import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { EffectType } from './EffectType';

// Skill IDs used by SkillEffect::encode (Effect.skillUse/skillAffected family).
const WARRIOR_BERSERK = 1320006;
const EVAN_DRAGON_FURY = 22160000;
const THIEF_CHAINS_OF_HELL = 4341005;
const CITIZEN_CALL_OF_THE_HUNTER = 30001062;
const CITIZEN_CAPTURE = 30001061;
const THIEF_MONSTER_BOMB = 4341003;

/**
 * Port of kinoko's Effect (UserEffect) + SkillEffect.
 */
export class Effect {
  protected type: EffectType;
  private bool1 = false;
  private int1 = 0;
  private int2 = 0;
  private int3 = 0;
  private string1 = '';

  // SkillEffect fields (SkillUse/SkillAffected/SkillAffected_Select/SkillSpecial/SkillSpecialAffected)
  private skillId = 0;
  private skillLevel = 0;
  private charLevel = 0;
  private enable = false;
  private left = false;
  private info = 0;
  private positionX = 0;
  private positionY = 0;

  protected constructor(type: EffectType) {
    this.type = type;
  }

  encode(w: PacketWriter): void {
    w.writeByte(this.type);
    switch (this.type) {
      case EffectType.LevelUp:
      case EffectType.PlayPortalSE:
      case EffectType.JobChanged:
      case EffectType.QuestComplete:
      case EffectType.MonsterBookCardGet:
      case EffectType.ItemLevelUp:
      case EffectType.ExpItemConsumed:
      case EffectType.Buff:
      case EffectType.SoulStoneUse:
      case EffectType.RepeatEffectRemove:
      case EffectType.EvolRing:
        break;
      case EffectType.Quest:
        w.writeBoolean(this.bool1);
        if (this.bool1) {
          w.writeInt(this.int1); // nItemID
          w.writeInt(this.int2); // quantity
        } else {
          w.writeMapleAsciiString(this.string1); // sStrMsg
          w.writeInt(this.int1); // nEffect
        }
        break;
      case EffectType.Pet:
        w.writeByte(this.int1); // nType
        w.writeByte(this.int2); // pet index
        break;
      case EffectType.ProtectOnDieItemUse:
        w.writeBoolean(this.int1 === 5130000); // is safety charm
        w.writeByte(this.int2); // times left
        w.writeByte(this.int3); // days left
        if (this.int1 !== 5130000) {
          w.writeInt(this.int1); // nItemID
        }
        break;
      case EffectType.IncDecHPEffect:
        w.writeByte(this.int1); // nDelta
        break;
      case EffectType.BuffItemEffect:
      case EffectType.ItemMaker:
        w.writeInt(this.int1); // nItemID, ITEM_MAKER_RESULT
        break;
      case EffectType.SquibEffect:
        w.writeMapleAsciiString(this.string1); // sEffect
        break;
      case EffectType.LotteryUse:
        w.writeInt(this.int1); // nItemId
        w.writeBoolean(this.bool1);
        if (this.bool1) {
          w.writeMapleAsciiString(this.string1); // sEffect
        }
        break;
      case EffectType.ReservedEffect:
        w.writeMapleAsciiString(this.string1); // sEffect
        break;
      case EffectType.ConsumeEffect:
        w.writeInt(this.int1); // nItemID
        break;
      case EffectType.UpgradeTombItemUse:
        w.writeByte(this.int1); // number of wheels of destiny left
        break;
      case EffectType.BattlefieldItemUse:
        w.writeMapleAsciiString(this.string1); // sEffect
        break;
      case EffectType.AvatarOriented:
        w.writeMapleAsciiString(this.string1); // sEffect
        w.writeInt(0); // ignored
        break;
      case EffectType.IncubatorUse:
        w.writeInt(this.int1); // nItemId
        w.writeMapleAsciiString(this.string1); // sEffect
        break;
      case EffectType.PlaySoundWithMuteBGM:
        w.writeMapleAsciiString(this.string1); // sName
        break;
      case EffectType.IncDecHPEffect_EX:
        w.writeInt(this.int1); // nDelta
        break;
      case EffectType.DeliveryQuestItemUse:
        w.writeInt(this.int1); // nItemId
        break;
      case EffectType.SkillUse:
        w.writeInt(this.skillId);
        w.writeByte(this.charLevel);
        w.writeByte(this.skillLevel);
        switch (this.skillId) {
          case WARRIOR_BERSERK:
          case EVAN_DRAGON_FURY:
            w.writeBoolean(this.enable);
            break;
          case THIEF_CHAINS_OF_HELL:
            w.writeBoolean(this.left);
            w.writeInt(this.info); // dwMobID
            break;
          case CITIZEN_CALL_OF_THE_HUNTER:
            w.writeBoolean(this.left);
            w.writeShort(this.positionX);
            w.writeShort(this.positionY);
            break;
          case CITIZEN_CAPTURE:
            w.writeByte(this.info);
            break;
        }
        if (Math.floor(this.skillId / 10000000) === 9) { // is_unregistered_skill
          w.writeBoolean(this.left);
        }
        break;
      case EffectType.SkillAffected:
      case EffectType.SkillSpecialAffected:
        w.writeInt(this.skillId);
        w.writeByte(this.skillLevel);
        break;
      case EffectType.SkillAffected_Select:
        w.writeInt(this.info);
        w.writeInt(this.skillId);
        w.writeByte(this.skillLevel);
        break;
      case EffectType.SkillSpecial:
        w.writeInt(this.skillId);
        if (this.skillId === THIEF_MONSTER_BOMB) {
          w.writeInt(this.positionX); // nTimeBombX
          w.writeInt(this.positionY); // nTimeBombY
          w.writeInt(this.skillLevel);
          w.writeInt(0); // ignored
        }
        break;
      default:
        throw new Error('Tried to encode unsupported effect type: ' + this.type);
    }
  }

