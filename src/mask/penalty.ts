import type { Matrix } from "../matrix/bit-matrix.js";

/**
 * Calculates the penalty score for a matrix based on N1-N4 rules.
 */
export function calculatePenalty(matrix: Matrix): number {
	const size = matrix.size;
	const data = matrix._data; // Direct access optimization
	let penalty = 0;
	let darkCount = 0;

	// Process Rows: N1, N3, N2, N4 (partial)
	for (let y = 0; y < size; y++) {
		let rowRun = 0;
		let lastBit = -1;
		// History scalars
		let h0 = 0,
			h1 = 0,
			h2 = 0,
			h3 = 0,
			h4 = 0;

		for (let x = 0; x < size; x++) {
			const idx = y * size + x;
			const val = data[idx] ?? 0;
			const bit = val & 1;

			if (bit === 1) darkCount++;

			// N2 (2x2)
			if (x < size - 1 && y < size - 1) {
				const right = (data[idx + 1] ?? 0) & 1;
				const down = (data[idx + size] ?? 0) & 1;
				const diag = (data[idx + size + 1] ?? 0) & 1;

				if (bit === right && bit === down && bit === diag) {
					penalty += 3;
				}
			}

			// N1 & N3
			if (bit === lastBit) {
				rowRun++;
			} else {
				if (rowRun >= 5) penalty += 3 + (rowRun - 5);

				// Shift history
				if (lastBit !== -1) {
					// Skip initial run
					h0 = h1;
					h1 = h2;
					h2 = h3;
					h3 = h4;
					h4 = rowRun;

					// Check N3
					if (lastBit === 1 && checkRatioScalar(h0, h1, h2, h3, h4)) {
						if (checkWhiteSpace(data, size, x, y, 1, 0, h0, h1, h2, h3, h4)) {
							penalty += 40;
						}
					}
				}
				rowRun = 1;
				lastBit = bit;
			}
		}
		// End of row
		if (rowRun >= 5) penalty += 3 + (rowRun - 5);
		if (lastBit !== -1) {
			h0 = h1;
			h1 = h2;
			h2 = h3;
			h3 = h4;
			h4 = rowRun;
			if (lastBit === 1 && checkRatioScalar(h0, h1, h2, h3, h4)) {
				if (checkWhiteSpace(data, size, size, y, 1, 0, h0, h1, h2, h3, h4)) {
					penalty += 40;
				}
			}
		}
	}

	// Process Columns: N1
	for (let x = 0; x < size; x++) {
		let colRun = 0;
		let lastBit = -1;
		let h0 = 0,
			h1 = 0,
			h2 = 0,
			h3 = 0,
			h4 = 0;

		for (let y = 0; y < size; y++) {
			const idx = y * size + x;
			const bit = (data[idx] ?? 0) & 1;

			if (bit === lastBit) {
				colRun++;
			} else {
				if (colRun >= 5) penalty += 3 + (colRun - 5);
				if (lastBit !== -1) {
					h0 = h1;
					h1 = h2;
					h2 = h3;
					h3 = h4;
					h4 = colRun;
					if (lastBit === 1 && checkRatioScalar(h0, h1, h2, h3, h4)) {
						if (checkWhiteSpace(data, size, x, y, 0, 1, h0, h1, h2, h3, h4)) {
							penalty += 40;
						}
					}
				}
				colRun = 1;
				lastBit = bit;
			}
		}
		if (colRun >= 5) penalty += 3 + (colRun - 5);
		if (lastBit !== -1) {
			h0 = h1;
			h1 = h2;
			h2 = h3;
			h3 = h4;
			h4 = colRun;
			if (lastBit === 1 && checkRatioScalar(h0, h1, h2, h3, h4)) {
				if (checkWhiteSpace(data, size, x, size, 0, 1, h0, h1, h2, h3, h4)) {
					penalty += 40;
				}
			}
		}
	}

	const total = size * size;
	const ratio = (darkCount * 20) / total;
	const _diff = Math.abs(ratio - 10);
	const percentage = (darkCount / total) * 100;
	const deviation = Math.abs(percentage - 50);
	penalty += Math.floor(deviation / 5) * 10;

	return penalty;
}

function checkRatioScalar(h0: number, h1: number, h2: number, h3: number, h4: number): boolean {
	if (h0 === 0 || h1 === 0 || h2 === 0 || h3 === 0 || h4 === 0) return false;

	const total = h0 + h1 + h2 + h3 + h4;
	if (total < 7) return false;

	const moduleSize = total / 7;
	const maxVariance = moduleSize / 2;

	return (
		Math.abs(moduleSize - h0) < maxVariance &&
		Math.abs(moduleSize - h1) < maxVariance &&
		Math.abs(3 * moduleSize - h2) < 3 * maxVariance &&
		Math.abs(moduleSize - h3) < maxVariance &&
		Math.abs(moduleSize - h4) < maxVariance
	);
}

function checkWhiteSpace(
	data: Uint8Array,
	size: number,
	x: number,
	y: number,
	dx: number,
	dy: number,
	h0: number,
	h1: number,
	h2: number,
	h3: number,
	h4: number,
): boolean {
	const totalLen = h0 + h1 + h2 + h3 + h4;

	let hasRightWhite = true;
	for (let i = 0; i < 4; i++) {
		const px = x + dx * i;
		const py = y + dy * i;
		if (px >= size || py >= size) break;

		const idx = py * size + px;
		if (((data[idx] ?? 0) & 1) === 1) {
			hasRightWhite = false;
			break;
		}
	}
	if (hasRightWhite) return true; // Optimization: If one side is white, we are good?
	// Wait. "Preceded OR followed by". Yes. If right is white, we satisfy condition.
	// We don't need to check left.
	// RETURN TRUE EARLY!

	let hasLeftWhite = true;
	const startX = x - dx * totalLen;
	const startY = y - dy * totalLen;
	for (let i = 1; i <= 4; i++) {
		const px = startX - dx * i;
		const py = startY - dy * i;
		if (px < 0 || py < 0) break;

		const idx = py * size + px;
		if (((data[idx] ?? 0) & 1) === 1) {
			hasLeftWhite = false;
			break;
		}
	}
	return hasLeftWhite;
}
