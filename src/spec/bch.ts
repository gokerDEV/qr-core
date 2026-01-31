/**
 * BCH (Bose-Chaudhuri-Hocquenghem) Error Correction for QR Metadata
 */

/**
 * Format Info BCH (15, 5)
 */
export function getFormatInfo(eccLevel: "L" | "M" | "Q" | "H", mask: number): number {
	const eccBits: Record<string, number> = { L: 1, M: 0, Q: 3, H: 2 };
	const bits = eccBits[eccLevel];
	if (bits === undefined) throw new Error(`Invalid ecc level: ${eccLevel}`);
	const data = (bits << 3) | mask;

	let rem = data;
	for (let i = 0; i < 10; i++) {
		rem = (rem << 1) ^ (rem >>> 9 ? 0x537 : 0);
	}

	return ((data << 10) | rem) ^ 0x5412;
}

/**
 * Version Info BCH (18, 6)
 */
export function getVersionInfo(version: number): number {
	if (version < 7) return 0;

	let rem = version;
	for (let i = 0; i < 12; i++) {
		rem = (rem << 1) ^ (rem >>> 11 ? 0x1f25 : 0);
	}

	return (version << 12) | rem;
}
