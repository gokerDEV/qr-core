import { err, ok, QrException } from "../core/error.js";
import { buildBitstream } from "../encoding/bitstream.js";
import { interleave } from "../encoding/interleave.js";
import type { Segment } from "../encoding/segmentation.js";
import { setupFunctionPatterns, writeVersionInfo } from "../layout/patterns.js";
import { zigzag } from "../mapping/zigzag.js";
import { applyMask, writeFormatInformation } from "../mask/selection.js";
import { Matrix, ReadOnlyMatrix } from "../matrix/bit-matrix.js";
import { ALPHANUMERIC_CHARSET } from "../spec/constants.js";
import { BestMaskStrategy } from "../strategies/mask.js";

// Strategies
import { GreedySegmentationStrategy } from "../strategies/segmentation.js";
import { SmallestVersionStrategy } from "../strategies/version.js";
import type {
	EccLevel,
	EncodeOptions,
	MaskId,
	QrCode,
	QrError,
	QrMeta,
	Result,
} from "../types/index.js";

/**
 * High-level API to encode data into a QrCode structure.
 */
/**
 * Encode input into a deterministic QR Code module matrix and metadata.
 *
 * @param input String or bytes to encode.
 * @param options Encoding options (mode, ECC, version, mask, charset, etc.).
 * @throws QrException when strict validation fails.
 */
export function encode(input: string | Uint8Array, options: EncodeOptions = {}): QrCode {
	const ecc = options.ecc ?? "M";
	const quietZone = options.quietZone ?? 4;
	const isStrict = options.strict ?? true;
	const charset = options.charset ?? "utf-8";

	validateOptions(options, ecc, charset, quietZone);

	// 1. Segmentation
	let segments: Segment[];
	if (typeof input === "string") {
		if (options.mode && options.mode !== "auto") {
			if (options.mode === "numeric" && !isNumeric(input)) {
				throw new QrException("UNSUPPORTED_MODE", "Input is not representable in numeric mode.");
			}
			if (options.mode === "alphanumeric" && !isAlphanumeric(input)) {
				throw new QrException(
					"UNSUPPORTED_MODE",
					"Input is not representable in alphanumeric mode.",
				);
			}
			segments = [{ mode: options.mode, data: input, count: input.length }];
		} else {
			segments = GreedySegmentationStrategy.apply(input);
		}
		segments = prepareSegments(segments, charset, isStrict);
	} else {
		if (options.mode && options.mode !== "auto" && options.mode !== "byte") {
			throw new QrException(
				"UNSUPPORTED_MODE",
				"Uint8Array input can only be encoded with byte mode.",
			);
		}
		segments = [
			{
				mode: "byte",
				data: "",
				count: input.length,
				bytes: input,
			},
		];
	}

	// 2. Version Selection
	let version: number;
	let minVersion = 1;

	minVersion = SmallestVersionStrategy.select(segments, ecc);

	if (options.version === "auto" || options.version === undefined) {
		version = minVersion;
	} else {
		const requested = options.version as number;
		if (requested < minVersion) {
			if (isStrict) {
				throw new QrException(
					"DATA_TOO_LARGE",
					`Data requires version ${minVersion}, but ${requested} requested.`,
				);
			}
			version = minVersion;
		} else {
			version = requested;
		}
	}

	// 3. Bitstream & ECC
	const bitstream = buildBitstream(segments, version, ecc);
	const interleaved = interleave(bitstream.toBytes(), version, ecc);

	// 4. Matrix Initialization
	const size = 21 + 4 * (version - 1);
	const matrix = new Matrix(size);
	setupFunctionPatterns(matrix, version);

	// 5. Data Placement
	zigzag(matrix, interleaved);

	// 6. Masking
	let maskId: MaskId;
	let penalties: number[] | undefined;

	if (options.mask !== undefined && options.mask !== "auto") {
		maskId = options.mask as MaskId;
		applyMask(matrix, maskId);
		writeFormatInformation(matrix, ecc, maskId);
	} else {
		const result = BestMaskStrategy.select(matrix, ecc);
		maskId = result.mask;
		penalties = result.penalties;
	}

	// 7. Version Info (for V7+)
	if (version >= 7) {
		writeVersionInfo(matrix, version);
	}

	const meta: QrMeta = {
		quietZone,
		modeUsed: segments.length > 1 ? "mixed" : segments[0]?.mode || "byte",
		segments: segments.map((s) => ({
			mode: s.mode,
			charCount: s.count,
		})),
	};

	if (penalties) {
		meta.maskPenalties = penalties;
		const chosen = penalties[maskId];
		if (chosen === undefined) throw new Error("Internal error: Chosen penalty undefined");
		meta.chosenPenalty = chosen;
	}

	return {
		version,
		ecc,
		mask: maskId,
		size,
		matrix: new ReadOnlyMatrix(matrix),
		meta,
	};
}

