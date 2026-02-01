/**
 * Benchmark runner for Node, Bun, and Deno.
 *
 * How to run:
 * - Node: `node --expose-gc bench/bench.ts`
 * - Bun:  `bun bench/bench.ts`
 * - Deno: `deno run --allow-read bench/bench.ts`
 *
 * Notes:
 * - GC is optional; when available, it is invoked before each run to reduce noise.
 * - If results are too noisy, increase RUNS, ITERS, or BATCH.
 */

import { encode } from "../src/index.js";

type GlobalWithExtras = typeof globalThis & {
	gc?: () => void;
	Deno?: { mainModule?: string; env?: { get: (key: string) => string | undefined } };
	process?: {
		argv?: string[];
		versions?: { node?: string };
		env?: Record<string, string | undefined>;
	};
};

function getEnv(key: string): string | undefined {
	const g = globalThis as GlobalWithExtras;
	return g.Deno?.env?.get(key) ?? g.process?.env?.[key];
}

function readNumberEnv(key: string, fallback: number): number {
	const raw = getEnv(key);
	if (!raw) return fallback;
	const n = Number(raw);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export const RUNS = readNumberEnv("BENCH_RUNS", 5);
export const ITERS = readNumberEnv("BENCH_ITERS", 1000);
export const BATCH = readNumberEnv("BENCH_BATCH", 20);
export const WARMUP = readNumberEnv("BENCH_WARMUP", 100);

function maybeGc() {
	const g = (globalThis as GlobalWithExtras).gc;
	if (typeof g === "function") g();
}

export function bench(name: string, fn: () => void) {
	// Warmup
	for (let i = 0; i < WARMUP; i++) fn();

	const runTimes: number[] = [];
	for (let r = 0; r < RUNS; r++) {
		maybeGc();
		const start = performance.now();
		for (let i = 0; i < ITERS; i++) {
			for (let b = 0; b < BATCH; b++) fn();
		}
		const end = performance.now();
		const perIter = (end - start) / (ITERS * BATCH);
		runTimes.push(perIter);
	}

	runTimes.sort((a, b) => a - b);
	const p50 = runTimes[Math.floor(runTimes.length * 0.5)] || 0;
	const p95 = runTimes[Math.floor(runTimes.length * 0.95)] || 0;
	const avg = runTimes.reduce((a, b) => a + b, 0) / runTimes.length;

	console.log(`${name}:`);
	console.log(`  p50: ${p50.toFixed(3)}ms`);
	console.log(`  p95: ${p95.toFixed(3)}ms`);
	console.log(`  avg: ${avg.toFixed(3)}ms`);
}

async function runBenchmarks() {
	console.log("Running qr-core benchmarks...\n");

	const smallPayload = "HELLO WORLD";
	bench("Small Payload (auto version/mask, ecc M)", () => {
		encode(smallPayload, { ecc: "M" });
	});

	const mediumPayload = `https://example.com/search?q=${"A".repeat(480)}`;
	bench("Medium Payload (~500 bytes, auto version/mask, ecc M)", () => {
		encode(mediumPayload, { ecc: "M" });
	});

	const largePayload = "A".repeat(3000);
	// Version 40-L holds 3181 data codewords; 3000 bytes fits.
	bench("Large Payload (3000 bytes, auto version/mask, ecc L)", () => {
		encode(largePayload, { ecc: "L" });
	});
}

const isMain = await (async () => {
	const g = globalThis as GlobalWithExtras;
	if (typeof g.Deno?.mainModule === "string") {
		return g.Deno.mainModule === import.meta.url;
	}
	const meta = import.meta as ImportMeta & { main?: boolean };
	if (typeof meta.main === "boolean") {
		// Bun supports import.meta.main
		return meta.main;
	}
	const proc = g.process;
	if (proc?.argv?.[1] && proc?.versions?.node) {
		const { pathToFileURL } = await import("node:url");
		return pathToFileURL(proc.argv[1]).href === import.meta.url;
	}
	return false;
})();

if (isMain) {
	runBenchmarks();
}
