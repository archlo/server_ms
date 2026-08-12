export const GameConstants = {
  CHARACTER_SLOT_MAX:   15,
  INVENTORY_SLOT_MAX:   96,
  TRUNK_SLOT_MAX:       48,
  LOCKER_SLOT_MAX:      500,
  PLAYER_SHOP_SLOT_MAX: 16,
  DEFAULT_ITEM_SLOT_MAX:100,
  MONEY_MAX:            0x7FFFFFFF,

  SKIN_MAX:    11,
  FACE_MIN:    20000, FACE_MAX:   29999,
  HAIR_MIN:    30000, HAIR_MAX:   39999,
  STAT_MIN:    4,     STAT_MAX:   32767,
  HP_MAX:      99999, MP_MAX:     99999,
  PAD_MAX:     29999, PDD_MAX:    30000,
  MAD_MAX:     29999, MDD_MAX:    30000,
  ACC_MAX:     9999,  EVA_MAX:    9999,
  SPEED_MIN:   100,   SPEED_MAX:  140,
  JUMP_MIN:    100,   JUMP_MAX:   123,
  LEVEL_MAX:   200,
  DAMAGE_MAX:  999999,
  MASTERY_MAX: 0.95,

  DEFAULT_FRIEND_GROUP: 'Group Unknown',
  FRIEND_MAX:           100,
  CHANNEL_LOGIN:        -1,
  CHANNEL_OFFLINE:      -2,
  MESSENGER_MAX:        3,
  PARTY_MAX:            6,
  EXPEDITION_MAX:       5,

  GUILD_GRADE_NAMES: ['Master','Jr.Master','Member','Member','Member'],
  GUILD_CAPACITY_MIN: 10, GUILD_CAPACITY_MAX: 100,
  CREATE_GUILD_COST:  5_000_000, CREATE_EMBLEM_COST: 500_000,
  DELETE_EMBLEM_COST: 1_000_000, CREATE_UNION_COST:  5_000_000,

  MACRO_SYS_DATA_SIZE:    5,
  MACRO_SKILL_COUNT:      3,
  FUNC_KEY_MAP_SIZE:      89,
  QUICKSLOT_KEY_MAP_SIZE: 8,
  DEFAULT_QUICKSLOT_KEY_MAP: [0x2A,0x52,0x47,0x49,0x1D,0x53,0x4F,0x51],

  UNDEFINED_FIELD_ID:   999999999,
  DEFAULT_PORTAL_NAME:  'sp',
  DEFAULT_SPEAKER_ID:   9010000,

  PET_COUNT_MAX:    3,
  PET_LEVEL_MAX:    30,
  PET_FULLNESS_FOR_TAMENESS: 75,
  PET_FULLNESS_MAX: 100,
  PET_FULLNESS_TICK_INTERVAL: 60, // seconds between fullness decreases
  PET_TAMENESS_MAX: 30000,
  PET_TAMENESS_TABLE: [0,1,3,6,14,31,60,108,181,287,434,632,891,1224,1642,2161,2793,3557,4467,5542,6801,8263,9950,11882,14084,16578,19391,22548,26084,30000],

  MOB_HP_TAG_INTERVAL:  500,
  MOB_SKILL_COOLTIME:   3,
  MOB_RECOVER_TIME:     5,
  MOB_RESPAWN_TIME:     7,
  MOB_CAPACITY_MAX:     40,
  MOB_CAPACITY_CONSTANT:0.0000078125,

  DROP_HEIGHT:           100, DROP_SPREAD: 20, DROP_BOUND_OFFSET: 20,
  DROP_EXPIRE_INTERVAL:  3,
  DROP_OWNERSHIP_EXPIRE_TIME: 15,
  DROP_REMAIN_ON_GROUND_TIME: 120,
  DROP_MONEY_PROB:       0.60,

  REACTOR_EXPIRE_INTERVAL: 5, REACTOR_END_DELAY:   5,
  REACTOR_DROP_DELAY:      3, REACTOR_SPAWN_HEIGHT: 20,

  CYGNUS_LEVEL_MAX: 120,

  EXP_TABLE: initExpTable(),

  isValidCharacterName(name: string): boolean {
    return name.length >= 4 && name.length <= 13 && /^[a-zA-Z0-9]+$/.test(name);
  },

  getStartingMap(jobId: number, subJob: number): number {
    switch (jobId) {
      case 0:    return 10000; // BEGINNER -> Maple Island (Maple Road : Mushroom Town)
      case 1000: return 130030000; // NOBLESSE
      case 2000: return 914000000; // ARAN
      case 2001: return 900010000; // EVAN
      case 3000: return 931000000; // CITIZEN
      default:   return 0;
    }
  },

  getLevelMax(jobId: number): number {
    const { JobConstants } = require('./job/JobConstants');
    return JobConstants.isCygnusJob(jobId) ? GameConstants.CYGNUS_LEVEL_MAX : GameConstants.LEVEL_MAX;
  },

  isEventMap(fieldId: number): boolean { return Math.floor(fieldId / 1000000) % 100 === 9; },

  getNextLevelExp(level: number): number { return GameConstants.EXP_TABLE[level] ?? 0; },
  getNextLevelPetCloseness(level: number): number { return GameConstants.PET_TAMENESS_TABLE[level] ?? 0; },

  getTradeTax(money: number): number {
    if (money >= 100_000_000) return Math.round(money * 0.94);
    if (money >=  25_000_000) return Math.round(money * 0.95);
    if (money >=  10_000_000) return Math.round(money * 0.96);
    if (money >=   5_000_000) return Math.round(money * 0.97);
    if (money >=   1_000_000) return Math.round(money * 0.982);
    if (money >=     100_000) return Math.round(money * 0.992);
    return money;
  },

  getPersonalShopTax(money: number): number {
    if (money >= 100_000_000) return Math.round(money * 0.97);
    if (money >=  25_000_000) return Math.round(money * 0.975);
    if (money >=  10_000_000) return Math.round(money * 0.98);
    if (money >=   5_000_000) return Math.round(money * 0.975);
    if (money >=   1_000_000) return Math.round(money * 0.991);
    if (money >=     100_000) return Math.round(money * 0.996);
    return money;
  },

  getPartyBonusExp(exp: number, memberCount: number): number {
    if (memberCount < 2) return 0;
    const bonus = 0.05 * Math.min(memberCount, GameConstants.PARTY_MAX);
    return Math.floor(exp * bonus);
  },

  getHolySymbolBonus(x: number, memberCount: number): number {
    return memberCount < 2 ? Math.min(x, 10) : Math.min(x, 50);
  },

  getMoneyForMobLevel(level: number): [number, number] {
    let min: number, max: number;
    if (level === 1)       { min = 1.0; max = 1.0; }
    else if (level <= 20)  { min = 1.6; max = 2.4; }
    else if (level <= 30)  { min = 2.0; max = 3.0; }
    else if (level <= 40)  { min = 2.4; max = 3.6; }
    else if (level <= 50)  { min = 2.8; max = 4.2; }
    else if (level <= 60)  { min = 4.0; max = 6.0; }
    else if (level <= 70)  { min = 4.8; max = 7.2; }
    else if (level <= 80)  { min = 5.2; max = 7.8; }
    else if (level <= 90)  { min = 5.6; max = 8.4; }
    else                   { min = 6.0; max = 9.0; }
    return [Math.floor(min * level), Math.floor(max * level)];
  },

  getGuildExpandCost(memberMax: number): number {
    if (memberMax < 15) return 500_000;
    if (memberMax < 20) return 1_500_000;
    if (memberMax < 25) return 2_500_000;
    if (memberMax < 30) return 3_500_000;
    if (memberMax < 35) return 4_500_000;
    return 5_000_000;
  },

  /** Port of kinoko's GameConstants::isJaguarMob. Wild Hunter jaguar mounts. */
  isJaguarMob(templateId: number): boolean {
    return templateId >= 9304000 && templateId <= 9304005;
  },
};

