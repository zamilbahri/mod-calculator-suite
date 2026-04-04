import React, { useState } from 'react';
import GFPolynomialInput from '../shared/GFPolynomialInput';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  gfAdd,
  gfMul,
  gfDivide,
  gfMod,
  parseGFPoly,
  toLatex,
  toCoeffString,
} from '../../utils/numberTheory/gf';

type Operation = 'add' | 'mul' | 'div';

const GFPolynomialArithmetic: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [mod, setMod] = useState('');
  const [op, setOp] = useState<Operation>('add');
  const [result, setResult] = useState<{
    res?: number[];
    quotient?: number[];
    remainder?: number[];
  } | null>(null);
  const [error, setError] = useState('');

  const compute = () => {
    setError('');
    setResult(null);
    try {
      const polyA = parseGFPoly(a);
      const polyB = parseGFPoly(b);

      if (op === 'add') {
        const polyMod = mod ? parseGFPoly(mod) : undefined;
        let res = gfAdd(polyA, polyB);
        if (polyMod) res = gfMod(res, polyMod);
        setResult({ res });
      } else if (op === 'mul') {
        const polyMod = mod ? parseGFPoly(mod) : undefined;
        const res = gfMul(polyA, polyB, polyMod);
        setResult({ res });
      } else if (op === 'div') {
        const { quotient, remainder } = gfDivide(polyA, polyB);
        setResult({ quotient, remainder });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    }
  };

  const clear = () => {
    setA('');
    setB('');
    setMod('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <GFPolynomialInput
          label={<MathText>A(x)</MathText>}
          value={a}
          onChange={(val) => {
            setA(val);
            setResult(null);
          }}
          onEnter={compute}
        />
        <GFPolynomialInput
          label={<MathText>B(x)</MathText>}
          value={b}
          onChange={(val) => {
            setB(val);
            setResult(null);
          }}
          onEnter={compute}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-md text-purple-300 mb-2">
            Operation
          </label>
          <select
            value={op}
            onChange={(e) => {
              setOp(e.target.value as Operation);
              setResult(null);
            }}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-purple-500/60"
          >
            <option value="add">Addition (A + B)</option>
            <option value="mul">Multiplication (A * B)</option>
            <option value="div">Division (A / B)</option>
          </select>
        </div>

        {(op === 'add' || op === 'mul') && (
          <GFPolynomialInput
            label={
              <span>
                Modulus <MathText>P(x)</MathText> (optional)
              </span>
            }
            value={mod}
            onChange={(val) => {
              setMod(val);
              setResult(null);
            }}
            onEnter={compute}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={compute} className={primaryButtonClass}>
          Compute
        </button>
        <button onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>

      {error && <div className={errorBoxClass}>{error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          {result.res !== undefined && (
            <div>
              <div className="mb-2 text-lg text-white text-center">
                <MathText>{toLatex(result.res)}</MathText>
              </div>
              <NumericOutput label="Result" value={toCoeffString(result.res)} />
            </div>
          )}
          {result.quotient !== undefined && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-lg text-white text-center">
                  <MathText>{toLatex(result.quotient)}</MathText>
                </div>
                <NumericOutput label="Quotient Q(x)" value={toCoeffString(result.quotient)} />
              </div>
              <div>
                <div className="mb-2 text-lg text-white text-center">
                  <MathText>{toLatex(result.remainder!)}</MathText>
                </div>
                <NumericOutput label="Remainder R(x)" value={toCoeffString(result.remainder!)} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GFPolynomialArithmetic;
