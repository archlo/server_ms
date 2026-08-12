import { AttackInfo } from './AttackInfo';

/** Port of kinoko's OutHeader subset used by Attack (UserRemote attack packet headers). */
export enum AttackHeaderType {
  UserMeleeAttack,
  UserShootAttack,
  UserMagicAttack,
  UserBodyAttack,
  SummonedAttack,
}

const MAGIC_ATTACK_SKILL_IDS = new Set([
  32001000, // BattleMage.TRIPLE_BLOW
  32101000, // BattleMage.QUAD_BLOW
  32111002, // BattleMage.QUINTUPLE_BLOW
  32121002, // BattleMage.FINISHING_BLOW
  32001007, // BattleMage.THE_FINISHER_STANDALONE
  32001008, // BattleMage.THE_FINISHER_TRIPLE_BLOW
  32001009, // BattleMage.THE_FINISHER_QUAD_BLOW
  32001010, // BattleMage.THE_FINISHER_QUINTUPLE_BLOW
  32001011, // BattleMage.THE_FINISHER_FINISHING_BLOW
]);

/** Port of kinoko's Attack (world/skill/Attack.java). */
export class Attack {
  readonly attackInfo: AttackInfo[] = [];

  mask = 0;
  flag = 0;
  skillId = 0;
  slv = 0;
  combatOrders = 0;
  keyDown = 0;
  exJablin = 0;
  actionAndDir = 0;
  attackSpeed = 0;
  mastery = 0;
  bulletPosition = 0;
  bulletItemId = 0;

  userX = 0;
  userY = 0;
  ballStartX = 0;
  ballStartY = 0;
  grenadeX = 0;
  grenadeY = 0;
  dragonX = 0;
  dragonY = 0;

  passiveSlv = 0;
  passiveSkillId = 0;
  swallowMobTemplateId = 0;
  drops: number[] = [];
  dropExplodeDelay = 0;

  crc = 0;

  constructor(public readonly headerType: AttackHeaderType) {}

  getDamagePerMob(): number { return this.mask & 0xF; }
  getMobCount(): number { return (this.mask >> 4) & 0xF; }

  isFinalAfterSlashBlast(): boolean { return (this.flag & 0x1) !== 0; }
  isSoulArrow(): boolean { return (this.flag & 0x2) !== 0; }
  isMortalBlow(): boolean { return (this.flag & 0x4) !== 0; }
  isShadowPartner(): boolean { return (this.flag & 0x8) !== 0; }
  isSerialAttackSkill(): boolean { return (this.flag & 0x20) !== 0; }
  isSpiritJavelin(): boolean { return (this.flag & 0x40) !== 0; }
  isSpark(): boolean { return (this.flag & 0x80) !== 0; }

  getAction(): number { return this.actionAndDir & 0x7FFF; }
  isLeft(): boolean { return (this.actionAndDir & 0x8000) !== 0; }

  isShootAttack(): boolean { return this.headerType === AttackHeaderType.UserShootAttack; }

  isMagicAttack(): boolean {
    if (MAGIC_ATTACK_SKILL_IDS.has(this.skillId)) return true;
    return this.headerType === AttackHeaderType.UserMagicAttack;
  }
}
