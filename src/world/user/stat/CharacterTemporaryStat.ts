/** Port of henesys.skills.CharacterTemporaryStat */
export enum CharacterTemporaryStat {
  PAD              = 0,
  PDD              = 1,
  MAD              = 2,
  MDD              = 3,
  ACC              = 4,
  EVA              = 5,
  Craft            = 6,
  Speed            = 7,
  Jump             = 8,
  MagicGuard       = 9,
  DarkSight        = 10,
  Booster          = 11,
  PowerGuard       = 12,
  MaxHP            = 13,
  MaxMP            = 14,
  Invincible       = 15,
  SoulArrow        = 16,
  Stun             = 17,
  Poison           = 18,
  Seal             = 19,
  Darkness         = 20,
  ComboCounter     = 21,
  WeaponCharge     = 22,
  DragonBlood      = 23,
  HolySymbol       = 24,
  MesoUp           = 25,
  ShadowPartner    = 26,
  PickPocket       = 27,
  MesoGuard        = 28,
  Thaw             = 29,
  Weakness         = 30,
  Curse            = 31,
  Slow             = 32,
  Morph            = 33,
  Regen            = 34,
  BasicStatUp      = 35,
  Stance           = 36,
  SharpEyes        = 37,
  ManaReflection   = 38,
  Attract          = 39,
  SpiritJavelin    = 40,
  Infinity         = 41,
  Holyshield       = 42,
  HamString        = 43,
  Blind            = 44,
  Concentration    = 45,
  BanMap           = 46,
  MaxLevelBuff     = 47,
  MesoUpByItem     = 48,
  Ghost            = 49,
  Barrier          = 50,
  ReverseInput     = 51,
  ItemUpByItem     = 52,
  RespectPImmune   = 53,
  RespectMImmune   = 54,
  DefenseAtt       = 55,
  DefenseState     = 56,
  IncEffectHPPotion = 57,
  IncEffectMPPotion = 58,
  DojangBerserk    = 59,
  DojangInvincible = 60,
  Spark            = 61,
  DojangShield     = 62,
  SoulMasterFinal  = 63,
  WindBreakerFinal = 64,
  ElementalReset   = 65,
  WindWalk         = 66,
  EventRate        = 67,
  ComboAbilityBuff = 68,
  ComboDrain       = 69,
  ComboBarrier     = 70,
  BodyPressure     = 71,
  SmartKnockback   = 72,
  RepeatEffect     = 73,
  ExpBuffRate      = 74,
  StopPortion      = 75,
  StopMotion       = 76,
  Fear             = 77,
  EvanSlow         = 78,
  MagicShield      = 79,
  MagicResistance  = 80,
  SoulStone        = 81,
  Flying           = 82,
  Frozen           = 83,
  AssistCharge     = 84,
  Enrage           = 85,
  SuddenDeath      = 86,
  NotDamaged       = 87,
  FinalCut         = 88,
  ThornsEffect     = 89,
  SwallowAttackDamage = 90,
  MorewildDamageUp = 91,
  Mine             = 92,
  EMHP             = 93,
  EMMP             = 94,
  EPAD             = 95,
  EPDD             = 96,
  EMDD             = 97,
  Guard            = 98,
  SafetyDamage     = 99,
  SafetyAbsorb     = 100,
  Cyclone          = 101,
  SwallowCritical  = 102,
  SwallowMaxMP     = 103,
  SwallowDefence   = 104,
  SwallowEvasion   = 105,
  Conversion       = 106,
  Revive           = 107,
  Sneak            = 108,
  Mechanic         = 109,
  Aura             = 110,
  DarkAura         = 111,
  BlueAura         = 112,
  YellowAura       = 113,
  SuperBody        = 114,
  MorewildMaxHP    = 115,
  Dice             = 116,
  BlessingArmor    = 117,
  DamR             = 118,
  TeleportMasteryOn = 119,
  CombatOrders     = 120,
  Beholder         = 121,
  EnergyCharged    = 122,
  Dash_Speed       = 123,
  Dash_Jump        = 124,
  RideVehicle      = 125,
  PartyBooster     = 126,
  GuidedBullet     = 127,
  Undead           = 128,
  SummonBomb       = 129,
  // extra info (not in 128-bit flag)
  DefenseAtt_Elem  = 1000,
  DefenseState_Stat = 1001,
  SuddenDeath_Count = 1002,
  BlessingArmorIncPAD = 1003,
  Swallow_Mob      = 1004,
  Swallow_Template = 1005,
}

