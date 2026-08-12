export class ClientSocket {
  static migrateCommand(boolean: boolean, address: number[], port: number): any {
    return { data: 'migrateCommand', boolean, address, port };
  }
}
