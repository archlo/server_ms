export class Randomizer {
  static nextInt(bound?: number): number {
    if (bound !== undefined) {
      return Math.floor(Math.random() * bound);
    }
    return Math.floor(Math.random() * 2147483647);
  }

  static rand(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  static nextBoolean(): boolean {
    return Math.random() < 0.5;
  }

  static nextFloat(): number {
    return Math.random();
  }
}
