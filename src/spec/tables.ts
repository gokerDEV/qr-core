import type { EccLevel } from "../types/index.js";

/**
 * Alignment pattern center coordinates for each version (1-40)
 */
export const ALIGNMENT_PATTERN_POSITIONS: number[][] = [
	[],
	[],
	[6, 18],
	[6, 22],
	[6, 26],
	[6, 30],
	[6, 34],
	[6, 22, 38],
	[6, 24, 42],
	[6, 26, 46],
	[6, 28, 50],
	[6, 30, 54],
	[6, 32, 58],
	[6, 34, 62],
	[6, 26, 46, 66],
	[6, 26, 48, 70],
	[6, 26, 50, 74],
	[6, 30, 54, 78],
	[6, 30, 56, 82],
	[6, 30, 58, 86],
	[6, 34, 62, 90],
	[6, 28, 50, 72, 94],
	[6, 26, 50, 74, 98],
	[6, 30, 54, 78, 102],
	[6, 28, 54, 80, 106],
	[6, 32, 58, 84, 110],
	[6, 30, 58, 86, 114],
	[6, 34, 62, 90, 118],
	[6, 26, 50, 74, 98, 122],
	[6, 30, 54, 78, 102, 126],
	[6, 26, 52, 78, 104, 130],
	[6, 30, 56, 82, 108, 134],
	[6, 34, 60, 86, 112, 138],
	[6, 30, 58, 86, 114, 142],
	[6, 34, 62, 90, 118, 146],
	[6, 30, 54, 78, 102, 126, 150],
	[6, 24, 50, 76, 102, 128, 154],
	[6, 28, 54, 80, 106, 132, 158],
	[6, 32, 58, 84, 110, 136, 162],
	[6, 26, 54, 82, 110, 138, 166],
	[6, 30, 58, 86, 114, 142, 170],
];

export interface EccBlockInfo {
	numBlocks: number;
	dataCodewords: number;
}

export interface VersionInfo {
	totalCodewords: number;
	eccPerBlock: number;
	group1: EccBlockInfo;
	group2: EccBlockInfo;
}

/**
 * ECC capacity table for V1 and V2.
 */