  static levelUp(): Effect {
    return new Effect(EffectType.LevelUp);
  }

  static playPortalSE(): Effect {
    return new Effect(EffectType.PlayPortalSE);
  }

  static jobChanged(): Effect {
    return new Effect(EffectType.JobChanged);
  }

  static questComplete(): Effect {
    return new Effect(EffectType.QuestComplete);
  }

  static soulStoneUse(): Effect {
    return new Effect(EffectType.SoulStoneUse);
  }

  static petLevelUp(petIndex: number): Effect {
    const effect = new Effect(EffectType.Pet);
    effect.int1 = 0; // PetEffectType.LevelUp
    effect.int2 = petIndex;
    return effect;
  }

  static protectOnDieItemUse(itemId: number, remainCount: number, remainDays: number): Effect {
    const effect = new Effect(EffectType.ProtectOnDieItemUse);
    effect.int1 = itemId;
    effect.int2 = remainCount;
    effect.int3 = remainDays;
    return effect;
  }

  static upgradeTombItemUse(remain: number): Effect {
    const effect = new Effect(EffectType.UpgradeTombItemUse);
    effect.int1 = remain;
    return effect;
  }

  static avatarOriented(effectPath: string): Effect {
    const effect = new Effect(EffectType.AvatarOriented);
    effect.string1 = effectPath;
    return effect;
  }

  static incDecHpEffect(delta: number): Effect {
    const effect = new Effect(EffectType.IncDecHPEffect_EX);
    effect.int1 = delta;
    return effect;
  }

  static buffItemEffect(itemId: number): Effect {
    const effect = new Effect(EffectType.BuffItemEffect);
    effect.int1 = itemId;
    return effect;
  }

  static squibEffect(effectPath: string): Effect {
    const effect = new Effect(EffectType.SquibEffect);
    effect.string1 = effectPath;
    return effect;
  }

  static lotteryUse(itemId: number, effectPath: string): Effect {
    const effect = new Effect(EffectType.LotteryUse);
    effect.int1 = itemId;
    effect.bool1 = true;
    effect.string1 = effectPath;
    return effect;
  }

