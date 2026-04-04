import React, { useState } from 'react';
import GFPolynomialInput from '../shared/GFPolynomialInput';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import { gfGCD, parseGFPoly, toLatex, toCoeffString } from '../../utils/numberTheory/gf';
import type { StepLog } from '../../utils/numberTheory/gf';

const GFPolynomialGCD: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<{
    gcd: number[];
    steps: StepLog[];
  } | null>(null);
  const [error, setError] = useState('');

  const compute = () => {
    setError('');
    setResult(null);
    try {
      const polyA = parseGFPoly(a);
      const polyB = parseGFPoly(b);

      const { gcd, steps } = gfGCD(polyA, polyB);
      setResult({ gcd, steps });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    }
  };

  const clear = () => {
    setA('');
    setB('');
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

      <div className="flex items-center gap-3">
        <button onClick={compute} className={primaryButtonClass}>
          Compute GCD
        </button>
        <button onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>

      {error && <div className={errorBoxClass}>{error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          <div>
              <div className="mb-2 text-lg text-white text-center">
                <MathText>{toLatex(result.gcd)}</MathText>
              </div>
              <NumericOutput label="GCD Polynomial" value={toCoeffString(result.gcd)} />
            </div>

          <div className="mt-6">
            <h4 className="text-md font-semibold text-purple-200 mb-3">
              Euclidean Algorithm Steps
            </h4>
            <div className="space-y-2">
              {result.steps.map((step, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-gray-900/40 border border-gray-700 text-sm font-mono text-gray-300"
                >
                  <div className="flex flex-wrap gap-x-4">
                    <span>
                      Step {i + 1}: ({step.dividend}) = ({step.divisor})
                      &middot; ({step.quotient}) + ({step.remainder})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GFPolynomialGCD;