// Full ECC table for versions 1-40
export const ECC_TABLE: Record<number, Record<EccLevel, VersionInfo>> = {
	1: {
		L: {
			totalCodewords: 26,
			eccPerBlock: 7,
			group1: { numBlocks: 1, dataCodewords: 19 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 26,
			eccPerBlock: 10,
			group1: { numBlocks: 1, dataCodewords: 16 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 26,
			eccPerBlock: 13,
			group1: { numBlocks: 1, dataCodewords: 13 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		H: {
			totalCodewords: 26,
			eccPerBlock: 17,
			group1: { numBlocks: 1, dataCodewords: 9 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
	},
	2: {
		L: {
			totalCodewords: 44,
			eccPerBlock: 10,
			group1: { numBlocks: 1, dataCodewords: 34 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 44,
			eccPerBlock: 16,
			group1: { numBlocks: 1, dataCodewords: 28 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 44,
			eccPerBlock: 22,
			group1: { numBlocks: 1, dataCodewords: 22 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		H: {
			totalCodewords: 44,
			eccPerBlock: 28,
			group1: { numBlocks: 1, dataCodewords: 16 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
	},
	3: {
		L: {
			totalCodewords: 70,
			eccPerBlock: 15,
			group1: { numBlocks: 1, dataCodewords: 55 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 70,
			eccPerBlock: 26,
			group1: { numBlocks: 1, dataCodewords: 44 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 70,
			eccPerBlock: 18,
			group1: { numBlocks: 2, dataCodewords: 17 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		H: {
			totalCodewords: 70,
			eccPerBlock: 22,
			group1: { numBlocks: 2, dataCodewords: 13 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
	},
	4: {
		L: {
			totalCodewords: 100,
			eccPerBlock: 20,
			group1: { numBlocks: 1, dataCodewords: 80 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 100,
			eccPerBlock: 18,
			group1: { numBlocks: 2, dataCodewords: 32 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 100,
			eccPerBlock: 26,
			group1: { numBlocks: 2, dataCodewords: 24 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		H: {
			totalCodewords: 100,
			eccPerBlock: 16,
			group1: { numBlocks: 4, dataCodewords: 9 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
	},
	5: {
		L: {
			totalCodewords: 134,
			eccPerBlock: 26,
			group1: { numBlocks: 1, dataCodewords: 108 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 134,
			eccPerBlock: 24,
			group1: { numBlocks: 2, dataCodewords: 43 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 134,
			eccPerBlock: 18,
			group1: { numBlocks: 2, dataCodewords: 15 },
			group2: { numBlocks: 2, dataCodewords: 16 },
		},
		H: {
			totalCodewords: 134,
			eccPerBlock: 22,
			group1: { numBlocks: 2, dataCodewords: 11 },
			group2: { numBlocks: 2, dataCodewords: 12 },
		},
	},
	6: {
		L: {
			totalCodewords: 172,
			eccPerBlock: 18,
			group1: { numBlocks: 2, dataCodewords: 68 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 172,
			eccPerBlock: 16,
			group1: { numBlocks: 4, dataCodewords: 27 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 172,
			eccPerBlock: 24,
			group1: { numBlocks: 4, dataCodewords: 19 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		H: {
			totalCodewords: 172,
			eccPerBlock: 28,
			group1: { numBlocks: 4, dataCodewords: 15 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
	},
	7: {
		L: {
			totalCodewords: 196,
			eccPerBlock: 20,
			group1: { numBlocks: 2, dataCodewords: 78 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 196,
			eccPerBlock: 18,
			group1: { numBlocks: 4, dataCodewords: 31 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 196,
			eccPerBlock: 18,
			group1: { numBlocks: 2, dataCodewords: 14 },
			group2: { numBlocks: 4, dataCodewords: 15 },
		},
		H: {
			totalCodewords: 196,
			eccPerBlock: 26,
			group1: { numBlocks: 4, dataCodewords: 13 },
			group2: { numBlocks: 1, dataCodewords: 14 },
		},
	},
	8: {
		L: {
			totalCodewords: 242,
			eccPerBlock: 24,
			group1: { numBlocks: 2, dataCodewords: 97 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 242,
			eccPerBlock: 22,
			group1: { numBlocks: 2, dataCodewords: 38 },
			group2: { numBlocks: 2, dataCodewords: 39 },
		},
		Q: {
			totalCodewords: 242,
			eccPerBlock: 22,
			group1: { numBlocks: 4, dataCodewords: 18 },
			group2: { numBlocks: 2, dataCodewords: 19 },
		},
		H: {
			totalCodewords: 242,
			eccPerBlock: 26,
			group1: { numBlocks: 4, dataCodewords: 14 },
			group2: { numBlocks: 2, dataCodewords: 15 },
		},
	},
	9: {
		L: {
			totalCodewords: 292,
			eccPerBlock: 30,
			group1: { numBlocks: 2, dataCodewords: 116 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 292,
			eccPerBlock: 22,
			group1: { numBlocks: 3, dataCodewords: 36 },
			group2: { numBlocks: 2, dataCodewords: 37 },
		},
		Q: {
			totalCodewords: 292,
			eccPerBlock: 20,
			group1: { numBlocks: 4, dataCodewords: 16 },
			group2: { numBlocks: 4, dataCodewords: 17 },
		},
		H: {
			totalCodewords: 292,
			eccPerBlock: 24,
			group1: { numBlocks: 4, dataCodewords: 12 },
			group2: { numBlocks: 4, dataCodewords: 13 },
		},
	},
	10: {
		L: {
			totalCodewords: 346,
			eccPerBlock: 18,
			group1: { numBlocks: 2, dataCodewords: 68 },
			group2: { numBlocks: 2, dataCodewords: 69 },
		},
		M: {
			totalCodewords: 346,
			eccPerBlock: 26,
			group1: { numBlocks: 4, dataCodewords: 43 },
			group2: { numBlocks: 1, dataCodewords: 44 },
		},
		Q: {
			totalCodewords: 346,
			eccPerBlock: 24,
			group1: { numBlocks: 6, dataCodewords: 19 },
			group2: { numBlocks: 2, dataCodewords: 20 },
		},
		H: {
			totalCodewords: 346,
			eccPerBlock: 28,
			group1: { numBlocks: 6, dataCodewords: 15 },
			group2: { numBlocks: 2, dataCodewords: 16 },
		},
	},
	11: {
		L: {
			totalCodewords: 404,
			eccPerBlock: 20,
			group1: { numBlocks: 4, dataCodewords: 81 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 404,
			eccPerBlock: 30,
			group1: { numBlocks: 1, dataCodewords: 50 },
			group2: { numBlocks: 4, dataCodewords: 51 },
		},
		Q: {
			totalCodewords: 404,
			eccPerBlock: 28,
			group1: { numBlocks: 4, dataCodewords: 22 },
			group2: { numBlocks: 4, dataCodewords: 23 },
		},
		H: {
			totalCodewords: 404,
			eccPerBlock: 24,
			group1: { numBlocks: 3, dataCodewords: 12 },
			group2: { numBlocks: 8, dataCodewords: 13 },
		},
	},
	12: {
		L: {
			totalCodewords: 466,
			eccPerBlock: 24,
			group1: { numBlocks: 2, dataCodewords: 92 },
			group2: { numBlocks: 2, dataCodewords: 93 },
		},
		M: {
			totalCodewords: 466,
			eccPerBlock: 22,
			group1: { numBlocks: 6, dataCodewords: 36 },
			group2: { numBlocks: 2, dataCodewords: 37 },
		},
		Q: {
			totalCodewords: 466,
			eccPerBlock: 26,
			group1: { numBlocks: 4, dataCodewords: 20 },
			group2: { numBlocks: 6, dataCodewords: 21 },
		},
		H: {
			totalCodewords: 466,
			eccPerBlock: 28,
			group1: { numBlocks: 7, dataCodewords: 14 },
			group2: { numBlocks: 4, dataCodewords: 15 },
		},
	},
	13: {
		L: {
			totalCodewords: 532,
			eccPerBlock: 26,
			group1: { numBlocks: 4, dataCodewords: 107 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 532,
			eccPerBlock: 22,
			group1: { numBlocks: 8, dataCodewords: 37 },
			group2: { numBlocks: 1, dataCodewords: 38 },
		},
		Q: {
			totalCodewords: 532,
			eccPerBlock: 24,
			group1: { numBlocks: 8, dataCodewords: 20 },
			group2: { numBlocks: 4, dataCodewords: 21 },
		},
		H: {
			totalCodewords: 532,
			eccPerBlock: 22,
			group1: { numBlocks: 12, dataCodewords: 11 },
			group2: { numBlocks: 4, dataCodewords: 12 },
		},
	},
	14: {
		L: {
			totalCodewords: 581,
			eccPerBlock: 30,
			group1: { numBlocks: 3, dataCodewords: 115 },
			group2: { numBlocks: 1, dataCodewords: 116 },
		},
		M: {
			totalCodewords: 581,
			eccPerBlock: 24,
			group1: { numBlocks: 4, dataCodewords: 40 },
			group2: { numBlocks: 5, dataCodewords: 41 },
		},
		Q: {
			totalCodewords: 581,
			eccPerBlock: 20,
			group1: { numBlocks: 11, dataCodewords: 16 },
			group2: { numBlocks: 5, dataCodewords: 17 },
		},
		H: {
			totalCodewords: 581,
			eccPerBlock: 24,
			group1: { numBlocks: 11, dataCodewords: 12 },
			group2: { numBlocks: 5, dataCodewords: 13 },
		},
	},
	15: {
		L: {
			totalCodewords: 655,
			eccPerBlock: 22,
			group1: { numBlocks: 5, dataCodewords: 87 },
			group2: { numBlocks: 1, dataCodewords: 88 },
		},
		M: {
			totalCodewords: 655,
			eccPerBlock: 24,
			group1: { numBlocks: 5, dataCodewords: 41 },
			group2: { numBlocks: 5, dataCodewords: 42 },
		},
		Q: {
			totalCodewords: 655,
			eccPerBlock: 30,
			group1: { numBlocks: 5, dataCodewords: 24 },
			group2: { numBlocks: 7, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 655,
			eccPerBlock: 24,
			group1: { numBlocks: 11, dataCodewords: 12 },
			group2: { numBlocks: 7, dataCodewords: 13 },
		},
	},
	16: {
		L: {
			totalCodewords: 733,
			eccPerBlock: 24,
			group1: { numBlocks: 5, dataCodewords: 98 },
			group2: { numBlocks: 1, dataCodewords: 99 },
		},
		M: {
			totalCodewords: 733,
			eccPerBlock: 28,
			group1: { numBlocks: 7, dataCodewords: 45 },
			group2: { numBlocks: 3, dataCodewords: 46 },
		},
		Q: {
			totalCodewords: 733,
			eccPerBlock: 24,
			group1: { numBlocks: 15, dataCodewords: 19 },
			group2: { numBlocks: 2, dataCodewords: 20 },
		},
		H: {
			totalCodewords: 733,
			eccPerBlock: 30,
			group1: { numBlocks: 3, dataCodewords: 15 },
			group2: { numBlocks: 13, dataCodewords: 16 },
		},
	},
	17: {
		L: {
			totalCodewords: 815,
			eccPerBlock: 28,
			group1: { numBlocks: 1, dataCodewords: 107 },
			group2: { numBlocks: 5, dataCodewords: 108 },
		},
		M: {
			totalCodewords: 815,
			eccPerBlock: 28,
			group1: { numBlocks: 10, dataCodewords: 46 },
			group2: { numBlocks: 1, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 815,
			eccPerBlock: 28,
			group1: { numBlocks: 1, dataCodewords: 22 },
			group2: { numBlocks: 15, dataCodewords: 23 },
		},
		H: {
			totalCodewords: 815,
			eccPerBlock: 28,
			group1: { numBlocks: 2, dataCodewords: 14 },
			group2: { numBlocks: 17, dataCodewords: 15 },
		},
	},
	18: {
		L: {
			totalCodewords: 901,
			eccPerBlock: 30,
			group1: { numBlocks: 5, dataCodewords: 120 },
			group2: { numBlocks: 1, dataCodewords: 121 },
		},
		M: {
			totalCodewords: 901,
			eccPerBlock: 26,
			group1: { numBlocks: 9, dataCodewords: 43 },
			group2: { numBlocks: 4, dataCodewords: 44 },
		},
		Q: {
			totalCodewords: 901,
			eccPerBlock: 28,
			group1: { numBlocks: 17, dataCodewords: 22 },
			group2: { numBlocks: 1, dataCodewords: 23 },
		},
		H: {
			totalCodewords: 901,
			eccPerBlock: 28,
			group1: { numBlocks: 2, dataCodewords: 14 },
			group2: { numBlocks: 19, dataCodewords: 15 },
		},
	},
	19: {
		L: {
			totalCodewords: 991,
			eccPerBlock: 28,
			group1: { numBlocks: 3, dataCodewords: 113 },
			group2: { numBlocks: 4, dataCodewords: 114 },
		},
		M: {
			totalCodewords: 991,
			eccPerBlock: 26,
			group1: { numBlocks: 3, dataCodewords: 44 },
			group2: { numBlocks: 11, dataCodewords: 45 },
		},
		Q: {
			totalCodewords: 991,
			eccPerBlock: 26,
			group1: { numBlocks: 17, dataCodewords: 21 },
			group2: { numBlocks: 4, dataCodewords: 22 },
		},
		H: {
			totalCodewords: 991,
			eccPerBlock: 26,
			group1: { numBlocks: 9, dataCodewords: 13 },
			group2: { numBlocks: 16, dataCodewords: 14 },
		},
	},
	20: {
		L: {
			totalCodewords: 1085,
			eccPerBlock: 28,
			group1: { numBlocks: 3, dataCodewords: 107 },
			group2: { numBlocks: 5, dataCodewords: 108 },
		},
		M: {
			totalCodewords: 1085,
			eccPerBlock: 26,
			group1: { numBlocks: 3, dataCodewords: 41 },
			group2: { numBlocks: 13, dataCodewords: 42 },
		},
		Q: {
			totalCodewords: 1085,
			eccPerBlock: 30,
			group1: { numBlocks: 15, dataCodewords: 24 },
			group2: { numBlocks: 5, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 1085,
			eccPerBlock: 28,
			group1: { numBlocks: 15, dataCodewords: 15 },
			group2: { numBlocks: 10, dataCodewords: 16 },
		},
	},
	21: {
		L: {
			totalCodewords: 1156,
			eccPerBlock: 28,
			group1: { numBlocks: 4, dataCodewords: 116 },
			group2: { numBlocks: 4, dataCodewords: 117 },
		},
		M: {
			totalCodewords: 1156,
			eccPerBlock: 26,
			group1: { numBlocks: 17, dataCodewords: 42 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 1156,
			eccPerBlock: 28,
			group1: { numBlocks: 17, dataCodewords: 22 },
			group2: { numBlocks: 6, dataCodewords: 23 },
		},
		H: {
			totalCodewords: 1156,
			eccPerBlock: 30,
			group1: { numBlocks: 19, dataCodewords: 16 },
			group2: { numBlocks: 6, dataCodewords: 17 },
		},
	},
	22: {
		L: {
			totalCodewords: 1258,
			eccPerBlock: 28,
			group1: { numBlocks: 2, dataCodewords: 111 },
			group2: { numBlocks: 7, dataCodewords: 112 },
		},
		M: {
			totalCodewords: 1258,
			eccPerBlock: 28,
			group1: { numBlocks: 17, dataCodewords: 46 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		Q: {
			totalCodewords: 1258,
			eccPerBlock: 30,
			group1: { numBlocks: 7, dataCodewords: 24 },
			group2: { numBlocks: 16, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 1258,
			eccPerBlock: 24,
			group1: { numBlocks: 34, dataCodewords: 13 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
	},
	23: {
		L: {
			totalCodewords: 1364,
			eccPerBlock: 30,
			group1: { numBlocks: 4, dataCodewords: 121 },
			group2: { numBlocks: 5, dataCodewords: 122 },
		},
		M: {
			totalCodewords: 1364,
			eccPerBlock: 28,
			group1: { numBlocks: 4, dataCodewords: 47 },
			group2: { numBlocks: 14, dataCodewords: 48 },
		},
		Q: {
			totalCodewords: 1364,
			eccPerBlock: 30,
			group1: { numBlocks: 11, dataCodewords: 24 },
			group2: { numBlocks: 14, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 1364,
			eccPerBlock: 30,
			group1: { numBlocks: 16, dataCodewords: 15 },
			group2: { numBlocks: 14, dataCodewords: 16 },
		},
	},
	24: {
		L: {
			totalCodewords: 1474,
			eccPerBlock: 30,
			group1: { numBlocks: 6, dataCodewords: 117 },
			group2: { numBlocks: 4, dataCodewords: 118 },
		},
		M: {
			totalCodewords: 1474,
			eccPerBlock: 28,
			group1: { numBlocks: 6, dataCodewords: 45 },
			group2: { numBlocks: 14, dataCodewords: 46 },
		},
		Q: {
			totalCodewords: 1474,
			eccPerBlock: 30,
			group1: { numBlocks: 11, dataCodewords: 24 },
			group2: { numBlocks: 16, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 1474,
			eccPerBlock: 30,
			group1: { numBlocks: 30, dataCodewords: 16 },
			group2: { numBlocks: 2, dataCodewords: 17 },
		},
	},
	25: {
		L: {
			totalCodewords: 1588,
			eccPerBlock: 26,
			group1: { numBlocks: 8, dataCodewords: 106 },
			group2: { numBlocks: 4, dataCodewords: 107 },
		},
		M: {
			totalCodewords: 1588,
			eccPerBlock: 28,
			group1: { numBlocks: 8, dataCodewords: 47 },
			group2: { numBlocks: 13, dataCodewords: 48 },
		},
		Q: {
			totalCodewords: 1588,
			eccPerBlock: 30,
			group1: { numBlocks: 7, dataCodewords: 24 },
			group2: { numBlocks: 22, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 1588,
			eccPerBlock: 30,
			group1: { numBlocks: 22, dataCodewords: 15 },
			group2: { numBlocks: 13, dataCodewords: 16 },
		},
	},
	26: {
		L: {
			totalCodewords: 1706,
			eccPerBlock: 28,
			group1: { numBlocks: 10, dataCodewords: 114 },
			group2: { numBlocks: 2, dataCodewords: 115 },
		},
		M: {
			totalCodewords: 1706,
			eccPerBlock: 28,
			group1: { numBlocks: 19, dataCodewords: 46 },
			group2: { numBlocks: 4, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 1706,
			eccPerBlock: 28,
			group1: { numBlocks: 28, dataCodewords: 22 },
			group2: { numBlocks: 6, dataCodewords: 23 },
		},
		H: {
			totalCodewords: 1706,
			eccPerBlock: 30,
			group1: { numBlocks: 33, dataCodewords: 16 },
			group2: { numBlocks: 4, dataCodewords: 17 },
		},
	},
	27: {
		L: {
			totalCodewords: 1828,
			eccPerBlock: 30,
			group1: { numBlocks: 8, dataCodewords: 122 },
			group2: { numBlocks: 4, dataCodewords: 123 },
		},
		M: {
			totalCodewords: 1828,
			eccPerBlock: 28,
			group1: { numBlocks: 22, dataCodewords: 45 },
			group2: { numBlocks: 3, dataCodewords: 46 },
		},
		Q: {
			totalCodewords: 1828,
			eccPerBlock: 30,
			group1: { numBlocks: 8, dataCodewords: 23 },
			group2: { numBlocks: 26, dataCodewords: 24 },
		},
		H: {
			totalCodewords: 1828,
			eccPerBlock: 30,
			group1: { numBlocks: 12, dataCodewords: 15 },
			group2: { numBlocks: 28, dataCodewords: 16 },
		},
	},
	28: {
		L: {
			totalCodewords: 1921,
			eccPerBlock: 30,
			group1: { numBlocks: 3, dataCodewords: 117 },
			group2: { numBlocks: 10, dataCodewords: 118 },
		},
		M: {
			totalCodewords: 1921,
			eccPerBlock: 28,
			group1: { numBlocks: 3, dataCodewords: 45 },
			group2: { numBlocks: 23, dataCodewords: 46 },
		},
		Q: {
			totalCodewords: 1921,
			eccPerBlock: 30,
			group1: { numBlocks: 4, dataCodewords: 24 },
			group2: { numBlocks: 31, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 1921,
			eccPerBlock: 30,
			group1: { numBlocks: 11, dataCodewords: 15 },
			group2: { numBlocks: 31, dataCodewords: 16 },
		},
	},
	29: {
		L: {
			totalCodewords: 2051,
			eccPerBlock: 30,
			group1: { numBlocks: 7, dataCodewords: 116 },
			group2: { numBlocks: 7, dataCodewords: 117 },
		},
		M: {
			totalCodewords: 2051,
			eccPerBlock: 28,
			group1: { numBlocks: 21, dataCodewords: 45 },
			group2: { numBlocks: 7, dataCodewords: 46 },
		},
		Q: {
			totalCodewords: 2051,
			eccPerBlock: 30,
			group1: { numBlocks: 1, dataCodewords: 23 },
			group2: { numBlocks: 37, dataCodewords: 24 },
		},
		H: {
			totalCodewords: 2051,
			eccPerBlock: 30,
			group1: { numBlocks: 19, dataCodewords: 15 },
			group2: { numBlocks: 26, dataCodewords: 16 },
		},
	},
	30: {
		L: {
			totalCodewords: 2185,
			eccPerBlock: 30,
			group1: { numBlocks: 5, dataCodewords: 115 },
			group2: { numBlocks: 10, dataCodewords: 116 },
		},
		M: {
			totalCodewords: 2185,
			eccPerBlock: 28,
			group1: { numBlocks: 19, dataCodewords: 47 },
			group2: { numBlocks: 10, dataCodewords: 48 },
		},
		Q: {
			totalCodewords: 2185,
			eccPerBlock: 30,
			group1: { numBlocks: 15, dataCodewords: 24 },
			group2: { numBlocks: 25, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 2185,
			eccPerBlock: 30,
			group1: { numBlocks: 23, dataCodewords: 15 },
			group2: { numBlocks: 25, dataCodewords: 16 },
		},
	},
	31: {
		L: {
			totalCodewords: 2323,
			eccPerBlock: 30,
			group1: { numBlocks: 13, dataCodewords: 115 },
			group2: { numBlocks: 3, dataCodewords: 116 },
		},
		M: {
			totalCodewords: 2323,
			eccPerBlock: 28,
			group1: { numBlocks: 2, dataCodewords: 46 },
			group2: { numBlocks: 29, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 2323,
			eccPerBlock: 30,
			group1: { numBlocks: 42, dataCodewords: 24 },
			group2: { numBlocks: 1, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 2323,
			eccPerBlock: 30,
			group1: { numBlocks: 23, dataCodewords: 15 },
			group2: { numBlocks: 28, dataCodewords: 16 },
		},
	},
	32: {
		L: {
			totalCodewords: 2465,
			eccPerBlock: 30,
			group1: { numBlocks: 17, dataCodewords: 115 },
			group2: { numBlocks: 0, dataCodewords: 0 },
		},
		M: {
			totalCodewords: 2465,
			eccPerBlock: 28,
			group1: { numBlocks: 10, dataCodewords: 46 },
			group2: { numBlocks: 23, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 2465,
			eccPerBlock: 30,
			group1: { numBlocks: 10, dataCodewords: 24 },
			group2: { numBlocks: 35, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 2465,
			eccPerBlock: 30,
			group1: { numBlocks: 19, dataCodewords: 15 },
			group2: { numBlocks: 35, dataCodewords: 16 },
		},
	},
	33: {
		L: {
			totalCodewords: 2611,
			eccPerBlock: 30,
			group1: { numBlocks: 17, dataCodewords: 115 },
			group2: { numBlocks: 1, dataCodewords: 116 },
		},
		M: {
			totalCodewords: 2611,
			eccPerBlock: 28,
			group1: { numBlocks: 14, dataCodewords: 46 },
			group2: { numBlocks: 21, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 2611,
			eccPerBlock: 30,
			group1: { numBlocks: 29, dataCodewords: 24 },
			group2: { numBlocks: 19, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 2611,
			eccPerBlock: 30,
			group1: { numBlocks: 11, dataCodewords: 15 },
			group2: { numBlocks: 46, dataCodewords: 16 },
		},
	},
	34: {
		L: {
			totalCodewords: 2761,
			eccPerBlock: 30,
			group1: { numBlocks: 13, dataCodewords: 115 },
			group2: { numBlocks: 6, dataCodewords: 116 },
		},
		M: {
			totalCodewords: 2761,
			eccPerBlock: 28,
			group1: { numBlocks: 14, dataCodewords: 46 },
			group2: { numBlocks: 23, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 2761,
			eccPerBlock: 30,
			group1: { numBlocks: 44, dataCodewords: 24 },
			group2: { numBlocks: 7, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 2761,
			eccPerBlock: 30,
			group1: { numBlocks: 59, dataCodewords: 16 },
			group2: { numBlocks: 1, dataCodewords: 17 },
		},
	},
	35: {
		L: {
			totalCodewords: 2915,
			eccPerBlock: 30,
			group1: { numBlocks: 12, dataCodewords: 121 },
			group2: { numBlocks: 7, dataCodewords: 122 },
		},
		M: {
			totalCodewords: 2915,
			eccPerBlock: 28,
			group1: { numBlocks: 12, dataCodewords: 47 },
			group2: { numBlocks: 26, dataCodewords: 48 },
		},
		Q: {
			totalCodewords: 2915,
			eccPerBlock: 30,
			group1: { numBlocks: 39, dataCodewords: 24 },
			group2: { numBlocks: 14, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 2915,
			eccPerBlock: 30,
			group1: { numBlocks: 22, dataCodewords: 15 },
			group2: { numBlocks: 41, dataCodewords: 16 },
		},
	},
	36: {
		L: {
			totalCodewords: 3073,
			eccPerBlock: 30,
			group1: { numBlocks: 6, dataCodewords: 121 },
			group2: { numBlocks: 14, dataCodewords: 122 },
		},
		M: {
			totalCodewords: 3073,
			eccPerBlock: 28,
			group1: { numBlocks: 6, dataCodewords: 47 },
			group2: { numBlocks: 34, dataCodewords: 48 },
		},
		Q: {
			totalCodewords: 3073,
			eccPerBlock: 30,
			group1: { numBlocks: 46, dataCodewords: 24 },
			group2: { numBlocks: 10, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 3073,
			eccPerBlock: 30,
			group1: { numBlocks: 2, dataCodewords: 15 },
			group2: { numBlocks: 64, dataCodewords: 16 },
		},
	},
	37: {
		L: {
			totalCodewords: 3235,
			eccPerBlock: 30,
			group1: { numBlocks: 17, dataCodewords: 122 },
			group2: { numBlocks: 4, dataCodewords: 123 },
		},
		M: {
			totalCodewords: 3235,
			eccPerBlock: 28,
			group1: { numBlocks: 29, dataCodewords: 46 },
			group2: { numBlocks: 14, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 3235,
			eccPerBlock: 30,
			group1: { numBlocks: 49, dataCodewords: 24 },
			group2: { numBlocks: 10, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 3235,
			eccPerBlock: 30,
			group1: { numBlocks: 24, dataCodewords: 15 },
			group2: { numBlocks: 46, dataCodewords: 16 },
		},
	},
	38: {
		L: {
			totalCodewords: 3401,
			eccPerBlock: 30,
			group1: { numBlocks: 4, dataCodewords: 122 },
			group2: { numBlocks: 18, dataCodewords: 123 },
		},
		M: {
			totalCodewords: 3401,
			eccPerBlock: 28,
			group1: { numBlocks: 13, dataCodewords: 46 },
			group2: { numBlocks: 32, dataCodewords: 47 },
		},
		Q: {
			totalCodewords: 3401,
			eccPerBlock: 30,
			group1: { numBlocks: 48, dataCodewords: 24 },
			group2: { numBlocks: 14, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 3401,
			eccPerBlock: 30,
			group1: { numBlocks: 42, dataCodewords: 15 },
			group2: { numBlocks: 32, dataCodewords: 16 },
		},
	},
	39: {
		L: {
			totalCodewords: 3571,
			eccPerBlock: 30,
			group1: { numBlocks: 20, dataCodewords: 117 },
			group2: { numBlocks: 4, dataCodewords: 118 },
		},
		M: {
			totalCodewords: 3571,
			eccPerBlock: 28,
			group1: { numBlocks: 40, dataCodewords: 47 },
			group2: { numBlocks: 7, dataCodewords: 48 },
		},
		Q: {
			totalCodewords: 3571,
			eccPerBlock: 30,
			group1: { numBlocks: 43, dataCodewords: 24 },
			group2: { numBlocks: 22, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 3571,
			eccPerBlock: 30,
			group1: { numBlocks: 10, dataCodewords: 15 },
			group2: { numBlocks: 67, dataCodewords: 16 },
		},
	},
	40: {
		L: {
			totalCodewords: 3745,
			eccPerBlock: 30,
			group1: { numBlocks: 19, dataCodewords: 127 },
			group2: { numBlocks: 6, dataCodewords: 128 },
		},
		M: {
			totalCodewords: 3745,
			eccPerBlock: 28,
			group1: { numBlocks: 18, dataCodewords: 47 },
			group2: { numBlocks: 31, dataCodewords: 48 },
		},
		Q: {
			totalCodewords: 3745,
			eccPerBlock: 30,
			group1: { numBlocks: 34, dataCodewords: 24 },
			group2: { numBlocks: 34, dataCodewords: 25 },
		},
		H: {
			totalCodewords: 3745,
			eccPerBlock: 30,
			group1: { numBlocks: 20, dataCodewords: 15 },
			group2: { numBlocks: 61, dataCodewords: 16 },
		},
	},
};

export function getDataCapacity(version: number, ecc: EccLevel): number {
	const info = ECC_TABLE[version]?.[ecc];
	if (!info) return 0;
	return (
		info.group1.numBlocks * info.group1.dataCodewords +
		info.group2.numBlocks * info.group2.dataCodewords
	);
}
