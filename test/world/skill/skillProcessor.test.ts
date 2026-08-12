import { expect } from 'chai';
import { SkillProvider } from '../../../src/provider/SkillProvider';
import { SkillProcessor } from '../../../src/world/skill/SkillProcessor';
import { Skill } from '../../../src/world/skill/Skill';
import { CharacterTemporaryStat } from '../../../src/world/user/stat/CharacterTemporaryStat';
import { SkillStat } from '../../../src/provider/skill/SkillStat';
import { MobTemporaryStat } from '../../../src/world/field/mob/MobTemporaryStat';
import { Summoned } from '../../../src/world/field/summoned/Summoned';
import { SummonedAssistType } from '../../../src/world/field/summoned/SummonedAssistType';
import { SummonedMoveAbility } from '../../../src/world/field/summoned/SummonedMoveAbility';

describe('world/skill/SkillProcessor.ts', () => {
  const originalGetSkillInfoById = SkillProvider.getSkillInfoById;

  afterEach(() => {
    (SkillProvider as any).getSkillInfoById = originalGetSkillInfoById;
  });

  it('should apply plain temporary stat buffs', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.speed, 20],
      [SkillStat.jump, 10],
    ]), 30_000);

    const setStats: Array<[CharacterTemporaryStat, any]> = [];
    const user = {
      getField: (): null => null,
      setTemporaryStats: (stats: Map<CharacterTemporaryStat, any>): void => {
        for (const entry of stats) setStats.push(entry);
      },
    } as any;
    const skill = new Skill();
    skill.skillId = 4101004; // Thief.HASTE_NL
    skill.slv = 1;

    SkillProcessor.processSkill(user, skill);

    expect(setStats.map(([stat]) => stat)).to.deep.equal([
      CharacterTemporaryStat.Speed,
      CharacterTemporaryStat.Jump,
    ]);
    expect(setStats[0][1].nOption).to.equal(20);
    expect(setStats[1][1].nOption).to.equal(10);
  });

  it('should apply targeted mob debuffs', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.x, 30],
    ]), 20_000);

    const mobStats: Array<[MobTemporaryStat, any, number]> = [];
    const mob = {
      isSlowUsed: (): boolean => false,
      setSlowUsed: (_v: boolean): undefined => undefined,
      setTemporaryStat: (stat: MobTemporaryStat, option: any, delay: number): number => mobStats.push([stat, option, delay]),
    };
    const field = {
      getMobPool: (): { getById: (_id: number) => typeof mob } => ({ getById: (_id: number): typeof mob => mob }),
    };
    const user = { getField: () => field } as any;
    const skill = new Skill();
    skill.skillId = 2101003; // Magician.SLOW_FP
    skill.slv = 1;
    skill.delay = 120;
    skill.targetIds = [99];

    SkillProcessor.processSkill(user, skill);

    expect(mobStats.length).to.equal(1);
    expect(mobStats[0][0]).to.equal(MobTemporaryStat.Speed);
    expect(mobStats[0][1].nOption).to.equal(30);
    expect(mobStats[0][2]).to.equal(120);
  });

  it('should apply transformation morph stat bundles', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.morph, 1000],
      [SkillStat.epad, 12],
      [SkillStat.epdd, 20],
      [SkillStat.emdd, 30],
      [SkillStat.speed, 40],
      [SkillStat.jump, 15],
    ]), 60_000);

    const setStats: Array<[CharacterTemporaryStat, any]> = [];
    const user = {
      getField: (): null => null,
      getGender: (): number => 1,
      setTemporaryStats: (stats: Map<CharacterTemporaryStat, any>): void => {
        for (const entry of stats) setStats.push(entry);
      },
    } as any;
    const skill = new Skill();
    skill.skillId = 5111005; // Pirate.TRANSFORMATION
    skill.slv = 1;

    SkillProcessor.processSkill(user, skill);

    expect(setStats.map(([stat]) => stat)).to.deep.equal([
      CharacterTemporaryStat.Morph,
      CharacterTemporaryStat.EPAD,
      CharacterTemporaryStat.EPDD,
      CharacterTemporaryStat.EMDD,
      CharacterTemporaryStat.Speed,
      CharacterTemporaryStat.Jump,
    ]);
    expect(setStats[0][1].nOption).to.equal(1100);
    expect(setStats[1][1].nOption).to.equal(12);
  });

  it('should apply Battle Mage body boost from active aura', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.v, 9],
    ]), 30_000);

    const setStats: Array<[CharacterTemporaryStat, any]> = [];
    const user = {
      getField: (): null => null,
      getSecondaryStat: (): any => ({
        getOption: (stat: CharacterTemporaryStat): any => stat === CharacterTemporaryStat.Aura
          ? { nOption: 4, rOption: 32001003 }
          : { nOption: 0, rOption: 0 },
      }),
      setTemporaryStats: (stats: Map<CharacterTemporaryStat, any>): void => {
        for (const entry of stats) setStats.push(entry);
      },
    } as any;
    const skill = new Skill();
    skill.skillId = 32111005; // BattleMage.BODY_BOOST
    skill.slv = 1;

    SkillProcessor.processSkill(user, skill);

    expect(setStats.map(([stat]) => stat)).to.deep.equal([
      CharacterTemporaryStat.SuperBody,
      CharacterTemporaryStat.DarkAura,
    ]);
    expect(setStats[1][1].nOption).to.equal(13);
    expect(setStats[1][1].rOption).to.equal(32001003);
  });

  it('should toggle Mechanic perfect armor', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map(), 0);

    let resetSkillId = 0;
    let setStat: [CharacterTemporaryStat, any] | undefined;
    const user = {
      getField: (): null => null,
      getSecondaryStat: (): any => ({
        hasOption: (stat: CharacterTemporaryStat): boolean => stat === CharacterTemporaryStat.ManaReflection,
      }),
      resetTemporaryStatBySkill: (skillId: number): void => { resetSkillId = skillId; },
      setTemporaryStat: (stat: CharacterTemporaryStat, option: any): void => { setStat = [stat, option]; },
    } as any;
    const skill = new Skill();
    skill.skillId = 35101007; // Mechanic.PERFECT_ARMOR
    skill.slv = 3;

    SkillProcessor.processSkill(user, skill);

    expect(resetSkillId).to.equal(35101007);
    expect(setStat).to.equal(undefined);
  });

  it('should apply Warrior threaten debuffs to targeted mobs', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.x, 10],
      [SkillStat.y, 20],
      [SkillStat.z, 30],
      [SkillStat.subTime, 4],
    ]), 15_000);

    const mobStats: Array<[MobTemporaryStat, any]> = [];
    const mob = {
      isBoss: (): boolean => false,
      setTemporaryStat: (stats: Map<MobTemporaryStat, any>): void => {
        for (const entry of stats) mobStats.push(entry);
      },
    };
    const field = {
      getMobPool: (): { getById: (_id: number) => typeof mob } => ({ getById: (_id: number): typeof mob => mob }),
    };
    const user = { getField: () => field } as any;
    const skill = new Skill();
    skill.skillId = 1201006; // Warrior.THREATEN
    skill.slv = 1;
    skill.targetIds = [88];

    SkillProcessor.processSkill(user, skill);

    expect(mobStats.map(([stat]) => stat)).to.deep.equal([
      MobTemporaryStat.PAD,
      MobTemporaryStat.PDR,
      MobTemporaryStat.Blind,
    ]);
    expect(mobStats[2][1].tOption).to.equal(4000);
  });

  it('should apply Magician bless stat bundle', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.pad, 1],
      [SkillStat.mad, 2],
      [SkillStat.pdd, 3],
      [SkillStat.mdd, 4],
      [SkillStat.acc, 5],
      [SkillStat.eva, 6],
    ]), 40_000);

    const setStats: Array<[CharacterTemporaryStat, any]> = [];
    const user = {
      getField: (): null => null,
      setTemporaryStats: (stats: Map<CharacterTemporaryStat, any>): void => {
        for (const entry of stats) setStats.push(entry);
      },
    } as any;
    const skill = new Skill();
    skill.skillId = 2301004; // Magician.BLESS
    skill.slv = 1;

    SkillProcessor.processSkill(user, skill);

    expect(setStats.map(([stat]) => stat)).to.deep.equal([
      CharacterTemporaryStat.PAD,
      CharacterTemporaryStat.MAD,
      CharacterTemporaryStat.PDD,
      CharacterTemporaryStat.MDD,
      CharacterTemporaryStat.ACC,
      CharacterTemporaryStat.EVA,
    ]);
    expect(setStats.map(([, opt]) => opt.nOption)).to.deep.equal([1, 2, 3, 4, 5, 6]);
  });

  it('should apply Dragon Blood and schedule its HP tick', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.x, 7],
      [SkillStat.pad, 11],
    ]), 30_000);

    const setStats: Array<[CharacterTemporaryStat, any]> = [];
    let scheduledSkillId = 0;
    let scheduledAt: Date | undefined;
    const user = {
      getField: (): null => null,
      setTemporaryStats: (stats: Map<CharacterTemporaryStat, any>): void => {
        for (const entry of stats) setStats.push(entry);
      },
      setSchedule: (skillId: number, date: Date): void => {
        scheduledSkillId = skillId;
        scheduledAt = date;
      },
    } as any;
    const skill = new Skill();
    skill.skillId = 1311008; // Warrior.DRAGON_BLOOD
    skill.slv = 1;

    SkillProcessor.processSkill(user, skill);

    expect(setStats.map(([stat]) => stat)).to.deep.equal([
      CharacterTemporaryStat.DragonBlood,
      CharacterTemporaryStat.PAD,
    ]);
    expect(setStats[0][1].nOption).to.equal(7);
    expect(setStats[1][1].nOption).to.equal(11);
    expect(scheduledSkillId).to.equal(1311008);
    expect(scheduledAt).to.be.instanceOf(Date);
  });

  it('should create walking attack summons', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map(), 45_000, 2121005);

    const summoned: Summoned[] = [];
    const user = {
      getField: (): any => fakeField(),
      addSummoned: (s: Summoned): void => { summoned.push(s); },
    } as any;
    const skill = new Skill();
    skill.skillId = 2121005; // Magician.IFRIT
    skill.slv = 4;
    skill.positionX = 120;
    skill.positionY = 230;
    skill.summonLeft = true;

    SkillProcessor.processSkill(user, skill);

    expect(summoned.length).to.equal(1);
    expect(summoned[0].skillId).to.equal(2121005);
    expect(summoned[0].skillLevel).to.equal(4);
    expect(summoned[0].moveAbility).to.equal(SummonedMoveAbility.WALK);
    expect(summoned[0].assistType).to.equal(SummonedAssistType.ATTACK);
    expect(summoned[0].getX()).to.equal(120);
    expect(summoned[0].getY()).to.equal(230);
    expect(summoned[0].isLeft()).to.equal(true);
  });

  it('should create puppet summons with configured hp', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.x, 900],
    ]), 30_000, 3111002);

    const summoned: Summoned[] = [];
    const user = {
      getField: (): any => fakeField(),
      addSummoned: (s: Summoned): void => { summoned.push(s); },
    } as any;
    const skill = new Skill();
    skill.skillId = 3111002; // Bowman.PUPPET_BM
    skill.slv = 2;
    skill.positionX = 40;
    skill.positionY = 50;

    SkillProcessor.processSkill(user, skill);

    expect(summoned.length).to.equal(1);
    expect(summoned[0].moveAbility).to.equal(SummonedMoveAbility.STOP);
    expect(summoned[0].assistType).to.equal(SummonedAssistType.NONE);
    expect(summoned[0].hp).to.equal(900);
  });
});

function fakeSkillInfo(values: Map<SkillStat, number>, duration: number, skillId = 0): any {
  return {
    skillId,
    maxLevel: 10,
    getValue: (stat: SkillStat, _slv: number) => values.get(stat) ?? 0,
    getDuration: (_slv: number) => duration,
    getRect(slv: number): null { return null; },
  };
}

function fakeField(): any {
  return {
    getMapInfo: (): any => ({
      getFootholdBelow: (_x: number, _y: number): any => ({ sn: 12 }),
    }),
  };
}
