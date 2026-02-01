import { encode } from "../src/index.js";

interface NayukiEcc {
	LOW: unknown;
	MEDIUM: unknown;
	QUARTILE: unknown;
	HIGH: unknown;
}

interface NayukiQrCode {
	encodeSegments(
		segs: unknown[],
		ecl: unknown,
		minVersion?: number,
		maxVersion?: number,
		mask?: number,
		boostEcl?: boolean,
	): unknown;
	Ecc: NayukiEcc;
}

interface NayukiQrSegment {
	makeSegments(text: string): unknown[];
}

interface NayukiNamespace {
	QrCode: NayukiQrCode;
	QrSegment: NayukiQrSegment;
}

async function loadNayuki(): Promise<NayukiNamespace> {
	const mod = await import("../vendor/qrcodegen.js");
	const ns = (mod as unknown as { qrcodegen?: NayukiNamespace }).qrcodegen;
	if (!ns) throw new Error("Nayuki qrcodegen namespace not found");
	return ns;
}

function bench(name: string, fn: () => void, iterations = 100) {
	for (let i = 0; i < 10; i++) fn();

	const times: number[] = [];
	for (let i = 0; i < iterations; i++) {
		const start = performance.now();
		fn();
		const end = performance.now();
		times.push(end - start);
	}

	times.sort((a, b) => a - b);
	const p50 = times[Math.floor(times.length * 0.5)] || 0;
	const p95 = times[Math.floor(times.length * 0.95)] || 0;
	const avg = times.reduce((a, b) => a + b, 0) / times.length;

	console.log(`${name}:`);
	console.log(`  p50: ${p50.toFixed(3)}ms`);
	console.log(`  p95: ${p95.toFixed(3)}ms`);
	console.log(`  avg: ${avg.toFixed(3)}ms`);
}

function toNayukiEcc(qrcodegen: NayukiNamespace, ecc: "L" | "M" | "Q" | "H") {
	switch (ecc) {
		case "L":
			return qrcodegen.QrCode.Ecc.LOW;
		case "M":
			return qrcodegen.QrCode.Ecc.MEDIUM;
		case "Q":
			return qrcodegen.QrCode.Ecc.QUARTILE;
		case "H":
			return qrcodegen.QrCode.Ecc.HIGH;
	}
}

function benchNayuki(
	qrcodegen: NayukiNamespace,
	input: string,
	opts: { ecc: "L" | "M" | "Q" | "H"; version?: number; mask?: number },
) {
	return bench("Nayuki (reference)", () => {
		const segs = qrcodegen.QrSegment.makeSegments(input);
		qrcodegen.QrCode.encodeSegments(
			segs,
			toNayukiEcc(qrcodegen, opts.ecc),
			opts.version ?? 1,
			opts.version ?? 40,
			opts.mask ?? -1,
			false,
		);
	});
}

async function runCompare() {
	const qrcodegen = await loadNayuki();

	console.log("Running performance comparison (qr-core vs Nayuki)...\n");

	const smallPayload = "HELLO WORLD";
	bench("qr-core", () => {
		encode(smallPayload, { ecc: "M" });
	});
	benchNayuki(qrcodegen, smallPayload, { ecc: "M" });
	console.log("");

	const mediumPayload = `https://example.com/search?q=${"A".repeat(480)}`;
	bench("qr-core", () => {
		encode(mediumPayload, { ecc: "M" });
	});
	benchNayuki(qrcodegen, mediumPayload, { ecc: "M" });
	console.log("");

	const largePayload = "A".repeat(3000);
	bench("qr-core", () => {
		encode(largePayload, { ecc: "L" });
	});
	benchNayuki(qrcodegen, largePayload, { ecc: "L" });
}

runCompare();
