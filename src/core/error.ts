import type { QrError, QrErrorCode, Result } from "../types/index.js";

/**
 * Typed error used by qr-core for validation and encoding failures.
 */
export class QrException extends Error implements QrError {
	public readonly code: QrErrorCode;
	public readonly details?: unknown;

	constructor(code: QrErrorCode, message: string, details?: unknown) {
		super(message);
		this.name = "QrException";
		this.code = code;
		this.details = details;
	}
}

/**
 * Helper to construct a successful Result.
 */
export function ok<T>(value: T): Result<T, never> {
	return { ok: true, value };
}

/**
 * Helper to construct a failed Result.
 */
export function err<E>(error: E): Result<never, E> {
	return { ok: false, error };
}
