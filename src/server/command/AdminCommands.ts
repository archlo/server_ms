/**
 * Port of kinoko's `AdminCommands`.
 *
 * kinoko registers `@Command`-annotated static methods via reflection; the TS
 * port exposes plain static methods and a `registerAll()` that registers each
 * one with `CommandProcessor`. Every handler receives `(user, args)` where
 * `args[0]` is the command name and `args[1..]` are the parsed arguments.
 *
 * GM privilege is checked once in `CommandProcessor` (via `User.isGm()`) before
 * any handler runs, mirroring kinoko's assumption that admin commands are only
 * reachable by GM accounts.
 */
import { CommandProcessor, CommandEntry } from './CommandProcessor';
import { Arguments } from './Arguments';
import { User } from '../../world/user/User';
import { statChangedPacket, statChangedMapPacket } from '../../world/user/User';
import { MessagePacket } from '../../world/user/MessagePacket';
import { UserLocal } from '../../world/user/UserLocal';
import { UserRemote } from '../../world/user/UserRemote';
import { Effect } from '../../world/user/effect/Effect';
import { Stat } from '../../world/user/stat/Stat';
import { GameConstants } from '../../world/GameConstants';
import { JobConstants } from '../../world/job/JobConstants';
import { InventoryType } from '../../world/item/InventoryType';
import { InventoryOperation } from '../../world/item/InventoryOperation';
import { inventoryOperation } from '../../world/item/ItemPacket';
import { ItemProvider } from '../../provider/ItemProvider';
import { MobProvider } from '../../provider/MobProvider';
import { SkillProvider } from '../../provider/SkillProvider';
import { ItemVariationOption } from '../../world/item/ItemVariationOption';
import { SkillRecord } from '../../world/skill/SkillRecord';
import { Mob } from '../../world/field/mob/Mob';
import { MobLeaveType } from '../../world/field/mob/MobLeaveType';
import { MobAppearType } from '../../world/field/mob/MobAppearType';
import { Field } from '../../world/field/Field';
import { PortalInfo } from '../../provider/map/PortalInfo';
import { ChannelServer } from '../channel/channelServer';

type CommandHandler = (user: User, args: string[]) => void;

function entry(names: string[], args: string[], handler: CommandHandler): CommandEntry {
  return { names, args, handler };
}

export class AdminCommands {
  // ---- utility / navigation ---------------------------------------------

  /** `!dispose` — closes any open dialog and unlocks client input. */
  static dispose(user: User): void {
    user.closeDialog();
    user.dispose();
    user.write(MessagePacket.system('You have been disposed.'));
  }

  /** `!info` — prints character/field stats to the invoking GM. */
  static info(user: User): void {
    const field = user.getField() as Field | null;
    const cs = user.getCharacterStat();
    user.write(MessagePacket.system(`HP : ${user.getHp()} / ${user.getMaxHp()}, MP : ${user.getMp()} / ${user.getMaxMp()}`));
    user.write(MessagePacket.system(`STR : ${cs.baseStr}, DEX : ${cs.baseDex}, INT : ${cs.baseInt}, LUK : ${cs.baseLuk}`));
    user.write(MessagePacket.system(`AP : ${cs.ap}, Level : ${user.getLevel()}, Job : ${user.getJob()}`));
    if (field) {
      user.write(MessagePacket.system(`Field ID : ${field.getFieldId()}`));
      user.write(MessagePacket.system(`  x : ${user.getX()}, y : ${user.getY()}, fh : ${user.getFoothold()}`));
      user.write(MessagePacket.system(`  users : ${field.getUserPool().getCount()}, mobs : ${field.getMobPool().getCount()}`));
    }
  }

  /** `!map`/`!warp <fieldId> [portal]` — warps the GM to a field by ID. */
  static map(user: User, args: string[]): void {
    const fieldId = Arguments.parseInt(args, 1);
    if (fieldId <= 0) {
      user.write(MessagePacket.system('Syntax : !map|warp <field ID to warp to>'));
      return;
    }
    const portalName = Arguments.has(args, 2) ? args[2] : GameConstants.DEFAULT_PORTAL_NAME;
    const fs = (user.getField() as Field | null)?.getFieldStorage();
    const target = fs?.getFieldById(fieldId) as Field | null | undefined;
    if (!target) {
      user.write(MessagePacket.system(`Could not resolve field ID : ${fieldId}`));
      return;
    }
    const portal = target.getPortalByName(portalName) ?? target.getRandomStartPoint();
    if (!portal) {
      user.write(MessagePacket.system(`Could not resolve portal ${portalName} for field ID : ${fieldId}`));
      return;
    }
    user.warp(target, portal, false, false);
  }

