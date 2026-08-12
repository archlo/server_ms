export type TurnUpResult = 'NO_MATCH' | 'MATCH' | 'WIN' | 'DRAW' | 'LOSE';

export class MemoryGame {
  private readonly score = new Map<number, number>(); // userIndex -> score
  private readonly shuffle: number[];

  constructor(gameSpec: number) {
    this.shuffle = MemoryGame.shuffleCards(gameSpec);
  }

  getTotalScore(): number {
    let total = 0;
    for (const v of this.score.values()) total += v;
    return total;
  }

  isScorePenalty(): boolean {
    return this.getTotalScore() < Math.floor(this.shuffle.length / 10);
  }

  getShuffle(): number[] { return this.shuffle; }

  turnUpCard(firstCard: number, secondCard: number, userIndex: number): TurnUpResult {
    if (this.shuffle[firstCard] === this.shuffle[secondCard]) {
      const cur = (this.score.get(userIndex) ?? 0) + 2;
      this.score.set(userIndex, cur);
      if (this.getTotalScore() >= this.shuffle.length) {
        const half = this.shuffle.length / 2;
        if (cur > half) return 'WIN';
        if (cur === half) return 'DRAW';
        return 'LOSE';
      }
      return 'MATCH';
    }
    return 'NO_MATCH';
  }

  private static shuffleCards(gameSpec: number): number[] {
    let size: number;
    if (gameSpec === 0) size = 4 * 3;
    else if (gameSpec === 1) size = 5 * 4;
    else size = 6 * 5;
    const shuffle: number[] = [];
    for (let i = 0; i < size / 2; i++) {
      shuffle.push(i);
      shuffle.push(i);
    }
    // Fisher-Yates shuffle
    for (let i = shuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
    }
    return shuffle;
  }
}
