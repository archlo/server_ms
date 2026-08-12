import { SkillInfo } from '../../../provider/skill/SkillInfo';
import { Rect } from '../../../util/Rect';
import { Life } from '../life/Life';
import { AvatarLook } from '../../user/AvatarLook';
import { SummonedAssistType } from './SummonedAssistType';
import { SummonedEnterType } from './SummonedEnterType';
import { SummonedLeaveType } from './SummonedLeaveType';
import { SummonedMoveAbility } from './SummonedMoveAbility';

export class Summoned extends Life {
  enterType = SummonedEnterType.CREATE_SUMMONED;
  leaveType = SummonedLeaveType.LEAVE_FIELD;
  rect: Rect | null = null;
  hp = 1;
  teslaCoilState = 0;
  ownerId = 0;
  lastUpdateTime = 0;

  getRect(): Rect | null { return this.rect; }
  setRect(rect: Rect): void { this.rect = rect; }

  constructor(
    public readonly skillId: number,
    public readonly skillLevel: number,
    public readonly moveAbility: SummonedMoveAbility,
    public readonly assistType: SummonedAssistType,
    public readonly avatarLook: AvatarLook | null = null,
    public readonly expireTime: Date = new Date(8640000000000000),
  ) {
    super();
  }

  isExpired(now: Date): boolean {
    return now >= this.expireTime;
  }

  setPosition(field: any, x: number, y: number, left: boolean): void {
    this.setField(field);
    this.setX(x);
    this.setY(y);
    this.setLeft(left);
    const foothold = field?.getMapInfo?.().getFootholdBelow?.(x, y);
    this.setFoothold(foothold?.sn ?? 0);
  }

  static from(si: SkillInfo, slv: number, moveAbility: SummonedMoveAbility, assistType: SummonedAssistType): Summoned;
  static from(skillId: number, slv: number, moveAbility: SummonedMoveAbility, assistType: SummonedAssistType, expireTime: Date): Summoned;
  static from(
    siOrSkillId: SkillInfo | number,
    slv: number,
    moveAbility: SummonedMoveAbility,
    assistType: SummonedAssistType,
    expireTime?: Date,
  ): Summoned {
    const skillId = typeof siOrSkillId === 'number' ? siOrSkillId : siOrSkillId.skillId;
    const expire = expireTime ?? new Date(Date.now() + (typeof siOrSkillId === 'number' ? 0 : siOrSkillId.getDuration(slv)));
    const summoned = new Summoned(skillId, slv, moveAbility, assistType, null, expire);
    if (typeof siOrSkillId !== 'number') {
      summoned.rect = siOrSkillId.getRect(slv);
    }
    return summoned;
  }
}
