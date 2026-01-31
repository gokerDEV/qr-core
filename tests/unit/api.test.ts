import { describe, expect, it } from "vitest";
import { encode, encodeSafe } from "../../src/api/index";

describe("Public API", () => {
	it("should encode simple string", () => {
		const result = encode("Hello World");
		expect(result.version).toBeGreaterThan(0);
		expect(result.size).toBeGreaterThan(0);
		expect(result.matrix).toBeDefined();
	});

	it("should allow forcing version", () => {
		const result = encode("A", { version: 5 });
		expect(result.version).toBe(5);
		expect(result.size).toBe(21 + 4 * (5 - 1));
	});

	it("should throw if data too large for fixed version", () => {
		// Version 1 can only hold ~17 bytes (Ecc L)
		// "A" * 100 needs version ~4
		const largeData = "A".repeat(100);
		// Expect message to contain "Data requires version"
		expect(() => encode(largeData, { version: 1 })).toThrow(
			/Data requires version/,
		);
	});

	it("should safe encode without throwing", () => {
		const largeData = "A".repeat(100);
		const result = encodeSafe(largeData, { version: 1 });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe("DATA_TOO_LARGE");
		}
	});

	it("should support Uint8Array input", () => {
		const input = new Uint8Array([65, 66, 67]);
		const result = encode(input, { mode: "byte" });
		expect(result.version).toBe(1);
	});
});
