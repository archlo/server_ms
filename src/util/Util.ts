/** Port of kinoko's Util (subset used by combat handlers). */
export class Util {
  static getRandom(toInclusive: number): number;
  static getRandom(fromInclusive: number, toInclusive: number): number;
  static getRandom(a: number, b?: number): number {
    if (b === undefined) {
      return Math.floor(Math.random() * (a + 1));
    }
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  static succeedProp(chance: number): boolean {
    return Math.floor(Math.random() * 100) < chance;
  }

  static succeedDouble(chance: number): boolean {
    return Math.random() < chance;
  }

  static getRandomFromCollection<T>(collection: T[]): T | undefined;
  static getRandomFromCollection<T>(collection: T[], weightFn: (item: T) => number): T | undefined;
  static getRandomFromCollection<T>(collection: T[], weightFn?: (item: T) => number): T | undefined {
    if (collection.length === 0) return undefined;
    if (!weightFn) {
      return collection[Math.floor(Math.random() * collection.length)];
    }
    const totalWeight = collection.reduce((sum, item) => sum + weightFn(item), 0);
    let r = Math.random() * totalWeight;
    for (const item of collection) {
      r -= weightFn(item);
      if (r <= 0) return item;
    }
    return undefined;
  }

  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
