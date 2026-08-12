/* Renderer for the Maple admin panel. Talks to the server's AdminApiServer
   (config/admin.hjson: host, port, token) over HTTP + WebSocket. */

let apiUrl = 'http://127.0.0.1:3002';
let token = '';
let ws = null;
let players = [];
let selectedPlayer = null;

const $ = (id) => document.getElementById(id);

// ---- toasts -------------------------------------------------------------
function toast(message, ok) {
  const el = document.createElement('div');
  el.className = 'toast ' + (ok === undefined ? '' : ok ? 'ok' : 'err');
  el.textContent = message;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ---- server console -----------------------------------------------------
const serverOutput = $('serverOutput');
const serverState = $('serverState');

function serverLog(text, stream) {
  const span = document.createElement('span');
  span.className = stream === 'err' ? 'stderr' : stream === 'sys' ? 'sys' : 'stdout';
  span.textContent = text;
  serverOutput.appendChild(span);
  serverOutput.scrollTop = serverOutput.scrollHeight;
}

function setServerState(text, running) {
  serverState.textContent = text;
  serverState.className = 'badge ' + (running ? 'online' : 'offline');
}

// ---- API -----------------------------------------------------------------
async function api(path, body) {
  const res = await fetch(apiUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
  return data;
}

// ---- players -------------------------------------------------------------
function renderPlayers() {
  const tbody = $('playerTable').querySelector('tbody');
  tbody.innerHTML = '';
  const sel = $('qaPlayer');
  sel.innerHTML = '<option value="">— select player —</option>';
  for (const p of players || []) {
    const tr = document.createElement('tr');
    if (selectedPlayer && selectedPlayer.name === p.name) tr.classList.add('selected');
    tr.innerHTML =
      `<td>${escapeHtml(p.name)}</td><td>${p.level}</td><td>${p.job}</td>` +
      `<td>${p.mapId}</td><td>${escapeHtml(p.ip)}</td><td>${p.meso}</td>` +
      `<td>${p.nxPrepaid}</td><td>${p.gm ? 'yes' : ''}</td>`;
    tr.addEventListener('click', () => {
      selectedPlayer = p;
      $('qaPlayer').value = p.name;
      renderPlayers();
    });
    tbody.appendChild(tr);
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = `${p.name} (Lv.${p.level})`;
    sel.appendChild(opt);
  }
  $('playerCount').textContent = `${players.length} online`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// ---- connection ----------------------------------------------------------
function saveSettings() {
  try {
    localStorage.setItem('admin_apiUrl', $('apiUrl').value.trim());
    localStorage.setItem('admin_token', $('token').value.trim());
  } catch { /* ignore */ }
}

function loadSettings() {
  try {
    const url = localStorage.getItem('admin_apiUrl');
    const tok = localStorage.getItem('admin_token');
    if (url) $('apiUrl').value = url;
    if (tok) $('token').value = tok;
  } catch { /* ignore */ }
}

function connect() {
  apiUrl = $('apiUrl').value.trim().replace(/\/$/, '') || 'http://127.0.0.1:3002';
  token = $('token').value.trim();
  saveSettings();
  const wsUrl = apiUrl.replace(/^http/, 'ws') + '/';

  if (ws) { try { ws.close(); } catch { /* ignore */ } ws = null; }

  fetch(apiUrl + '/api/health', { headers: { 'Authorization': 'Bearer ' + token } })
    .then((r) => {
      if (!r.ok) throw new Error('Unauthorized — check the token in config/admin.hjson');
      return r.json();
    })
    .then((d) => {
      setBadge(true);
      toast('Connected to ' + apiUrl);
      loadRates();
      loadNetwork();
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'players') { players = msg.players; renderPlayers(); }
          } catch { /* ignore */ }
        };
        ws.onerror = () => { ws = null; };
      } catch { /* ignore */ }
    })
    .catch((e) => {
      setBadge(false);
      toast('Connection failed: ' + e.message, false);
    });
}

loadSettings();
// auto-connect on launch if a token was previously saved
if (localStorage.getItem('admin_token')) connect();

function setBadge(online) {
  const b = $('connBadge');
  b.textContent = online ? 'online' : 'offline';
  b.className = 'badge ' + (online ? 'online' : 'offline');
}

// ---- quick actions -------------------------------------------------------
function selectedName() {
  const v = $('qaPlayer').value;
  if (!v) { toast('Select a player first', false); return null; }
  return v;
}

