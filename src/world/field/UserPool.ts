import { FieldObjectPool } from './FieldObjectPool';
import { User } from '../user/User';
import { UserPacket } from '../user/UserPacket';
import { Mob } from './mob/Mob';
import { MobPacket } from './mob/MobPacket';
import { Npc } from './npc/Npc';
import { NpcPacket } from './npc/NpcPacket';
import { DropPacket } from './drop/DropPacket';
import { DropEnterType } from './drop/DropEnterType';
import { ReactorPacket } from './reactor/ReactorPacket';
import { SummonedPacket } from './summoned/SummonedPacket';
import { PetPacket } from '../user/PetPacket';
import { QuestProvider } from '../../provider/QuestProvider';
import { AffectedAreaPacket } from './affectedarea/AffectedAreaPacket';
import { TownPortalPacket } from './townportal/TownPortalPacket';
import { DragonPacket } from '../user/DragonPacket';
import { CashItemPacket } from '../item/CashItemPacket';
import { MapleTvPacket } from './MapleTvPacket';
import { ScriptManager } from '../script/ScriptManager';

/**
 * Port of kinoko's UserPool. Holds the real User instances present in a field.
 * Pet/Dragon/Summoned/OpenGate/TownPortal/AffectedArea/party-related branches
 * of UserPool::addUser/removeUser are not ported (those subsystems don't
 * exist yet) - see PORT_GAPS.md "FieldHandler (#13) scope notes" and
 * "enter-field/leave-field broadcast wiring (#18)".
 */
export class UserPool extends FieldObjectPool<User> {
  constructor(private readonly field: any) { super(); }

  /** Port of kinoko's UserPool::addUser. */
  addUser(user: User): void {
    // Update entering client with existing users in pool
    for (const existingUser of this.getAll()) {
      user.write(UserPacket.userEnterField(existingUser));
      for (const pet of existingUser.getPets()) {
        user.write(PetPacket.petActivated(existingUser, pet));
      }
      for (const summoned of existingUser.getSummonedAll()) {
        user.write(SummonedPacket.summonedEnterField(existingUser, summoned));
      }
      if (existingUser.getDragon()) {
        user.write(DragonPacket.dragonEnterField(existingUser, existingUser.getDragon()!));
      }
    }

    user.setField(this.field);
    user.setId(user.getCharacterId());
    this.addObject(user);
    this.field.broadcastPacket(UserPacket.userEnterField(user), user);

    for (const pet of user.getPets()) {
      pet.setPosition(this.field, user.getX(), user.getY());
      this.field.broadcastPacket(PetPacket.petActivated(user, pet));
      user.write(PetPacket.petLoadExceptionList(user, pet.getPetIndex(), pet.getItemSn(), pet.getExceptionList()));
    }

    // Add user dragon (port of kinoko UserPool::addUser)
    if (user.getDragon()) {
      user.getDragon()!.setPosition(this.field, user.getX(), user.getY());
      this.field.broadcastPacket(DragonPacket.dragonEnterField(user, user.getDragon()!));
    }

    // Create field objects for entering user
    for (const mob of this.field.getMobPool().getAll() as Mob[]) {
      user.write(MobPacket.mobEnterField(mob));
      if (!mob.hasController()) {
        mob.setController(user);
        user.write(MobPacket.mobChangeController(mob, true));
      } else {
        user.write(MobPacket.mobChangeController(mob, false));
      }
    }
    for (const npc of this.field.getNpcPool().getAll() as Npc[]) {
      const questIds = QuestProvider.getQuestIdsByNpc(npc.getTemplateId());
      user.write(NpcPacket.npcEnterField(npc, questIds));
      if (npc.getController() === null) {
        npc.setController(user);
        user.write(NpcPacket.npcChangeController(npc, true));
      } else {
        user.write(NpcPacket.npcChangeController(npc, false));
      }
    }
    for (const drop of this.field.getDropPool().getAll()) {
      if (drop.questId !== 0 && !user.getQuestManager().hasQuestStarted(drop.questId)) continue;
      user.write(DropPacket.dropEnterField(drop, DropEnterType.ON_THE_FOOTHOLD, 0));
    }
    for (const reactor of this.field.getReactorPool().getAll()) {
      user.write(ReactorPacket.reactorEnterField(reactor));
    }
    for (const affectedArea of this.field.getAffectedAreaPool().getAll()) {
      user.write(AffectedAreaPacket.affectedAreaCreated(affectedArea));
    }
    for (const summoned of user.getSummonedAll()) {
      user.write(SummonedPacket.summonedEnterField(user, summoned));
    }

    // Show existing Mystic Door portals to the entering user (port of kinoko UserPool::addUser)
    for (const townPortal of this.field.getTownPortalPool().getAll()) {
      if (townPortal.townField === this.field) {
        // Town-side portal: rendered at the town portal point position
        const portalPoint = townPortal.getTownPortalPoint();
        user.write(TownPortalPacket.townPortalCreatedFor(townPortal.getOwner().getCharacterId(), portalPoint.x, portalPoint.y, false));
      } else {
        // Field-side portal: rendered at the cast position
        user.write(TownPortalPacket.townPortalCreated(townPortal, false));
      }
    }

    // Re-send active weather effect to the entering user (port of kinoko Field::addUser)
    const weatherEffect = this.field.getWeatherEffect();
    if (weatherEffect) {
      user.write(CashItemPacket.blowWeather(weatherEffect.itemId, weatherEffect.message));
    }

    // Re-send current Maple TV message to the entering user (port of kinoko Field::addUser)
    const mapleTvQueue = this.field.getMapleTvQueue();
    if (mapleTvQueue.length > 0) {
      const last = mapleTvQueue[mapleTvQueue.length - 1];
      const totalWaitTime = Math.max(Math.floor((last.expireTime.getTime() - Date.now()) / 1000), 0);
      user.write(MapleTvPacket.updateMessage(mapleTvQueue[0], totalWaitTime));
    }

    // Execute field enter scripts (port of kinoko Field::addUser)
    const mapInfo = this.field.getMapInfo();
    if (mapInfo.hasOnFirstUserEnter() && this.field.consumeFirstEnterScript()) {
      ScriptManager.startFieldEnterScript(user, this.field, mapInfo.onFirstUserEnter);
    }
    if (mapInfo.hasOnUserEnter()) {
      ScriptManager.startFieldEnterScript(user, this.field, mapInfo.onUserEnter);
    }
  }

