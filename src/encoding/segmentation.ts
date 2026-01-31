import { ALPHANUMERIC_CHARSET } from "../spec/constants.js";
import type { QrMode } from "../types/index.js";

export interface Segment {
	mode: Exclude<QrMode, "auto">;
	data: string;
	count: number;
	bytes?: Uint8Array;
}

/**
 * Analyzes the input string and splits it into the most appropriate QR modes.
 * v1: Simple but effective greedy approach.
 */
export function segmentize(input: string): Segment[] {
	if (input.length === 0) return [];

	const segments: Segment[] = [];

	const firstChar = input[0];
	if (firstChar === undefined) return []; // Should be caught by input.length === 0 check

	let currentMode: Exclude<QrMode, "auto"> = getBestMode(firstChar);
	let startIndex = 0;

	for (let i = 1; i < input.length; i++) {
		const char = input[i];
		if (char === undefined) throw new Error("Segmentation error: index out of bounds");

		const charMode = getBestMode(char);
		if (charMode !== currentMode) {
			segments.push({
				mode: currentMode,
				data: input.substring(startIndex, i),
				count: i - startIndex,
			});
			currentMode = charMode;
			startIndex = i;
		}
	}

	segments.push({
		mode: currentMode,
		data: input.substring(startIndex),
		count: input.length - startIndex,
	});
	return segments;
}

function getBestMode(char: string): Exclude<QrMode, "auto"> {
	if (/[0-9]/.test(char)) return "numeric";
	if (ALPHANUMERIC_CHARSET.includes(char)) return "alphanumeric";
	return "byte";
}
