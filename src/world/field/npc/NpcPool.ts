import { FieldObjectPool } from '../FieldObjectPool';
import { Npc } from './Npc';

export class NpcPool extends FieldObjectPool<Npc> {
  private idCounter = 1;

  constructor(private readonly field: any) { super(); }

  addNpc(npc: Npc): void {
    npc.setField(this.field);
    npc.setId(this.idCounter++);
    this.addObject(npc);
  }

  removeNpc(npc: Npc): boolean { return this.removeObject(npc); }

  getNpcByTemplateId(templateId: number): Npc | undefined {
    return this.getBy(n => n.getTemplateId() === templateId);
  }
}
