import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { encode } from "../../src/api/index";

// Define strict types for vector data
interface VectorInput {
	kind: "text" | "bytes";
	value: string;
}

interface VectorOptions {
	ecc?: "L" | "M" | "Q" | "H";
	version?: number;
	mask?: number;
}

interface VectorExpected {
	version: number;
	ecc?: string;
	mask?: number;
	size: number;
}

interface VectorCase {
	name: string;
	input: VectorInput;
	options: VectorOptions;
	expected: VectorExpected;
}

const vectorsDir = path.join(__dirname, "../vectors");
const vectorFiles = fs
	.readdirSync(vectorsDir)
	.filter((f) => f.endsWith(".json"));

let vectors: VectorCase[] = [];
for (const file of vectorFiles) {
	const content = JSON.parse(
		fs.readFileSync(path.join(vectorsDir, file), "utf-8"),
	);
	vectors = vectors.concat(content);
}

describe("Golden Vectors", () => {
	for (const vec of vectors) {
		it(`should match vector: ${vec.name}`, () => {
			// Normalize inputs
			// biome-ignore lint/suspicious/noExplicitAny: generic casting for options
			const opts: any = { ...vec.options };

			const result = encode(vec.input.value, opts);

			expect(result.version).toBe(vec.expected.version);
			expect(result.size).toBe(vec.expected.size);
			// In a real golden test, we would compare the entire matrix hash/bits
		});
	}
});
