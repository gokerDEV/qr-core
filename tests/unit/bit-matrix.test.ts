import { describe, expect, it } from "vitest";
import { Matrix } from "../../src/matrix/bit-matrix";

describe("BitMatrix", () => {
	it("should initialize with correct size and default values", () => {
		const size = 21;
		const matrix = new Matrix(size);
		expect(matrix.size).toBe(size);
		expect(matrix.get(0, 0)).toBe(0);
		expect(matrix.get(size - 1, size - 1)).toBe(0);
	});

	it("should set and get values", () => {
		const matrix = new Matrix(21);
		matrix.set(5, 5, true);
		expect(matrix.get(5, 5)).toBe(1);
		matrix.set(5, 5, false);
		expect(matrix.get(5, 5)).toBe(0);
	});

	it("should handle reserved modules", () => {
		const matrix = new Matrix(21);
		matrix.setReserved(10, 10, true);
		expect(matrix.isReserved(10, 10)).toBe(true);
		expect(matrix.get(10, 10)).toBe(1);

		// Normal set should not overwrite reserved
		matrix.set(10, 10, false);
		expect(matrix.get(10, 10)).toBe(1);
	});

	it("should throw on out of bounds access", () => {
		const matrix = new Matrix(21);
		expect(() => matrix.get(-1, 0)).toThrow();
		expect(() => matrix.get(0, 21)).toThrow();
		expect(() => matrix.set(21, 0, true)).toThrow();
		expect(() => matrix.setReserved(0, -1, true)).toThrow();
	});

	it("should serialize to packed bytes correct MSB-first order", () => {
		// Size 9 -> 2 bytes per row
		// Row 0: 10000000 1.......
		const matrix = new Matrix(9);
		matrix.set(0, 0, true); // First bit
		matrix.set(8, 0, true); // 9th bit (first bit of second byte)

		const packed = matrix.toPacked();
		expect(packed.length).toBe(9 * 2);

		// Row 0
		expect(packed[0]).toBe(0x80); // 10000000
		expect(packed[1]).toBe(0x80); // 10000000 (padded)
	});
});
