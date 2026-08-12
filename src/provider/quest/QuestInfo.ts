import { NXNode } from '../../wz-utils/NXNode';
import { QuestMobData } from './QuestMobData';
import { QuestAct } from './act/QuestAct';
import { QuestCheck } from './check/QuestCheck';
import { QuestItemAct } from './act/QuestItemAct';
import { QuestMoneyAct } from './act/QuestMoneyAct';
import { QuestExpAct } from './act/QuestExpAct';
import { QuestPopAct } from './act/QuestPopAct';
import { QuestSpAct } from './act/QuestSpAct';
import { QuestInfoAct } from './act/QuestInfoAct';
import { QuestSkillAct } from './act/QuestSkillAct';
import { QuestBuffAct } from './act/QuestBuffAct';
import { QuestPetAct } from './act/QuestPetAct';
import { QuestItemCheck } from './check/QuestItemCheck';
import { QuestMobCheck } from './check/QuestMobCheck';
import { QuestJobCheck } from './check/QuestJobCheck';
import { QuestSubJobCheck } from './check/QuestSubJobCheck';
import { QuestSkillCheck } from './check/QuestSkillCheck';
import { QuestMorphCheck } from './check/QuestMorphCheck';
import { QuestLevelCheck } from './check/QuestLevelCheck';
import { QuestBuffCheck } from './check/QuestBuffCheck';
import { QuestDateCheck } from './check/QuestDateCheck';
import { QuestDayOfWeekCheck } from './check/QuestDayOfWeekCheck';
import { QuestExCheck } from './check/QuestExCheck';
import { User } from '../../world/user/User';
import { QuestRecord } from '../../world/quest/QuestRecord';
import { QuestState } from '../../world/quest/QuestState';
import { questFailedUnknown } from '../../world/quest/QuestPacket';

export class QuestInfo {
  constructor(
    public readonly questId: number,
    public readonly questName: string,
    public readonly questParent: string,
    public readonly questArea: number,
    public readonly nextQuest: number,
    public readonly npc: number,
    public readonly autoStart: boolean,
    public readonly autoComplete: boolean,
    public readonly startActs: QuestAct[],
    public readonly completeActs: QuestAct[],
    public readonly startChecks: QuestCheck[],
    public readonly completeChecks: QuestCheck[],
  ) {}

  isAutoAlert(): boolean { return this.autoStart || this.autoComplete; }

  /** Convenience: mobs from the complete-check QuestMobCheck (if any). */
  get mobs(): QuestMobData[] {
    for (const check of this.completeChecks) {
      if (check instanceof QuestMobCheck) return check.getMobs();
    }
    return [];
  }

  canStartQuest(user: User): boolean {
    if (user.getQuestManager().hasQuestStarted(this.questId)) return false;
    for (const check of this.startChecks) {
      if (!check.check(user)) return false;
    }
    return true;
  }

  startQuest(user: User): QuestRecord | null {
    if (!this.canStartQuest(user)) return null;
    for (const act of this.startActs) {
      if (!act.canAct(user, -1)) return null;
    }
    const qm = user.getQuestManager();
    qm.removeQuestRecord(this.questId);
    for (const act of this.startActs) {
      if (!act.doAct(user, -1)) {
        user.write(questFailedUnknown());
        throw new Error('Failed to perform quest start act');
      }
    }
    return qm.getQuestRecord(this.questId) ?? qm.forceStartQuest(this.questId);
  }

  canCompleteQuest(user: User): boolean {
    if (!user.getQuestManager().hasQuestStarted(this.questId)) return false;
    for (const check of this.completeChecks) {
      if (!check.check(user)) return false;
    }
    return true;
  }

  completeQuest(user: User, rewardIndex: number): { record: QuestRecord; nextQuest: number } | null {
    if (!this.canCompleteQuest(user)) return null;
    for (const act of this.completeActs) {
      if (!act.canAct(user, rewardIndex)) return null;
    }
    for (const act of this.completeActs) {
      if (!act.doAct(user, rewardIndex)) {
        user.write(questFailedUnknown());
        throw new Error('Failed to perform quest complete act');
      }
    }
    const qr = user.getQuestManager().forceCompleteQuest(this.questId);
    return { record: qr, nextQuest: this.nextQuest };
  }

  resignQuest(user: User): QuestRecord | null {
    const qm = user.getQuestManager();
    const qr = qm.getQuestRecord(this.questId);
    if (!qr || qr.state !== QuestState.PERFORM) return null;
    const removed = qm.removeQuestRecord(this.questId);
    if (!removed) return null;
    for (const act of this.startActs) {
      if (act instanceof QuestItemAct) act.removeQuestItems(user);
    }
    removed.state = QuestState.NONE;
    return removed;
  }

  restoreLostItems(user: User, lostItems: number[]): void {
    const qm = user.getQuestManager();
    const qr = qm.getQuestRecord(this.questId);
    if (!qr || qr.state !== QuestState.PERFORM) {
      user.write(questFailedUnknown());
      return;
    }
    for (const act of this.startActs) {
      if (act instanceof QuestItemAct) act.restoreLostItems(user, lostItems);
    }
  }

  hasRequiredItem(user: User, itemId: number): boolean {
    for (const check of this.completeChecks) {
      if (!(check instanceof QuestItemCheck)) continue;
      for (const itemData of check.getItems()) {
        if (itemData.itemId === itemId && user.getInventoryManager().hasItem(itemId, itemData.count)) {
          return true;
        }
      }
    }
    return false;
  }

