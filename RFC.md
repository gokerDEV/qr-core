
# RFC: qr-core (TS) — Binary Matrix QR Encoder

**Status:** Draft  
**Audience:** Library authors, maintainers, integrators  
**Scope:** QR Code Model 2 encoding to a binary module matrix (no rendering)  
**Last updated:** 2026-02-01

This RFC defines the public contract, normative behavior, and extensibility points for a TypeScript QR encoder library (“qr-core”) that outputs a deterministic binary matrix suitable for downstream renderers (SVG/Canvas/PDF/etc.).

---

## Contents

1. Goals  
2. Non-Goals  
3. Terminology  
4. Public API  
5. Matrix Representation Contract  
6. Supported Encoding Modes (v1)  
7. Version and Capacity Selection  
8. Bitstream Construction  
9. Error Correction and Masking  
10. Error Model  
11. Extensibility Points  
12. Performance Budget  
13. Security and Robustness Considerations  
14. Test Requirements  
15. Acceptance Criteria for v1  
16. Open Questions  
17. References

---

## 1. Goals

The library **MUST**:

1. Accept input as `string` or `Uint8Array` and produce a QR Code **module matrix** conforming to ISO/IEC 18004 (QR Code Model 2).
2. Provide a stable, deterministic output for identical inputs and options.
3. Support error correction levels **L/M/Q/H**.
4. Support **version auto-selection** or **fixed version**.
5. Support **mask auto-selection** (minimum penalty) or **fixed mask**.
6. Expose output as a binary matrix structure and associated metadata.

The library **SHOULD**:

- Be runtime-agnostic (Node.js, browsers, Edge runtimes).
- Be dependency-free (or minimal), small, and performant.
- Provide strong TypeScript typing and strict option validation.

The library **MAY**:

- Provide optional strategies for segmentation and optimization.
- Provide helper utilities (e.g., matrix hashing) used for testing.

---

## 2. Non-Goals

The library **MUST NOT**:

- Render QR codes (SVG/Canvas/PNG/PDF) in v1.
- Implement Micro QR, Structured Append, or Kanji mode in v1.

The library **MAY** defer to later versions:

- ECI mode
- Optimal multi-mode segmentation
- Structured Append

---

## 3. Terminology

- **Module**: A single square cell in the QR symbol (dark = 1, light = 0).
- **Matrix**: The `N×N` module grid where `N = 21 + 4*(version-1)`.
- **Reserved modules**: Modules used for function patterns (finder, timing, format, etc.).
- **Data codewords**: Encoded payload bytes after mode/length headers and padding.
- **ECC codewords**: Reed–Solomon error correction bytes.
- **Interleaving**: Block-wise mixing of data and ECC codewords per QR spec.
- **Mask**: One of 8 mask patterns (IDs 0..7) applied to data modules.

Normative keywords **MUST**, **SHOULD**, **MAY** are used per RFC 2119.

---

## 4. Public API

### 4.1 Primary function

The library **MUST** expose a primary encoder entrypoint:

- `encode(input: string | Uint8Array, options?: EncodeOptions): QrCode`

The library **MAY** additionally expose:

- `encodeSafe(...) => Result<QrCode, QrError>` (non-throwing variant)

### 4.2 Types

#### 4.2.1 EncodeOptions

`EncodeOptions` **MUST** support:

- `ecc?: 'L' | 'M' | 'Q' | 'H'` (default `'M'`)
- `version?: number | 'auto'` (default `'auto'`)
- `mask?: 0|1|2|3|4|5|6|7 | 'auto'` (default `'auto'`)
- `mode?: 'auto' | 'byte' | 'alphanumeric' | 'numeric'` (default `'auto'`)
- `charset?: 'utf-8' | 'iso-8859-1'` (default `'utf-8'`)
- `quietZone?: number` (default `4`) — note: **not applied to the core matrix**, carried as metadata
- `strict?: boolean` (default `true`)

Constraints:

