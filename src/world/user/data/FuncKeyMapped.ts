import { FuncKeyType } from './FuncKeyType';

export class FuncKeyMapped {
  constructor(
    readonly type: FuncKeyType,
    readonly id: number,
  ) {}

  static of(type: FuncKeyType, id: number): FuncKeyMapped {
    return new FuncKeyMapped(type, id);
  }

  static none(): FuncKeyMapped {
    return new FuncKeyMapped(FuncKeyType.NONE, 0);
  }
}
