// Minimal type declarations for the `ws` WebSocket library.
// The repo pins an old @types/node that conflicts with @types/ws' generics, so
// we keep a local structural shim instead of installing @types/ws.
declare module 'ws' {
  import { Server as HttpServer } from 'http';

  export class WebSocketServer {
    constructor(options: { server: HttpServer });
    on(event: 'connection', cb: (ws: WebSocket) => void): void;
    on(event: string, cb: (...args: any[]) => void): void;
    close(cb?: () => void): void;
  }

  export class WebSocket {
    static readonly OPEN: number;
    readyState: number;
    send(data: string): void;
    on(event: string, cb: (...args: any[]) => void): void;
  }

  const ws: {
    Server: typeof WebSocketServer;
    OPEN: number;
  };
  export default ws;
}
