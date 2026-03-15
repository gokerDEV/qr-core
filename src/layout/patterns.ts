/**
 * QR Functional Pattern Placement (Finder, Timing, Alignment)
 */

import type { Matrix } from "../matrix/bit-matrix.js";
import { getVersionInfo } from "../spec/bch.js";
import { ALIGNMENT_PATTERN_POSITIONS } from "../spec/tables.js";

/**
 * Writes the 18-bit version information for versions >= 7.
 */
export function writeVersionInfo(matrix: Matrix, version: number): void {
	const info = getVersionInfo(version);
	const size = matrix.size;
	for (let i = 0; i < 18; i++) {
		const bit = ((info >>> i) & 1) === 1;
		const row = Math.floor(i / 3);
		const col = i % 3;
		// Bottom-left area (above the bottom-left finder pattern)
		matrix.setReserved(row, size - 11 + col, bit);
		// Top-right area (left of the top-right finder pattern)
		matrix.setReserved(size - 11 + col, row, bit);
	}
}

/**
 * Draws all functional patterns on the matrix
 */
export function setupFunctionPatterns(matrix: Matrix, version: number): void {
	const size = matrix.size;

	// 1. Finder Patterns (Top-Left, Top-Right, Bottom-Left)
	drawFinder(matrix, 0, 0);
	drawFinder(matrix, size - 7, 0);
	drawFinder(matrix, 0, size - 7);

	// 2. Separators (White space around finder patterns)
	drawSeparators(matrix);

	// 3. Timing Patterns (Alternating solid and empty lines along 6th row and 6th column)
	for (let i = 8; i < size - 8; i++) {
		const bit = i % 2 === 0;
		matrix.setReserved(6, i, bit); // Vertical
		matrix.setReserved(i, 6, bit); // Horizontal
	}

	// 4. Alignment Patterns (Version >= 2, 5x5 patterns)
	const coords = ALIGNMENT_PATTERN_POSITIONS[version] || [];
	const numAlign = coords.length;
	for (let i = 0; i < coords.length; i++) {
		for (let j = 0; j < coords.length; j++) {
			const x = coords[i];
			const y = coords[j];
			if (x === undefined || y === undefined)
				throw new Error("Internal error: Alignment pattern coords undefined");

			// Skip only the 3 finder-corner overlaps. Other intersections (including timing overlaps)
			// must keep alignment patterns for versions with 3+ alignment coordinates.
			if (i === 0 && j === 0) continue;
			if (i === 0 && j === numAlign - 1) continue;
			if (i === numAlign - 1 && j === 0) continue;

			drawAlignment(matrix, x - 2, y - 2);
		}
	}

	// 5. Dark Module (Fixed dark module)
	matrix.setReserved(8, size - 8, true);

	// 6. Reserve Format & Version Areas (To be filled with BCH later)
	reserveFormatAreas(matrix);
	if (version >= 7) {
		reserveVersionAreas(matrix);
	}
}

function drawFinder(matrix: Matrix, ox: number, oy: number): void {
	for (let y = 0; y < 7; y++) {
		for (let x = 0; x < 7; x++) {
			const isDark =
				Math.max(Math.abs(x - 3), Math.abs(y - 3)) === 3 || // Outer 7x7 frame
				Math.max(Math.abs(x - 3), Math.abs(y - 3)) <= 1; // Inner 3x3 square
			matrix.setReserved(ox + x, oy + y, isDark);
		}
	}
}

function drawAlignment(matrix: Matrix, ox: number, oy: number): void {
	for (let y = 0; y < 5; y++) {
		for (let x = 0; x < 5; x++) {
			const isDark =
				Math.max(Math.abs(x - 2), Math.abs(y - 2)) === 2 || // 5x5 frame
				(x === 2 && y === 2); // Center point
			matrix.setReserved(ox + x, oy + y, isDark);
		}
	}
}

function drawSeparators(matrix: Matrix): void {
	const size = matrix.size;

	// Top-Left
	for (let i = 0; i < 8; i++) {
		matrix.setReserved(7, i, false);
		matrix.setReserved(i, 7, false);
	}
	// Top-Right
	for (let i = 0; i < 8; i++) {
		matrix.setReserved(size - 8, i, false);
		matrix.setReserved(size - 8 + i, 7, false);
	}
	// Bottom-Left
	for (let i = 0; i < 8; i++) {
		matrix.setReserved(7, size - 8 + i, false);
		matrix.setReserved(i, size - 8, false);
	}
}

function reserveFormatAreas(matrix: Matrix): void {
	const size = matrix.size;
	// Reserve format bit areas (Excluding timing line)
	for (let i = 0; i <= 8; i++) {
		if (i !== 6) matrix.setReserved(i, 8, false);
		if (i !== 6) matrix.setReserved(8, i, false);
	}
	for (let i = 0; i < 8; i++) matrix.setReserved(size - 1 - i, 8, false);
	for (let i = 0; i < 7; i++) matrix.setReserved(8, size - 1 - i, false);
}

function reserveVersionAreas(matrix: Matrix): void {
	const size = matrix.size;
	// 3x6 areas for version >= 7
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 3; j++) {
			matrix.setReserved(size - 11 + j, i, false);
			matrix.setReserved(i, size - 11 + j, false);
		}
	}
}
