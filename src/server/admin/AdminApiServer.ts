import * as express from 'express';
import { Server as HttpServer } from 'http';
import { Config } from '../../util/config';
import { ChannelAdminProxy } from './ChannelAdminProxy';
import { Database } from '../center/db/database';
import * as bcrypt from 'bcrypt';
import { AccountDB } from '../center/db/account';
import { AdminPlayerInfo } from './adminIpc';
import { WebSocketServer, WebSocket } from 'ws';
const WS_OPEN = WebSocket.OPEN;

/**
 * Admin panel API server. Runs in the MASTER process (alongside the metrics
 * server). Provides a token-authenticated HTTP + WebSocket API for the Electron
 * admin app. Player-targeting operations are forwarded to the channel worker via
 * ChannelAdminProxy; account-level operations hit the database directly.
 */
export class AdminApiServer {
  private readonly app = express();
  private server: HttpServer | null = null;
  private wss: WebSocketServer | null = null;
  private clients = new Set<WebSocket>();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly token: string,
    private readonly logger: any,
  ) {}

  start(): void {
    this.app.use(express.json());
    this.app.use(this.auth.bind(this));

    // ---- REST endpoints -------------------------------------------------
    this.app.get('/api/health', (_req, res) => {
      res.json({ ok: true, channel: ChannelAdminProxy.isChannelReady() });
    });

    this.app.get('/api/players', async (_req, res) => {
      const r = await ChannelAdminProxy.request('players', {});
      if (!r.ok) return res.status(502).json({ error: r.error ?? 'channel unavailable' });
      res.json({ players: r.result as AdminPlayerInfo[] });
    });

    this.app.post('/api/command', async (req, res) => {
      const { command } = req.body ?? {};
      const result = await this.executeCommand(String(command ?? ''));
      res.json(result);
    });

    this.app.post('/api/notice', async (req, res) => {
      const { message, type } = req.body ?? {};
      const r = await ChannelAdminProxy.request('notice', { message: String(message ?? ''), type: String(type ?? 'notice') });
      res.json({ ok: r.ok, message: r.error ?? r.result });
    });

    // ---- account endpoints (database) ------------------------------------
    this.app.post('/api/account/create', async (req, res) => {
      const { name, password } = req.body ?? {};
      if (!name || !password) return res.status(400).json({ error: 'name and password required' });
      const existing = await AccountDB.findAccountIdByName(String(name));
      if (existing !== null) return res.status(409).json({ error: 'Account already exists' });
      const hashed = bcrypt.hashSync(String(password), 12);
      try {
        await Database.knex('accounts').insert({
          name: String(name),
          password: hashed,
          nx_credit: 0,
          maple_points: 0,
          nx_prepaid: 0,
          character_slots: 3,
        });
        res.json({ ok: true, message: `Account ${name} created` });
      } catch (err) {
        res.status(500).json({ error: `Failed to create account: ${err?.message ?? err}` });
      }
    });

    this.app.post('/api/account/gm', async (req, res) => {
      const { name, gm } = req.body ?? {};
      const accountId = await AccountDB.findAccountIdByName(String(name ?? ''));
      if (accountId === null) return res.status(404).json({ error: 'Account not found' });
      await AccountDB.setGm(accountId, Boolean(gm));
      res.json({ ok: true, message: `Set GM=${Boolean(gm)} for account ${name}` });
    });

    this.app.post('/api/account/ban', async (req, res) => {
      const { name, reason } = req.body ?? {};
      const accountId = await AccountDB.findAccountIdByName(String(name ?? ''));
      if (accountId === null) return res.status(404).json({ error: 'Account not found' });
      await AccountDB.banAccount(accountId, String(reason ?? ''));
      res.json({ ok: true, message: `Banned account ${name}` });
    });

    this.app.post('/api/account/unban', async (req, res) => {
      const { name } = req.body ?? {};
      const accountId = await AccountDB.findAccountIdByName(String(name ?? ''));
      if (accountId === null) return res.status(404).json({ error: 'Account not found' });
      await AccountDB.unbanAccount(accountId);
      res.json({ ok: true, message: `Unbanned account ${name}` });
    });

    // ---- rates (live, no restart) ---------------------------------------
    this.app.get('/api/rates', async (_req, res) => {
      const r = await ChannelAdminProxy.request('getRates', {});
      if (!r.ok) return res.status(502).json({ error: r.error ?? 'channel unavailable' });
      res.json({ ok: true, rates: r.result });
    });

    this.app.post('/api/rates', async (req, res) => {
      const { expRate, dropRate, mesoRate } = req.body ?? {};
      const r = await ChannelAdminProxy.request('setRates', {
        expRate: expRate !== undefined ? Number(expRate) : undefined,
        dropRate: dropRate !== undefined ? Number(dropRate) : undefined,
        mesoRate: mesoRate !== undefined ? Number(mesoRate) : undefined,
      });
      res.json({ ok: r.ok, message: r.error ?? r.result });
    });

    // ---- network config (hosts/ports in config/*.hjson) ------------------
    this.app.get('/api/network', (_req, res) => {
      res.json({ ok: true, network: readNetworkConfig() });
    });

    this.app.post('/api/network', (req, res) => {
      const { network } = req.body ?? {};
      if (!network) return res.status(400).json({ error: 'network object required' });
      const err = writeNetworkConfig(network);
      if (err) return res.status(500).json({ error: err });
      res.json({ ok: true, message: 'Network config saved. Restart the server to apply.' });
    });

    // ---- admin token (changeable from the app; needs restart to apply) ----
    this.app.get('/api/network/token', (_req, res) => {
      res.json({ ok: true, token: this.token });
    });

    this.app.post('/api/network/token', (req, res) => {
      const { token: newToken } = req.body ?? {};
      if (!newToken || typeof newToken !== 'string' || newToken.length < 4) {
        return res.status(400).json({ error: 'Token must be at least 4 characters' });
      }
      const err = writeNetworkConfig({ admin: { token: newToken } });
      if (err) return res.status(500).json({ error: err });
      res.json({ ok: true, message: 'Token saved. Restart the server to apply. Until then the current token still works.' });
    });

    this.server = this.app.listen(this.port, this.host, () => {
      this.logger.info(`Admin API server listening on ${this.host}:${this.port}`);
    });
    this.server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') this.logger.warn(`Admin API port ${this.port} already in use — skipping admin server`);
      else this.logger.error(`Admin API server error: ${err.message}`);
    });

    // ---- WebSocket for live player push ----------------------------------
    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
      ws.on('error', () => this.clients.delete(ws));
      // Send the player list immediately on connect.
      this.pushPlayers();
    });

    // Poll the channel worker for the player list every 3s and broadcast to
    // connected clients.
    this.refreshTimer = setInterval(() => this.pushPlayers(), 3000);
  }

  stop(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.wss) this.wss.close();
    if (this.server) this.server.close();
  }

  private auth(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const header = req.header('Authorization') ?? '';
    const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (provided === this.token) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  private async pushPlayers(): Promise<void> {
    if (this.clients.size === 0) return;
    const r = await ChannelAdminProxy.request('players', {});
    if (!r.ok) return;
    const payload = JSON.stringify({ type: 'players', players: r.result });
    for (const ws of this.clients) {
      if (ws.readyState === WS_OPEN) ws.send(payload);
    }
  }

  private async executeCommand(command: string): Promise<any> {
    const parts = command.trim().split(/\s+/);
    const cmd = (parts[0] ?? '').toLowerCase();
    switch (cmd) {
      case 'players':
      case 'list': {
        const r = await ChannelAdminProxy.request('players', {});
        return { ok: r.ok, message: r.error ?? `Online players: ${(r.result as AdminPlayerInfo[]).length}` };
      }
      case 'meso': {
        const [, charName, amount] = parts;
        if (!charName || !amount) return { ok: false, message: 'Usage: meso <character> <amount>' };
        const r = await ChannelAdminProxy.request('meso', { charName, amount: parseInt(amount, 10) });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      case 'level': {
        const [, charName, level] = parts;
        if (!charName || !level) return { ok: false, message: 'Usage: level <character> <level>' };
        const r = await ChannelAdminProxy.request('level', { charName, amount: parseInt(level, 10) });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      case 'job': {
        const [, charName, jobId] = parts;
        if (!charName || !jobId) return { ok: false, message: 'Usage: job <character> <jobId>' };
        const r = await ChannelAdminProxy.request('job', { charName, amount: parseInt(jobId, 10) });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      case 'nx': {
        const [, charName, amount] = parts;
        if (!charName || !amount) return { ok: false, message: 'Usage: nx <character> <amount>' };
        const r = await ChannelAdminProxy.request('nx', { charName, amount: parseInt(amount, 10) });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      case 'item': {
        const [, charName, itemId, count] = parts;
        if (!charName || !itemId) return { ok: false, message: 'Usage: item <character> <itemId> [count]' };
        const r = await ChannelAdminProxy.request('item', { charName, itemId: parseInt(itemId, 10), count: count ? parseInt(count, 10) : 1 });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      case 'kick': {
        const [, charName] = parts;
        if (!charName) return { ok: false, message: 'Usage: kick <character>' };
        const r = await ChannelAdminProxy.request('kick', { charName });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      case 'warp': {
        const [, charName, mapId] = parts;
        if (!charName || !mapId) return { ok: false, message: 'Usage: warp <character> <mapId>' };
        const r = await ChannelAdminProxy.request('warp', { charName, mapId: parseInt(mapId, 10) });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      case 'notice':
      case 'noticeall':
      case 'popup': {
        const type = cmd === 'popup' ? 'popup' : 'notice';
        const message = command.slice(parts[0].length).trim();
        if (!message) return { ok: false, message: `Usage: ${cmd} <message>` };
        const r = await ChannelAdminProxy.request('notice', { message, type });
        return { ok: r.ok, message: r.error ?? r.result };
      }
      default:
        return {
          ok: false,
          message: `Unknown command. Available: players, meso, nx, item, kick, warp, notice, popup`,
        };
    }
  }
}

/** Convenience factory so index.ts can start the server from config. */
export function startAdminApiServer(): AdminApiServer | null {
  const cfg = Config.instance?.admin;
  if (!cfg) {
    // eslint-disable-next-line no-console
    console.warn('[admin] No admin.hjson config — admin panel disabled');
    return null;
  }
  const host = cfg.host ?? '0.0.0.0';
  const port = cfg.port ?? 3002;
  const token = cfg.token ?? 'changeme';
  const server = new AdminApiServer(host, port, token, {
    info: (m: string) => console.log(`[admin] ${m}`),
    warn: (m: string) => console.warn(`[admin] ${m}`),
    error: (m: string) => console.error(`[admin] ${m}`),
  });
  server.start();
  return server;
}

// ---------------------------------------------------------------------------
// Network config read/write (config/{center,login,channel,shop,admin}.hjson)
// ---------------------------------------------------------------------------

interface NetworkEntry { host?: string; port?: number; token?: string; }

type NetworkConfig = {
  center?: NetworkEntry;
  login?: NetworkEntry;
  channel?: NetworkEntry;
  shop?: NetworkEntry;
  admin?: NetworkEntry;
};

function readNetworkConfig(): NetworkConfig {
  const Hjson = require('hjson');
  const fs = require('fs');
  const path = require('path');
  const configDir = path.join(process.cwd(), 'config');
  const read = (file: string, includeToken: boolean): NetworkEntry => {
    try {
      const raw = fs.readFileSync(path.join(configDir, file), 'utf-8');
      const obj = Hjson.parse(raw);
      const entry: NetworkEntry = { host: obj.host ?? '', port: obj.port ?? 0 };
      if (includeToken) entry.token = obj.token ?? '';
      return entry;
    } catch {
      return {};
    }
  };
  return {
    center: read('center.hjson', false),
    login: read('login.hjson', false),
    channel: read('channel.hjson', false),
    shop: read('shop.hjson', false),
    admin: read('admin.hjson', true),
  };
}

function writeNetworkConfig(network: NetworkConfig): string | null {
  const Hjson = require('hjson');
  const fs = require('fs');
  const path = require('path');
  const configDir = path.join(process.cwd(), 'config');
  try {
    for (const key of ['center', 'login', 'channel', 'shop', 'admin']) {
      const entry = (network as any)[key];
      if (!entry) continue;
      const file = `${key}.hjson`;
      const fullPath = path.join(configDir, file);
      const obj = Hjson.parse(fs.readFileSync(fullPath, 'utf-8'));
      if (entry.host !== undefined) obj.host = String(entry.host);
      if (entry.port !== undefined && entry.port !== '') obj.port = Number(entry.port);
      if (key === 'admin' && entry.token !== undefined && entry.token !== '') {
        obj.token = String(entry.token);
      }
      fs.writeFileSync(fullPath, Hjson.stringify(obj, { space: 4, quoteAllStrings: true, condense: 0 }));
    }
    return null;
  } catch (err: any) {
    return `Failed to write network config: ${err?.message ?? err}`;
  }
}
