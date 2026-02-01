import { describe, expect, it } from "vitest";
import { encode } from "../../src/api/index";
import { qrcodegen } from "../../vendor/qrcodegen";

function compareMatrices(
	name: string,
	actual: { size: number; get(x: number, y: number): 0 | 1 },
	expected: { size: number; data: boolean[] },
): void {
	expect(actual.size).toBe(expected.size);
	const mismatches: Array<{ x: number; y: number; a: number; b: number }> = [];
	for (let y = 0; y < actual.size; y++) {
		for (let x = 0; x < actual.size; x++) {
			const idx = y * actual.size + x;
			const exp = expected.data[idx] ? 1 : 0;
			const act = actual.get(x, y);
			if (act !== exp) {
				mismatches.push({ x, y, a: act, b: exp });
				if (mismatches.length >= 50) break;
			}
		}
		if (mismatches.length >= 50) break;
	}

	if (mismatches.length > 0) {
		const details = mismatches.map((m) => `(${m.x},${m.y}) ${m.a}!=${m.b}`).join(", ");
		throw new Error(`Matrix mismatch for ${name}: ${details}`);
	}
}

describe("Reference matrix match (nayuki qrcodegen)", () => {
	it("v3 M mask 2 alphanumeric matches reference", () => {
		const input = "HELLO WORLD";
		const ours = encode(input, { ecc: "M", version: 3, mask: 2, mode: "alphanumeric" });

		const seg = qrcodegen.QrSegment.makeAlphanumeric(input);
		const ref = qrcodegen.QrCode.encodeSegments([seg], qrcodegen.QrCode.Ecc.MEDIUM, 3, 3, 2, false);

		const refModules = {
			size: ref.size,
			data: (() => {
				const arr: boolean[] = [];
				for (let y = 0; y < ref.size; y++) {
					for (let x = 0; x < ref.size; x++) {
						arr.push(ref.getModule(x, y));
					}
				}
				return arr;
			})(),
		};

		compareMatrices("v3-M mask2 alphanumeric", ours.matrix, refModules);
	});
});
