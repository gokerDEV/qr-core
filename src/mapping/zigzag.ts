import type { Matrix } from "../matrix/bit-matrix.js";

/**
 * Places bits into the matrix in a zigzag pattern, skipping reserved modules.
 */
export function zigzag(matrix: Matrix, data: Uint8Array): void {
	const size = matrix.size;
	let bitIndex = 0;
	const totalBits = data.length * 8;

	const last = size - 1;
	for (let right = last, pairIndex = 0; right > 0; right -= 2, pairIndex++) {
		if (right === 6) right--;

		const upward = pairIndex % 2 === 0;
		for (let i = 0; i < size; i++) {
			const y = upward ? size - 1 - i : i;
			for (let j = 0; j < 2; j++) {
				const x = right - j;
				if (!matrix.isReserved(x, y) && bitIndex < totalBits) {
					const byteIndex = Math.floor(bitIndex / 8);
					const byte = data[byteIndex];
					if (byte === undefined)
						throw new Error(
							`Internal error: Data missing at index ${byteIndex}`,
						);

					const bit = (byte >>> (7 - (bitIndex % 8))) & 1;
					matrix.set(x, y, bit === 1);
					bitIndex++;
				}
			}
		}
	}
}
