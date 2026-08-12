import { Point } from "../../util/types/point";


export type OutPacket = PacketWriter;

export class PacketWriter {

    data: Buffer;
    bytesWritten: number = 0;

    constructor(length: number = 32) {
        this.data = Buffer.alloc(length);
    }

    private dynamicAllocation(byteSize: number): void {
        const bytesAvailable = this.data.length - this.bytesWritten;
        if (bytesAvailable < byteSize) {
            const bytesNeeded = byteSize - bytesAvailable;
            this.data = Buffer.alloc(this.data.length + bytesNeeded, this.data);
        }
    }

    writeByte(byte: number): void {
        this.dynamicAllocation(1);
        // MapleStory bytes are unsigned (0..255). writeIntLE rejects values
        // >= 128, so mask to the low 8 bits (mirrors Java's DataOutput.writeByte).
        this.data.writeUIntLE(byte & 0xFF, this.bytesWritten, 1);
        this.bytesWritten += 1;
    }

    writeUByte(uByte: number): void {
        this.dynamicAllocation(1);
        this.data.writeUIntLE(uByte, this.bytesWritten, 1);
        this.bytesWritten += 1;
    }

    writeShort(short: number): void {
        this.dynamicAllocation(2);
        this.data.writeInt16LE(short, this.bytesWritten);
        this.bytesWritten += 2;
    }

    writeUShort(uShort: number): void {
        this.dynamicAllocation(2);
        this.data.writeUInt16LE(uShort, this.bytesWritten);
        this.bytesWritten += 2;
    }

    writeInt(int: number): void {
        this.dynamicAllocation(4);
        this.data.writeInt32LE(int, this.bytesWritten);
        this.bytesWritten += 4;
    }

    writeUInt(uInt: number): void {
        this.dynamicAllocation(4);
        this.data.writeUInt32LE(uInt, this.bytesWritten);
        this.bytesWritten += 4;
    }

    writeDouble(double: number): void {
        this.dynamicAllocation(8);
        this.data.writeDoubleLE(double, this.bytesWritten);
        this.bytesWritten += 8;
    }

    writeLong(long: bigint): void {
        this.dynamicAllocation(8);
        this.data.writeBigInt64LE(long, this.bytesWritten);
        this.bytesWritten += 8;
    }

    writeULong(uLong: bigint): void {
        this.dynamicAllocation(8);
        this.data.writeBigUInt64LE(uLong, this.bytesWritten);
        this.bytesWritten += 8;
    }

    write(buf: Buffer): void {
        for (let byte of buf) this.writeByte(byte);
    }

    private writeAsciiString(str: string): void {
        this.write(Buffer.from(str, 'utf-8'));
    }

    writeNullTerminatedAsciiString(str: string): void {
        this.writeAsciiString(str);
        this.writeByte(0);
    }

    writeMapleAsciiString(str: string): void {
        this.writeShort(str.length);
        this.writeAsciiString(str);
    }

    /** Fixed-length ASCII string, padded/truncated to `length` bytes. */
    writeFixedString(str: string, length: number): void {
        const buf = Buffer.alloc(length);
        buf.write(str ?? '', 0, 'ascii');
        this.write(buf);
    }

    /** Windows FILETIME (100ns ticks since 1601-01-01), encoded as low/high 32-bit ints. */
    writeFT(date: Date | null): void {
        const ft = date !== null
            ? BigInt(date.getTime()) * 10000n + 116444736000000000n
            : 150842304000000000n; // FileTime.DEFAULT_TIME
        this.writeFTValue(ft);
    }

    /** Raw FILETIME value (e.g. FileTime.ZERO_TIME = 94354848000000000n). */
    writeFTValue(ft: bigint): void {
        this.writeInt(Number(BigInt.asIntN(32, ft & 0xFFFFFFFFn)));
        this.writeInt(Number(BigInt.asIntN(32, (ft >> 32n) & 0xFFFFFFFFn)));
    }

    writePosition(pos: Point): void {
        this.writeShort(pos.x);
        this.writeShort(pos.y);
    }

    writeBoolean(bool: boolean): void {
        this.writeByte(bool ? 1 : 0);
    }

    getPacket(): Buffer {
        return this.data;
    }

}