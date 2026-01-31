export class BitBuffer {
	private buffer: number[] = [];
	private _length = 0;

	get length(): number {
		return this._length;
	}

	get byteLength(): number {
		return (this._length + 7) >>> 3;
	}

	public put(num: number, length: number): void {
		if (length === 0) return;

		// We iterate from MSB to LSB
		for (let i = 0; i < length; i++) {
			const bit = (num >>> (length - 1 - i)) & 1;
			this.putBit(bit);
		}
	}

	public putBit(bit: number): void {
		const bufIndex = this._length >>> 3;
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
		if (bit) {
			const current = this.buffer[bufIndex];
			// Initialize if undefined (though push(0) above should handle this)
			// But relying on array index validity is key.
			if (current !== undefined) {
				this.buffer[bufIndex] = current | (0x80 >>> (this._length & 7));
			} else {
				// This branch should theoretically be unreachable due to the push check above
				this.buffer[bufIndex] = 0x80 >>> (this._length & 7);
			}
		}
		this._length++;
	}

	public putBytes(bytes: Uint8Array): void {
		for (const byte of bytes) {
			this.put(byte, 8);
		}
	}

	public toBytes(): Uint8Array {
		return new Uint8Array(this.buffer);
	}

	// Helper to pad with zeroes to next byte boundary
	public bitByteAlign(): void {
		const remainder = this._length & 7;
		if (remainder > 0) {
			this.put(0, 8 - remainder);
		}
	}
}
