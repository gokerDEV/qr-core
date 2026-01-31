import { describe, expect, it } from "vitest";
import { BitBuffer } from "../../src/core/bit-buffer";
import {
	encodeAlphanumeric,
	encodeByte,
	encodeNumeric,
} from "../../src/encoding/encoders";
import { interleave } from "../../src/encoding/interleave";
import { segmentize } from "../../src/encoding/segmentation";

describe("Encoders", () => {
	it("should encode numeric data", () => {
		const buffer = new BitBuffer();
		// "01234567" -> "012" (10 bits) + "345" (10 bits) + "67" (7 bits)
		encodeNumeric("01234567", buffer);
		// 012 = 0000001100
		// 345 = 0101011001
		// 67  = 1000011
		expect(buffer.length).toBe(27);
	});

	it("should encode alphanumeric data", () => {
		const buffer = new BitBuffer();
		// "AC-42" -> "AC" (11) + "-4" (11) + "2" (6)
		encodeAlphanumeric("AC-42", buffer);
		expect(buffer.length).toBe(11 + 11 + 6);
	});

	it("should encode byte data", () => {
		const buffer = new BitBuffer();
		encodeByte("Hello", buffer);
		expect(buffer.length).toBe(5 * 8);
	});
});

describe("Segmentation", () => {
	it("should segment simple numeric", () => {
		const segments = segmentize("0123456789");
		expect(segments).toHaveLength(1);
		expect(segments[0]?.mode).toBe("numeric");
	});

	it("should segment simple alphanumeric", () => {
		const segments = segmentize("HELLO WORLD");
		expect(segments).toHaveLength(1);
		expect(segments[0]?.mode).toBe("alphanumeric");
	});

	it("should segment mixed content", () => {
		// "123ABC123" -> numeric, alphanumeric, numeric
		// Our greedy segmenter might merge if it's suboptimal, but let's see current behavior.
		// "123" (num) "ABC" (alnum) "123" (num)
		const segments = segmentize("123ABC123");
		// Actually, greedy might switch eagerly.
		// "123" -> numeric
		// "A" -> switch to Alnum
		// "123" -> switch to Numeric
		expect(segments.map((s) => s.mode)).toEqual([
			"numeric",
			"alphanumeric",
			"numeric",
		]);
	});
});

describe("Interleave", () => {
	it("should interleave data and ecc correctly", () => {
		// Mock data that fits version 1-L (19 data bytes)
		const data = new Uint8Array(19).fill(0x11);
		// Version 1-L: 19 data bytes, 7 ECC bytes. Total 26.
		const result = interleave(data, 1, "L");
		expect(result.length).toBe(26);
	});
});