  /** `!goto <characterName>` — warps the GM to another online player. */
  static goto(user: User, args: string[]): void {
    const name = args[1];
    if (!name) {
      user.write(MessagePacket.system('Syntax : !goto <character name>'));
      return;
    }
    const target = ChannelServer.instance.getUserByCharacterName(name);
    if (!target || !target.getField()) {
      user.write(MessagePacket.system(`Could not find online character : ${name}`));
      return;
    }
    const targetField = target.getField() as Field;
    const portal = targetField.getRandomStartPoint() ?? PortalInfo.EMPTY;
    user.warp(targetField, portal, false, false);
    user.warpTo(targetField, target.getX(), target.getY(), portal.portalId, false, false);
  }

  /** `!summon <characterName>` — warps another online player to the GM. */
  static summon(user: User, args: string[]): void {
    const name = args[1];
    if (!name) {
      user.write(MessagePacket.system('Syntax : !summon <character name>'));
      return;
    }
    const target = ChannelServer.instance.getUserByCharacterName(name);
    const field = user.getField() as Field | null;
    if (!target || !field) {
      user.write(MessagePacket.system(`Could not find online character : ${name}`));
      return;
    }
    const portal = field.getRandomStartPoint() ?? PortalInfo.EMPTY;
    target.warp(field, portal, false, false);
    target.warpTo(field, user.getX(), user.getY(), portal.portalId, false, false);
  }

  // ---- field manipulation ----------------------------------------------

  /** `!mob`/`!spawn <mobId> [count]` — spawns mobs at the GM's position. */
  static mob(user: User, args: string[]): void {
    const templateId = Arguments.parseInt(args, 1);
    const template = MobProvider.getMobTemplate(templateId);
    if (!template) {
      user.write(MessagePacket.system(`Could not resolve mob template ID : ${templateId}`));
      return;
    }
    const count = Math.max(1, Arguments.parseInt(args, 2, 1));
    const field = user.getField() as Field | null;
    if (!field) return;
    const fh = field.getMapInfo().getFootholdBelow(user.getX(), user.getY() - GameConstants.REACTOR_SPAWN_HEIGHT)?.sn ?? user.getFoothold();
    for (let i = 0; i < count; i++) {
      const mob = new Mob(template, null, user.getX(), user.getY(), fh);
      mob.summonType = MobAppearType.EFFECT;
      field.getMobPool().addMob(mob);
    }
  }

  /** `!killmobs` — damages every mob on the field for its full max HP. */
  static killMobs(user: User): void {
    const field = user.getField() as Field | null;
    if (!field) return;
    field.getMobPool().forEach((mob: Mob) => {
      if (mob.getHp() > 0) {
        mob.damage(user.getCharacterId(), mob.getMaxHp());
        field.getMobPool().removeMob(mob, MobLeaveType.ETC);
      }
    });
  }

  /** `!togglemob <true|false>` — enables/disables mob respawn on the field. */
  static toggleMob(user: User, args: string[]): void {
    const field = user.getField() as Field | null;
    if (!field) return;
    const v = (args[1] ?? '').toLowerCase();
    if (v === 'true') {
      field.setMobSpawn(true);
      user.write(MessagePacket.system('Enabled mob spawns'));
    } else if (v === 'false') {
      field.setMobSpawn(false);
      user.write(MessagePacket.system('Disabled mob spawns'));
    } else {
      user.write(MessagePacket.system('Syntax : !togglemob <true|false>'));
    }
  }

  // ---- inventory / currency --------------------------------------------

  /** `!item <itemId> [quantity]` — creates and adds an item to inventory. */
  static item(user: User, args: string[]): void {
    const itemId = Arguments.parseInt(args, 1);
    const info = ItemProvider.getItemInfo(itemId);
    if (!info) {
      user.write(MessagePacket.system(`Could not resolve item ID : ${itemId}`));
      return;
    }
    const quantity = Math.max(1, Arguments.parseInt(args, 2, 1));
    const im = user.getInventoryManager();
    const item = info.createItem(user.getNextItemSn(), Math.min(quantity, info.getSlotMax()), ItemVariationOption.NORMAL);
    const ops = im.addItem(item);
    if (!ops) {
      user.write(MessagePacket.system(`Failed to add item ID ${itemId} (${quantity}) to inventory`));
      return;
    }
    user.write(inventoryOperation(ops, true));
    user.write(UserLocal.effect(Effect.gainItem(itemId, quantity)));
  }

