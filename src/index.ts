/**
 * qr-core public API.
 *
 * Deterministic QR Code Model 2 encoder that outputs a binary module matrix
 * and metadata only (no rendering).
 */
export { encode, encodeSafe } from "./api/index.js";
export { QrException } from "./core/error.js";
export * from "./types/index.js";
