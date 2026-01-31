import type { QrMode } from "../types/index.js";

/**
 * QR Code constants and lookup tables
 */

export const MIN_VERSION = 1;
export const MAX_VERSION = 40;

/**
 * Mode indicators (4-bit values)
 */
export const MODE_INDICATOR: Record<Exclude<QrMode, "auto">, number> = {
	numeric: 0b0001,
	alphanumeric: 0b0010,
	byte: 0b0100,
};

/**
 * Bit lengths for Character Count Indicator based on version groups
 * Groups: 1-9, 10-26, 27-40
 */
export const CHAR_COUNT_INDICATOR_BITS: Record<
	Exclude<QrMode, "auto">,
	[number, number, number]
> = {
	numeric: [10, 12, 14],
	alphanumeric: [9, 11, 13],
	byte: [8, 16, 16],
};

/**
 * Version group index for Character Count Indicator
 */
export function getVersionGroupIndex(version: number): 0 | 1 | 2 {
	if (version <= 9) return 0;
	if (version <= 26) return 1;
	return 2;
}

/**
 * Alphanumeric character set mapping
 */
export const ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/**
 * ECC Codeword tables, Alignment pattern positions, etc. will go here or in sub-files.
 * For now, defining the structure for capacity lookup.
 */

export interface EccBlockConfig {
	totalCodewords: number;
	dataCodewords: number;
	eccCodewordsPerBlock: number;
	blocksGroup1: number;
	dataPerBlockGroup1: number;
	blocksGroup2: number;
	dataPerBlockGroup2: number;
}

// These tables are large and will be populated in src/spec/tables.ts
