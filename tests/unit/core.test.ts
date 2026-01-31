import { describe, expect, it } from "vitest";
import { BitBuffer } from "../../src/core/bit-buffer";
import { EXP, inv, LOG, mul } from "../../src/core/gf";
import { computeEcc } from "../../src/core/rs";

describe("GF(256)", () => {
	it("should have correct table sizes", () => {
		expect(EXP.length).toBe(512);
		expect(LOG.length).toBe(256);
	});

	it("EXP[0] should be 1", () => {
		expect(EXP[0]).toBe(1);
		expect(EXP[255]).toBe(1);
	});

	it("LOG[1] should be 0", () => {
		expect(LOG[1]).toBe(0);
	});

	it("multiplication should be correct", () => {
		expect(mul(0, 5)).toBe(0);
		expect(mul(5, 0)).toBe(0);
		expect(mul(1, 10)).toBe(10);
		// 2 * 2 = 4
		expect(mul(2, 2)).toBe(4);
		// Inverse check
		const a = 123;
		const invA = inv(a);
		expect(mul(a, invA)).toBe(1);
	});
});

describe("BitBuffer", () => {
	it("should append bits correctly", () => {
		const bb = new BitBuffer();
		bb.put(0b1, 1);
		bb.put(0b0, 1);
		bb.put(0b1, 1);
		// current: 101 (5)
		// length: 3
		expect(bb.length).toBe(3);
		const bytes = bb.toBytes();
		// 10100000 = 0xA0
		expect(bytes[0]).toBe(0xa0);
	});

	it("should handle multi-bit put", () => {
		const bb = new BitBuffer();
		// append 0xABC (101010111100) 12 bits
		bb.put(0xabc, 12);
		expect(bb.length).toBe(12);
		const bytes = bb.toBytes();
		// 10101011 1100xxxx
		// 0xAB     0xC0
		expect(bytes[0]).toBe(0xab);
		expect((bytes[1] ?? 0) & 0xf0).toBe(0xc0);
	});
});

describe("Reed-Solomon", () => {
	it("should return all zeros for zero data", () => {
		const data = new Uint8Array([0, 0, 0]);
		const ecc = computeEcc(data, 5);
		expect(ecc).toEqual(new Uint8Array(5));
	});

	// Simple known vector check could be added here if we had one.
	// Using a known property check:
	// If we encode M(x), then M(x)x^n + R(x) is a codeword.
	// This means it evaluates to 0 at the roots of G(x)?
	// Roots of G(x) are 2^0, 2^1 ... 2^{n-1}.
	// Let's check with eccLen=2. Roots 2^0=1, 2^1=2.
	// Codeword C(x) should satisfy C(1)=0 and C(2)=0.

	it("should produce valid codewords (eval to 0 at roots)", () => {
		const message = new Uint8Array([10, 20, 30]);
		const eccLen = 2; // Roots: 1, 2
		const ecc = computeEcc(message, eccLen);

		// Construct full codeword: message * x^n + ecc
		// Coefficients: [10, 20, 30, ecc[0], ecc[1]]
		const codeword = new Uint8Array([...message, ...ecc]);

		// Evaluate at root 1 (2^0) = 1
		// Eval(x) = c0*x^4 + c1*x^3 + ...

		function evalPoly(poly: Uint8Array, x: number): number {
			let res = 0;
			for (const coeff of poly) {
				res = mul(res, x) ^ coeff;
			}
			return res;
		}

		const root0 = EXP[0] ?? 0; // 1
		const root1 = EXP[1] ?? 0; // 2

		expect(evalPoly(codeword, root0)).toBe(0);
		expect(evalPoly(codeword, root1)).toBe(0);
	});
});
