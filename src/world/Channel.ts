import { World } from './World';
import { Field } from './field/Field';
import { Char } from './user/Char';

export class Channel {
  private id: number;
  private port: number;
  private world: World;
  private fields: Map<number, Field>;
  private clientsInTransfer: Map<number, any>;
  private chars: Char[];

  constructor(id: number, port: number, world: World) {
    this.id = id;
    this.port = port;
    this.world = world;
    this.fields = new Map();
    this.clientsInTransfer = new Map();
    this.chars = [];
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }

  getPort(): number { return this.port; }
  setPort(port: number): void { this.port = port; }

  getWorld(): World { return this.world; }
  setWorld(world: World): void { this.world = world; }

  getFields(): Map<number, Field> { return this.fields; }
  getField(fieldId: number): Field | undefined { return this.fields.get(fieldId); }
  addField(field: Field): void { this.fields.set(field.getMapId(), field); }

  getChars(): Char[] { return this.chars; }
  addChar(char: Char): void { this.chars.push(char); }
  removeChar(char: Char): void {
    const idx = this.chars.indexOf(char);
    if (idx !== -1) this.chars.splice(idx, 1);
  }

  getClientsInTransfer(): Map<number, any> { return this.clientsInTransfer; }
  getClientInTransfer(chrId: number): any | undefined { return this.clientsInTransfer.get(chrId); }
  addClientInTransfer(chrId: number, chanPort: number, client: any): void { this.clientsInTransfer.set(chrId, client); }
  removeClientInTransfer(chrId: number): void { this.clientsInTransfer.delete(chrId); }
}
