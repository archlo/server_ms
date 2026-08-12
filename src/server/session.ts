import * as net from 'net';
import { AES } from '../protocol/crypto/aes';
import { Shanda } from '../protocol/crypto/shanda';
import { PacketReader } from '../protocol/packets/packetReader';

interface PendingAck {
  ackOpcode: number;
  recvCrypto?: AES;
  resolve: (packet: PacketReader) => void;
  reject: (reason: string) => void;
  timeoutTask: NodeJS.Timeout;
}

export class Session {
    id: number;
    socket: net.Socket;
    handling: Map<number, number> = new Map();
    private pendingAcKs: PendingAck[] = [];
    private dataListenerAttached = false;
    recvBuffer: Buffer = Buffer.alloc(0);

    constructor(socket: net.Socket) {
        this.socket = socket;
    }

    updateHandling(recvOp: number) {
        const numQueued = this.handling.get(recvOp);
        if (numQueued > 1) this.handling.set(recvOp, numQueued - 1);
        else this.handling.delete(recvOp);
    }

    isHandling(opcode: number) {
        return this.handling.has(opcode);
    }

    writePromise(data: Buffer, ackOpcode: number, recvCrypto?: AES, timeout: number = 10000): Promise<PacketReader> {
        this.socket.write(data);
        this.handling.set(ackOpcode, this.handling.has(ackOpcode) ? this.handling.get(ackOpcode) + 1 : 1);

        return new Promise((resolve, reject) => {
            const timeoutTask = setTimeout(() => {
                const idx = this.pendingAcKs.findIndex(p => p.timeoutTask === timeoutTask);
                if (idx >= 0) {
                    this.pendingAcKs.splice(idx, 1);
                    this.updateHandling(ackOpcode);
                    reject(`Never received an ack packet with opcode 0x${ackOpcode.toString(16)}`);
                }
            }, timeout);

            this.pendingAcKs.push({ ackOpcode, recvCrypto, resolve, reject, timeoutTask });

            if (!this.dataListenerAttached) {
                this.dataListenerAttached = true;
                this.socket.on('data', (returnData: Buffer) => {
                    for (let i = this.pendingAcKs.length - 1; i >= 0; i--) {
                        const pending = this.pendingAcKs[i];
                        let packet: PacketReader | null = null;

                        if (!pending.recvCrypto) {
                            packet = new PacketReader(returnData);
                            const opcode = packet.readShort();
                            if (opcode === pending.ackOpcode) {
                                this.pendingAcKs.splice(i, 1);
                                clearTimeout(pending.timeoutTask);
                                this.updateHandling(pending.ackOpcode);
                                pending.resolve(packet);
                            }
                        } else {
                            const dataNoHeader = returnData.slice(4);
                            pending.recvCrypto.transform(dataNoHeader);
                            const decryptedData = Shanda.decrypt(dataNoHeader);
                            packet = new PacketReader(decryptedData);
                            const opcode = packet.readShort();
                            if (opcode === pending.ackOpcode) {
                                this.pendingAcKs.splice(i, 1);
                                clearTimeout(pending.timeoutTask);
                                this.updateHandling(pending.ackOpcode);
                                pending.resolve(packet);
                            }
                        }
                    }
                });
            }
        });
    }
}
