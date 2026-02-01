# qr-core

[![npm](https://img.shields.io/npm/v/qr-core?label=npm)](https://www.npmjs.com/package/qr-core)
[![jsr](https://img.shields.io/jsr/v/@goker/qr-code)](https://jsr.io/@goker/qr-code)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![buy me a coffee](https://img.shields.io/badge/buy%20me%20a%20coffee-support-yellow)](https://www.buymeacoffee.com/goker)
[![github sponsor](https://img.shields.io/badge/sponsor-github-black)](https://github.com/sponsors/gokerDEV)

Deterministic, zero-dependency QR Code Model 2 encoder for TypeScript/JavaScript. Outputs a binary module matrix and metadata only (no rendering).

RFC: See `RFC.md` for the normative specification.

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

Run `npm run bench` to reproduce qr-core numbers.
Run `npm run compare` to compare qr-core vs Nayuki (this builds a separate compare bundle via `tsconfig.compare.json`).

You can tune runtime for quick/slow passes:

```bash
BENCH_RUNS=3 BENCH_ITERS=200 BENCH_BATCH=5 BENCH_WARMUP=50 npm run bench
```

Compare scenario details:

- **Short text**: input `"HELLO WORLD"`, ecc `M`, auto version/mask.
- **URL (medium)**: input `https://example.com/search?q=${"A".repeat(480)}`, ecc `M`, auto version/mask.
- **vCard-like**: multi-line vCard-ish text, ecc `Q`, auto version/mask.
- **Large payload**: input `"A".repeat(3000)`, ecc `L`, auto version/mask.

### Methodology

The benchmark harness runs a warmup phase, followed by `BENCH_RUNS` measurement cycles. In each cycle, the task is executed `BENCH_ITERS * BENCH_BATCH` times. To minimize noise, garbage collection is forced (if exposed) before each cycle. We report:

- **p50** (median): The median time per operation across runs.
- **p95**: The 95th percentile time per operation, indicating tail latency.

Bench (qr-core only)

| Runtime | Short text p50 / p95 (ms) | URL (medium) p50 / p95 (ms) | Large payload p50 / p95 (ms) |
| :--- | :---: | :---: | :---: |
| **Node v23.11.0** | **0.046 / 0.051** | **1.193 / 1.205** | **3.897 / 3.899** |
| **Bun v1.3.8** | **0.040 / 0.053** | **1.154 / 1.171** | **3.736 / 3.736** |
| **Deno v2.6.7** | **0.041 / 0.046** | **1.179 / 1.213** | **3.866 / 3.876** |

Compare (qr-core vs Nayuki)

| Runtime | Short text (qr-core / Nayuki p50) | URL (medium) (qr-core / Nayuki p50) | vCard-like (qr-core / Nayuki p50) | Large payload (qr-core / Nayuki p50) |
| :--- | :---: | :---: | :---: | :---: |
| **Node v23.11.0** | **0.041 / 0.211** | **1.181 / 4.034** | **0.485 / 1.566** | **3.908 / 12.070** |
| **Bun v1.3.8** | **0.040 / 0.190** | **1.155 / 3.900** | **0.467 / 1.317** | **3.753 / 11.902** |
| **Deno v2.6.7** | **0.040 / 0.205** | **1.204 / 3.957** | **0.489 / 1.530** | **3.898 / 11.952** |

> Benchmarks captured on 2026‑02‑01 (darwin arm64) with `BENCH_RUNS=3 BENCH_ITERS=200 BENCH_BATCH=5 BENCH_WARMUP=50`. Goal from RFC: version‑40 near‑capacity with auto‑mask < 5ms — **met**.

## Contributing

Contributions are welcome. If you plan a larger change, please open an issue first to align on scope.

### Development

```bash
npm install
npm test
```

### Status & Roadmap

- v1 scope: numeric, alphanumeric, byte; versions 1–40; ECC L/M/Q/H; auto version/mask; deterministic output.
- Non‑goals in v1: rendering, Kanji, ECI, Structured Append, Micro QR.
- Review notes:
  - Golden tests currently validate only version/size; matrix hash/bit equality is still missing.
  - V7+ version info bit placement is only indirectly validated (reservation checks), not byte‑level correctness.
  - Segmentation cost estimation uses V1 character count sizes; V10+ may choose larger versions than necessary.
  - Zigzag placement has no explicit “all bits consumed” assertion, so silent data loss is possible if reserved areas are wrong.

### Guidelines

- Keep output deterministic across runtimes.
- Prefer small, well‑scoped PRs with tests.
- Preserve strict typing and zero‑dependency policy.

## License

MIT
