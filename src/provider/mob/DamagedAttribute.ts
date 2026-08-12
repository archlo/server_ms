export enum DamagedAttribute {
  NONE     = 0,
  DAMAGE0  = 1,
  DAMAGE50 = 2,
  DAMAGE150= 3,
}

export function damagedAttributeFromChar(c: string): DamagedAttribute {
  switch (c) {
    case '1': return DamagedAttribute.DAMAGE0;
    case '2': return DamagedAttribute.DAMAGE50;
    case '3': return DamagedAttribute.DAMAGE150;
    default:  throw new Error(`Unknown DamagedAttribute char: ${c}`);
  }
}
