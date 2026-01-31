# qr-core

Deterministic, zero-dependency QR Code Model 2 encoder for TypeScript/JavaScript. Outputs a binary module matrix and metadata only (no rendering), aligned with the project RFC.

## Highlights

- **Deterministic output**: Same input + same options ⇒ identical version, mask, and matrix.
- **Strict typing**: TypeScript 5.x, strict mode.
- **RFC-aligned**: Numeric, alphanumeric, and byte modes; versions 1–40; ECC L/M/Q/H.
- **Read‑only matrix**: Consumers cannot mutate the QR matrix.
- **Zero dependencies**: Small, portable, runtime-agnostic.

## Installation

```bash
npm install qr-core
```

## Quick Start

```ts
import { encode } from "qr-core";

const qr = encode("HELLO WORLD");
console.log(qr.version, qr.mask, qr.size);
console.log(qr.matrix.get(0, 0));
```

## Usage

```ts
import { encode, encodeSafe } from "qr-core";

// Basic
const qr = encode("https://example.com");

// Advanced options
const qr2 = encode("https://example.com", {
  ecc: "H",          // L | M | Q | H
  version: 5,         // 1..40 or "auto"
  mask: "auto",      // 0..7 or "auto"
  mode: "auto",      // numeric | alphanumeric | byte | auto
  charset: "utf-8",  // utf-8 | iso-8859-1
  quietZone: 4,       // metadata only
  strict: true
});

// Non-throwing variant
const result = encodeSafe("1234", { mode: "numeric" });
if (result.ok) {
  console.log(result.value.version);
} else {
  console.error(result.error.code, result.error.message);
}
```

## API

### `encode(input, options?) => QrCode`

- `input`: `string | Uint8Array`
- `options`: `EncodeOptions` (see below)
- **throws** `QrException` on invalid input/options when `strict=true`

### `encodeSafe(input, options?) => Result<QrCode, QrError>`

Non-throwing wrapper that returns `{ ok: true, value }` or `{ ok: false, error }`.

### Types

```ts
export type EccLevel = "L" | "M" | "Q" | "H";
export type QrMode = "auto" | "byte" | "alphanumeric" | "numeric";
export type MaskId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface EncodeOptions {
  ecc?: EccLevel;                   // default: "M"
  version?: number | "auto";       // default: "auto"
  mask?: MaskId | "auto";          // default: "auto"
  mode?: QrMode;                    // default: "auto"
  charset?: "utf-8" | "iso-8859-1";// default: "utf-8"
  quietZone?: number;               // default: 4 (metadata only)
  strict?: boolean;                 // default: true
}

export interface BitMatrix {
  readonly size: number;
  get(x: number, y: number): 0 | 1;
  toPacked?(): Uint8Array;          // row-major, MSB-first, row padded to byte
  toRows?(): ReadonlyArray<Uint8Array>;
}

export interface QrCode {
  version: number;
  ecc: EccLevel;
  mask: MaskId;
  size: number;
  matrix: BitMatrix;
  meta?: QrMeta;
}
```

## Matrix Packing Format

If `toPacked()` is available, it returns **row-major**, **MSB‑first** bits. Each row is padded to the next byte boundary with zero bits. Coordinates use `(0,0)` as the **top‑left** module.

## Benchmarks

Run `npm run bench` to reproduce.

| Scenario | Description | p50 (ms) | p95 (ms) |
| :--- | :--- | :---: | :---: |
| **Small** | Auto version/mask, ecc M ("HELLO WORLD") | **0.066** | **0.138** |
| **Medium** | Auto version/mask, ecc M (~500 bytes URL‑ish payload) | **1.262** | **1.403** |
| **Large** | Auto version/mask, ecc L (3000 bytes) | **3.849** | **3.984** |

> Benchmarks captured on 2026‑01‑31 with Node v24.7.0 (darwin arm64). Goal from RFC: version‑40 near‑capacity with auto‑mask < 5ms — **met**.

## Status & Roadmap

- v1 scope: numeric, alphanumeric, byte; versions 1–40; ECC L/M/Q/H; auto version/mask; deterministic output.
- Non‑goals in v1: rendering, Kanji, ECI, Structured Append, Micro QR.

## License

MIT
