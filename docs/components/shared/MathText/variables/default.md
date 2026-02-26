[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [components/shared/MathText](../README.md) / default

# Variable: default

> `const` **default**: `React.FC`\<[`MathProps`](../interfaces/MathProps.md)\>

Defined in: [src/components/shared/MathText.tsx:67](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/shared/MathText.tsx#L67)

Renders a LaTeX math expression using KaTeX.

Converts LaTeX math strings to rendered HTML using the KaTeX library,
with support for both inline and display (block) rendering modes.
Errors in LaTeX expressions are gracefully handled.

## Param

The component props

## Examples

```ts
// Inline math expression
<MathText>a^n \\bmod m</MathText>
```

```ts
// Display mode (centered block)
<MathText block>a^n \\equiv {result} \\pmod{m}</MathText>
```

```ts
// With custom styling
<MathText className="text-lg text-purple-400">2^{23}</MathText>
```

```ts
// Truncate long integers at 8 digits
<MathText truncate={8}>{`${bigNumber}`}</MathText>
```

```ts
// Disable truncation
<MathText truncate={false}>{`${bigNumber}`}</MathText>
```
