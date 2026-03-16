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
  gfInverse,
  parseGFPoly,
  prettyPrint,
} from '../../utils/numberTheory/gf';
import type { EEAStepLog } from '../../utils/numberTheory/gf';

const GFPolynomialInverse: React.FC = () => {
  const [a, setA] = useState('');
  const [mod, setMod] = useState('');
  const [result, setResult] = useState<{
    inverse: string;
    steps: EEAStepLog[];
  } | null>(null);
  const [error, setError] = useState('');

  const compute = () => {
    setError('');
    setResult(null);
    try {
      const polyA = parseGFPoly(a);
      const polyMod = parseGFPoly(mod);

      const { inverse, steps } = gfInverse(polyA, polyMod);
      setResult({
        inverse: prettyPrint(inverse),
        steps,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    }
  };

  const clear = () => {
    setA('');
    setMod('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <GFPolynomialInput
          label={<MathText>{`A(x)`}</MathText>}
          value={a}
          onChange={(val) => {
            setA(val);
            setResult(null);
          }}
          onEnter={compute}
        />
        <GFPolynomialInput
          label={
            <span>
              Modulus <MathText>{`P(x)`}</MathText>
            </span>
          }
          value={mod}
          onChange={(val) => {
            setMod(val);
            setResult(null);
          }}
          onEnter={compute}
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={compute} className={primaryButtonClass}>
          Compute Inverse
        </button>
        <button onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>

      {error && <div className={errorBoxClass}>{error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          <NumericOutput
            label={
              <span>
                <MathText>{`A(x)^{-1} \\bmod P(x)`}</MathText>
              </span>
            }
            value={result.inverse}
          />

          <div className="mt-6">
            <h4 className="text-md font-semibold text-purple-200 mb-3">
              Extended Euclidean Algorithm Steps
            </h4>
            <div className="space-y-2">
              {result.steps.map((step, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-gray-900/40 border border-gray-700 text-sm font-mono text-gray-300"
                >
                  <div className="space-y-1">
                    <div>
                      Step {i + 1}: ({step.dividend}) = ({step.divisor})
                      &middot; ({step.quotient}) + ({step.remainder})
                    </div>
                    <div className="text-purple-300/80">
                      S: ({step.sOld}) &oplus; (({step.quotient}) &middot;
                      (current_S)) &rarr; ({step.sNew})
                    </div>
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

export default GFPolynomialInverse;
