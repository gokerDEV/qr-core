import { encode } from "../src/index.js";

function bench(name: string, fn: () => void, iterations = 100) {
	// Warmup
	for (let i = 0; i < 10; i++) fn();

	const times: number[] = [];
	for (let i = 0; i < iterations; i++) {
		const start = performance.now();
		fn();
		const end = performance.now();
		times.push(end - start);
	}

	times.sort((a, b) => a - b);
	const p50 = times[Math.floor(times.length * 0.5)] || 0;
	const p95 = times[Math.floor(times.length * 0.95)] || 0;
	const avg = times.reduce((a, b) => a + b, 0) / times.length;

	console.log(`${name}:`);
	console.log(`  p50: ${p50.toFixed(3)}ms`);
	console.log(`  p95: ${p95.toFixed(3)}ms`);
	console.log(`  avg: ${avg.toFixed(3)}ms`);
}

async function runBenchmarks() {
	console.log("Running benchmarks...\n");

	const smallPayload = "HELLO WORLD";
	bench("Small Payload (auto version/mask, ecc M)", () => {
		encode(smallPayload, { ecc: "M" });
	});

	const mediumPayload =
		"https://example.com/search?q=" + "A".repeat(480);
	bench("Medium Payload (~500 bytes, auto version/mask, ecc M)", () => {
		encode(mediumPayload, { ecc: "M" });
	});

	const largePayload = "A".repeat(3000);
	// Version 40-L holds 3181 data codewords; 3000 bytes fits.
	bench("Large Payload (3000 bytes, auto version/mask, ecc L)", () => {
		encode(largePayload, { ecc: "L" });
	});
}

runBenchmarks();
