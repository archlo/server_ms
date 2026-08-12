export class CharDao {
  getCharById(id: number): any {
    return null;
  }

  getCharsByAccountId(accountId: number): any[] {
    return [];
  }

  saveChar(char: any): void {
    console.log('[CharDao] saveChar');
  }

  createChar(char: any): void {
    console.log('[CharDao] createChar');
  }

  deleteChar(id: number): void {
    console.log('[CharDao] deleteChar');
  }
}