async function sendCommand(cmd, okMsg) {
  try {
    const data = await api('/api/command', { command: cmd });
    toast(data.message || okMsg || (data.ok ? 'ok' : 'failed'), data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
}

$('qaMesoBtn').addEventListener('click', () => {
  const name = selectedName(); if (!name) return;
  sendCommand(`meso ${name} ${$('qaMesoAmt').value || 0}`, 'Mesos updated');
});
$('qaNxBtn').addEventListener('click', () => {
  const name = selectedName(); if (!name) return;
  sendCommand(`nx ${name} ${$('qaNxAmt').value || 0}`, 'NX updated');
});
$('qaItemBtn').addEventListener('click', () => {
  const name = selectedName(); if (!name) return;
  const itemId = $('qaItemId').value;
  if (!itemId) { toast('Enter an item id', false); return; }
  sendCommand(`item ${name} ${itemId} ${$('qaItemCnt').value || 1}`, 'Item given');
});
$('qaLevelBtn').addEventListener('click', () => {
  const name = selectedName(); if (!name) return;
  const level = $('qaLevel').value;
  if (!level) { toast('Enter a level', false); return; }
  sendCommand(`level ${name} ${level}`, 'Level set');
});
$('qaJobBtn').addEventListener('click', () => {
  const name = selectedName(); if (!name) return;
  const jobId = $('qaJob').value;
  if (!jobId) { toast('Enter a job id', false); return; }
  sendCommand(`job ${name} ${jobId}`, 'Job set');
});
$('qaWarpBtn').addEventListener('click', () => {
  const name = selectedName(); if (!name) return;
  const mapId = $('qaWarpMap').value;
  if (!mapId) { toast('Enter a map id', false); return; }
  sendCommand(`warp ${name} ${mapId}`, 'Player warped');
});
$('qaKickBtn').addEventListener('click', () => {
  const name = selectedName(); if (!name) return;
  sendCommand(`kick ${name}`, 'Player kicked');
});
$('qaBanBtn').addEventListener('click', async () => {
  const name = selectedName(); if (!name) return;
  try {
    const data = await api('/api/account/ban', { name, reason: 'banned from panel' });
    toast(data.message || 'Banned', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});

// ---- server controls -----------------------------------------------------
$('serverStartBtn').addEventListener('click', async () => await window.adminApi.serverStart());
$('serverRestartBtn').addEventListener('click', async () => {
  setServerState('restarting...');
  serverLog('\n[app] Restarting server...\n', 'sys');
  await window.adminApi.serverRestart();
});
$('serverStopBtn').addEventListener('click', async () => {
  setServerState('shutting down...');
  serverLog('\n[app] Shutting down server...\n', 'sys');
  await window.adminApi.serverStop();
});

window.adminApi.onServerLog((data) => serverLog(data.text, data.stream));
window.adminApi.onServerStatus((data) => setServerState(data.message, data.running));
window.adminApi.serverLog().then((buf) => { if (buf) serverLog(buf, 'out'); });
window.adminApi.serverStatus().then((s) => setServerState(s.running ? 'running' : 'stopped', s.running));

// ---- navigation ----------------------------------------------------------
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    $('view-' + btn.dataset.view).classList.add('active');
  });
});