  /** `!clearinventory <type>` — empties one inventory tab. */
  static clearInventory(user: User, args: string[]): void {
    const typeName = (args[1] ?? '').toUpperCase();
    const type = (Object.values(InventoryType) as number[]).includes(
      (InventoryType as any)[typeName],
    ) ? (InventoryType as any)[typeName] as InventoryType : undefined;
    if (type === undefined || type === InventoryType.EQUIPPED) {
      user.write(MessagePacket.system('Please specify a valid inventory type : EQUIP | CONSUME | INSTALL | ETC | CASH'));
      return;
    }
    const im = user.getInventoryManager();
    const inv = im.getInventoryByType(type);
    const ops: InventoryOperation[] = [];
    for (const [pos] of inv.getItems()) {
      ops.push(InventoryOperation.delItem(type, pos));
    }
    inv.getItems().clear();
    user.write(inventoryOperation(ops, true));
    user.write(MessagePacket.system(`${typeName} inventory cleared!`));
  }

  /** `!meso`/`!money <amount>` — sets the character's meso balance. */
  static meso(user: User, args: string[]): void {
    const money = Arguments.parseInt(args, 1);
    const im = user.getInventoryManager();
    im.money = money;
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(MessagePacket.system(`Set meso to ${money}`));
  }

  /** `!nx <amount>` — sets the account's NX prepaid balance. */
  static nx(user: User, args: string[]): void {
    const nx = Arguments.parseInt(args, 1);
    if (user.account) {
      user.account.nxPrepaid = nx;
    }
    user.write(MessagePacket.system(`Set NX prepaid to ${nx}`));
  }

  // ---- stats ------------------------------------------------------------

  /** `!hp <newHp>` / `!mp <newMp>` — sets current HP/MP. */
  static hp(user: User, args: string[]): void {
    user.setHp(Arguments.parseInt(args, 1));
  }
  static mp(user: User, args: string[]): void {
    user.setMp(Arguments.parseInt(args, 1));
  }

  /** `!stat <hp|mp|str|dex|int|luk|ap|sp> <value>` — sets a base stat. */
  static stat(user: User, args: string[]): void {
    const stat = (args[1] ?? '').toLowerCase();
    const value = Arguments.parseInt(args, 2);
    const cs = user.getCharacterStat();
    const map = new Map<Stat, any>();
    switch (stat) {
      case 'hp': cs.maxHp = value; map.set(Stat.MHP, cs.maxHp); break;
      case 'mp': cs.maxMp = value; map.set(Stat.MMP, cs.maxMp); break;
      case 'str': cs.baseStr = value; map.set(Stat.STR, cs.baseStr); break;
      case 'dex': cs.baseDex = value; map.set(Stat.DEX, cs.baseDex); break;
      case 'int': cs.baseInt = value; map.set(Stat.INT, cs.baseInt); break;
      case 'luk': cs.baseLuk = value; map.set(Stat.LUK, cs.baseLuk); break;
      case 'ap': cs.ap = value; map.set(Stat.AP, cs.ap); break;
      case 'sp':
        if (JobConstants.isExtendSpJob(cs.job)) {
          cs.sp.setSp(JobConstants.getJobLevel(cs.job), value);
          map.set(Stat.SP, cs.sp);
        } else {
          cs.sp.setNonExtendSp(value);
          map.set(Stat.SP, cs.sp.getNonExtendSp());
        }
        break;
      default:
        user.write(MessagePacket.system('Syntax : !stat hp/mp/str/dex/int/luk/ap/sp <new value>'));
        return;
    }
    user.validateStat();
    user.write(statChangedMapPacket(map));
    user.write(MessagePacket.system(`Set ${stat} to ${value}`));
  }

  /** `!level <newLevel>` — sets the character's level directly. */
  static level(user: User, args: string[]): void {
    const newLevel = Arguments.parseInt(args, 1);
    if (newLevel < 1 || newLevel > GameConstants.LEVEL_MAX) {
      user.write(MessagePacket.system(`Could not change level to : ${newLevel}`));
      return;
    }
    const cs = user.getCharacterStat();
    cs.level = newLevel;
    user.validateStat();
    user.write(statChangedPacket(Stat.LEVEL, cs.level));
    user.write(MessagePacket.system(`Set level to ${newLevel}`));
  }

  /** `!levelup <targetLevel>` — grants EXP until `targetLevel` is reached. */
  static levelUp(user: User, args: string[]): void {
    const target = Arguments.parseInt(args, 1);
    if (target <= user.getLevel() || target > GameConstants.LEVEL_MAX) {
      user.write(MessagePacket.system(`Could not level up to : ${target}`));
      return;
    }
    while (user.getLevel() < target) {
      const needed = GameConstants.getNextLevelExp(user.getLevel()) - user.getCharacterStat().exp;
      user.addExp(needed);
    }
  }

  /** `!job <jobId>` — changes the character's job. */
  static job(user: User, args: string[]): void {
    const jobId = Arguments.parseInt(args, 1);
    cs_job(user, jobId);
  }

