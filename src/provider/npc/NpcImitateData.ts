import { NXNode } from '../../wz-utils/NXNode';

export class NpcImitateData {
  constructor(
    readonly npcId: number,
    readonly imitateType: number,
    readonly hideName: boolean,
    readonly dcLeft: number,
    readonly dcRight: number,
    readonly dcTop: number,
    readonly dcBottom: number,
    readonly script: string,
  ) {}

  static from(npcId: number, infoNode: NXNode): NpcImitateData | null {
    const imitate = infoNode.nGet('imitate') as number | undefined;
    if (!imitate || imitate === 0) return null;

    return new NpcImitateData(
      npcId,
      imitate as number,
      (infoNode.nGet('hideName') as number | undefined) === 1,
      infoNode.nGet('dcLeft') as number ?? 0,
      infoNode.nGet('dcRight') as number ?? 0,
      infoNode.nGet('dcTop') as number ?? 0,
      infoNode.nGet('dcBottom') as number ?? 0,
      String(infoNode.nGet('script') ?? ''),
    );
  }

  static fromNX(npcId: number, imitateNode: NXNode): NpcImitateData {
    return new NpcImitateData(
      npcId,
      imitateNode.nGet('imitate') as number ?? 1,
      (imitateNode.nGet('hideName') as number | undefined) === 1,
      imitateNode.nGet('dcLeft') as number ?? 0,
      imitateNode.nGet('dcRight') as number ?? 0,
      imitateNode.nGet('dcTop') as number ?? 0,
      imitateNode.nGet('dcBottom') as number ?? 0,
      String(imitateNode.nGet('script') ?? ''),
    );
  }
}
