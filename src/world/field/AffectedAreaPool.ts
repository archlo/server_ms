import { FieldObjectPool } from './FieldObjectPool';
import { AffectedArea } from './affectedarea/AffectedArea';
import { AffectedAreaType } from './affectedarea/AffectedAreaType';
import { AffectedAreaPacket } from './affectedarea/AffectedAreaPacket';

export class AffectedAreaPool extends FieldObjectPool<AffectedArea> {
  private fieldTickCounter = 1;

  constructor(private readonly field: any) { super(); }

  addAffectedArea(affectedArea: AffectedArea): void {
    affectedArea.setField(this.field);
    affectedArea.setId(typeof this.field.nextId === 'function' ? this.field.nextId() : this.fieldTickCounter++);
    this.addObject(affectedArea);
    this.field.broadcastPacket(AffectedAreaPacket.affectedAreaCreated(affectedArea));
  }

  removeAffectedArea(affectedArea: AffectedArea): boolean {
    if (!this.removeObject(affectedArea)) return false;
    this.field.broadcastPacket(AffectedAreaPacket.affectedAreaRemoved(affectedArea));
    return true;
  }

  removeByOwnerId(ownerId: number): void {
    const iter = this.getAll();
    for (const affectedArea of iter) {
      if (affectedArea.owner.getId() === ownerId) {
        this.removeObject(affectedArea);
        this.field.broadcastPacket(AffectedAreaPacket.affectedAreaRemoved(affectedArea));
      }
    }
  }

  updateAffectedAreas(now: Date): void {
    const counter = this.fieldTickCounter++;
    const iter = this.getAll();
    for (const affectedArea of iter) {
      // Check users and mobs inside area every `interval` ticks
      if (affectedArea.interval !== 0 && counter % affectedArea.interval === 0) {
        switch (affectedArea.type) {
          case AffectedAreaType.UserSkill:
            this.field.getMobPool().forEach((mob: any) => {
              if (mob.getHp() > 0 && affectedArea.rect.isInsideRect(mob.getX(), mob.getY())) {
                affectedArea.handleMobInside(mob);
              }
            });
            break;
          case AffectedAreaType.MobSkill:
          case AffectedAreaType.Buff:
          case AffectedAreaType.BlessedMist:
            this.field.getUserPool().forEach((user: any) => {
              if (user.getHp() > 0 && affectedArea.rect.isInsideRect(user.getX(), user.getY())) {
                affectedArea.handleUserInside(user);
              }
            });
            break;
        }
      }
      // Remove expired
      if (now >= affectedArea.expireTime) {
        this.removeObject(affectedArea);
        this.field.broadcastPacket(AffectedAreaPacket.affectedAreaRemoved(affectedArea));
      }
    }
  }
}
