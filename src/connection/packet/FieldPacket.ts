export class FieldPacket {
  static showFieldEffect(effect: string): any {
    return { data: 'showFieldEffect', effect };
  }

  static showFieldObject(obj: any): any {
    return { data: 'showFieldObject', obj };
  }

  static showFieldPortal(portal: any): any {
    return { data: 'showFieldPortal', portal };
  }

  static showFieldMob(mob: any): any {
    return { data: 'showFieldMob', mob };
  }

  static showFieldNPC(npc: any): any {
    return { data: 'showFieldNPC', npc };
  }
}