// ---- notices -------------------------------------------------------------
$('noticeBtn').addEventListener('click', async () => {
  const message = $('noticeText').value;
  if (!message) { toast('Enter a message', false); return; }
  try {
    const data = await api('/api/notice', { message, type: 'notice' });
    toast(data.message || 'Notice sent', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('popupBtn').addEventListener('click', async () => {
  const message = $('noticeText').value;
  if (!message) { toast('Enter a message', false); return; }
  try {
    const data = await api('/api/notice', { message, type: 'popup' });
    toast(data.message || 'Popup sent', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});

// ---- accounts ------------------------------------------------------------
$('createAccBtn').addEventListener('click', async () => {
  const name = $('accName').value, password = $('accPass').value;
  if (!name || !password) { toast('Enter a username and password', false); return; }
  try {
    const data = await api('/api/account/create', { name, password });
    toast(data.message || 'Account created', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('setGmBtn').addEventListener('click', async () => {
  const name = $('gmName').value;
  if (!name) { toast('Enter a username', false); return; }
  try {
    const data = await api('/api/account/gm', { name, gm: $('gmOn').checked });
    toast(data.message || 'GM flag set', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('banBtn').addEventListener('click', async () => {
  const name = $('banName').value;
  if (!name) { toast('Enter a username', false); return; }
  try {
    const data = await api('/api/account/ban', { name, reason: $('banReason').value });
    toast(data.message || 'Banned', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('unbanBtn').addEventListener('click', async () => {
  const name = $('banName').value;
  if (!name) { toast('Enter a username', false); return; }
  try {
    const data = await api('/api/account/unban', { name });
    toast(data.message || 'Unbanned', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});

$('connectBtn').addEventListener('click', connect);

// ---- rates ----------------------------------------------------------------
function num(id) {
  const v = parseFloat($(id).value);
  return isNaN(v) ? undefined : v;
}

function loadRates() {
  fetch(apiUrl + '/api/rates', { headers: { 'Authorization': 'Bearer ' + token } })
    .then((r) => r.json())
    .then((d) => {
      if (!d.ok || !d.rates) return;
      $('expRate').value = d.rates.expRate;
      $('dropRate').value = d.rates.dropRate;
      $('mesoRate').value = d.rates.mesoRate;
    })
    .catch(() => { /* not connected yet */ });
}

$('expRateBtn').addEventListener('click', async () => {
  try {
    const data = await api('/api/rates', { expRate: num('expRate') });
    toast(data.message || 'EXP rate set', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('dropRateBtn').addEventListener('click', async () => {
  try {
    const data = await api('/api/rates', { dropRate: num('dropRate') });
    toast(data.message || 'Drop rate set', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('mesoRateBtn').addEventListener('click', async () => {
  try {
    const data = await api('/api/rates', { mesoRate: num('mesoRate') });
    toast(data.message || 'Meso rate set', data.ok);
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('allRatesBtn').addEventListener('click', async () => {
  const v = num('allRates');
  if (v === undefined) { toast('Enter a multiplier', false); return; }
  try {
    const data = await api('/api/rates', { expRate: v, dropRate: v, mesoRate: v });
    toast(data.message || 'Rates set', data.ok);
    loadRates();
  } catch (e) { toast('Error: ' + e.message, false); }
});

// ---- network config -------------------------------------------------------
function loadNetwork() {
  fetch(apiUrl + '/api/network', { headers: { 'Authorization': 'Bearer ' + token } })
    .then((r) => r.json())
    .then((d) => {
      if (!d.ok || !d.network) return;
      const n = d.network;
      $('netCenterHost').value = n.center?.host ?? '';
      $('netCenterPort').value = n.center?.port ?? '';
      $('netLoginHost').value = n.login?.host ?? '';
      $('netLoginPort').value = n.login?.port ?? '';
      $('netChannelHost').value = n.channel?.host ?? '';
      $('netChannelPort').value = n.channel?.port ?? '';
      $('netShopHost').value = n.shop?.host ?? '';
      $('netShopPort').value = n.shop?.port ?? '';
      $('netAdminHost').value = n.admin?.host ?? '';
      $('netAdminPort').value = n.admin?.port ?? '';
      $('netAdminToken').value = n.admin?.token ?? '';
    })
    .catch(() => { /* not connected yet */ });
}

$('netSaveBtn').addEventListener('click', async () => {
  const network = {
    center: { host: $('netCenterHost').value, port: $('netCenterPort').value },
    login: { host: $('netLoginHost').value, port: $('netLoginPort').value },
    channel: { host: $('netChannelHost').value, port: $('netChannelPort').value },
    shop: { host: $('netShopHost').value, port: $('netShopPort').value },
    admin: { host: $('netAdminHost').value, port: $('netAdminPort').value, token: $('netAdminToken').value },
  };
  try {
    const data = await api('/api/network', { network });
    toast(data.message || 'Network config saved', data.ok);
    if (data.ok && $('netAdminToken').value.trim()) {
      // keep the app in sync with the saved token for the next launch
      $('token').value = $('netAdminToken').value.trim();
      token = $('netAdminToken').value.trim();
      saveSettings();
    }
  } catch (e) { toast('Error: ' + e.message, false); }
});
$('netReloadBtn').addEventListener('click', () => loadNetwork());

// after a successful connect, load rates + network + player list
const origSetBadge = setBadge;
setBadge = (online) => {
  origSetBadge(online);
  if (online) { loadRates(); loadNetwork(); }
};
