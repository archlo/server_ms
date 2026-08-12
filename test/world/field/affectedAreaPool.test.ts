import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { Rect } from '../../../src/util/Rect';
import { ElementAttribute } from '../../../src/provider/skill/ElementAttribute';
import { AffectedAreaPool } from '../../../src/world/field/AffectedAreaPool';
import { AffectedArea } from '../../../src/world/field/affectedarea/AffectedArea';
import { AffectedAreaType } from '../../../src/world/field/affectedarea/AffectedAreaType';
import { FieldObject } from '../../../src/world/field/FieldObject';
import { Life } from '../../../src/world/field/life/Life';

describe('world/field/AffectedAreaPool.ts', () => {
  it('should add and remove affected areas with broadcasts', () => {
    const broadcasts: Buffer[] = [];
    const field = {
      nextId: (): number => 77,
      broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
    };
    const pool = new AffectedAreaPool(field);
    const area = affectedArea(owner(1), new Rect(0, 0, 100, 100), new Date(Date.now() + 10_000));

    pool.addAffectedArea(area);

    expect(area.getId()).to.equal(77);
    expect(area.getField()).to.equal(field);
    expect(pool.getById(77)).to.equal(area);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.AFFECTED_AREA_CREATED.code);

    expect(pool.removeAffectedArea(area)).to.equal(true);
    expect(pool.getById(77)).to.equal(undefined);
    expect(broadcasts[1].readInt16LE(0)).to.equal(MapleSendOpcode.AFFECTED_AREA_REMOVED.code);
  });

  it('should apply user-skill areas to mobs inside the rect and expire them', () => {
    const broadcasts: Buffer[] = [];
    const mobInside = mob(10, 10);
    const mobOutside = mob(500, 500);
    const field = {
      nextId: (): number => 1,
      broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
      getMobPool: (): any => ({
        forEach: (fn: (m: any) => void): void => {
          fn(mobInside);
          fn(mobOutside);
        },
      }),
      getUserPool: (): any => ({ forEach: (_fn: (u: any) => void): void => undefined }),
    };
    const pool = new AffectedAreaPool(field);
    const area = affectedArea(owner(2), new Rect(0, 0, 20, 20), new Date(Date.now() + 10_000));
    let hits = 0;
    (area as any).handleMobInside = (m: any): void => {
      expect(m).to.equal(mobInside);
      hits++;
    };
    pool.addAffectedArea(area);

    pool.updateAffectedAreas(new Date());

    expect(hits).to.equal(1);
    expect(pool.getCount()).to.equal(1);

    pool.updateAffectedAreas(new Date(Date.now() + 20_000));

    expect(pool.getCount()).to.equal(0);
    expect(broadcasts.some((packet) => packet.readInt16LE(0) === MapleSendOpcode.AFFECTED_AREA_REMOVED.code)).to.equal(true);
  });

  it('should remove affected areas by owner id', () => {
    const broadcasts: Buffer[] = [];
    let nextId = 1;
    const field = {
      nextId: (): number => nextId++,
      broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
    };
    const pool = new AffectedAreaPool(field);
    pool.addAffectedArea(affectedArea(owner(9), new Rect(0, 0, 10, 10), new Date(Date.now() + 10_000)));
    pool.addAffectedArea(affectedArea(owner(10), new Rect(0, 0, 10, 10), new Date(Date.now() + 10_000)));

    pool.removeByOwnerId(9);

    expect(pool.getCount()).to.equal(1);
    expect(pool.getAll()[0].owner.getId()).to.equal(10);
    expect(broadcasts.filter((packet) => packet.readInt16LE(0) === MapleSendOpcode.AFFECTED_AREA_REMOVED.code).length).to.equal(1);
  });

  it('should create mob-skill affected areas relative to the mob', () => {
    const ownerMob = owner(50);
    ownerMob.setX(100);
    ownerMob.setY(200);
    const skillInfo = {
      skillId: 130,
      elemAttr: ElementAttribute.FIRE,
      getRect: (_slv: number): Rect => new Rect(-20, -10, 20, 10),
      getDuration: (_slv: number): number => 15_000,
    } as any;

    const area = AffectedArea.mobSkill(ownerMob as any, skillInfo, 2, 90);

    expect(area.type).to.equal(AffectedAreaType.MobSkill);
    expect(area.owner).to.equal(ownerMob);
    expect(area.skillId).to.equal(130);
    expect(area.skillLevel).to.equal(2);
    expect(area.delay).to.equal(90);
    expect(area.rect.left).to.equal(80);
    expect(area.rect.right).to.equal(120);
    expect(area.rect.top).to.equal(190);
    expect(area.rect.bottom).to.equal(210);
  });
});

function affectedArea(ownerObject: FieldObject, rect: Rect, expireTime: Date): AffectedArea {
  return new AffectedArea(
    AffectedAreaType.UserSkill,
    ownerObject,
    2111003,
    1,
    0,
    1,
    rect,
    ElementAttribute.POISON,
    expireTime,
  );
}

function owner(id: number): FieldObject {
  const o = new TestFieldObject();
  o.setId(id);
  return o;
}

function mob(x: number, y: number): any {
  return {
    getHp: (): number => 100,
    getX: (): number => x,
    getY: (): number => y,
  };
}

class TestFieldObject extends Life {}