  static reservedEffect(effectPath: string): Effect {
    const effect = new Effect(EffectType.ReservedEffect);
    effect.string1 = effectPath;
    return effect;
  }

  static consumeEffect(itemId: number): Effect {
    const effect = new Effect(EffectType.ConsumeEffect);
    effect.int1 = itemId;
    return effect;
  }

  static gainItem(itemId: number, quantity: number): Effect {
    const effect = new Effect(EffectType.Quest);
    effect.bool1 = true;
    effect.int1 = itemId;
    effect.int2 = quantity;
    return effect;
  }

  static itemMaker(makerResult: number): Effect {
    const effect = new Effect(EffectType.ItemMaker);
    effect.int1 = makerResult;
    return effect;
  }

  /** Port of kinoko's Effect::skillUseEnable(int, int, int, boolean). */
  static skillUseEnable(skillId: number, skillLevel: number, charLevel: number, enabled: boolean): Effect {
    const effect = new Effect(EffectType.SkillUse);
    effect.skillId = skillId;
    effect.skillLevel = skillLevel;
    effect.charLevel = charLevel;
    effect.enable = enabled;
    return effect;
  }

  /** Port of kinoko's Effect::skillUse(int, int, int). */
  static skillUse(skillId: number, skillLevel: number, charLevel: number): Effect {
    const effect = new Effect(EffectType.SkillUse);
    effect.skillId = skillId;
    effect.skillLevel = skillLevel;
    effect.charLevel = charLevel;
    return effect;
  }

  /**
   * Port of kinoko's Effect::skillUseInfo(int, int, int, int). Used by the
   * Citizen Capture skill to report capture success/failure reason codes
   * (info = 0 success, 1 hp-too-high, 2 not-capturable).
   */
  static skillUseInfo(skillId: number, skillLevel: number, charLevel: number, info: number): Effect {
    const effect = new Effect(EffectType.SkillUse);
    effect.skillId = skillId;
    effect.skillLevel = skillLevel;
    effect.charLevel = charLevel;
    effect.info = info;
    return effect;
  }

  /**
   * Port of kinoko's Effect::skillUse(Skill, int).
   * Caller passes skill.skillId/slv/left/positionX/positionY/targetIds directly
   * to avoid an Effect <-> Skill import cycle.
   */
  static skillUseForSkill(
    skillId: number, slv: number, charLevel: number,
    opts?: { left?: boolean; targetMobId?: number; positionX?: number; positionY?: number },
  ): Effect {
    const effect = new Effect(EffectType.SkillUse);
    effect.skillId = skillId;
    effect.skillLevel = slv;
    effect.charLevel = charLevel;
    switch (skillId) {
      case THIEF_CHAINS_OF_HELL:
        effect.left = opts?.left ?? false;
        if (opts?.targetMobId !== undefined) effect.info = opts.targetMobId;
        break;
      case CITIZEN_CALL_OF_THE_HUNTER:
        effect.left = opts?.left ?? false;
        effect.positionX = opts?.positionX ?? 0;
        effect.positionY = opts?.positionY ?? 0;
        break;
    }
    return effect;
  }

  /** Port of kinoko's Effect::skillAffected. */
  static skillAffected(skillId: number, skillLevel: number): Effect {
    const effect = new Effect(EffectType.SkillAffected);
    effect.skillId = skillId;
    effect.skillLevel = skillLevel;
    return effect;
  }

  /** Port of kinoko's Effect::skillAffectedSelect. */
  static skillAffectedSelect(select: number, skillId: number, skillLevel: number): Effect {
    const effect = new Effect(EffectType.SkillAffected_Select);
    effect.info = select;
    effect.skillId = skillId;
    effect.skillLevel = skillLevel;
    return effect;
  }

  /** Port of kinoko's Effect::skillSpecial. */
  static skillSpecial(skillId: number, skillLevel: number, positionX: number, positionY: number): Effect {
    const effect = new Effect(EffectType.SkillAffected_Select);
    effect.skillId = skillId;
    effect.skillLevel = skillLevel;
    effect.positionX = positionX;
    effect.positionY = positionY;
    return effect;
  }
}