- If `version` is a number, it **MUST** be within `[1, 40]`.
- If `mask` is a number, it **MUST** be within `[0, 7]`.
- If `quietZone` is provided, it **MUST** be an integer within `[0, 64]`.

#### 4.2.2 QrCode

The `QrCode` result **MUST** include:

- `version: number`
- `ecc: 'L' | 'M' | 'Q' | 'H'`
- `mask: 0|1|2|3|4|5|6|7`
- `size: number` (matrix dimension)
- `matrix: BitMatrix` (quiet zone excluded)

The `QrCode` result **MAY** include:

- `meta: QrMeta`

#### 4.2.3 QrMeta

If provided, `QrMeta` **SHOULD** contain:

- `quietZone: number`
- `modeUsed: 'byte'|'alphanumeric'|'numeric'|('mixed')`
- `segments: SegmentInfo[]`
- `maskPenalties?: number[]` (length 8)
- `chosenPenalty?: number`

---

## 5. Matrix Representation Contract

### 5.1 Read-only Matrix Exposure

- The `matrix` returned on `QrCode` **MUST** be **read-only** from the consumer perspective.
- Implementations **MAY** use internal mutable buffers, but external mutation **MUST NOT** be possible.
- Acceptable approaches include:
  - returning an object that only exposes read methods (`get`, `size`, `toPacked`, `toRows`)
  - returning a wrapper over an internal matrix

### 5.2 BitMatrix

The library **MUST** expose a read interface:

- `get(x: number, y: number): 0 | 1`
- `size: number`

The library **MAY** expose additional methods:

- `toPacked(): Uint8Array`
- `toRows(): Uint8Array[]` (row-major bytes 0/1)

### 5.3 Coordinate System

- `(0,0)` **MUST** refer to the **top-left** module.
- `x` increases to the right, `y` increases downward.
- Bounds: `0 ≤ x,y < size`.

### 5.4 Determinism

Given identical `input` bytes and identical `options`, `encode` **MUST** produce:

- The same `version`, `mask`, and `matrix` contents.

Tie-break rules **MUST** be deterministic (see §9.6).

---

## 6. Supported Encoding Modes (v1)

### 6.1 Required

The implementation **MUST** support the following modes in v1:

- **Numeric mode**
- **Alphanumeric mode**
- **8-bit byte mode**

Rationale (non-normative): Numeric and alphanumeric are essential for efficiency with common payloads such as phone numbers, numeric IDs, and URLs.

### 6.2 Input handling

- If `input` is `string`, it **MUST** be converted to bytes using `charset` when byte mode is used.
- For `charset = 'utf-8'`, encoding **MUST** use standard UTF-8.
- For `charset = 'iso-8859-1'`, characters outside 0..255 **MUST** cause an error when `strict=true`.

### 6.3 Mode selection

- If `mode='numeric'|'alphanumeric'|'byte'`, the implementation **MUST** use the forced mode.
- If `mode='auto'`, the implementation **MUST** choose a **space-efficient** encoding.
  - The implementation **SHOULD** perform optimal or near-optimal segmentation across numeric/alphanumeric/byte.

### 6.4 Representability

- If a forced mode cannot represent the input:
  - The implementation **MUST** throw `UNSUPPORTED_MODE` or `ENCODING_FAILED`.

---

## 7. Version and Capacity Selection

### 7.1 Auto version

If `version='auto'`:

- The implementation **MUST** select the smallest version that fits the encoded payload for the specified ECC level.

### 7.2 Fixed version

If `version` is fixed:

- The implementation **MUST** validate capacity.
- If the payload does not fit:
  - When `strict=true`, the implementation **MUST** throw `DATA_TOO_LARGE`.
  - When `strict=false`, the implementation **MAY** override the version upward to the smallest version that fits.

---

## 8. Bitstream Construction

The implementation **MUST** construct the final codeword stream according to QR spec rules:

1. Mode indicator
2. Character count indicator (bit-length depends on mode and version group)
3. Data bits
4. Terminator (up to 4 zero bits if space)
5. Pad to byte boundary (0 bits)
6. Pad codewords alternating `0xEC`, `0x11` until capacity is filled

