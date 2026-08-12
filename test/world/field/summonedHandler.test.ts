import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { SkillProvider } from '../../../src/provider/SkillProvider';
import { SkillStat } from '../../../src/provider/skill/SkillStat';
import { CharacterTemporaryStat } from '../../../src/world/user/stat/CharacterTemporaryStat';
import { Summoned } from '../../../src/world/field/summoned/Summoned';
import { SummonedActionType } from '../../../src/world/field/summoned/SummonedActionType';
import { SummonedAssistType } from '../../../src/world/field/summoned/SummonedAssistType';
import { SummonedHandler } from '../../../src/world/field/summoned/SummonedHandler';
import { SummonedLeaveType } from '../../../src/world/field/summoned/SummonedLeaveType';
import { SummonedMoveAbility } from '../../../src/world/field/summoned/SummonedMoveAbility';

describe('world/field/summoned/SummonedHandler.ts', () => {
  const originalGetSkillInfoById = SkillProvider.getSkillInfoById;

  afterEach(() => {
    (SkillProvider as any).getSkillInfoById = originalGetSkillInfoById;
  });

  it('should apply summoned movement and broadcast it', () => {
    const summoned = new Summoned(5211001, 1, SummonedMoveAbility.WALK, SummonedAssistType.ATTACK);
    summoned.setId(42);
    summoned.ownerId = 7;

    const broadcasts: Buffer[] = [];
    summoned.setField({
      broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
    });

    const user = fakeUser(7, summoned);
    SummonedHandler.handleSummonedMove(user as any, new PacketReader(summonedMovePacket(42)));

    expect(summoned.getX()).to.equal(300);
    expect(summoned.getY()).to.equal(400);
    expect(summoned.getFoothold()).to.equal(12);
    expect(summoned.getMoveAction()).to.equal(3);
    expect(broadcasts.length).to.equal(1);
  });

  it('should remove summoned objects owned by the user', () => {
    const summoned = new Summoned(5211001, 1, SummonedMoveAbility.STOP, SummonedAssistType.ATTACK);
    summoned.setId(99);
    summoned.ownerId = 8;

    let removed: Summoned | undefined;
    const user = fakeUser(8, summoned, {
      removeSummonedObject: (s: Summoned): boolean => { removed = s; return true; },
    });

    SummonedHandler.handleSummonedRemove(user as any, new PacketReader(intPacket(99)));

    expect(removed).to.equal(summoned);
  });

  it('should clear satellite safety when a satellite is removed', () => {
    const summoned = new Summoned(35111001, 1, SummonedMoveAbility.WALK, SummonedAssistType.ATTACK_EX);
    summoned.setId(12);
    summoned.ownerId = 9;

    const resetStats: CharacterTemporaryStat[] = [];
    let cooltimeSkillId = 0;
    const user = fakeUser(9, summoned, {
      removeSummonedObject: (_s: Summoned): boolean => true,
      hasSafetyDamage: true,
      resetTemporaryStat: (pred: (cts: CharacterTemporaryStat) => boolean): void => {
        for (const stat of [CharacterTemporaryStat.SafetyDamage, CharacterTemporaryStat.SafetyAbsorb]) {
          if (pred(stat)) resetStats.push(stat);
        }
      },
      setSkillCooltime: (skillId: number): void => { cooltimeSkillId = skillId; },
    });

    SummonedHandler.handleSummonedRemove(user as any, new PacketReader(intPacket(12)));

    expect(resetStats).to.deep.equal([CharacterTemporaryStat.SafetyDamage, CharacterTemporaryStat.SafetyAbsorb]);
    expect(cooltimeSkillId).to.equal(35121006);
  });

  it('should apply non-lethal summoned hit damage', () => {
    const summoned = new Summoned(3111002, 1, SummonedMoveAbility.STOP, SummonedAssistType.NONE);
    summoned.setId(21);
    summoned.ownerId = 10;
    summoned.hp = 500;

    const broadcasts: Buffer[] = [];
    const user = fakeUser(10, summoned, {
      getField: (): any => ({
        getSummonedPool: (): any => ({
          getById: (id: number): Summoned | undefined => id === 21 ? summoned : undefined,
        }),
        broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
      }),
    });

    SummonedHandler.handleSummonedHit(user as any, new PacketReader(summonedHitPacket(21, 0, 150, 9300000, 1)));

    expect(summoned.hp).to.equal(350);
    expect(broadcasts.length).to.equal(1);
  });

  it('should remove summoned objects killed by hit damage', () => {
    const summoned = new Summoned(3111002, 1, SummonedMoveAbility.STOP, SummonedAssistType.NONE);
    summoned.setId(22);
    summoned.ownerId = 11;
    summoned.hp = 100;

    let removed: Summoned | undefined;
    const user = fakeUser(11, summoned, {
      removeSummonedObject: (s: Summoned): boolean => { removed = s; return true; },
    });

    SummonedHandler.handleSummonedHit(user as any, new PacketReader(summonedHitPacket(22, -2, 100)));

    expect(summoned.hp).to.equal(0);
    expect(summoned.leaveType).to.equal(SummonedLeaveType.SUMMONED_DEAD);
    expect(removed).to.equal(summoned);
  });

  it('should process and broadcast summoned skill effects', () => {
    (SkillProvider as any).getSkillInfoById = () => fakeSkillInfo(new Map([
      [SkillStat.epad, 17],
    ]), 20_000);

    const summoned = new Summoned(1321007, 4, SummonedMoveAbility.WALK, SummonedAssistType.ATTACK);
    summoned.setId(23);
    summoned.ownerId = 12;

    const broadcasts: Buffer[] = [];
    let setStat: [CharacterTemporaryStat, any] | undefined;
    const user = fakeUser(12, summoned, {
      getField: (): any => ({
        getSummonedPool: (): any => ({
          getById: (id: number): Summoned | undefined => id === 23 ? summoned : undefined,
        }),
        broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
      }),
      getSkillLevel: (): number => 3,
      setTemporaryStat: (stat: CharacterTemporaryStat, option: any): void => { setStat = [stat, option]; },
    });

    SummonedHandler.handleSummonedSkill(user as any, new PacketReader(summonedSkillPacket(23, 1320009, 5, 4)));

    expect(setStat?.[0]).to.equal(CharacterTemporaryStat.EPAD);
    expect(setStat?.[1].nOption).to.equal(17);
    expect(setStat?.[1].rOption).to.equal(1320009);
    expect(broadcasts.length).to.equal(1);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.SUMMONED_SKILL.code);
  });

  it('should process and broadcast summoned attacks', () => {
    const summoned = new Summoned(2121005, 2, SummonedMoveAbility.WALK, SummonedAssistType.ATTACK);
    summoned.setId(24);
    summoned.ownerId = 13;

    let hp = 300;
    let damagedBy = 0;
    let removed = false;
    let expDistributed = false;
    let revivesSpawned = false;
    let rewardsDropped = false;
    const mob = {
      getId: (): number => 55,
      getHp: (): number => hp,
      setHp: (value: number): void => { hp = value; },
      getMaxHp: (): number => 300,
      getTemplateId: (): number => 9300000,
      getController: (): null => null,
      isDamagedByMob: (): boolean => false,
      addDamage: (characterId: number, damage: number): void => { damagedBy = characterId * 1000 + damage; },
      distributeExp: (): void => { expDistributed = true; },
      spawnRevives: (): void => { revivesSpawned = true; },
      dropRewards: (): void => { rewardsDropped = true; },
    };

    const broadcasts: Buffer[] = [];
    const user = fakeUser(13, summoned, {
      getField: (): any => ({
        getSummonedPool: (): any => ({
          getById: (id: number): Summoned | undefined => id === 24 ? summoned : undefined,
        }),
        getMobPool: (): any => ({
          getById: (id: number): any => id === 55 ? mob : undefined,
          removeMob: (_mob: any): boolean => { removed = true; return true; },
        }),
        broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
      }),
    });

    SummonedHandler.handleSummonedAttack(user as any, new PacketReader(summonedAttackPacket(24, 55, 400)));

    expect(hp).to.equal(0);
    expect(damagedBy).to.equal(13300);
    expect(removed).to.equal(true);
    expect(expDistributed).to.equal(true);
    expect(revivesSpawned).to.equal(true);
    expect(rewardsDropped).to.equal(true);
    expect(broadcasts.some((packet) => packet.readInt16LE(0) === MapleSendOpcode.SUMMONED_ATTACK.code)).to.equal(true);
  });
});

