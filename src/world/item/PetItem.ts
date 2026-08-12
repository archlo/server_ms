import { Item } from './Item';
import { ItemType } from './ItemType';

export class PetItem extends Item {
  private _name: string = '';
  private _level: number = 0;
  private _closeness: number = 0;
  private _fullness: number = 0;
  private _petSkill: number = 0;
  private _summoned: boolean = false;
  private _dateDead: Date | null = null;

  constructor() {
    super(ItemType.PET);
  }

  get name(): string { return this._name; }
  set name(v: string) { this._name = v; }

  get level(): number { return this._level; }
  set level(v: number) { this._level = v; }

  get closeness(): number { return this._closeness; }
  set closeness(v: number) { this._closeness = v; }

  get fullness(): number { return this._fullness; }
  set fullness(v: number) { this._fullness = v; }

  get petSkill(): number { return this._petSkill; }
  set petSkill(v: number) { this._petSkill = v; }

  get summoned(): boolean { return this._summoned; }
  set summoned(v: boolean) { this._summoned = v; }

  get dateDead(): Date | null { return this._dateDead; }
  set dateDead(v: Date | null) { this._dateDead = v; }
}