---

## 9. Error Correction and Masking

### 9.1 Reed–Solomon

- The implementation **MUST** generate ECC codewords using Reed–Solomon over GF(256) with QR parameters.

### 9.2 Block structure

- The implementation **MUST** split data into blocks per version/ECC tables.
- The implementation **MUST** interleave data codewords and ECC codewords per spec.

### 9.3 Function patterns

The matrix **MUST** include:

- Finder patterns + separators
- Timing patterns
- Alignment patterns (as applicable)
- Dark module
- Reserved areas for format and version information

### 9.4 Data placement

- The implementation **MUST** place interleaved codewords into the matrix in the standard zigzag pattern.
- Reserved modules **MUST** NOT be overwritten.

### 9.5 Mask selection

If `mask='auto'`:

- The implementation **MUST** evaluate all 8 masks.
- The implementation **MUST** compute penalty score using QR penalty rules (N1–N4).
- The implementation **MUST** choose the mask with minimal penalty.

If `mask` is fixed:

- The implementation **MUST** apply the specified mask.

### 9.6 Mask tie-break

If two or more masks produce equal minimal penalty:

- The implementation **MUST** select the **lowest mask ID**.

### 9.7 Format and version info

- After choosing the mask, the implementation **MUST** write the correct format bits.
- For versions `>= 7`, the implementation **MUST** write version information bits.

---

## 10. Error Model

The library **MUST** define a `QrError` type that includes:

- `code: QrErrorCode`
- `message: string`
- `details?: unknown`

`QrErrorCode` **MUST** include at least:

- `INVALID_OPTIONS`
- `UNSUPPORTED_MODE`
- `DATA_TOO_LARGE`
- `INVALID_VERSION`
- `INVALID_MASK`
- `ENCODING_FAILED`
- `INTERNAL_INVARIANT_BROKEN`

---

## 11. Extensibility Points

The library **SHOULD** define internal strategy interfaces and default implementations:

- `VersionStrategy`
- `MaskStrategy`
- `SegmentationStrategy`

The public API **MAY** expose configuration hooks for advanced users, but v1 **SHOULD** keep the public surface minimal.

---

## 12. Performance Budget

The project **SHOULD** define and continuously track a performance budget.

Recommended initial budget (non-normative; to be validated on CI hardware):

- **Version 40, byte payload near capacity, auto-mask enabled:** encoding wall time **< 5 ms**

Notes:

- Budgets **MUST** specify runtime (Node version), CPU class, and measurement method.
- If budgets cannot be met on CI hardware, they **SHOULD** be adjusted to a realistic bound and used as regression gates.

---

## 13. Security and Robustness Considerations

- The implementation **MUST** validate all numeric options for bounds and integer-ness.
- The implementation **MUST** avoid algorithmic explosions; runtime should be O(N²) with an 8× masking factor.
- The implementation **SHOULD** avoid unbounded memory growth.

---

## 14. Test Requirements

The project **MUST** include:

1. Unit tests for:
   - GF(256) arithmetic
   - Reed–Solomon ECC
   - Mask functions and penalty scoring
   - Pattern placement (finder/timing/alignment)

2. Golden tests:
   - Known inputs with fixed options must match stored expected matrix hashes.

3. Determinism tests:
   - Repeated runs in different environments must produce identical outputs.

---

## 15. Acceptance Criteria for v1

v1 is considered compliant when:

- Numeric, alphanumeric, and byte modes are supported.
- Versions 1..40 are supported with ECC L/M/Q/H.
- Auto version and auto mask are implemented.
- The output matrix is correct and deterministic.
- The `matrix` output is read-only to consumers.

---

## 16. Open Questions

- Should `matrix` be read-only by default (recommended), with internal mutable matrices?
- Should v1 ship with numeric/alphanumeric modes enabled or defer to v1.1?
- Should `encodeSafe` be included in v1?

---

## 17. References

- ISO/IEC 18004 (QR Code Model 2)
- RFC 2119 (Key words for use in RFCs)
