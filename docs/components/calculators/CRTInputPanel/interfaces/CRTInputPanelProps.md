[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [components/calculators/CRTInputPanel](../README.md) / CRTInputPanelProps

# Interface: CRTInputPanelProps

Defined in: [src/components/calculators/CRTInputPanel.tsx:18](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L18)

## Properties

### equations

> **equations**: [`CRTEquationDraft`](../../../../types/numberTheory/interfaces/CRTEquationDraft.md)[]

Defined in: [src/components/calculators/CRTInputPanel.tsx:19](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L19)

***

### isCoprime

> **isCoprime**: `boolean` \| `null`

Defined in: [src/components/calculators/CRTInputPanel.tsx:27](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L27)

***

### liveErrors

> **liveErrors**: [`MathValidationError`](../../../../utils/numberTheory/validation/classes/MathValidationError.md)[]

Defined in: [src/components/calculators/CRTInputPanel.tsx:26](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L26)

***

### onAdd()

> **onAdd**: () => `void`

Defined in: [src/components/calculators/CRTInputPanel.tsx:21](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L21)

#### Returns

`void`

***

### onChange()

> **onChange**: (`index`, `field`, `value`) => `void`

Defined in: [src/components/calculators/CRTInputPanel.tsx:20](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L20)

#### Parameters

##### index

`number`

##### field

`"m"` | `"a"`

##### value

`string`

#### Returns

`void`

***

### onClear()

> **onClear**: () => `void`

Defined in: [src/components/calculators/CRTInputPanel.tsx:24](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L24)

#### Returns

`void`

***

### onEnter()?

> `optional` **onEnter**: () => `void`

Defined in: [src/components/calculators/CRTInputPanel.tsx:25](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L25)

#### Returns

`void`

***

### onRemove()

> **onRemove**: () => `void`

Defined in: [src/components/calculators/CRTInputPanel.tsx:22](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L22)

#### Returns

`void`

***

### onResetExample()

> **onResetExample**: () => `void`

Defined in: [src/components/calculators/CRTInputPanel.tsx:23](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/components/calculators/CRTInputPanel.tsx#L23)

#### Returns

`void`
