[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/generatePrime](../README.md) / generatePrimesWithProgress

# Function: generatePrimesWithProgress()

> **generatePrimesWithProgress**(`options`, `onProgress?`, `onHeartbeat?`): `Promise`\<`bigint`[]\>

Defined in: [src/utils/numberTheory/primality/generatePrime.ts:222](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/generatePrime.ts#L222)

Generates one or more primes with progress and heartbeat callbacks.

Heartbeats report attempt counts while searching for each prime.

## Parameters

### options

[`PrimeGenerationOptions`](../../../../../types/numberTheory/interfaces/PrimeGenerationOptions.md)

Prime generation parameters.

### onProgress?

(`completed`, `total`, `prime`) => `void`

Called after each prime.

### onHeartbeat?

(`primeIndex`, `total`, `attempts`) => `void`

Called during attempts.

## Returns

`Promise`\<`bigint`[]\>

Generated primes.

## Throws

If request constraints are invalid.
