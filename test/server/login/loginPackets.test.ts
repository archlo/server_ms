import { expect } from 'chai';
import { LoginPackets, CharData } from '../../../src/server/login/loginPackets';

// CLogin::OnViewAllCharResult (decompile/5DE120.c) subType 0 wire format:
//   byte subType(0) + byte worldId + byte count + per-char(
//   CharacterStat[101+sp] + AvatarLook[29+equips*5] + byte hasRank + 16-byte rank?) +
//   byte loginOpt (last batch).
// Buffer layout (single non-extend char, 1 equip):
//   [0..1] opcode | [2] subType | [3] worldId | [4] count |
//   [5..107] CharacterStat(103) | [108..141] AvatarLook(34) |
//   [142] hasRank | [143..158] rank(16) | [159] picStatus
describe('server/login/LoginPackets.getViewAllCharResult', () => {
  const makeChar = (): CharData => ({
    id: 7, name: 'Hero', gender: 0, skin: 0, face: 20000, hair: 30000,
    petSn1: 0, petSn2: 0, petSn3: 0,
    level: 1, job: 0, str: 4, dex: 4, int: 4, luk: 4,
    hp: 50, maxHp: 50, mp: 5, maxMp: 5, ap: 0,
    sp: 0, exp: 0, pop: 0, tempExp: 0,
    posMap: 100000000, portal: 0, playTime: 0, subJob: 0,
    onFamily: true, hasRank: true,
    worldRank: 1, worldRankMove: 2, jobRank: 3, jobRankMove: 4,
    equipped: [{ pos: 1, itemId: 1040000 }],
  });

  it('encodes the v95 subType-0 batch: byte count, no onFamily, trailing picStatus', () => {
    const p = LoginPackets.getViewAllCharResult(1, [makeChar()]);
    const b = p;
    expect(b.length).to.equal(160);
    expect(b[2]).to.equal(0);       // subType = 0 (character batch)
    expect(b[3]).to.equal(0);       // worldId
    expect(b[4]).to.equal(1);       // count as BYTE (was a 4-byte int before)
    // CharacterStat id at [5..9], AvatarLook ends at 142
    expect(b.readInt32LE(5)).to.equal(7);
    // [142] is the hasRank flag (NOT onFamily — the old encoder wrote onFamily here)
    expect(b[142]).to.equal(1);
    // 16-byte rank block
    expect(b.readInt32LE(143)).to.equal(1);  // worldRank
    expect(b.readInt32LE(147)).to.equal(2);  // worldRankMove
    expect(b.readInt32LE(151)).to.equal(3);  // jobRank
    expect(b.readInt32LE(155)).to.equal(4);  // jobRankMove
    // trailing loginOpt/picStatus byte (was writeByte(0)+writeInt(picStatus))
    expect(b[159]).to.equal(1);
  });

  it('omits the rank block when hasRank is false and keeps the trailer aligned', () => {
    const c = makeChar();
    c.hasRank = false;
    const p = LoginPackets.getViewAllCharResult(0, [c]);
    expect(p.length).to.equal(144);
    expect(p[142]).to.equal(0);     // hasRank = 0, no 16-byte block
    expect(p[143]).to.equal(0);     // picStatus
  });
});
