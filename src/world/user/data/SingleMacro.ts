import { PacketReader } from '../../../protocol/packets/packetReader';
import { GameConstants } from '../../GameConstants';

export class SingleMacro {
  constructor(
    readonly name: string,
    readonly mute: boolean,
    readonly skills: number[],
  ) {}

  static decode(r: PacketReader): SingleMacro {
    const name = r.readMapleAsciiString();
    const mute = r.readBoolean();
    const skills = new Array(GameConstants.MACRO_SKILL_COUNT);
    for (let i = 0; i < skills.length; i++) {
      skills[i] = r.readInt();
    }
    return new SingleMacro(name, mute, skills);
  }
}
