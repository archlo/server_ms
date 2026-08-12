export class UserDao {
  getUserById(id: number): any {
    return null;
  }

  saveUser(user: any): void {
    console.log('[UserDao] saveUser');
  }

  createUser(user: any): void {
    console.log('[UserDao] createUser');
  }
}
