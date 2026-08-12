import { ChannelServer } from '../channel/channelServer';
import { User } from '../../world/user/User';
import { AdminPlayerInfo } from './adminIpc';
import { ItemProvider } from '../../provider/ItemProvider';
import { ItemVariationOption } from '../../world/item/ItemVariationOption';
import { inventoryOperation } from '../../world/item/ItemPacket';
import { InventoryType } from '../../world/item/InventoryType';
import { InventoryOperation } from '../../world/item/InventoryOperation';
import { UserLocal } from '../../world/user/UserLocal';
import { Effect } from '../../world/user/effect/Effect';
import { statChangedPacket } from '../../world/user/User';
import { Stat } from '../../world/user/stat/Stat';
import { BroadcastMsg } from '../../client/BroadcastMsg';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { CharacterDB } from '../channel/db/CharacterDB';
import { AccountDB } from '../center/db/account';
import { RatesManager } from '../../world/RatesManager';

/**
 * Runs inside the channel worker process. Executes admin-panel operations
 * against the online User objects owned by this channel's ChannelServer.
 */
export class ChannelAdminService {
  static listPlayers(): AdminPlayerInfo[] {
    const cs = ChannelServer.instance;
    if (!cs) return [];
    const out: AdminPlayerInfo[] = [];
    for (const user of cs.userRegistry.values()) {
      out.push({
        charId: user.getCharacterId(),
        name: user.getCharacterName(),
        level: user.getLevel(),
        job: user.getJob(),
        mapId: user.getField()?.getFieldId() ?? 0,
        ip: user.getClientIp(),
        meso: user.getInventoryManager().money,
        nxPrepaid: user.account?.nxPrepaid ?? 0,
        gm: user.isGm(),
      });
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }

  static findUser(charName: string): User | undefined {
    const cs = ChannelServer.instance;
    if (!cs) return undefined;
    return cs.getUserByCharacterName(charName);
  }

  static setMeso(charName: string, amount: number): { ok: boolean; message: string } {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    const im = user.getInventoryManager();
    im.money = Math.max(0, amount);
    user.write(statChangedPacket(Stat.MONEY, im.money));
    CharacterDB.saveCharacter(user.getCharacterData()).catch(() => undefined);
    return { ok: true, message: `Set ${charName}'s mesos to ${im.money}` };
  }

  static setLevel(charName: string, level: number): { ok: boolean; message: string } {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    if (level < 1 || level > 200) return { ok: false, message: 'Level must be between 1 and 200' };
    const cs = user.getCharacterStat();
    cs.level = level;
    user.validateStat();
    user.write(statChangedPacket(Stat.LEVEL, cs.level));
    CharacterDB.saveCharacter(user.getCharacterData()).catch(() => undefined);
    return { ok: true, message: `Set ${charName}'s level to ${level}` };
  }

  static setJob(charName: string, jobId: number): { ok: boolean; message: string } {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    const cs = user.getCharacterStat();
    cs.job = jobId;
    user.updatePassiveSkillData();
    user.validateStat();
    user.write(statChangedPacket(Stat.JOB, cs.job));
    CharacterDB.saveCharacter(user.getCharacterData()).catch(() => undefined);
    return { ok: true, message: `Set ${charName}'s job to ${jobId}` };
  }

  static setNx(charName: string, amount: number): { ok: boolean; message: string } {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    const account = user.account;
    if (!account) return { ok: false, message: `No account loaded for ${charName}` };
    account.nxPrepaid = Math.max(0, amount);
    AccountDB.updateAccountCash(account.id, account.nxCredit, account.maplePoint, account.nxPrepaid).catch(() => undefined);
    return { ok: true, message: `Set NX prepaid to ${account.nxPrepaid} for account ${account.username}` };
  }

  static giveItem(charName: string, itemId: number, count = 1): { ok: boolean; message: string } {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    const info = ItemProvider.getItemInfo(itemId);
    if (!info) return { ok: false, message: `Could not resolve item ID : ${itemId}` };
    const quantity = Math.max(1, count);
    const im = user.getInventoryManager();
    const item = info.createItem(user.getNextItemSn(), Math.min(quantity, info.getSlotMax()), ItemVariationOption.NORMAL);
    const ops = im.addItem(item);
    if (!ops) return { ok: false, message: `Failed to add item ID ${itemId} (${quantity}) to inventory` };
    user.write(inventoryOperation(ops, true));
    user.write(UserLocal.effect(Effect.gainItem(itemId, quantity)));
    CharacterDB.saveCharacter(user.getCharacterData()).catch(() => undefined);
    return { ok: true, message: `Gave ${quantity} x ${itemId} to ${charName}` };
  }

  static kick(charName: string): { ok: boolean; message: string } {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    user.kick();
    return { ok: true, message: `Kicked ${charName}` };
  }

  static warp(charName: string, mapId: number, portal = ''): { ok: boolean; message: string } {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    const field = user.getField()?.getFieldStorage()?.getFieldById(mapId);
    if (!field) return { ok: false, message: `Could not resolve field ID : ${mapId}` };
    const portalInfo = portal ? field.getPortalByName(portal) : field.getRandomStartPoint();
    if (!portalInfo) return { ok: false, message: `Could not resolve portal for field ${mapId}` };
    user.warp(field, portalInfo, false, false);
    return { ok: true, message: `Warped ${charName} to field ${mapId}` };
  }

  /** Broadcasts a notice / popup to every field on this channel. */
  static notice(message: string, type = 'notice'): { ok: boolean; message: string } {
    const cs = ChannelServer.instance;
    if (!cs) return { ok: false, message: 'Channel not available' };
    const msg = type === 'popup'
      ? BroadcastMsg.popUpMessage(message)
      : BroadcastMsg.notice(message);
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.BROADCAST_MSG.code);
    msg.encode(w);
    const packet = w.getPacket();
    for (const field of cs.fieldStorage.getAllFields()) {
      field.broadcastPacket(packet);
    }
    return { ok: true, message: `Broadcast sent (${type})` };
  }

  static async ban(charName: string, reason: string): Promise<{ ok: boolean; message: string }> {
    const user = this.findUser(charName);
    if (!user) return { ok: false, message: `Character not online: ${charName}` };
    const accountId = user.getAccountId();
    await AccountDB.banAccount(accountId, reason);
    user.kick();
    return { ok: true, message: `Banned ${charName} (account ${accountId})` };
  }

  static getRates(): { ok: boolean; result: { expRate: number; dropRate: number; mesoRate: number } } {
    return { ok: true, result: RatesManager.snapshot() };
  }

  static setRates(expRate?: number, dropRate?: number, mesoRate?: number): { ok: boolean; message: string } {
    RatesManager.setRates(expRate, dropRate, mesoRate);
    const s = RatesManager.snapshot();
    return {
      ok: true,
      message: `Rates updated: EXP x${s.expRate}, Drop x${s.dropRate}, Meso x${s.mesoRate}`,
    };
  }
}
