import type { MaskId } from "../types/index.js";

export type MaskFn = (x: number, y: number) => boolean;

/**
 * Standard QR mask patterns (0-7)
 */
export const MASK_PATTERNS: Record<MaskId, MaskFn> = {
	0: (x, y) => (x + y) % 2 === 0,
	1: (_x, y) => y % 2 === 0,
	2: (x, _y) => x % 3 === 0,
	3: (x, y) => (x + y) % 3 === 0,
	4: (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
	5: (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
	6: (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
	7: (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
};
