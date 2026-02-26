[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/core](../README.md) / modPow

# Function: modPow()

> **modPow**(`a`, `n`, `m`): `bigint`

Defined in: [src/utils/numberTheory/core.ts:96](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/core.ts#L96)

Computes modular exponentiation using square-and-multiply.

## Parameters

### a

`bigint`

Base.

### n

`bigint`

Exponent (must be non-negative).

### m

`bigint`

Modulus (must be positive).

## Returns

`bigint`

`a^n mod m`.

## Throws

If `n < 0` or `m <= 0`.

## Example

```ts
modPow(7n, 128n, 13n) // 3n
```
