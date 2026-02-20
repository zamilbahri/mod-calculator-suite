import React, { useState } from 'react';
import MathText from '../shared/MathText';
import CopyableCodeBlock from '../shared/CopyableCodeBlock';
import {
  errorBoxClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import { extendedGCD, parseBigIntStrict } from '../../utils/numberTheory';

const GCDCalculator: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [g, setG] = useState<string>('');
  const [x, setX] = useState<string>('');
  const [y, setY] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [working, setWorking] = useState(false);
  const [computed, setComputed] = useState(false);

  const compute = async () => {
    setError('');
    setG('');
    setX('');
    setY('');
    setComputed(false);
    setWorking(true);
    try {
      await new Promise((r) => setTimeout(r, 0));
      const A = parseBigIntStrict(a, 'a');
      const B = parseBigIntStrict(b, 'b');
      const res = extendedGCD(A, B);
      setG(res.gcd.toString());
      setX(res.x.toString());
      setY(res.y.toString());
      setComputed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    } finally {
      setWorking(false);
    }
  };

  const clear = () => {
    setA('');
    setB('');
    setG('');
    setX('');
    setY('');
    setError('');
    setComputed(false);
  };

  const hasResult = computed && g !== '' && x !== '' && y !== '';

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <MathText>a</MathText>
          </label>
          <input
            value={a}
            onChange={(e) => {
              setA(e.target.value);
              setComputed(false);
            }}
            placeholder="Digits only"
            className={inputClass}
            inputMode="numeric"
            spellCheck={false}
          />
        </div>
        <div>
          <label className={labelClass}>
            <MathText>b</MathText>
          </label>
          <input
            value={b}
            onChange={(e) => {
              setB(e.target.value);
              setComputed(false);
            }}
            placeholder="Digits only"
            className={inputClass}
            inputMode="numeric"
            spellCheck={false}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Computing…' : 'Compute GCD'}
        </button>
        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>
      {error ? <div className={errorBoxClass}>{error}</div> : null}
      {hasResult ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <div className="text-sm text-gray-300">
              <MathText
                block
              >{`\\gcd(${a.trim()}, ${b.trim()}) = ${g}`}</MathText>
            </div>
            <div className="mt-3 text-sm text-gray-300">
              <MathText block>
                {`${a}\\cdot(${x}) + ${b}\\cdot(${y}) = ${g}`}
              </MathText>
            </div>
          </div>
          <CopyableCodeBlock
            label={<MathText>{`\\gcd(a,b)`}</MathText>}
            value={g}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <CopyableCodeBlock
              label={
                <span>
                  <MathText>x</MathText> (coefficient for <MathText>a</MathText>
                  )
                </span>
              }
              value={x}
            />
            <CopyableCodeBlock
              label={
                <span>
                  <MathText>y</MathText> (coefficient for <MathText>b</MathText>
                  )
                </span>
              }
              value={y}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GCDCalculator;
