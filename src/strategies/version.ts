import { QrException } from "../core/error.js";
import { buildBitstream } from "../encoding/bitstream.js";
import type { Segment } from "../encoding/segmentation.js";
import { MAX_VERSION, MIN_VERSION } from "../spec/constants.js";
import type { EccLevel } from "../types/index.js";

/**
 * Strategy for selecting the smallest QR version that fits the data.
 */
export interface VersionStrategy {
	select(segments: Segment[], ecc: EccLevel): number;
}

/**
 * Iterates from MIN_VERSION to MAX_VERSION to find the first one that fits.
 */
export const SmallestVersionStrategy: VersionStrategy = {
	select(segments: Segment[], ecc: EccLevel): number {
		for (let v = MIN_VERSION; v <= MAX_VERSION; v++) {
			try {
				// Try to build bitstream specifically for this version to check capacity
				// This is less efficient than just checking capacity tables but safer
				// as it accounts for mode overheads correctly
				// TODO: Optimize by checking capacity table directly first
				buildBitstream(segments, v, ecc);
				return v;
			} catch (_e) {}
		}
		throw new QrException("DATA_TOO_LARGE", "Data exceeds maximum QR capacity");
	},
};
