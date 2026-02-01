/** Error correction levels. */
export type EccLevel = "L" | "M" | "Q" | "H";
/** Encoding mode selection. */
export type QrMode = "auto" | "byte" | "alphanumeric" | "numeric";
/** Mask pattern IDs. */
export type MaskId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Encoding options for {@link encode}. */
export interface EncodeOptions {
	ecc?: EccLevel;
	version?: number | "auto";
	mask?: MaskId | "auto";
	mode?: QrMode;
	charset?: "utf-8" | "iso-8859-1";
	quietZone?: number; // carried in meta only
	strict?: boolean;
}

/** Read-only QR module matrix interface. */
export interface BitMatrix {
	readonly size: number;
	get(x: number, y: number): 0 | 1;
	toPacked?(): Uint8Array;
	toRows?(): ReadonlyArray<Uint8Array>;
}

/** Per-segment summary for metadata. */
export interface SegmentInfo {
	mode: Exclude<QrMode, "auto">;
	charCount: number;
}

/** Optional metadata returned by the encoder. */
export interface QrMeta {
	quietZone: number;
	modeUsed: Exclude<QrMode, "auto"> | "mixed";
	segments: ReadonlyArray<SegmentInfo>;
	maskPenalties?: ReadonlyArray<number>;
	chosenPenalty?: number;
	details?: Readonly<Record<string, unknown>>;
}

/** Error codes emitted by the encoder. */
export type QrErrorCode =
	| "INVALID_OPTIONS"
	| "UNSUPPORTED_MODE"
	| "DATA_TOO_LARGE"
	| "INVALID_VERSION"
	| "INVALID_MASK"
	| "ENCODING_FAILED"
	| "INTERNAL_INVARIANT_BROKEN";

/** Structured error for {@link encodeSafe}. */
export interface QrError {
	code: QrErrorCode;
	message: string;
	details?: unknown;
}

/** Result type used by {@link encodeSafe}. */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/** Encoded QR Code output. */
export interface QrCode {
	version: number;
	ecc: EccLevel;
	mask: MaskId;
	size: number;
	matrix: BitMatrix; // MUST be read-only exposure
	meta?: QrMeta;
}
