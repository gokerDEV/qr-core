import type { BitBuffer } from "../core/bit-buffer.js";
import { ALPHANUMERIC_CHARSET } from "../spec/constants.js";

/**
 * Numeric Mode: 10 bit / 3 characters
 */
export function encodeNumeric(data: string, buffer: BitBuffer): void {
	let i = 0;
	while (i + 3 <= data.length) {
		const num = parseInt(data.substring(i, i + 3), 10);
		buffer.put(num, 10);
		i += 3;
	}
	if (data.length - i === 2) {
		buffer.put(parseInt(data.substring(i), 10), 7);
	} else if (data.length - i === 1) {
		buffer.put(parseInt(data.substring(i), 10), 4);
	}
}

/**
 * Alphanumeric Mode: 11 bit / 2 characters
 */
export function encodeAlphanumeric(data: string, buffer: BitBuffer): void {
	let i = 0;
	while (i + 2 <= data.length) {
		const char1Str = data[i];
		const char2Str = data[i + 1];

		if (char1Str === undefined || char2Str === undefined)
			throw new Error("Encoding error: Index out of bounds");

		const char1 = ALPHANUMERIC_CHARSET.indexOf(char1Str);
		const char2 = ALPHANUMERIC_CHARSET.indexOf(char2Str);

		if (char1 === -1 || char2 === -1)
			throw new Error("Encoding error: Invalid character");

		buffer.put(char1 * 45 + char2, 11);
		i += 2;
	}
	if (data.length - i === 1) {
		const char1Str = data[i];
		if (char1Str === undefined)
			throw new Error("Encoding error: Index out of bounds");

		const char1 = ALPHANUMERIC_CHARSET.indexOf(char1Str);
		if (char1 === -1) throw new Error("Encoding error: Invalid character");

		buffer.put(char1, 6);
	}
}

/**
 * Byte Mode: UTF-8 (Default)
 */
export function encodeByte(data: string | Uint8Array, buffer: BitBuffer): void {
	const bytes =
		typeof data === "string" ? new TextEncoder().encode(data) : data;
	for (const byte of bytes) {
		buffer.put(byte, 8);
	}
}