export const FLAG_SIZE = 128; // 128 bits = 16 bytes (UINT128), matches OG DecodeForRemote / DecodeForLocal

/** Encode order for local (self) temporaryStat — port of henesys.skills.CharacterTemporaryStat.ORDER */
export const LOCAL_ENCODE_ORDER: CharacterTemporaryStat[] = [
  CharacterTemporaryStat.PAD,
  CharacterTemporaryStat.PDD,
  CharacterTemporaryStat.MAD,
  CharacterTemporaryStat.MDD,
  CharacterTemporaryStat.ACC,
  CharacterTemporaryStat.EVA,
  CharacterTemporaryStat.Craft,
  CharacterTemporaryStat.Speed,
  CharacterTemporaryStat.Jump,
  CharacterTemporaryStat.EMHP,
  CharacterTemporaryStat.EMMP,
  CharacterTemporaryStat.EPAD,
  CharacterTemporaryStat.EPDD,
  CharacterTemporaryStat.EMDD,
  CharacterTemporaryStat.MagicGuard,
  CharacterTemporaryStat.DarkSight,
  CharacterTemporaryStat.Booster,
  CharacterTemporaryStat.PowerGuard,
  CharacterTemporaryStat.Guard,
  CharacterTemporaryStat.SafetyDamage,
  CharacterTemporaryStat.SafetyAbsorb,
  CharacterTemporaryStat.MaxHP,
  CharacterTemporaryStat.MaxMP,
  CharacterTemporaryStat.Invincible,
  CharacterTemporaryStat.SoulArrow,
  CharacterTemporaryStat.Stun,
  CharacterTemporaryStat.Poison,
  CharacterTemporaryStat.Seal,
  CharacterTemporaryStat.Darkness,
  CharacterTemporaryStat.ComboCounter,
  CharacterTemporaryStat.WeaponCharge,
  CharacterTemporaryStat.DragonBlood,
  CharacterTemporaryStat.HolySymbol,
  CharacterTemporaryStat.MesoUp,
  CharacterTemporaryStat.ShadowPartner,
  CharacterTemporaryStat.PickPocket,
  CharacterTemporaryStat.MesoGuard,
  CharacterTemporaryStat.Thaw,
  CharacterTemporaryStat.Weakness,
  CharacterTemporaryStat.Curse,
  CharacterTemporaryStat.Slow,
  CharacterTemporaryStat.Morph,
  CharacterTemporaryStat.Ghost,
  CharacterTemporaryStat.Regen,
  CharacterTemporaryStat.BasicStatUp,
  CharacterTemporaryStat.Stance,
  CharacterTemporaryStat.SharpEyes,
  CharacterTemporaryStat.ManaReflection,
  CharacterTemporaryStat.Attract,
  CharacterTemporaryStat.SpiritJavelin,
  CharacterTemporaryStat.Infinity,
  CharacterTemporaryStat.Holyshield,
  CharacterTemporaryStat.HamString,
  CharacterTemporaryStat.Blind,
  CharacterTemporaryStat.Concentration,
  CharacterTemporaryStat.BanMap,
  CharacterTemporaryStat.MaxLevelBuff,
  CharacterTemporaryStat.Barrier,
  CharacterTemporaryStat.DojangShield,
  CharacterTemporaryStat.ReverseInput,
  CharacterTemporaryStat.MesoUpByItem,
  CharacterTemporaryStat.ItemUpByItem,
  CharacterTemporaryStat.RespectPImmune,
  CharacterTemporaryStat.RespectMImmune,
  CharacterTemporaryStat.DefenseAtt,
  CharacterTemporaryStat.DefenseState,
  CharacterTemporaryStat.DojangBerserk,
  CharacterTemporaryStat.DojangInvincible,
  CharacterTemporaryStat.Spark,
  CharacterTemporaryStat.SoulMasterFinal,
  CharacterTemporaryStat.WindBreakerFinal,
  CharacterTemporaryStat.ElementalReset,
  CharacterTemporaryStat.WindWalk,
  CharacterTemporaryStat.EventRate,
  CharacterTemporaryStat.ComboAbilityBuff,
  CharacterTemporaryStat.ComboDrain,
  CharacterTemporaryStat.ComboBarrier,
  CharacterTemporaryStat.BodyPressure,
  CharacterTemporaryStat.SmartKnockback,
  CharacterTemporaryStat.RepeatEffect,
  CharacterTemporaryStat.ExpBuffRate,
  CharacterTemporaryStat.IncEffectHPPotion,
  CharacterTemporaryStat.IncEffectMPPotion,
  CharacterTemporaryStat.StopPortion,
  CharacterTemporaryStat.StopMotion,
  CharacterTemporaryStat.Fear,
  CharacterTemporaryStat.EvanSlow,
  CharacterTemporaryStat.MagicShield,
  CharacterTemporaryStat.MagicResistance,
  CharacterTemporaryStat.SoulStone,
  CharacterTemporaryStat.Flying,
  CharacterTemporaryStat.Frozen,
  CharacterTemporaryStat.AssistCharge,
  CharacterTemporaryStat.Enrage,
  CharacterTemporaryStat.SuddenDeath,
  CharacterTemporaryStat.NotDamaged,
  CharacterTemporaryStat.FinalCut,
  CharacterTemporaryStat.ThornsEffect,
  CharacterTemporaryStat.SwallowAttackDamage,
  CharacterTemporaryStat.MorewildDamageUp,
  CharacterTemporaryStat.Mine,
  CharacterTemporaryStat.Cyclone,
  CharacterTemporaryStat.SwallowCritical,
  CharacterTemporaryStat.SwallowMaxMP,
  CharacterTemporaryStat.SwallowDefence,
  CharacterTemporaryStat.SwallowEvasion,
  CharacterTemporaryStat.Conversion,
  CharacterTemporaryStat.Revive,
  CharacterTemporaryStat.Sneak,
  CharacterTemporaryStat.Mechanic,
  CharacterTemporaryStat.Aura,
  CharacterTemporaryStat.DarkAura,
  CharacterTemporaryStat.BlueAura,
  CharacterTemporaryStat.YellowAura,
  CharacterTemporaryStat.SuperBody,
  CharacterTemporaryStat.MorewildMaxHP,
  CharacterTemporaryStat.Dice,
  CharacterTemporaryStat.BlessingArmor,
  CharacterTemporaryStat.DamR,
  CharacterTemporaryStat.TeleportMasteryOn,
  CharacterTemporaryStat.CombatOrders,
  CharacterTemporaryStat.Beholder,
  CharacterTemporaryStat.SummonBomb,
  // Two-state stats at the end
  CharacterTemporaryStat.EnergyCharged,
  CharacterTemporaryStat.Dash_Speed,
  CharacterTemporaryStat.Dash_Jump,
  CharacterTemporaryStat.RideVehicle,
  CharacterTemporaryStat.PartyBooster,
  CharacterTemporaryStat.GuidedBullet,
];

