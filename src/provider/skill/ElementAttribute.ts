export enum ElementAttribute {
  PHYSICAL = 0,
  ICE      = 1,
  FIRE     = 2,
  LIGHT    = 3,
  POISON   = 4,
  HOLY     = 5,
  DARK     = 6,
  UNDEAD   = 7,
  COUNT    = 8,
}

export function elementAttributeFromChar(c: string): ElementAttribute {
  switch (c.toLowerCase()) {
    case 'p': return ElementAttribute.PHYSICAL;
    case 'd': return ElementAttribute.DARK;
    case 'f': return ElementAttribute.FIRE;
    case 'h': return ElementAttribute.HOLY;
    case 'i': return ElementAttribute.ICE;
    case 'l': return ElementAttribute.LIGHT;
    case 's': return ElementAttribute.POISON;
    case 'u': return ElementAttribute.UNDEAD;
    default:  throw new Error(`Unknown ElementAttribute char: ${c}`);
  }
}