  progressQuest(questRecord: QuestRecord, killedMobId: number): QuestRecord | null {
    if (questRecord.state !== QuestState.PERFORM) return null;
    const mobCheck = this.completeChecks.find(c => c instanceof QuestMobCheck) as QuestMobCheck | undefined;
    if (!mobCheck) return null;
    const mobs = mobCheck.getMobs();
    if (mobs.length === 0) return null;
    if (!mobs.some(m => m.isMatch(killedMobId))) return null;

    const progress = new Array(mobs.length).fill(0);
    const value = questRecord.value;
    if (value) {
      for (let c = 0; c < value.length; c += 3) {
        const idx = c / 3;
        if (idx >= progress.length) break;
        const countStr = value.substring(c, Math.min(c + 3, value.length));
        const n = parseInt(countStr, 10);
        if (!isNaN(n)) progress[idx] = n;
      }
    }
    for (let i = 0; i < mobs.length; i++) {
      if (mobs[i].isMatch(killedMobId)) {
        progress[i] = Math.min(progress[i] + 1, mobs[i].count);
      }
    }
    const newQrValue = progress.map(c => String(Math.min(c, 999)).padStart(3, '0')).join('');
    if (newQrValue === questRecord.value) return null;
    questRecord.value = newQrValue;
    return questRecord;
  }

  static from(questId: number, questInfo: NXNode, questAct: NXNode, questCheck: NXNode): QuestInfo {
    let questName = '';
    let questParent = '';
    let autoStart = false;
    let autoComplete = false;
    let questArea = 0;
    let npc = 0;

    for (const child of questInfo.nChildren) {
      switch (child.nName) {
        case 'name':         questName = String(child.nValue ?? ''); break;
        case 'parent':       questParent = String(child.nValue ?? ''); break;
        case 'area':         questArea = child.nValue as number; break;
        case 'npc':          npc = child.nValue as number; break;
        case 'autoStart':    autoStart = (child.nValue as number) !== 0; break;
        case 'autoComplete': autoComplete = (child.nValue as number) !== 0; break;
      }
    }

    const act1 = questAct.nGet('1') as NXNode | undefined;
    const nextQuest = act1 ? (act1.nGet('nextQuest', 0) as number) : 0;

    return new QuestInfo(
      questId,
      questName,
      questParent,
      questArea,
      nextQuest,
      npc,
      autoStart,
      autoComplete,
      resolveQuestActs(questId, questAct.nGet('0') as NXNode),
      resolveQuestActs(questId, questAct.nGet('1') as NXNode),
      resolveQuestChecks(questId, questCheck.nGet('0') as NXNode),
      resolveQuestChecks(questId, questCheck.nGet('1') as NXNode),
    );
  }
}

function resolveQuestActs(questId: number, actProps: NXNode | undefined): QuestAct[] {
  if (!actProps) return [];
  const acts: QuestAct[] = [];
  for (const child of actProps.nChildren) {
    switch (child.nName) {
      case 'item':
        acts.push(QuestItemAct.from(questId, child));
        break;
      case 'money':
        acts.push(new QuestMoneyAct(child.nValue as number));
        break;
      case 'exp':
        acts.push(new QuestExpAct(child.nValue as number));
        break;
      case 'pop':
        acts.push(new QuestPopAct(child.nValue as number));
        break;
      case 'sp':
        acts.push(QuestSpAct.from(child));
        break;
      case 'info':
        acts.push(new QuestInfoAct(questId, String(child.nValue ?? '')));
        break;
      case 'skill':
        if (questId === 6034) continue;
        acts.push(QuestSkillAct.from(child));
        break;
      case 'buffItemID':
        acts.push(new QuestBuffAct(child.nValue as number));
        break;
      case 'pettameness':
        acts.push(new QuestPetAct(child.nValue as number, actProps.nGet('petspeed') !== undefined));
        break;
      case 'petspeed':
      case 'nextQuest':
        break;
    }
  }
  return acts;
}

function resolveQuestChecks(questId: number, checkProps: NXNode | undefined): QuestCheck[] {
  if (!checkProps) return [];
  const checks: QuestCheck[] = [];
  for (const child of checkProps.nChildren) {
    switch (child.nName) {
      case 'item':
        checks.push(QuestItemCheck.from(child));
        break;
      case 'mob':
        checks.push(QuestMobCheck.from(questId, child));
        break;
      case 'job':
        checks.push(QuestJobCheck.from(child));
        break;
      case 'subJobFlags':
        checks.push(new QuestSubJobCheck(child.nValue as number));
        break;
      case 'skill':
        checks.push(QuestSkillCheck.from(child));
        break;
      case 'morph':
        checks.push(new QuestMorphCheck(child.nValue as number));
        break;
      case 'lvmin':
        checks.push(new QuestLevelCheck(child.nValue as number, true));
        break;
      case 'lvmax':
        checks.push(new QuestLevelCheck(child.nValue as number, false));
        break;
      case 'buff':
        checks.push(new QuestBuffCheck(child.nValue as number, false));
        break;
      case 'exceptbuff':
        checks.push(new QuestBuffCheck(child.nValue as number, true));
        break;
      case 'start':
        checks.push(QuestDateCheck.from(String(child.nValue ?? ''), true));
        break;
      case 'end':
        checks.push(QuestDateCheck.from(String(child.nValue ?? ''), false));
        break;
      case 'dayOfWeek':
        checks.push(QuestDayOfWeekCheck.from(child));
        break;
      case 'infoex': {
        const infoQuestId = checkProps.nGet('infoNumber', questId) as number;
        checks.push(QuestExCheck.from(infoQuestId, child));
        break;
      }
    }
  }
  return checks;
}
