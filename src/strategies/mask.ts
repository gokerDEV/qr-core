import { selectAndApplyBestMask } from "../mask/selection.js";
import type { Matrix } from "../matrix/bit-matrix.js";
import type { EccLevel, MaskId } from "../types/index.js";

export interface MaskResult {
	mask: MaskId;
	penalties: number[];
}

/**
 * Strategy for selecting the best mask pattern.
 */
export interface MaskStrategy {
	select(matrix: Matrix, ecc: EccLevel): MaskResult;
}

/**
 * Evaluates all 8 masks and picks the one with the lowest penalty.
 */
export const BestMaskStrategy: MaskStrategy = {
	select(matrix: Matrix, ecc: EccLevel): MaskResult {
		return selectAndApplyBestMask(matrix, ecc);
	},
};
