import { computeEcc } from "../core/rs.js";
import { ECC_TABLE } from "../spec/tables.js";
import type { EccLevel } from "../types/index.js";

/**
 * Splits data into blocks and interleaves them with ECC codewords.
 */
export function interleave(data: Uint8Array, version: number, ecc: EccLevel): Uint8Array {
	const spec = ECC_TABLE[version]?.[ecc];
	if (!spec) throw new Error(`Invalid version/ECC: ${version}/${ecc}`);

	const dataBlocks: Uint8Array[] = [];
	const eccBlocks: Uint8Array[] = [];
	let offset = 0;

	const groups = [spec.group1, spec.group2];
	for (const group of groups) {
		for (let i = 0; i < group.numBlocks; i++) {
			const block = data.slice(offset, offset + group.dataCodewords);
			dataBlocks.push(block);
			eccBlocks.push(computeEcc(block, spec.eccPerBlock));
			offset += group.dataCodewords;
		}
	}

	const totalDataLen = dataBlocks.reduce((acc, b) => acc + b.length, 0);
	const totalEccLen = eccBlocks.length * spec.eccPerBlock;
	const result = new Uint8Array(totalDataLen + totalEccLen);
	let resOffset = 0;

	// Interleave data codewords
	const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
	for (let i = 0; i < maxDataLen; i++) {
		for (const block of dataBlocks) {
			if (i < block.length) {
				const val = block[i];
				// block[i] is safe because i < block.length
				if (val !== undefined) {
					result[resOffset++] = val;
				}
			}
		}
	}

	// Interleave ECC codewords
	for (let i = 0; i < spec.eccPerBlock; i++) {
		for (const block of eccBlocks) {
			const val = block[i];
			if (val === undefined) throw new Error("Internal error: ECC block shorter than expected");
			result[resOffset++] = val;
		}
	}

	return result;
}