  /** Port of kinoko's UserPool::removeUser. */
  removeUser(user: User): boolean {
    if (!this.removeObject(user)) return false;
    this.field.broadcastPacket(UserPacket.userLeaveField(user), user);

    // Reassign mob/npc controllers previously held by the leaving user
    for (const mob of this.field.getMobPool().getAll() as Mob[]) {
      if (mob.getController() === user) this.assignController(mob);
    }
    for (const npc of this.field.getNpcPool().getAll() as Npc[]) {
      if (npc.getController() === user) this.assignController(npc);
    }

    user.closeDialog();
    user.removeSummoned(() => true);
    this.field.getAffectedAreaPool().removeByOwnerId(user.getCharacterId());
    return true;
  }

  /** Port of kinoko's UserPool::assignController. */
  assignController(controlled: Mob | Npc): void {
    const nearest = controlled.getNearestObject(this.getAll());
    if (!nearest) {
      controlled.setController(null);
      return;
    }
    this.setController(controlled, nearest);
  }

  /** Port of kinoko's UserPool::setController. */
  setController(controlled: Mob | Npc, controller: User): void {
    controlled.setController(controller);
    if (controlled instanceof Mob) {
      controller.write(MobPacket.mobChangeController(controlled, true));
      this.field.broadcastPacket(MobPacket.mobChangeController(controlled, false), controller);
    } else {
      controller.write(NpcPacket.npcChangeController(controlled, true));
      this.field.broadcastPacket(NpcPacket.npcChangeController(controlled, false), controller);
    }
  }

  getUserByCharacterId(charId: number): User | undefined {
    return this.getBy(u => u.getCharacterId() === charId);
  }

  /** Port of kinoko's UserPool::getByCharacterName. */
  getUserByCharacterName(name: string): User | undefined {
    const lower = name.toLowerCase();
    return this.getBy(u => u.getCharacterName().toLowerCase() === lower);
  }

  getPartyMembers(partyId: number): User[] {
    if (partyId === 0) return [];
    return this.getAll().filter((u) => u.getPartyId() === partyId);
  }

  forEachPartyMemberOf(user: User, consumer: (member: User) => void): void {
    const partyId = user.getPartyId();
    if (partyId === 0) return;
    for (const member of this.getAll()) {
      if (member.getCharacterId() !== user.getCharacterId() && member.getPartyId() === partyId) {
        consumer(member);
      }
    }
  }

  forEachPartySummoned(user: User, consumer: (summoned: any) => void): void {
    const partyId = user.getPartyId();
    if (partyId === 0) return;
    for (const member of this.getAll()) {
      if (member.getCharacterId() !== user.getCharacterId() && member.getPartyId() === partyId) {
        for (const summoned of member.getSummonedAll()) {
          consumer(summoned);
        }
      }
    }
  }
}
