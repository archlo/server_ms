import { PacketWriter } from '../../protocol/packets/packetWriter';
import { InventoryOperationType } from './InventoryOperationType';
import { InventoryType } from './InventoryType';
import { Item } from './Item';

export class InventoryOperation {
  private constructor(
    public readonly operationType: InventoryOperationType,
    public readonly inventoryType: InventoryType,
    public readonly position: number,
    public item?: Item,
    public newPosition = 0,
    public newQuantity = 0,
    public newExp      = 0,
  ) {}

  static newItem(inventoryType: InventoryType, position: number, item: Item): InventoryOperation {
    const op = new InventoryOperation(InventoryOperationType.NewItem, inventoryType, position);
    op.item = item;
    return op;
  }

  static itemNumber(inventoryType: InventoryType, position: number, newQuantity: number): InventoryOperation {
    const op = new InventoryOperation(InventoryOperationType.ItemNumber, inventoryType, position);
    op.newQuantity = newQuantity;
    return op;
  }

  static position(inventoryType: InventoryType, position: number, newPosition: number): InventoryOperation {
    const op = new InventoryOperation(InventoryOperationType.Position, inventoryType, position);
    op.newPosition = newPosition;
    return op;
  }

  static delItem(inventoryType: InventoryType, position: number): InventoryOperation {
    return new InventoryOperation(InventoryOperationType.DelItem, inventoryType, position);
  }

  static exp(inventoryType: InventoryType, position: number, newExp: number): InventoryOperation {
    const op = new InventoryOperation(InventoryOperationType.EXP, inventoryType, position);
    op.newExp = newExp;
    return op;
  }

  /** Port of kinoko's InventoryOperation::encode (GW_ItemSlotBase::Decode for NewItem). */
  encode(w: PacketWriter): void {
    w.writeByte(this.operationType);
    w.writeByte(this.inventoryType);
    w.writeShort(this.position);
    switch (this.operationType) {
      case InventoryOperationType.NewItem:
        this.item!.encode(w);
        break;
      case InventoryOperationType.ItemNumber:
        w.writeShort(this.newQuantity);
        break;
      case InventoryOperationType.Position:
        w.writeShort(this.newPosition);
        break;
      case InventoryOperationType.DelItem:
        break;
      case InventoryOperationType.EXP:
        w.writeInt(this.newExp);
        break;
    }
  }
}
