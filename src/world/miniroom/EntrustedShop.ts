import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { MiniRoom } from './MiniRoom';
import { MiniRoomProtocol } from './MiniRoomProtocol';
import { MiniRoomType } from './MiniRoomType';

/**
 * Port of kinoko EntrustedShop (hired merchant). The kinoko implementation is
 * a stub (handlePacket / leave / updateBalloon are empty), so this TS port
 * mirrors that structure: it stores the employer/template metadata and is
 * ready to be wired up with the hired-merchant packet flow.
 */
export class EntrustedShop extends MiniRoom {
  private readonly employerName: string;
  private readonly employerId: number;
  private readonly templateId: number;
  private foothold = 0;

  constructor(title: string, password: string | null, employerName: string, employerId: number, templateId: number) {
    super(title, password, 0);
    this.employerName = employerName;
    this.employerId = employerId;
    this.templateId = templateId;
  }

  getEmployerName(): string { return this.employerName; }
  getEmployerId(): number { return this.employerId; }
  getTemplateId(): number { return this.templateId; }
  getFoothold(): number { return this.foothold; }
  setFoothold(fh: number): void { this.foothold = fh; }

  getType(): MiniRoomType { return MiniRoomType.EntrustedShop; }
  getMaxUsers(): number { return 3; }

  handlePacket(_user: User, _mrp: MiniRoomProtocol, _r: PacketReader): void {
    // TODO: entrusted shop packet handling (matches kinoko stub)
  }

  leave(_user: User): void {
    // TODO: entrusted shop leave handling (matches kinoko stub)
  }

  updateBalloon(): void {
    // TODO: entrusted shop balloon (matches kinoko stub)
  }
}
