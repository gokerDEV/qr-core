export type EccLevel = "L" | "M" | "Q" | "H";
export type QrMode = "auto" | "byte" | "alphanumeric" | "numeric";
export type MaskId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface EncodeOptions {
	ecc?: EccLevel;
	version?: number | "auto";
	mask?: MaskId | "auto";
	mode?: QrMode;
	charset?: "utf-8" | "iso-8859-1";
	quietZone?: number; // carried in meta only
	strict?: boolean;
}

export interface BitMatrix {
	readonly size: number;
	get(x: number, y: number): 0 | 1;
	toPacked?(): Uint8Array;
	toRows?(): ReadonlyArray<Uint8Array>;
}

export interface SegmentInfo {
	mode: Exclude<QrMode, "auto">;
	charCount: number;
}

export interface QrMeta {
	quietZone: number;
	modeUsed: Exclude<QrMode, "auto"> | "mixed";
	segments: ReadonlyArray<SegmentInfo>;
	maskPenalties?: ReadonlyArray<number>;
	chosenPenalty?: number;
	details?: Readonly<Record<string, unknown>>;
}

export type QrErrorCode =
	| "INVALID_OPTIONS"
	| "UNSUPPORTED_MODE"
	| "DATA_TOO_LARGE"
	| "INVALID_VERSION"
	| "INVALID_MASK"
	| "ENCODING_FAILED"
	| "INTERNAL_INVARIANT_BROKEN";

export interface QrError {
	code: QrErrorCode;
	message: string;
	details?: unknown;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export interface QrCode {
	version: number;
	ecc: EccLevel;
	mask: MaskId;
	size: number;
	matrix: BitMatrix; // MUST be read-only exposure
	meta?: QrMeta;
}
