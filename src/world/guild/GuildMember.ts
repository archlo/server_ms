import { PacketWriter } from '../../protocol/packets/packetWriter';

export class GuildMember {
  constructor(
    readonly characterId: number,
    readonly characterName: string,
    readonly job: number,
    readonly level: number,
    readonly grade: number,
    readonly online: boolean,
    readonly allianceGrade: number = 0,
  ) {}

  encode(w: PacketWriter): void {
    w.writeInt(this.characterId);
    w.writeFixedString(this.characterName, 13);
    w.writeInt(this.job);
    w.writeInt(this.level);
    w.writeInt(this.grade);
    w.writeInt(this.online ? 1 : 0);
    w.writeInt(this.allianceGrade);
    w.writeInt(0); // nFace (unused in this context)
  }
}
