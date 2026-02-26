[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/crt](../README.md) / solveCRT

# Function: solveCRT()

> **solveCRT**(`equations`): [`CRTSolution`](../../../../types/numberTheory/interfaces/CRTSolution.md)

Defined in: [src/utils/numberTheory/crt.ts:46](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/crt.ts#L46)

Solves a system of congruences with pairwise-coprime moduli.

## Parameters

### equations

[`CRTEquationParsed`](../../../../types/numberTheory/interfaces/CRTEquationParsed.md)[]

Parsed equations `(a, m)` representing `x ≡ a (mod m)`.

## Returns

[`CRTSolution`](../../../../types/numberTheory/interfaces/CRTSolution.md)

Canonical solution `x` with modulus product `M`.

## Throws

If no equations are provided or moduli are not pairwise coprime.

## Examples

```ts
solveCRT([
  { a: 2n, m: 3n },
  { a: 3n, m: 5n },
  { a: 2n, m: 7n },
]) // { x: 23n, M: 105n }
```

```ts
// Throws: moduli are not pairwise coprime
solveCRT([
  { a: 1n, m: 6n },
  { a: 3n, m: 9n },
])
```
