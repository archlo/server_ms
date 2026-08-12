import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { Rect } from '../../../util/Rect';
import { FieldObject } from '../FieldObject';
import { AffectedAreaType } from './AffectedAreaType';
import { ElementAttribute } from '../../../provider/skill/ElementAttribute';
import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { SkillInfo } from '../../../provider/skill/SkillInfo';
import { User } from '../../user/User';
import { Mob } from '../mob/Mob';
import { BurnedInfo } from '../mob/BurnedInfo';

const FIELD_TICK_INTERVAL = 1000;

export class AffectedArea extends FieldObject {
  constructor(
    public readonly type: AffectedAreaType,
    public readonly owner: FieldObject,
    public readonly skillId: number,
    public readonly skillLevel: number,
    public readonly delay: number,
    public readonly interval: number,
    public readonly rect: Rect,
    public readonly elemAttr: ElementAttribute,
    public readonly expireTime: Date,
  ) {
    super();
  }

  handleUserInside(user: User): void {
    if (this.skillId === 22161003 /* Evan.RECOVERY_AURA */) {
      if (user.getCharacterId() !== this.owner.getId()) {
        return;
      }
      const si = SkillProvider.getSkillInfoById(this.skillId) as SkillInfo | undefined;
      if (!si) return;
      let recoveryRate = si.getValue(SkillStat.x, this.skillLevel) / 100.0;
      recoveryRate = recoveryRate * (this.interval * FIELD_TICK_INTERVAL) / si.getDuration(this.skillLevel);
      user.addMp(Math.floor(recoveryRate * user.getMaxMp()));
    }
  }

  handleMobInside(mob: Mob): void {
    if (this.skillId === 2111003 /* Magician.POISON_MIST */ || this.skillId === 12111005 /* BlazeWizard.FLAME_GEAR */ || this.skillId === 14111006 /* NightWalker.POISON_BOMB */) {
      if (mob.getHp() === 1 || mob.getMobStat().hasBurnedInfo(this.owner.getId(), this.skillId)) {
        return;
      }
      const si = SkillProvider.getSkillInfoById(this.skillId) as SkillInfo | undefined;
      if (!si) return;
      mob.setBurnedInfo(BurnedInfo.from(this.owner as User, si, this.skillLevel, mob), 0);
    }
  }

  encode(w: PacketWriter): void {
    w.writeInt(this.getId());
    w.writeInt(this.type);
    w.writeInt(this.owner.getId());
    w.writeInt(this.skillId);
    w.writeByte(this.skillLevel);
    w.writeShort(this.delay);
    w.writeInt(this.rect.left);
    w.writeInt(this.rect.top);
    w.writeInt(this.rect.right);
    w.writeInt(this.rect.bottom);
    w.writeInt(this.elemAttr);
    w.writeInt(0); // nPhase
  }

  static mobSkill(owner: Mob, si: SkillInfo, slv: number, delay: number): AffectedArea {
    const rect = si.getRect(slv);
    if (!rect) throw new Error(`AffectedArea.mobSkill: no rect for skill ${si.skillId} slv ${slv}`);
    const relativeRect = owner.getRelativeRect(rect);
    const expireTime = new Date(Date.now() + si.getDuration(slv));
    return new AffectedArea(AffectedAreaType.MobSkill, owner, si.skillId, slv, delay, 1, relativeRect, si.elemAttr, expireTime);
  }

  static userSkill(owner: User, si: SkillInfo, slv: number, delay: number, x: number, y: number): AffectedArea {
    return AffectedArea.from(AffectedAreaType.UserSkill, owner, si, slv, delay, 1, x, y);
  }

  static buff(owner: User, itemId: number, rect: Rect, expireTime: Date): AffectedArea {
    return new AffectedArea(AffectedAreaType.Buff, owner, itemId, 0, 0, 0, owner.getRelativeRect(rect), ElementAttribute.PHYSICAL, expireTime);
  }

  static from(affectedAreaType: AffectedAreaType, owner: User, si: SkillInfo, slv: number, delay: number, interval: number, x: number, y: number): AffectedArea {
    const skillRect = si.getRect(slv);
    const rect = skillRect ? skillRect.translate(x, y) : new Rect(x - 50, y - 50, x + 50, y + 50);
    const expireTime = new Date(Date.now() + si.getDuration(slv));
    return new AffectedArea(affectedAreaType, owner, si.skillId, slv, delay, interval, rect, si.elemAttr, expireTime);
  }
}