function fakeUser(characterId: number, summoned: Summoned, overrides: Record<string, any> = {}): any {
  return {
    getCharacterId: (): number => characterId,
    getLevel: (): number => 30,
    getField: (): any => ({
      getSummonedPool: (): any => ({
        getById: (id: number): Summoned | undefined => id === summoned.getId() ? summoned : undefined,
      }),
      broadcastPacket: (_packet: Buffer): void => undefined,
    }),
    getSecondaryStat: (): any => ({
      hasOption: (stat: CharacterTemporaryStat): boolean => stat === CharacterTemporaryStat.SafetyDamage && !!overrides.hasSafetyDamage,
    }),
    getSkillStatValue: (): number => 5,
    getSkillLevel: (): number => 0,
    getSummonedBySkill: (): Summoned[] => [],
    removeSummonedObject: (_s: Summoned): boolean => true,
    resetTemporaryStat: (_pred: (cts: CharacterTemporaryStat) => boolean): void => undefined,
    setSkillCooltime: (_skillId: number, _cooltime: number): void => undefined,
    ...overrides,
  };
}

function fakeSkillInfo(values: Map<SkillStat, number>, duration: number): any {
  return {
    skillId: 1320009,
    maxLevel: 10,
    getValue: (stat: SkillStat, _slv: number) => values.get(stat) ?? 0,
    getDuration: (_slv: number) => duration,
  };
}

