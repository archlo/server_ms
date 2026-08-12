export class Portal {
  private name: string;
  private id: number;
  private type: any;
  private x: number;
  private y: number;
  private targetMapId: number;
  private targetPortalName: string;
  private scriptName: string;

  constructor(name: string = '', id: number = 0) {
    this.name = name;
    this.id = id;
    this.type = 0;
    this.x = 0;
    this.y = 0;
    this.targetMapId = 0;
    this.targetPortalName = '';
    this.scriptName = '';
  }

  getName(): string { return this.name; }
  setName(name: string): void { this.name = name; }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }

  getType(): any { return this.type; }
  setType(type: any): void { this.type = type; }

  getX(): number { return this.x; }
  setX(x: number): void { this.x = x; }

  getY(): number { return this.y; }
  setY(y: number): void { this.y = y; }

  getTargetMapId(): number { return this.targetMapId; }
  setTargetMapId(targetMapId: number): void { this.targetMapId = targetMapId; }

  getTargetPortalName(): string { return this.targetPortalName; }
  setTargetPortalName(targetPortalName: string): void { this.targetPortalName = targetPortalName; }

  getScriptName(): string { return this.scriptName; }
  setScriptName(scriptName: string): void { this.scriptName = scriptName; }
}
