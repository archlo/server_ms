import { expect } from 'chai';
import { OmokGame } from '../../../src/world/miniroom/OmokGame';
import { MemoryGame } from '../../../src/world/miniroom/MemoryGame';
import { MiniGameRecord } from '../../../src/world/miniroom/MiniGameRecord';
import { MiniRoomType, miniRoomTypeByValue, miniRoomTypeIsBalloon } from '../../../src/world/miniroom/MiniRoomType';
import { MiniRoomProtocol, miniRoomProtocolByValue } from '../../../src/world/miniroom/MiniRoomProtocol';

describe('world/miniroom/OmokGame.ts', () => {
  it('should detect a horizontal five-in-a-row win', () => {
    const g = new OmokGame();
    expect(g.isValid(0, 0)).to.be.true;
    for (let i = 0; i < 5; i++) g.putStone(i, 0, 1);
    expect(g.checkWin(4, 0, 1)).to.be.true;
    expect(g.checkWin(4, 0, 2)).to.be.false;
  });

  it('should detect a vertical win', () => {
    const g = new OmokGame();
    for (let j = 0; j < 5; j++) g.putStone(3, j, 1);
    expect(g.checkWin(3, 4, 1)).to.be.true;
  });

  it('should detect a diagonal win', () => {
    const g = new OmokGame();
    for (let k = 0; k < 5; k++) g.putStone(k, k, 1);
    expect(g.checkWin(4, 4, 1)).to.be.true;
  });

  it('should reject placing a stone on an occupied cell', () => {
    const g = new OmokGame();
    g.putStone(7, 7, 1);
    expect(g.isValid(7, 7)).to.be.false;
  });

  it('should retreat the last move(s)', () => {
    const g = new OmokGame();
    g.putStone(0, 0, 1);
    g.putStone(1, 0, 2);
    const count = g.retreat();
    expect(count).to.equal(2);
    expect(g.isValid(0, 0)).to.be.true;
    expect(g.isValid(1, 0)).to.be.true;
  });

  it('should apply a score penalty while fewer than 6 stones are played', () => {
    const g = new OmokGame();
    expect(g.isScorePenalty()).to.be.true;
    for (let i = 0; i < 6; i++) g.putStone(i, 0, (i % 2) + 1);
    expect(g.isScorePenalty()).to.be.false;
  });
});

describe('world/miniroom/MemoryGame.ts', () => {
  it('should create a shuffled deck with paired cards based on gameSpec', () => {
    const g = new MemoryGame(0);
    const cards = g.getShuffle();
    expect(cards.length).to.equal(4 * 3);
    // every card id appears exactly twice
    const counts = new Map<number, number>();
    for (const c of cards) counts.set(c, (counts.get(c) ?? 0) + 1);
    for (const v of counts.values()) expect(v).to.equal(2);
  });

  it('should report MATCH for a matching pair and increment score', () => {
    const g = new MemoryGame(1);
    const cards = g.getShuffle();
    const first = 0;
    const second = cards.indexOf(cards[0], 1);
    const result = g.turnUpCard(first, second, 0);
    expect(result).to.equal('MATCH');
  });

  it('should report NO_MATCH for a non-matching pair', () => {
    const g = new MemoryGame(1);
    const cards = g.getShuffle();
    let second = cards.findIndex((c, i) => i !== 0 && c !== cards[0]);
    const result = g.turnUpCard(0, second, 0);
    expect(result).to.equal('NO_MATCH');
  });
});

describe('world/miniroom/MiniGameRecord.ts', () => {
  it('should update win/loss counts and Elo ratings for omok', () => {
    const a = new MiniGameRecord();
    const b = new MiniGameRecord();
    MiniGameRecord.processResult(MiniRoomType.OmokRoom, a, b, false, false);
    expect(a.omokWins).to.equal(1);
    expect(b.omokLosses).to.equal(1);
    expect(a.omokScore).to.be.greaterThan(2000);
    expect(b.omokScore).to.be.lessThan(2000);
  });

  it('should update tie counts for a draw', () => {
    const a = new MiniGameRecord();
    const b = new MiniGameRecord();
    MiniGameRecord.processResult(MiniRoomType.MemoryGameRoom, a, b, true, false);
    expect(a.memoryTies).to.equal(1);
    expect(b.memoryTies).to.equal(1);
  });

  it('should encode the record for the given mini room type', () => {
    const rec = new MiniGameRecord();
    rec.omokWins = 3;
    const { PacketWriter } = require('../../../src/protocol/packets/packetWriter');
    const w = new PacketWriter();
    rec.encode(MiniRoomType.OmokRoom, w);
    const buf = w.getPacket();
    // first int is the type, then wins/ties/losses/score
    expect(buf.readInt32LE(0)).to.equal(MiniRoomType.OmokRoom);
    expect(buf.readInt32LE(4)).to.equal(3);
  });
});

describe('world/miniroom enums', () => {
  it('MiniRoomType balloon flag', () => {
    expect(miniRoomTypeIsBalloon(MiniRoomType.OmokRoom)).to.be.true;
    expect(miniRoomTypeIsBalloon(MiniRoomType.PersonalShop)).to.be.true;
    expect(miniRoomTypeIsBalloon(MiniRoomType.TradingRoom)).to.be.false;
  });

  it('miniRoomTypeByValue resolves known values', () => {
    expect(miniRoomTypeByValue(1)).to.equal(MiniRoomType.OmokRoom);
    expect(miniRoomTypeByValue(4)).to.equal(MiniRoomType.PersonalShop);
    expect(miniRoomTypeByValue(99)).to.be.null;
  });

  it('miniRoomProtocolByValue resolves known values', () => {
    expect(miniRoomProtocolByValue(0)).to.equal(MiniRoomProtocol.MRP_Create);
    expect(miniRoomProtocolByValue(64)).to.equal(MiniRoomProtocol.ORP_PutStoneChecker);
    expect(miniRoomProtocolByValue(999)).to.be.null;
  });
});