function initExpTable(): number[] {
  const n = new Array(201).fill(0);
  n[1]  = 15; n[2] = 34; n[3] = 57; n[4] = 92; n[5] = 135;
  n[6]  = 372; n[7] = 560; n[8] = 840; n[9] = 1242;
  for (let i = 10; i <= 14; i++) n[i] = n[9];
  for (let i = 15; i <= 29; i++) n[i] = Math.floor(n[i-1] * 1.2 + 0.5);
  for (let i = 30; i <= 34; i++) n[i] = n[29];
  for (let i = 35; i <= 39; i++) n[i] = Math.floor(n[i-1] * 1.2 + 0.5);
  for (let i = 40; i <= 69; i++) n[i] = Math.floor(n[i-1] * 1.08 + 0.5);
  for (let i = 70; i <= 74; i++) n[i] = n[69];
  for (let i = 75; i <= 119; i++) n[i] = Math.floor(n[i-1] * 1.07 + 0.5);
  for (let i = 120; i <= 124; i++) n[i] = n[119];
  for (let i = 125; i <= 159; i++) n[i] = Math.floor(n[i-1] * 1.07 + 0.5);
  for (let i = 160; i <= 199; i++) n[i] = Math.floor(n[i-1] * 1.06 + 0.5);
  n[200] = 0;
  return n;
}
