import { BitBuffer } from "../core/bit-buffer.js";
import {
	CHAR_COUNT_INDICATOR_BITS,
	getVersionGroupIndex,
	MODE_INDICATOR,
} from "../spec/constants.js";
import { ECC_TABLE } from "../spec/tables.js";
import type { EccLevel } from "../types/index.js";
import { encodeAlphanumeric, encodeByte, encodeNumeric } from "./encoders.js";
import type { Segment } from "./segmentation.js";

/**
 * Combines encoded segments and applies padding to create the final data bitstream.
 */
export function buildBitstream(segments: Segment[], version: number, ecc: EccLevel): BitBuffer {
	const buffer = new BitBuffer();
	const groupIdx = getVersionGroupIndex(version);

	// 1. Append segments
	for (const segment of segments) {
		// Mode Indicator (4 bits)
		buffer.put(MODE_INDICATOR[segment.mode], 4);

		// Character Count Indicator (length depends on mode and version group)
		const charCountBits = CHAR_COUNT_INDICATOR_BITS[segment.mode][groupIdx];
		const charCount = segment.count;
		const maxCount = (1 << charCountBits) - 1;
		if (charCount > maxCount) {
			throw new Error(`Segment too long for mode ${segment.mode} at version ${version}`);
		}
		buffer.put(charCount, charCountBits);

		// Data bits
		switch (segment.mode) {
			case "numeric":
				encodeNumeric(segment.data, buffer);
				break;
			case "alphanumeric":
				encodeAlphanumeric(segment.data, buffer);
				break;
			case "byte":
				if (!segment.bytes) {
					throw new Error("Encoding error: Byte segment missing bytes");
				}
				encodeByte(segment.bytes, buffer);
				break;
		}
	}

	// Calculate target capacity in bits
	const versionInfo = ECC_TABLE[version]?.[ecc];
	if (!versionInfo) {
		throw new Error(`Invalid version/ECC combination: ${version}/${ecc}`);
	}

	const dataCapacityBits =
		(versionInfo.group1.numBlocks * versionInfo.group1.dataCodewords +
			versionInfo.group2.numBlocks * versionInfo.group2.dataCodewords) *
		8;

	if (buffer.length > dataCapacityBits) {
		throw new Error(`Data too large for version ${version}-${ecc}`);
	}

	// 2. Terminator (up to 4 zero bits)
	const terminatorLen = Math.min(4, dataCapacityBits - buffer.length);
	if (terminatorLen > 0) {
		buffer.put(0, terminatorLen);
	}

	// 3. Pad to byte boundary
	buffer.bitByteAlign();

	// 4. Pad with alternating bytes (0xEC, 0x11) until capacity is reached
	const padCodewords = [0xec, 0x11];
	let padIdx = 0;
	while (buffer.length < dataCapacityBits) {
		// Safe access because padIdx is modulo 2, so it's always 0 or 1.
		// padCodewords has 2 elements.
		const padVal = padCodewords[padIdx];
		buffer.put(padVal ?? 0xec, 8); // Fallback purely for type safety, never reached
		padIdx = (padIdx + 1) % 2;
	}

	return buffer;
}
