import { AdminRequest, AdminResponse } from './adminIpc';

/**
 * Master-side proxy to the channel worker. The admin HTTP/WS server runs in
 * the master process; the online User objects live in the channel worker. We
 * forward admin requests to that worker over cluster IPC and resolve once the
 * worker replies.
 */
export class ChannelAdminProxy {
  private static pending = new Map<number, { resolve: (r: AdminResponse) => void }>();
  private static requestIdCounter = 1;
  private static channelWorker: any = null; // cluster.Worker

  /** Set once the master forks the channel worker (serverType 2). */
  static setChannelWorker(worker: any): void {
    ChannelAdminProxy.channelWorker = worker;
    worker.on('message', (message: any) => {
      if (message && message.adminResponse) {
        ChannelAdminProxy.handleResponse(message.adminResponse as AdminResponse);
      }
    });
  }

  static isChannelReady(): boolean {
    return ChannelAdminProxy.channelWorker !== null && !ChannelAdminProxy.channelWorker.isDead();
  }

  static request(op: AdminRequest['op'], args: AdminRequest['args']): Promise<AdminResponse> {
    if (!ChannelAdminProxy.isChannelReady()) {
      return Promise.resolve({ requestId: 0, ok: false, error: 'Channel worker not ready' });
    }
    const requestId = ChannelAdminProxy.requestIdCounter++;
    const promise = new Promise<AdminResponse>((resolve) => {
      ChannelAdminProxy.pending.set(requestId, { resolve });
    });
    const req: AdminRequest = { requestId, op, args };
    ChannelAdminProxy.channelWorker.send({ adminRequest: req });
    // Fail-safe timeout so a dead worker doesn't hang the HTTP response.
    setTimeout(() => {
      const entry = ChannelAdminProxy.pending.get(requestId);
      if (entry) {
        ChannelAdminProxy.pending.delete(requestId);
        entry.resolve({ requestId, ok: false, error: 'Admin request timed out' });
      }
    }, 10000);
    return promise;
  }

  private static handleResponse(response: AdminResponse): void {
    const entry = ChannelAdminProxy.pending.get(response.requestId);
    if (!entry) return;
    ChannelAdminProxy.pending.delete(response.requestId);
    entry.resolve(response);
  }
}
