import type { QrError, QrErrorCode, Result } from "../types/index.js";

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

export function ok<T>(value: T): Result<T, never> {
	return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
	return { ok: false, error };
}
