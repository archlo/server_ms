export class ItemDao {
  getItemById(id: number): any {
    return null;
  }

  saveItem(item: any): void {
    console.log('[ItemDao] saveItem');
  }

  createItem(item: any): void {
    console.log('[ItemDao] createItem');
  }

  deleteItem(id: number): void {
    console.log('[ItemDao] deleteItem');
  }
}
