export enum TrunkRequestType {
  Load = 0,
  Save = 1,
  Close = 2,
  CheckSSN2 = 3,
  GetItem = 4,
  PutItem = 5,
  SortItem = 6,
  Money = 7,
  CloseDialog = 8,
}

export function getTrunkRequestType(value: number): TrunkRequestType | null {
  for (const type of Object.values(TrunkRequestType)) {
    if (typeof type === 'number' && type === value) {
      return type as TrunkRequestType;
    }
  }
  return null;
}