function intPacket(value: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(value);
  return w.getPacket();
}

function summonedMovePacket(summonedId: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(summonedId);
  w.writeShort(0); // start x
  w.writeShort(0); // start y
  w.writeShort(0); // vx
  w.writeShort(0); // vy
  w.writeByte(1);  // one move elem
  w.writeByte(3);  // TELEPORT
  w.writeShort(300);
  w.writeShort(400);
  w.writeShort(12);
  w.writeByte(3);  // move action
  w.writeShort(120);
  return w.getPacket();
}

function summonedHitPacket(summonedId: number, attackIndex: number, damage: number, templateId = 0, dir = 0): Buffer {
  const w = new PacketWriter();
  w.writeInt(summonedId);
  w.writeByte(attackIndex);
  w.writeInt(damage);
  if (attackIndex > -2) {
    w.writeInt(templateId);
    w.writeByte(dir);
  }
  return w.getPacket();
}

function summonedSkillPacket(summonedId: number, skillId: number, actionAndDir: number, summonBuffType: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(summonedId);
  w.writeInt(skillId);
  w.writeByte(actionAndDir);
  w.writeByte(summonBuffType);
  return w.getPacket();
}

function summonedAttackPacket(summonedId: number, mobId: number, damage: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(summonedId);
  for (let i = 0; i < 5; i++) w.writeInt(0);
  w.writeByte(SummonedActionType.ATTACK1);
  w.writeInt(0); // dwKey
  w.writeInt(0); // Crc32
  w.writeByte(1); // mobCount
  w.writeShort(100); // userX
  w.writeShort(200); // userY
  w.writeShort(110); // summonedX
  w.writeShort(210); // summonedY
  w.writeInt(0); // repeat skill point
  w.writeInt(mobId);
  w.writeInt(9300000); // templateId
  w.writeByte(1); // hitAction
  w.writeByte(0); // foreAction
  w.writeByte(0); // frameIdx
  w.writeByte(0); // calcDamageStatIndex
  w.writeShort(120);
  w.writeShort(220);
  w.writeShort(0);
  w.writeShort(0);
  w.writeShort(80); // delay
  w.writeInt(damage);
  w.writeInt(0); // crc
  return w.getPacket();
}
