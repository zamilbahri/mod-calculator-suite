import { performance } from 'node:perf_hooks';
import { generatePrimes } from './src/utils/numberTheory';

const t0 = performance.now();
const primes = generatePrimes({ size: 2048, sizeType: 'bits', count: 5 });
const t1 = performance.now();

console.log(`time_ms=${(t1 - t0).toFixed(2)} count=${primes.length}`);
