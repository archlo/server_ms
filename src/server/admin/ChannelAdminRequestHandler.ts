import { AdminRequest, AdminResponse } from './adminIpc';
import { ChannelAdminService } from './ChannelAdminService';

/**
 * Executed inside the channel worker process when it receives an adminRequest
 * message from the master. Dispatches to ChannelAdminService and posts the
 * response back to the master via process.send.
 */
export function handleChannelAdminRequest(req: AdminRequest): void {
  const respond = (ok: boolean, result?: any, error?: string): void => {
    const res: AdminResponse = { requestId: req.requestId, ok, result, error };
    if (typeof process.send === 'function') {
      process.send({ adminResponse: res });
    }
  };

  const { op, args } = req;
  switch (op) {
    case 'players':
      respond(true, ChannelAdminService.listPlayers());
      break;
    case 'meso':
      respond(...resultOf(ChannelAdminService.setMeso(args.charName ?? '', args.amount ?? 0)));
      break;
    case 'level':
      respond(...resultOf(ChannelAdminService.setLevel(args.charName ?? '', args.amount ?? 1)));
      break;
    case 'job':
      respond(...resultOf(ChannelAdminService.setJob(args.charName ?? '', args.amount ?? 0)));
      break;
    case 'nx':
      respond(...resultOf(ChannelAdminService.setNx(args.charName ?? '', args.amount ?? 0)));
      break;
    case 'item':
      respond(...resultOf(ChannelAdminService.giveItem(args.charName ?? '', args.itemId ?? 0, args.count ?? 1)));
      break;
    case 'kick':
      respond(...resultOf(ChannelAdminService.kick(args.charName ?? '')));
      break;
    case 'warp':
      respond(...resultOf(ChannelAdminService.warp(args.charName ?? '', args.mapId ?? 0, args.portal ?? '')));
      break;
    case 'notice':
      respond(...resultOf(ChannelAdminService.notice(args.message ?? '', args.type ?? 'notice')));
      break;
    case 'getRates': {
      const r = ChannelAdminService.getRates();
      respond(r.ok, r.result);
      break;
    }
    case 'setRates':
      respond(...resultOf(ChannelAdminService.setRates(args.expRate, args.dropRate, args.mesoRate)));
      break;
    case 'ban':
      ChannelAdminService.ban(args.charName ?? '', args.message ?? '').then(
        (r) => respond(...resultOf(r)),
        (err) => respond(false, undefined, String(err?.message ?? err)),
      );
      break;
    default:
      respond(false, undefined, `Unknown admin op: ${op}`);
  }
}

function resultOf(r: { ok: boolean; message: string }): [boolean, string | undefined, string | undefined] {
  return r.ok ? [true, r.message, undefined] : [false, undefined, r.message];
}
