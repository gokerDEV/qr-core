import { describe, expect, it } from "vitest";
import jsQR from "jsqr";
import { encode } from "../../src/api/index";

function renderToImageData(
	matrix: { size: number; get(x: number, y: number): 0 | 1 },
	quietZone = 4,
	scale = 4,
): { data: Uint8ClampedArray; width: number; height: number } {
	const size = matrix.size;
	const dim = (size + quietZone * 2) * scale;
	const data = new Uint8ClampedArray(dim * dim * 4);

	// Fill white
	for (let i = 0; i < data.length; i += 4) {
		data[i] = 255;
		data[i + 1] = 255;
		data[i + 2] = 255;
		data[i + 3] = 255;
	}

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (matrix.get(x, y) === 1) {
				const startX = (x + quietZone) * scale;
				const startY = (y + quietZone) * scale;
				for (let yy = 0; yy < scale; yy++) {
					for (let xx = 0; xx < scale; xx++) {
						const px = (startY + yy) * dim + (startX + xx);
						const idx = px * 4;
						data[idx] = 0;
						data[idx + 1] = 0;
						data[idx + 2] = 0;
						data[idx + 3] = 255;
					}
				}
			}
		}
	}

	return { data, width: dim, height: dim };
}

describe("Decoder round-trip (jsQR)", () => {
	it("decodes HELLO WORLD (v3 M mask2)", () => {
		const input = "HELLO WORLD";
		const qr = encode(input, { version: 3, ecc: "M", mask: 2, mode: "alphanumeric" });
		const image = renderToImageData(qr.matrix, 4, 4);
		const result = jsQR(image.data, image.width, image.height);
		expect(result?.data).toBe(input);
	});
});
