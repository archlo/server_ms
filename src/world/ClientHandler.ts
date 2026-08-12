import { PacketReader } from '../protocol/packets/packetReader';
import { User } from './user/User';

export class ClientHandler {
  static handleExceptionLog(user: User, r: PacketReader): void {
    // log client-side exception info
    r.readInt(); // dwErrorType
    r.readInt(); // dwErrorCode
    r.readMapleAsciiString(); // sErrorMessage
    r.readMapleAsciiString(); // sModuleName
    r.readInt(); // dwModuleOffset
  }

  static handleClientDumpLog(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // dump info
  }
}
