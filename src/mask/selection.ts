import { Matrix } from "../matrix/bit-matrix.js";
import { getFormatInfo } from "../spec/bch.js";
import type { EccLevel, MaskId } from "../types/index.js";
import { calculatePenalty } from "./penalty.js";

/**
 * Evaluates all 8 masks and applies the one with the lowest penalty.
 * Implements the deterministic tie-break (lowest ID).
 */
export function selectAndApplyBestMask(
	matrix: Matrix,
	ecc: EccLevel,
): { mask: MaskId; penalties: number[] } {
	let minPenalty = Infinity;
	let bestMask: MaskId = 0;
	const penalties: number[] = [];

	// Pre-allocate work matrix to avoid garbage
	const workMatrix = new Matrix(matrix.size);

	for (let id = 0; id < 8; id++) {
		const maskId = id as MaskId;

		// Reset work matrix
		workMatrix._data.set(matrix._data);

		const currentPenalty = evaluateMask(workMatrix, ecc, maskId);
		penalties.push(currentPenalty);

		if (currentPenalty < minPenalty) {
			minPenalty = currentPenalty;
			bestMask = maskId;
		}
	}

	// Final apply of the winner
	applyMask(matrix, bestMask);
	writeFormatInformation(matrix, ecc, bestMask);

	return { mask: bestMask, penalties };
}

function evaluateMask(
	workMatrix: Matrix,
	ecc: EccLevel,
	maskId: MaskId,
): number {
	// workMatrix is already a copy/reset
	applyMask(workMatrix, maskId);
	writeFormatInformation(workMatrix, ecc, maskId);
	return calculatePenalty(workMatrix);
}

export function applyMask(matrix: Matrix, maskId: MaskId): void {
	const size = matrix.size;
	const data = matrix._data; // Direct access

	switch (maskId) {
		case 0:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						if (((x + y) & 1) === 0) data[idx] = val ^ 1;
					}
				}
			}
			break;
		case 1:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						if ((y & 1) === 0) data[idx] = val ^ 1;
					}
				}
			}
			break;
		case 2:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						if (x % 3 === 0) data[idx] = val ^ 1;
					}
				}
			}
			break;
		case 3:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						if ((x + y) % 3 === 0) data[idx] = val ^ 1;
					}
				}
			}
			break;
		case 4:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						if ((((y >>> 1) + ((x / 3) | 0)) & 1) === 0) data[idx] = val ^ 1;
					}
				}
			}
			break;
		case 5:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						const temp = x * y;
						if ((temp & 1) + (temp % 3) === 0) data[idx] = val ^ 1;
					}
				}
			}
			break;
		case 6:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						const temp = x * y;
						if ((((temp & 1) + (temp % 3)) & 1) === 0) data[idx] = val ^ 1;
					}
				}
			}
			break;
		case 7:
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const idx = y * size + x;
					const val = data[idx] ?? 0;
					if (!(val & 2)) {
						if (((((x + y) & 1) + ((x * y) % 3)) & 1) === 0)
							data[idx] = val ^ 1;
					}
				}
			}
			break;
	}
}

export function writeFormatInformation(
	matrix: Matrix,
	ecc: EccLevel,
	maskId: MaskId,
): void {
	const formatBits = getFormatInfo(ecc, maskId);
	const size = matrix.size;

	for (let i = 0; i < 15; i++) {
		const bit = (formatBits >>> i) & 1;

		// Top-left
		let x: number;
		let y: number;
		if (i < 6) {
			x = i;
			y = 8;
		} else if (i < 8) {
			x = i + 1;
			y = 8;
		} else if (i === 8) {
			x = 8;
			y = 7;
		} else {
			x = 8;
			y = 14 - i;
		}
		matrix.setReserved(x, y, bit === 1);

		// Split area
		let x2: number;
		let y2: number;
		if (i < 8) {
			x2 = 8;
			y2 = size - 1 - i;
		} else {
			x2 = size - 15 + i;
			y2 = 8;
		}
		matrix.setReserved(x2, y2, bit === 1);
	}
}
