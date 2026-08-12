import { CenterServer } from "./src/server/center/centerServer";
import { LoginServer } from "./src/server/login/loginServer";
import * as winston from 'winston';
import * as cluster from 'cluster';
import { ShopServer } from "./src/server/shop/shopServer";
import { ChannelServer } from "./src/server/channel/channelServer";
import { Database } from "./src/server/center/db/database";
import { RankManager } from "./src/server/rank/RankManager";
import { customFormat } from "./src/logFormat";
import { startAdminApiServer } from "./src/server/admin/AdminApiServer";
import { ChannelAdminProxy } from "./src/server/admin/ChannelAdminProxy";
import { handleChannelAdminRequest } from "./src/server/admin/ChannelAdminRequestHandler";

// Prometheus metrics
import * as express from 'express';
const metricsServer = express();
import { AggregatorRegistry } from 'prom-client';

const aggregatorRegistry = new AggregatorRegistry();

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: 'BOOT' }),
        winston.format.colorize(),
        customFormat
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
        new winston.transports.Console({ level: 'debug' })
    ]
});

async function main(): Promise<void> {
    if (cluster.isMaster) {
        await Database.initialize();
        await RankManager.initialize();

        logger.debug(`Master process ${process.pid} has started`);

        const centerServer = new CenterServer();
        centerServer.start();

        // Track each worker's role so a crashed worker can be respawned as the
        // same server type. Without respawn, one channel crash left no channel
        // registered with center and every migration failed with login code 7.
        const workerRoles = new Map<number, number>();
        const spawn = (serverType: number): void => {
            const worker = cluster.fork();
            workerRoles.set(worker.id, serverType);
            worker.send({ serverType });
            if (serverType === 2) ChannelAdminProxy.setChannelWorker(worker); // channel
        };

        spawn(1); // login
        spawn(3); // shop
        spawn(2); // channel

        cluster.on('exit', (worker, code, signal) => {
            const role = workerRoles.get(worker.id);
            workerRoles.delete(worker.id);
            logger.warn(`Worker ${worker.process.pid} (role ${role}) exited code=${code} signal=${signal} — respawning`);
            if (role !== undefined) setTimeout(() => spawn(role), 1000);
        });

        // TODO: Secure metrics endpoint
        metricsServer.get('/metrics', async (req: any, res: any) => {
            try {
                const metrics = await aggregatorRegistry.clusterMetrics();
                res.set('Content-Type', aggregatorRegistry.contentType);
                res.send(metrics);
            } catch (ex) {
                res.statusCode = 500;
                res.send(ex.message);
            }
        });

        metricsServer.listen(3001, () => {
            logger.info('Cluster metrics server listening on port 3001, metrics exposed on /metrics');
        });
        metricsServer.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                logger.warn('Metrics port 3001 already in use — skipping metrics server');
            } else {
                logger.error(`Metrics server error: ${err.message}`);
            }
        });

        // Admin panel API (HTTP + WebSocket) — see config/admin.hjson.
        startAdminApiServer();

    } else {
        logger.debug(`Worker process ${process.pid} has started`);

        // Surface the real cause of worker deaths instead of a bare native exit
        // code. A stray unhandledRejection (e.g. writing to a client socket that
        // vanished mid-disconnect) would otherwise kill the worker silently.
        process.on('unhandledRejection', (reason: any) => {
            logger.error(`Worker ${process.pid} unhandledRejection: ${reason?.stack ?? reason}`);
        });
        process.on('uncaughtException', (err: any) => {
            logger.error(`Worker ${process.pid} uncaughtException: ${err?.stack ?? err}`);
            process.exit(1); // let the master respawn a clean worker
        });

        // Register listener immediately so master's serverType message
        // (sent right after fork) isn't dropped while we await DB init.
        process.on('message', async (message: any) => {
            // Admin panel requests from the master are handled by the channel
            // worker (the process that owns the online User objects).
            if (message && message.adminRequest) {
                handleChannelAdminRequest(message.adminRequest);
                return;
            }
            // Workers need their own DB connection (separate process)
            await Database.initialize();

            switch (message.serverType) {
                case 1:
                    new LoginServer().start();
                    break;
                case 2:
                    new ChannelServer().start();
                    break;
                case 3:
                    new ShopServer().start();
                    break;
            }
        });
    }
}

main().catch(err => {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
});
