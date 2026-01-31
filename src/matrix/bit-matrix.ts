/**
 * QR Matris Yönetimi
 */

import type { BitMatrix } from "../types/index.js";

/**
 * Matris hücre durumları (Dahili kullanım)
 */
const STATUS = {
	LIGHT: 0,
	DARK: 1,
	RESERVED_LIGHT: 2,
	RESERVED_DARK: 3,
} as const;

export class Matrix implements BitMatrix {
	public readonly size: number;
	private data: Uint8Array;

	constructor(size: number) {
		this.size = size;
		// Varsayılan olarak tüm hücreler "light" (0)
		this.data = new Uint8Array(size * size);
	}

	/**
	 * Internal access to raw data for performance-critical operations (e.g. penalty calculation).
	 */
	public get _data(): Uint8Array {
		return this.data;
	}

	/**
	 * Hücrenin değerini döndürür (Sadece 0 veya 1)
	 */
	public get(x: number, y: number): 0 | 1 {
		if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		const idx = y * this.size + x;
		const val = this.data[idx];
		if (val === undefined) {
			// Should be bounds checked or checked at call site, but defensive coding here:
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		return (val & 1) as 0 | 1;
	}

	/**
	 * Hücrenin "Reserved" (ayrılmış) olup olmadığını kontrol eder
	 */
	public isReserved(x: number, y: number): boolean {
		if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		const idx = y * this.size + x;
		const val = this.data[idx];
		if (val === undefined) {
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		return (val & 2) !== 0;
	}

	/**
	 * Hücreyi ayarlar ve rezerve eder (Fonksiyonel desenler için)
	 */
	public setReserved(x: number, y: number, isDark: boolean): void {
		if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		const idx = y * this.size + x;
		if (idx < 0 || idx >= this.data.length) {
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		this.data[idx] = isDark ? STATUS.RESERVED_DARK : STATUS.RESERVED_LIGHT;
	}

	/**
	 * Sadece veri modülleri için (Ayrılmamış alanlara yazar)
	 */
	public set(x: number, y: number, isDark: boolean): void {
		if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		if (this.isReserved(x, y)) return;
		const idx = y * this.size + x;
		if (idx < 0 || idx >= this.data.length) {
			// Double safety
			throw new Error(`Matrix access out of bounds: (${x},${y})`);
		}
		this.data[idx] = isDark ? STATUS.DARK : STATUS.LIGHT;
	}

	/**
	 * RFC 5.2: Matrisi satırlar halinde döndürür
	 */
	public toRows(): ReadonlyArray<Uint8Array> {
		const rows: Uint8Array[] = [];
		for (let y = 0; y < this.size; y++) {
			rows.push(this.data.slice(y * this.size, (y + 1) * this.size).map((v) => (v & 1) as 0 | 1));
		}
		return rows;
	}

	/**
	 * RFC 5.2: Matrisi paketlenmiş (MSB-first) bayt dizisi olarak döndürür
	 */
	public toPacked(): Uint8Array {
		const rowBytes = Math.ceil(this.size / 8);
		const packed = new Uint8Array(rowBytes * this.size);

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				if (this.get(x, y)) {
					const idx = y * rowBytes + (x >>> 3);
					const current = packed[idx];
					// safe access or initialized 0
					if (current !== undefined) {
						packed[idx] = current | (0x80 >>> (x & 7));
					}
				}
			}
		}
		return packed;
	}

	public clone(): Matrix {
		const copy = new Matrix(this.size);
		copy.data.set(this.data);
		return copy;
	}
}

export class ReadOnlyMatrix implements BitMatrix {
	public readonly size: number;
	private readonly inner: Matrix;

	constructor(matrix: Matrix) {
		this.inner = matrix;
		this.size = matrix.size;
	}

	public get(x: number, y: number): 0 | 1 {
		return this.inner.get(x, y);
	}

	public toRows(): ReadonlyArray<Uint8Array> {
		return this.inner.toRows();
	}

	public toPacked(): Uint8Array {
		return this.inner.toPacked();
	}
}
