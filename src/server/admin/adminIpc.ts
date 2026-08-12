/**
 * Admin panel IPC protocol between the master process (which runs the admin
 * HTTP/WebSocket server) and the channel worker (which owns the online User
 * objects). Messages are plain objects sent over cluster IPC.
 */

/** Requests master -> channel worker. */
export interface AdminRequest {
  requestId: number;
  op: AdminOp;
  args: AdminArgs;
}

/** Responses channel worker -> master. */
export interface AdminResponse {
  requestId: number;
  ok: boolean;
  result?: any;
  error?: string;
}

export type AdminOp =
  | 'players'
  | 'meso'
  | 'nx'
  | 'item'
  | 'notice'
  | 'kick'
  | 'ban'
  | 'warp'
  | 'level'
  | 'job'
  | 'getRates'
  | 'setRates';

export interface AdminArgs {
  charName?: string;
  amount?: number;
  itemId?: number;
  count?: number;
  message?: string;
  type?: string;
  mapId?: number;
  portal?: string;
  expRate?: number;
  dropRate?: number;
  mesoRate?: number;
}

/** A player snapshot returned by the `players` op. */
export interface AdminPlayerInfo {
  charId: number;
  name: string;
  level: number;
  job: number;
  mapId: number;
  ip: string;
  meso: number;
  nxPrepaid: number;
  gm: boolean;
}
