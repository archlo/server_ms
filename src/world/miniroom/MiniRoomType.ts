export enum MiniRoomType {
  OmokRoom = 1,
  MemoryGameRoom = 2,
  TradingRoom = 3,
  PersonalShop = 4,
  EntrustedShop = 5,
  CashTradingRoom = 6,
  TypeNo = 7,
}

export function miniRoomTypeIsBalloon(type: MiniRoomType): boolean {
  return type === MiniRoomType.OmokRoom ||
    type === MiniRoomType.MemoryGameRoom ||
    type === MiniRoomType.PersonalShop ||
    type === MiniRoomType.EntrustedShop;
}

export function miniRoomTypeByValue(value: number): MiniRoomType | null {
  for (const t of Object.values(MiniRoomType)) {
    if (typeof t === 'number' && t === value) return t as MiniRoomType;
  }
  return null;
}
