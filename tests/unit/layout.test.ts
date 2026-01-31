import { describe, expect, it } from "vitest";
import { setupFunctionPatterns } from "../../src/layout/patterns";
import { Matrix } from "../../src/matrix/bit-matrix";

describe("Layout Patterns", () => {
	it("should set up finder patterns", () => {
		const matrix = new Matrix(21);
		setupFunctionPatterns(matrix, 1);

		// Top Left Finder
		expect(matrix.isReserved(3, 3)).toBe(true); // Center of 3x3
		// Finder is 7x7. (0,0) to (6,6). Center (3,3).
		// (3,3) is dark.
		expect(matrix.get(3, 3)).toBe(1);

		// (0,0) is dark (outer ring)
		expect(matrix.get(0, 0)).toBe(1);

		// (1,1) is light (gap between outer and inner) - wait no
		// 7x7 finder:
		// xxxxxxx
		// x.....x
		// x.xxx.x
		// x.xxx.x
		// x.xxx.x
		// x.....x
		// xxxxxxx
		// (0,0) dark
		// (1,1) light?
		// Logic: max(abs(x-3), abs(y-3))
		// (1,1): abs(-2)=2. max(2,2)=2.
		// isDark = (max === 3) || (max <= 1).
		// 2 is not 3, nor <= 1. So light. Correct.
		expect(matrix.get(1, 1)).toBe(0);
	});

	it("should set up timing patterns", () => {
		const matrix = new Matrix(21);
		setupFunctionPatterns(matrix, 1);
		// Row 6, Cols 8..Size-8 (8..13 for V1)
		// (8, 6) -> i=8. even -> dark (true)
		// (9, 6) -> light
		expect(matrix.isReserved(8, 6)).toBe(true);
		expect(matrix.get(8, 6)).toBe(1);
		expect(matrix.get(9, 6)).toBe(0);
	});

	it("should set up alignment patterns for V2", () => {
		const matrix = new Matrix(25); // V2 size
		setupFunctionPatterns(matrix, 2);
		// V2 alignment at 6, 18
		// (6,6) is finder.
		// (18,18) should be alignment center.
		// Alignment is 5x5 center (18,18).
		expect(matrix.isReserved(18, 18)).toBe(true);
		// Center is dark
		expect(matrix.get(18, 18)).toBe(1);
	});

	it("should set up version info for V7", () => {
		const matrix = new Matrix(45); // V7 size
		setupFunctionPatterns(matrix, 7);
		// Version info is 3x6 block above bottom-left finder and left of top-right finder.
		// Bottom-left finder is at (0, Size-7).
		// Version info above it: Row Size-11..Size-9. Col 0..5
		// Let's check reservation.
		expect(matrix.isReserved(0, 45 - 11)).toBe(true);
	});
});
