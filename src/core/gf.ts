const PRIMITIVE = 0x11d;
export const EXP = new Uint8Array(512); // Double size to avoid modulo in mul
export const LOG = new Uint8Array(256);

// Initialize tables
(function initTables() {
	let x = 1;
	for (let i = 0; i < 255; i++) {
		EXP[i] = x;
		LOG[x] = i;
		x <<= 1;
		if (x & 0x100) {
			x ^= PRIMITIVE;
		}
	}
	// Fill the rest of EXP (periodic)
	for (let i = 255; i < 512; i++) {
		// Safe because i-255 is in [0, 255] range and EXP is initialized up to 254 in previous loop
		// and initialized with 0s by default. Logic ensures we read valid data.
		const val = EXP[i - 255];
		EXP[i] = val !== undefined ? val : 0;
	}
})();

export function mul(a: number, b: number): number {
	if (a === 0 || b === 0) return 0;

	// Check bounds or rely on safe access helper?
	// Arrays are fixed size.
	// LOG[a] can be undefined if a >= 256, but input is byte.
	// We assume a, b are bytes.
	const logA = LOG[a];
	const logB = LOG[b];

	// This is mathematically impossible if a,b are bytes != 0.
	// But for type safety we must check.
	if (logA === undefined || logB === undefined) {
		throw new Error(`Invalid input for GF multiplication: ${a}, ${b}`);
	}

	const expIndex = logA + logB;
	// expIndex max 508. EXP size 512.
	const result = EXP[expIndex];
	if (result === undefined) {
		throw new Error(
			`Internal GF error: EXP table underflow/overflow at index ${expIndex}`,
		);
	}
	return result;
}

export function inv(n: number): number {
	if (n === 0) throw new Error("Division by zero");
	const logN = LOG[n];
	if (logN === undefined)
		throw new Error(`Invalid input for GF inversion: ${n}`);

	return EXP[255 - logN] ?? 0; // Fallback 0 should essentially never happen given table construction
}
