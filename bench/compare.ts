import { encode } from "../src/index.js";
import { bench } from "./bench.js";

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

	const payloads: Array<{
		name: string;
		input: string;
		ecc: "L" | "M" | "Q" | "H";
	}> = [
		{ name: "Short text", input: "HELLO WORLD", ecc: "M" },
		{
			name: "URL (medium)",
			input: `https://example.com/search?q=${"A".repeat(480)}`,
			ecc: "M",
		},
		{
			name: "vCard-like",
			input:
				"BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nFN:John Doe\nORG:Example Inc.\nTEL:+1-555-123-4567\nEMAIL:john.doe@example.com\nEND:VCARD",
			ecc: "Q",
		},
		{
			name: "Large payload",
			input: "A".repeat(3000),
			ecc: "L",
		},
	];

	for (const p of payloads) {
		console.log(`${p.name} (ecc ${p.ecc})`);
		bench("  qr-core", () => {
			encode(p.input, { ecc: p.ecc });
		});
		benchNayuki(qrcodegen, p.input, { ecc: p.ecc });
		console.log("");
	}
}

runCompare();
