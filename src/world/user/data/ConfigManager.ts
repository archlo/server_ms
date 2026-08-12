import { GameConstants } from '../../GameConstants';
import { SingleMacro } from './SingleMacro';
import { FuncKeyMapped } from './FuncKeyMapped';
import { getFuncKeyTypeByValue } from './FuncKeyType';

export class ConfigManager {
  private readonly macroSysData: SingleMacro[] = [];
  readonly funcKeyMap: FuncKeyMapped[];
  readonly quickslotKeyMap: number[];
  petConsumeItem = 0;
  petConsumeMpItem = 0;
  petExceptionList: number[] = [];
  private _mapTransfers: number[] = [];

  constructor(funcKeyMap: FuncKeyMapped[], quickslotKeyMap: number[]) {
    this.funcKeyMap = funcKeyMap;
    this.quickslotKeyMap = quickslotKeyMap;
  }

  getMapTransfers(): number[] { return this._mapTransfers; }
  addMapTransfer(fieldId: number): void {
    if (!this._mapTransfers.includes(fieldId)) {
      this._mapTransfers.push(fieldId);
    }
  }
  removeMapTransfer(fieldId: number): void {
    this._mapTransfers = this._mapTransfers.filter(id => id !== fieldId);
  }
  clearMapTransfers(): void { this._mapTransfers = []; }

  getMacroSysData(): SingleMacro[] { return this.macroSysData; }

  updateMacroSysData(data: SingleMacro[]): void {
    this.macroSysData.length = 0;
    this.macroSysData.push(...data);
  }

  updateFuncKeyMap(updates: Map<number, FuncKeyMapped>): void {
    for (const [key, value] of updates) {
      this.funcKeyMap[key] = value;
    }
  }

  updateQuickslotKeyMap(quickslotKeyMap: number[]): void {
    for (let i = 0; i < GameConstants.QUICKSLOT_KEY_MAP_SIZE; i++) {
      this.quickslotKeyMap[i] = quickslotKeyMap[i];
    }
  }

  private static defaultFuncKeyMap(): FuncKeyMapped[] {
    const map = new Array<FuncKeyMapped>(GameConstants.FUNC_KEY_MAP_SIZE);
    map.fill(FuncKeyMapped.none());
    const indexArray = [2,3,4,5,6,7,8,16,17,18,19,20,23,24,25,26,27,29,31,33,34,35,37,38,39,40,41,43,44,45,46,50,56,57,59,60,61,62,63,64,65];
    const typeArray  = [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,5,5,4,4,5,5,6,6,6,6,6,6,6];
    const idArray    = [10,12,13,18,24,21,29,8,5,0,4,28,1,25,19,14,15,52,2,26,17,11,3,20,27,16,23,9,50,51,6,7,53,54,100,101,102,103,104,105,106];
    for (let i = 0; i < indexArray.length; i++) {
      const t = getFuncKeyTypeByValue(typeArray[i])!;
      map[indexArray[i]] = FuncKeyMapped.of(t, idArray[i]);
    }
    return map;
  }

  static defaults(): ConfigManager {
    return new ConfigManager(
      ConfigManager.defaultFuncKeyMap(),
      [...GameConstants.DEFAULT_QUICKSLOT_KEY_MAP],
    );
  }
}
