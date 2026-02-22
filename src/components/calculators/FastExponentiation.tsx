import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  modPow,
  parseBigIntStrict,
  isNonNegativeIntegerString,
  MathValidationError,
} from '../../utils/numberTheory';
import NumericInput from '../shared/NumericInput';
import { MathErrorView } from '../shared/MathErrorView';

const BASE_URL = 'https://zamilbahri.github.io/fast-exponentiation';
const MAX_INT_FOR_URL = 2n ** 36n;

function buildLearnMoreUrl(a: string, n: string, m: string): string {
  const A = a.trim();
  const N = n.trim();
  const M = m.trim();

  const filled = A.length > 0 && N.length > 0 && M.length > 0;
  const validDigits =
    isNonNegativeIntegerString(A) &&
    isNonNegativeIntegerString(N) &&
    isNonNegativeIntegerString(M);

  if (!filled || !validDigits) return BASE_URL;

  // Avoid linking to m=0 since mod is undefined; keep base URL in that case.
  if (M === '0') return BASE_URL;

  // Enforce a, n, m < 2^36 since demo page is for demonstrative purposes
  const Ab = BigInt(A);
  const Nb = BigInt(N);
  const Mb = BigInt(M);

  if (Ab >= MAX_INT_FOR_URL || Nb >= MAX_INT_FOR_URL || Mb >= MAX_INT_FOR_URL)
    return BASE_URL;

  const params = new URLSearchParams({ a: A, n: N, m: M });
  return `${BASE_URL}?${params.toString()}`;
}

const FastExponentiation: React.FC = () => {
  const [a, setA] = useState('');
  const [n, setN] = useState('');
  const [m, setM] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<React.ReactNode>(null);
  const [computed, setComputed] = useState(false);
  const [working, setWorking] = useState(false);

  const learnMoreUrl = useMemo(() => buildLearnMoreUrl(a, n, m), [a, n, m]);

  const compute = async () => {
    setError('');
    setResult('');
    setWorking(true);
    setComputed(true);

    try {
      // Yield so the UI can show "Computing…"
      await new Promise((r) => setTimeout(r, 0));

      const A = parseBigIntStrict(a, 'a');
      const N = parseBigIntStrict(n, 'n');
      const M = parseBigIntStrict(m, 'm');

      const rVal = modPow(A, N, M);
      setResult(rVal.toString());
    } catch (e) {
      if (e instanceof MathValidationError) {
        setError(<MathErrorView error={e} />);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to compute a^n mod m');
      }
    } finally {
      setWorking(false);
    }
  };

  const clear = () => {
    setA('');
    setN('');
    setM('');
    setResult('');
    setError('');
    setComputed(false);
  };

  const hasResult = computed && result !== '';

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <NumericInput
          label={<MathText>a</MathText>}
          value={a}
          onChange={(val) => {
            setA(val);
            setComputed(false);
          }}
          onEnter={compute}
        />

        <NumericInput
          label={<MathText>n</MathText>}
          value={n}
          onChange={(val) => {
            setN(val);
            setComputed(false);
          }}
          onEnter={compute}
        />

        <NumericInput
          label={<MathText>m</MathText>}
          value={m}
          onChange={(val) => {
            setM(val);
            setComputed(false);
          }}
          onEnter={compute}
        />
      </div>

      <div className="mt-4 flex items-center gap-3 pb-1">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Computing…' : 'Compute'}
        </button>

        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {hasResult ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <MathText block className="block text-sm text-gray-200">
              {`${a.trim()}^{${n.trim()}} \\equiv ${result} \\pmod{${m.trim()}}`}
            </MathText>
          </div>

          <NumericOutput
            label={<MathText>{`a^n \\bmod m`}</MathText>}
            value={result}
          />
        </div>
      ) : null}

      <p className="mt-2 text-xs text-gray-300">
        Learn more:{' '}
        <a
          href={learnMoreUrl}
          target="_blank"
          rel="noreferrer"
          className="text-purple-300 hover:text-purple-200 underline underline-offset-2"
        >
          detailed steps
        </a>
      </p>
    </div>
  );
};

export default FastExponentiation;
