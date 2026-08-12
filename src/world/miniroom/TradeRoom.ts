import { User } from '../../world/user/User';
import { Item } from '../../world/item/Item';
import { InventoryType } from '../item/InventoryType';

export interface TradeOffer {
  items: Map<number, TradeOfferItem>;
  mesos: number;
  locked: boolean;
}

export interface TradeOfferItem {
  item: Item;
  pos: number;
  quantity: number;
  invType: InventoryType;
}

export class TradeRoom {
  readonly tradeId: number;
  private readonly users: [User | null, User | null];
  private readonly offers: [TradeOffer, TradeOffer];

  private static nextId = 1;

  constructor(userA: User, userB: User) {
    this.tradeId = TradeRoom.nextId++;
    this.users = [userA, userB];
    this.offers = [
      { items: new Map(), mesos: 0, locked: false },
      { items: new Map(), mesos: 0, locked: false },
    ];
  }

  getUsers(): [User | null, User | null] {
    return this.users;
  }

  getPartner(user: User): User | null {
    return this.users[0]?.getCharacterId() === user.getCharacterId() ? this.users[1] : this.users[0];
  }

  getIndex(user: User): number {
    return this.users[0]?.getCharacterId() === user.getCharacterId() ? 0 : 1;
  }

  getOffer(index: number): TradeOffer {
    return this.offers[index];
  }

  getOfferItems(index: number): IterableIterator<TradeOfferItem> {
    return this.offers[index].items.values();
  }

  setItem(user: User, invType: InventoryType, pos: number, item: Item, quantity: number, tradeSlot: number): TradeOfferItem | null {
    const idx = this.getIndex(user);
    if (this.offers[idx].locked) return null;
    const entry: TradeOfferItem = { item, pos, quantity, invType };
    this.offers[idx].items.set(tradeSlot, entry);
    return entry;
  }

  removeItem(user: User, tradeSlot: number): TradeOfferItem | undefined {
    const idx = this.getIndex(user);
    if (this.offers[idx].locked) return undefined;
    const entry = this.offers[idx].items.get(tradeSlot);
    if (!entry) return undefined;
    this.offers[idx].items.delete(tradeSlot);
    return entry;
  }

  setMesos(user: User, mesos: number): boolean {
    const idx = this.getIndex(user);
    if (this.offers[idx].locked) return false;
    this.offers[idx].mesos = mesos;
    return true;
  }

  lock(user: User): boolean {
    const idx = this.getIndex(user);
    if (this.offers[idx].locked) return false;
    this.offers[idx].locked = true;
    return true;
  }

  cancelLock(user: User): boolean {
    const idx = this.getIndex(user);
    if (!this.offers[idx].locked) return false;
    this.offers[idx].locked = false;
    return true;
  }

  isBothLocked(): boolean {
    return this.offers[0].locked && this.offers[1].locked;
  }
}
