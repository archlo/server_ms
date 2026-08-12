export enum EquipAttribute {
  Locked = 0x1,
  Scrolled = 0x2,
  LuckyDay = 0x4,
  ProtectionScroll = 0x8,
  UpgradeCountProtection = 0x100,
  Crafted = 0x200,
  Untradable = 0x400,
  UpgradeBlock = 0x1000,
  GoldenHammer = 0x4000,
  TradeBlock = 0x20000,
  KarmaScissors = 0x20000,
  MasterWork = 0x100000,
  ChaosScrolled = 0x2000000,
}

export function getVal(attr: EquipAttribute): number {
  return attr;
}
