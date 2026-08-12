import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PopularityResultType } from './data/PopularityResultType';
import { WildHunterInfo } from './data/WildHunterInfo';
import { User } from './User';
import { GuildManager } from '../guild/GuildManager';
import { AllianceManager } from '../alliance/AllianceManager';

export function givePopularityResult(resultType: PopularityResultType): Buffer;
export function givePopularityResult(resultType: PopularityResultType.Success, targetCharacterName: string, inc: boolean, pop: number): Buffer;
export function givePopularityResult(resultType: PopularityResultType.Notify, fromCharacterName: string, inc: boolean): Buffer;
export function givePopularityResult(resultType: PopularityResultType, ...args: any[]): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.GIVE_POPULARITY_RESULT.code);
  w.writeByte(resultType);
  if (resultType === PopularityResultType.Success) {
    w.writeMapleAsciiString(args[0]);
    w.writeByte(args[1] ? 1 : 0);
    w.writeInt(args[2]);
  } else if (resultType === PopularityResultType.Notify) {
    w.writeMapleAsciiString(args[0]);
    w.writeByte(args[1] ? 1 : 0);
  }
  return w.getPacket();
}

export function characterInfo(user: User): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.CHARACTER_INFO.code);
  w.writeInt(user.getCharacterId());
  w.writeByte(user.getLevel());
  w.writeShort(user.getJob());
  w.writeShort(user.getPop());
  w.writeByte(0); // bIsMarried
  const guild = GuildManager.instance?.getGuild(user.getCharacterData().guildId) ?? null;
  w.writeMapleAsciiString(guild ? guild.name : '');
  if (guild && guild.allianceId !== 0) {
    const alliance = AllianceManager.instance?.getAlliance(guild.allianceId) ?? null;
    w.writeMapleAsciiString(alliance ? alliance.name : '');
  } else {
    w.writeMapleAsciiString('');
  }
  w.writeByte(0); // bMedalInfo

  const pets = user.getPets();
  for (const pet of pets) {
    w.writeByte(1);
    w.writeInt(pet.getTemplateId());
    w.writeMapleAsciiString(pet.getName());
    w.writeByte(pet.getLevel());
    w.writeShort(pet.getTameness());
    w.writeByte(pet.getFullness());
    w.writeShort(pet.getPetSkill());
    w.writeInt(pet.getPetWear());
  }
  w.writeByte(0);

  w.writeByte(0); // bTamingMob

  const wishlist = user.account?.wishlist?.filter(id => id !== 0) ?? [];
  w.writeByte(wishlist.length);
  for (const id of wishlist) w.writeInt(id);

  const medalItem = user.getInventoryManager().equipped.getItem(49); // BodyPart.MEDAL
  w.writeInt(medalItem ? medalItem.itemId : 0);

  w.writeShort(0); // title quests (not ported - empty)

  const chairs: number[] = [];
  for (const item of user.getInventoryManager().installInventory.getItems().values()) {
    if (Math.floor(item.itemId / 10000) === 301) chairs.push(item.itemId);
  }
  w.writeInt(chairs.length);
  for (const id of chairs) w.writeInt(id);

  return w.getPacket();
}

/**
 * Port of kinoko's WvsContext::wildHunterInfo. Pushes the GW_WildHunterInfo
 * block (riding type + 5 captured mob ids) to the client - used after a
 * successful Capture / Call of the Hunter skill.
 */
export function wildHunterInfoPacket(wildHunterInfo: WildHunterInfo): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.WILD_HUNTER_INFO.code);
  wildHunterInfo.encode(w); // GW_WildHunterInfo::Decode
  return w.getPacket();
}