/** Encode order for remote (broadcast) — port of henesys.skills.CharacterTemporaryStat.REMOTE_ORDER */
export const REMOTE_ENCODE_ORDER: CharacterTemporaryStat[] = [
  CharacterTemporaryStat.Speed,
  CharacterTemporaryStat.ComboCounter,
  CharacterTemporaryStat.WeaponCharge,
  CharacterTemporaryStat.Stun,
  CharacterTemporaryStat.Darkness,
  CharacterTemporaryStat.Seal,
  CharacterTemporaryStat.Weakness,
  CharacterTemporaryStat.Curse,
  CharacterTemporaryStat.Poison,
  CharacterTemporaryStat.ShadowPartner,
  CharacterTemporaryStat.Morph,
  CharacterTemporaryStat.Ghost,
  CharacterTemporaryStat.Attract,
  CharacterTemporaryStat.SpiritJavelin,
  CharacterTemporaryStat.BanMap,
  CharacterTemporaryStat.Barrier,
  CharacterTemporaryStat.DojangShield,
  CharacterTemporaryStat.ReverseInput,
  CharacterTemporaryStat.RespectPImmune,
  CharacterTemporaryStat.RespectMImmune,
  CharacterTemporaryStat.DefenseAtt,
  CharacterTemporaryStat.DefenseState,
  CharacterTemporaryStat.RepeatEffect,
  CharacterTemporaryStat.StopPortion,
  CharacterTemporaryStat.StopMotion,
  CharacterTemporaryStat.Fear,
  CharacterTemporaryStat.MagicShield,
  CharacterTemporaryStat.Frozen,
  CharacterTemporaryStat.SuddenDeath,
  CharacterTemporaryStat.FinalCut,
  CharacterTemporaryStat.Cyclone,
  CharacterTemporaryStat.Mechanic,
  CharacterTemporaryStat.DarkAura,
  CharacterTemporaryStat.BlueAura,
  CharacterTemporaryStat.YellowAura,
];

