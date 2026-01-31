import { EXP, LOG, mul } from "./gf.js";

const GEN_POLY_CACHE = new Map<number, Uint8Array>();

function getGeneratorPoly(eccLen: number): Uint8Array {
	const cached = GEN_POLY_CACHE.get(eccLen);
	if (cached) return cached;

	const poly = new Uint8Array(eccLen + 1);
	poly[0] = 1;

	// We multiply successively by (x - 2^i) for i=0..eccLen-1
	// In GF(2^8), subtraction is same as addition (XOR).
	// So we multiply by (x + 2^i).

	for (let i = 0; i < eccLen; i++) {
		const root = EXP[i];
		if (root === undefined) throw new Error("Internal error: EXP lookup failed");

		// Multiply poly by (x + root)
		// Coeffs shift: new_coeff[j] = coeff[j] ^ (coeff[j-1] * root)
		// We iterate backwards to use the 'old' values of j-1.
		for (let j = i + 1; j >= 1; j--) {
			const current = poly[j];
			const prev = poly[j - 1];
			if (current === undefined || prev === undefined) {
				throw new Error("Internal error: Poly index out of bounds");
			}
			poly[j] = current ^ mul(prev, root);
		}
	}

	GEN_POLY_CACHE.set(eccLen, poly);
	return poly;
}

export function computeEcc(data: Uint8Array, eccLen: number): Uint8Array {
	const genPoly = getGeneratorPoly(eccLen);
	const remainder = new Uint8Array(eccLen);
	const log = LOG;
	const exp = EXP;

	for (const byte of data) {
		const firstCoeff = remainder[0] ?? 0;
		const factor = firstCoeff ^ byte;

		// Shift remainder left
		// Using copyWithin is faster than set/subarray for small arrays?
		// remainder.set(remainder.subarray(1), 0);
		// remainder.copyWithin(0, 1); // standard
		remainder.copyWithin(0, 1);
		remainder[eccLen - 1] = 0;

		if (factor !== 0) {
			const logFactor = log[factor] ?? 0;

			for (let i = 0; i < eccLen; i++) {
				const genCoeff = genPoly[i + 1];
				if (genCoeff !== 0 && genCoeff !== undefined) {
					// Inlined mul
					const logVal = log[genCoeff] ?? 0;
					const expVal = exp[logVal + logFactor] ?? 0;
					const current = remainder[i] ?? 0;
					remainder[i] = current ^ expVal;
				}
			}
		}
	}

	return remainder;
}
