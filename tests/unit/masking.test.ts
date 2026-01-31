import { describe, expect, it } from "vitest";
import { applyMask, selectAndApplyBestMask } from "../../src/mask/selection";
import { Matrix } from "../../src/matrix/bit-matrix";

describe("Masking", () => {
	it("should allow applying a specific mask", () => {
		const matrix = new Matrix(21);
		// Mask 0: (x+y)%2 == 0
		applyMask(matrix, 0);
		// (0,0) -> even -> flip inv (0->1)
		expect(matrix.get(0, 0)).toBe(1);
		// (0,1) -> odd -> 0
		expect(matrix.get(0, 1)).toBe(0);
	});

	it("should select the best mask", () => {
		const matrix = new Matrix(21);
		// Empty matrix -> penalty calculation will favor a mask that breaks up large white areas
		// or one that doesn't create false patterns.
		const result = selectAndApplyBestMask(matrix, "M");
		expect(result.mask).toBeGreaterThanOrEqual(0);
		expect(result.mask).toBeLessThanOrEqual(7);
		expect(result.penalties).toHaveLength(8);

		// Ensure format info was written
		// (8,0) to (8,8) area
		let formatInfoWritten = false;
		for (let i = 0; i < 9; i++) {
			if (matrix.isReserved(i, 8)) formatInfoWritten = true;
		}
		expect(formatInfoWritten).toBe(true);
	});
});