/** CTS that use twoState encoding for remote */
export const TWO_STATE_ORDER: CharacterTemporaryStat[] = [
  CharacterTemporaryStat.RideVehicle,
  CharacterTemporaryStat.PartyBooster,
  CharacterTemporaryStat.GuidedBullet,
];

/** CTS that are "swallow buff" (jaguar) */
export const SWALLOW_BUFF_STAT: CharacterTemporaryStat[] = [
  CharacterTemporaryStat.SwallowAttackDamage,
  CharacterTemporaryStat.SwallowCritical,
  CharacterTemporaryStat.SwallowMaxMP,
  CharacterTemporaryStat.SwallowDefence,
  CharacterTemporaryStat.SwallowEvasion,
];

export function ctsIsEncodeInt(cts: CharacterTemporaryStat): boolean {
  return cts === CharacterTemporaryStat.ShadowPartner;
}

export function ctsIsIndie(cts: CharacterTemporaryStat): boolean {
  return cts.toString().toLowerCase().includes('indie');
}

export function ctsIsMovingEffectingStat(cts: CharacterTemporaryStat): boolean {
  switch (cts) {
    case CharacterTemporaryStat.Speed:
    case CharacterTemporaryStat.Jump:
    case CharacterTemporaryStat.Stun:
    case CharacterTemporaryStat.Weakness:
    case CharacterTemporaryStat.Slow:
    case CharacterTemporaryStat.Morph:
    case CharacterTemporaryStat.Ghost:
    case CharacterTemporaryStat.BasicStatUp:
    case CharacterTemporaryStat.Attract:
    case CharacterTemporaryStat.EnergyCharged:
    case CharacterTemporaryStat.Flying:
    case CharacterTemporaryStat.Frozen:
    case CharacterTemporaryStat.Mechanic:
    case CharacterTemporaryStat.RideVehicle:
      return true;
    default:
      return false;
  }
}

export function ctsIsRemoteEncode4(cts: CharacterTemporaryStat): boolean {
  switch (cts) {
    case CharacterTemporaryStat.RespectPImmune:
    case CharacterTemporaryStat.RespectMImmune:
    case CharacterTemporaryStat.DefenseAtt:
    case CharacterTemporaryStat.DefenseState:
    case CharacterTemporaryStat.MagicShield:
      return true;
    default:
      return false;
  }
}

export function ctsIsRemoteEncode1(cts: CharacterTemporaryStat): boolean {
  switch (cts) {
    case CharacterTemporaryStat.Speed:
    case CharacterTemporaryStat.Cyclone:
    case CharacterTemporaryStat.ComboCounter:
      return true;
    default:
      return false;
  }
}

export function ctsIsNotEncodeReason(cts: CharacterTemporaryStat): boolean {
  switch (cts) {
    case CharacterTemporaryStat.Speed:
    case CharacterTemporaryStat.Ghost:
    case CharacterTemporaryStat.RespectPImmune:
    case CharacterTemporaryStat.RespectMImmune:
    case CharacterTemporaryStat.DefenseAtt:
    case CharacterTemporaryStat.DefenseState:
    case CharacterTemporaryStat.MagicShield:
    case CharacterTemporaryStat.Cyclone:
    case CharacterTemporaryStat.ComboCounter:
      return true;
    default:
      return false;
  }
}
