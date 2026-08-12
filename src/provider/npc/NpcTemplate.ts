import { NXNode } from '../../wz-utils/NXNode';

export class NpcTemplate {
  constructor(
    public readonly id: number,
    public readonly move: boolean,
    public readonly script: string | null,
    public readonly trunkPut: number,
    public readonly trunkGet: number,
    public readonly guildRank: boolean,
    public readonly imitate: boolean,
  ) {}

  hasScript(): boolean { return !!this.script; }
  isTrunk():   boolean { return this.trunkGet > 0 || this.trunkPut > 0; }

  static from(npcId: number, move: boolean, infoProp: NXNode): NpcTemplate {
    let script: string | null = null;
    let trunkPut = 0, trunkGet = 0;
    let guildRank = false, imitate = false;

    for (const child of infoProp.nChildren) {
      switch (child.nName) {
        case 'script': {
          // child is a NXNode containing script entries
          const scriptChildren = (child as NXNode).nChildren;
          if (scriptChildren.length > 0) {
            const first = scriptChildren[0];
            // direct string value or nested 'script' child
            const s = first.nGet('script') ?? first.nValue;
            if (s) script = s as string;
          } else {
            const s = child.nGet('script');
            if (s) script = s as string;
          }
          break;
        }
        case 'trunkPut':  trunkPut  = child.nValue as number; break;
        case 'trunkGet':  trunkGet  = child.nValue as number; break;
        case 'guildRank': guildRank = (child.nValue as number) !== 0; break;
        case 'imitate':   imitate   = (child.nValue as number) !== 0; break;
      }
    }
    return new NpcTemplate(npcId, move, script, trunkPut, trunkGet, guildRank, imitate);
  }
}