/**
 * Safe variant of encode returning a Result object.
 */
/**
 * Safe variant of {@link encode}. Returns a Result instead of throwing.
 */
export function encodeSafe(
	input: string | Uint8Array,
	options?: EncodeOptions,
): Result<QrCode, QrError> {
	try {
		return ok(encode(input, options));
	} catch (e) {
		if (e instanceof QrException) {
			return err(e);
		}
		return err(
			new QrException("INTERNAL_INVARIANT_BROKEN", e instanceof Error ? e.message : String(e), e),
		);
	}
}

function validateOptions(
	options: EncodeOptions,
	ecc: EccLevel,
	charset: "utf-8" | "iso-8859-1",
	quietZone: number,
): void {
	if (!isEcc(ecc)) {
		throw new QrException("INVALID_OPTIONS", `Invalid ecc level: ${ecc}`);
	}

	if (options.version !== undefined && options.version !== "auto") {
		if (!isIntegerInRange(options.version, 1, 40)) {
			throw new QrException("INVALID_VERSION", `Invalid version: ${options.version}`);
		}
	}

	if (options.mask !== undefined && options.mask !== "auto") {
		if (!isIntegerInRange(options.mask, 0, 7)) {
			throw new QrException("INVALID_MASK", `Invalid mask: ${options.mask}`);
		}
	}

	if (!isIntegerInRange(quietZone, 0, 64)) {
		throw new QrException("INVALID_OPTIONS", `Invalid quietZone: ${quietZone}`);
	}

	if (charset !== "utf-8" && charset !== "iso-8859-1") {
		throw new QrException("INVALID_OPTIONS", `Invalid charset: ${charset}`);
	}

	if (options.mode !== undefined && options.mode !== "auto") {
		if (options.mode !== "numeric" && options.mode !== "alphanumeric" && options.mode !== "byte") {
			throw new QrException("INVALID_OPTIONS", `Invalid mode: ${options.mode}`);
		}
	}
}

function isEcc(value: string): value is EccLevel {
	return value === "L" || value === "M" || value === "Q" || value === "H";
}

function isIntegerInRange(value: number, min: number, max: number): boolean {
	return Number.isInteger(value) && value >= min && value <= max;
}

function isNumeric(input: string): boolean {
	if (input.length === 0) return true;
	return /^[0-9]+$/.test(input);
}

function isAlphanumeric(input: string): boolean {
	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (ch === undefined || !ALPHANUMERIC_CHARSET.includes(ch)) return false;
	}
	return true;
}

function prepareSegments(
	segments: Segment[],
	charset: "utf-8" | "iso-8859-1",
	strict: boolean,
): Segment[] {
	return segments.map((segment) => {
		switch (segment.mode) {
			case "numeric":
				if (!isNumeric(segment.data)) {
					throw new QrException("UNSUPPORTED_MODE", "Input is not representable in numeric mode.");
				}
				return { ...segment, count: segment.data.length };
			case "alphanumeric":
				if (!isAlphanumeric(segment.data)) {
					throw new QrException(
						"UNSUPPORTED_MODE",
						"Input is not representable in alphanumeric mode.",
					);
				}
				return { ...segment, count: segment.data.length };
			case "byte": {
				const bytes = encodeByteString(segment.data, charset, strict);
				return { ...segment, bytes, count: bytes.length };
			}
			default:
				throw new QrException("INTERNAL_INVARIANT_BROKEN", `Unknown segment mode: ${segment.mode}`);
		}
	});
}

function encodeByteString(
	input: string,
	charset: "utf-8" | "iso-8859-1",
	strict: boolean,
): Uint8Array {
	if (charset === "utf-8") {
		return new TextEncoder().encode(input);
	}

	const bytes: number[] = [];
	for (let i = 0; i < input.length; i++) {
		const codePoint = input.codePointAt(i);
		if (codePoint === undefined) continue;
		if (codePoint > 0xff) {
			if (strict) {
				throw new QrException(
					"ENCODING_FAILED",
					"Input contains characters outside ISO-8859-1 range.",
				);
			}
			bytes.push(0x3f);
		} else {
			bytes.push(codePoint);
		}
		if (codePoint > 0xffff) i++;
	}
	return new Uint8Array(bytes);
}