  /** `!max` — maxes level/HP/MP and tops up HP/MP (port of kinoko `max`). */
  static max(user: User): void {
    const cs = user.getCharacterStat();
    cs.level = GameConstants.LEVEL_MAX;
    cs.maxHp = GameConstants.HP_MAX;
    cs.maxMp = GameConstants.MP_MAX;
    cs.exp = 0;
    user.validateStat();
    user.write(statChangedMapPacket(new Map<Stat, any>([
      [Stat.LEVEL, cs.level],
      [Stat.MHP, cs.maxHp],
      [Stat.MMP, cs.maxMp],
      [Stat.EXP, cs.exp],
    ])));
    user.setHp(user.getMaxHp());
    user.setMp(user.getMaxMp());
    user.write(MessagePacket.system('Maxed stats'));
  }

  // ---- skills ----------------------------------------------------------

  /** `!skill <skillId> <level>` — sets a skill's level (master level = max). */
  static skill(user: User, args: string[]): void {
    const skillId = Arguments.parseInt(args, 1);
    const slv = Arguments.parseInt(args, 2);
    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) {
      user.write(MessagePacket.system(`Could not find skill : ${skillId}`));
      return;
    }
    const sr = new SkillRecord(skillId);
    sr.setSkillLevel(Math.min(slv, si.maxLevel));
    sr.setMasterLevel(si.masterLevel || si.maxLevel);
    user.getSkillManager().addSkill(sr);
    user.updatePassiveSkillData();
    user.validateStat();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { changeSkillRecordResultPacket } = require('../../world/item/ItemPacket');
    user.write(changeSkillRecordResultPacket(sr, true));
  }

  // ---- help ------------------------------------------------------------

  /** `!help [command]` — lists all commands or shows one command's syntax. */
  static help(user: User, args: string[]): void {
    if (args.length <= 1) {
      user.write(MessagePacket.system('Admin Commands :'));
      for (const e of CommandProcessor.getAllEntries()) {
        user.write(MessagePacket.system(CommandProcessor.getHelpString(e)));
      }
      return;
    }
    const e = CommandProcessor.getCommand(args[1]);
    if (!e) {
      user.write(MessagePacket.system(`Unknown command : ${args[1]}`));
      return;
    }
    user.write(MessagePacket.system(`Syntax : ${CommandProcessor.getHelpString(e)}`));
  }

  // ---- registration ----------------------------------------------------

  /** Registers every built-in command with the CommandProcessor. */
  static registerAll(): void {
    for (const e of AdminCommands.entries()) {
      CommandProcessor.register(e);
    }
  }

  private static entries(): CommandEntry[] {
    return [
      entry(['dispose'], [], (u) => AdminCommands.dispose(u)),
      entry(['info'], [], (u) => AdminCommands.info(u)),
      entry(['map', 'warp'], ['field ID to warp to'], AdminCommands.map),
      entry(['goto'], ['character name'], AdminCommands.goto),
      entry(['summon'], ['character name'], AdminCommands.summon),
      entry(['mob', 'spawn'], ['mob template ID'], AdminCommands.mob),
      entry(['killmobs'], [], (u) => AdminCommands.killMobs(u)),
      entry(['togglemob'], ['true/false'], AdminCommands.toggleMob),
      entry(['item'], ['item ID'], AdminCommands.item),
      entry(['clearinventory'], ['inventory type'], AdminCommands.clearInventory),
      entry(['meso', 'money'], ['amount'], AdminCommands.meso),
      entry(['nx'], ['amount'], AdminCommands.nx),
      entry(['hp'], ['new hp'], AdminCommands.hp),
      entry(['mp'], ['new mp'], AdminCommands.mp),
      entry(['stat'], ['hp/mp/str/dex/int/luk/ap/sp', 'new value'], AdminCommands.stat),
      entry(['level'], ['new level'], AdminCommands.level),
      entry(['levelup'], ['new level'], AdminCommands.levelUp),
      entry(['job'], ['job ID'], AdminCommands.job),
      entry(['max'], [], (u) => AdminCommands.max(u)),
      entry(['skill'], ['skill ID', 'skill level'], AdminCommands.skill),
      entry(['help'], [], AdminCommands.help),
    ];
  }
}

/** Shared job-change implementation (kept inline to avoid an extra module). */
function cs_job(user: User, jobId: number): void {
  const cs = user.getCharacterStat();
  cs.job = jobId;
  user.updatePassiveSkillData();
  user.validateStat();
  user.write(statChangedPacket(Stat.JOB, cs.job));
  user.getField()?.broadcastPacket(UserRemote.effect(user, Effect.jobChanged()), user);
  user.write(MessagePacket.system(`Set job to ${jobId}`));
}
