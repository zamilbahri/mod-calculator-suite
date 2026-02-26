[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/generatePrime](../README.md) / generatePrimes

# Function: generatePrimes()

> **generatePrimes**(`options`): `bigint`[]

Defined in: [src/utils/numberTheory/primality/generatePrime.ts:183](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/generatePrime.ts#L183)

Generates one or more primes synchronously.

## Parameters

### options

[`PrimeGenerationOptions`](../../../../../types/numberTheory/interfaces/PrimeGenerationOptions.md)

Prime generation parameters.

## Returns

`bigint`[]

Generated primes.

## Throws

If request constraints are invalid.

## Example

```ts
generatePrimes({ size: 512, sizeType: 'bits', count: 2 })
```
