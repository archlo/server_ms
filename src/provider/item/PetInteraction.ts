import { NXNode } from '../../wz-utils/NXNode';
import NXManager from '../../wz-utils/NXManager';

export class PetInteraction {
  private static cache = new Map<number, PetInteraction>();

  constructor(
    public readonly incTameness: number,
    public readonly levelMin: number,
    public readonly levelMax: number,
    public readonly prop: number,
  ) {}

  static from(interactProp: NXNode): PetInteraction {
    return new PetInteraction(
      interactProp.nGet('inc',  0) as number,
      interactProp.nGet('l0',   0) as number,
      interactProp.nGet('l1',   0) as number,
      interactProp.nGet('prob', 0) as number,
    );
  }

  static fromItemId(itemId: number): PetInteraction | null {
    if (this.cache.has(itemId)) return this.cache.get(itemId)!;

    try {
      const prefix = String(itemId).padStart(8, '0').slice(0, 4);
      const node = NXManager.get(`Item.wz/Cash/${prefix}.img/${itemId}/info/interact`);
      if (node) {
        const pi = PetInteraction.from(node);
        this.cache.set(itemId, pi);
        return pi;
      }
    } catch (_) {}
    return null;
  }
}
