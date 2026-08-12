import { NXNode } from '../../wz-utils/NXNode';

export class SkillStringInfo {
  constructor(
    public readonly name: string,
    public readonly desc: string,
    public readonly bookDesc: string,
  ) {}

  static from(skillId: number, stringNode: NXNode): SkillStringInfo {
    const name = (stringNode.nGet('name', '') as string) ?? '';
    const desc = (stringNode.nGet('desc', '') as string) ?? '';
    const bookDesc = (stringNode.nGet('bookDesc', '') as string) ?? '';
    return new SkillStringInfo(name, desc, bookDesc);
  }
}
