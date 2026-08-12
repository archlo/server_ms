import { ItemOption } from '../../enums/ItemOption';

export class ItemData {
  private static options = new Map<number, ItemOption>();

  static getItemOption(optionId: number): ItemOption | null {
    return ItemData.options.get(optionId) ?? null;
  }

  static addItemOption(option: ItemOption): void {
    ItemData.options.set(option.id, option);
  }
}
