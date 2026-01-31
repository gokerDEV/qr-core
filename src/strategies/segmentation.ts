import type { Segment } from "../encoding/segmentation.js";
import { segmentize } from "../encoding/segmentation.js";

/**
 * Strategy for splitting input data into segments with optimal encoding modes.
 */
export interface SegmentationStrategy {
	apply(input: string): Segment[];
}

/**
 * Default greedy strategy that switches mode when a character requires it.
 * Not optimal but efficient and simple.
 */
export const GreedySegmentationStrategy: SegmentationStrategy = {
	apply(input: string) {
		const greedy = segmentize(input);
		// Optimization: If mixed segments, check if pure Byte mode is smaller.
		// "Hello World" case: Greedy splits into Alpha/Byte/Alpha/Byte = high overhead.
		// Pure Byte is often better for short ASCII strings.
		if (greedy.length > 1) {
			const byteSeg: Segment = { mode: "byte", data: input, count: input.length };
			const greedyBits = estimateCost(greedy);
			const byteBits = estimateCost([byteSeg]);
			if (byteBits < greedyBits) {
				return [byteSeg];
			}
		}
		return greedy;
	},
};

function estimateCost(segments: Segment[]): number {
	let bits = 0;
	for (const s of segments) {
		// Overhead: Mode(4) + Count(var). Use V1 constants (conservative overhead cost).
		// Numeric: 10, Alpha: 9, Byte: 8
		if (s.mode === "numeric")
			bits += 4 + 10 + Math.ceil(s.count / 3) * 10;
		// Alpha: 11 bits per 2 chars. 6 for last.
		else if (s.mode === "alphanumeric") {
			const pairs = Math.floor(s.count / 2);
			const odd = s.count % 2;
			bits += 4 + 9 + pairs * 11 + odd * 6;
		}
		// Byte
		else bits += 4 + 8 + s.count * 8;
	}
	return bits;
}
