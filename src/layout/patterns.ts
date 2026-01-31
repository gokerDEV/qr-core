/**
 * QR Fonksiyonel Desenlerin Yerleştirilmesi (Finder, Timing, Alignment)
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
 * Tüm fonksiyonel desenleri matrise çizer
 */
export function setupFunctionPatterns(matrix: Matrix, version: number): void {
	const size = matrix.size;

	// 1. Finder Patterns (Sol Üst, Sağ Üst, Sol Alt)
	drawFinder(matrix, 0, 0);
	drawFinder(matrix, size - 7, 0);
	drawFinder(matrix, 0, size - 7);

	// 2. Separators (Finder pattern'lerin etrafındaki beyaz boşluklar)
	drawSeparators(matrix);

	// 3. Timing Patterns (6. satır ve 6. sütun boyunca bir dolu bir boş çizgiler)
	for (let i = 8; i < size - 8; i++) {
		const bit = i % 2 === 0;
		matrix.setReserved(6, i, bit); // Dikey
		matrix.setReserved(i, 6, bit); // Yatay
	}

	// 4. Alignment Patterns (Versiyon >= 2, 5x5 desenler)
	const coords = ALIGNMENT_PATTERN_POSITIONS[version] || [];
	for (let i = 0; i < coords.length; i++) {
		for (let j = 0; j < coords.length; j++) {
			const x = coords[i];
			const y = coords[j];
			if (x === undefined || y === undefined)
				throw new Error("Internal error: Alignment pattern coords undefined");

			// Finder pattern alanlarıyla çakışmıyorsa çiz
			if (!matrix.isReserved(x, y)) {
				drawAlignment(matrix, x - 2, y - 2);
			}
		}
	}

	// 5. Dark Module (Sabit koyu modül)
	matrix.setReserved(8, size - 8, true);

	// 6. Format & Version Alanlarını Rezerve Et (Daha sonra BCH ile doldurulacak)
	reserveFormatAreas(matrix);
	if (version >= 7) {
		reserveVersionAreas(matrix);
	}
}

function drawFinder(matrix: Matrix, ox: number, oy: number): void {
	for (let y = 0; y < 7; y++) {
		for (let x = 0; x < 7; x++) {
			const isDark =
				Math.max(Math.abs(x - 3), Math.abs(y - 3)) === 3 || // Dış 7x7 çerçeve
				Math.max(Math.abs(x - 3), Math.abs(y - 3)) <= 1; // İç 3x3 kare
			matrix.setReserved(ox + x, oy + y, isDark);
		}
	}
}

function drawAlignment(matrix: Matrix, ox: number, oy: number): void {
	for (let y = 0; y < 5; y++) {
		for (let x = 0; x < 5; x++) {
			const isDark =
				Math.max(Math.abs(x - 2), Math.abs(y - 2)) === 2 || // 5x5 çerçeve
				(x === 2 && y === 2); // Merkez nokta
			matrix.setReserved(ox + x, oy + y, isDark);
		}
	}
}

function drawSeparators(matrix: Matrix): void {
	const size = matrix.size;

	// Sol Üst
	for (let i = 0; i < 8; i++) {
		matrix.setReserved(7, i, false);
		matrix.setReserved(i, 7, false);
	}
	// Sağ Üst
	for (let i = 0; i < 8; i++) {
		matrix.setReserved(size - 8, i, false);
		matrix.setReserved(size - 8 + i, 7, false);
	}
	// Sol Alt
	for (let i = 0; i < 8; i++) {
		matrix.setReserved(7, size - 8 + i, false);
		matrix.setReserved(i, size - 8, false);
	}
}

function reserveFormatAreas(matrix: Matrix): void {
	const size = matrix.size;
	// Format bitleri alanlarını rezerve et (Timing çizgisi hariç)
	for (let i = 0; i <= 8; i++) {
		if (i !== 6) matrix.setReserved(i, 8, false);
		if (i !== 6) matrix.setReserved(8, i, false);
	}
	for (let i = 0; i < 8; i++) matrix.setReserved(size - 1 - i, 8, false);
	for (let i = 0; i < 7; i++) matrix.setReserved(8, size - 1 - i, false);
}

function reserveVersionAreas(matrix: Matrix): void {
	const size = matrix.size;
	// Versiyon >= 7 için 3x6 alanlar
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 3; j++) {
			matrix.setReserved(size - 11 + j, i, false);
			matrix.setReserved(i, size - 11 + j, false);
		}
	}
}
