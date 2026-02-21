import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import CopyableCodeBlock from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import { modPow, parseBigIntStrict } from '../../utils/numberTheory';
import NumericInput from '../shared/NumericInput';

const BASE_URL = 'https://zamilbahri.github.io/fast-exponentiation';

function buildLearnMoreUrl(a: string, n: string, m: string): string {
  const filled = a.length > 0 && n.length > 0 && m.length > 0;

  const maxIntegerSize = 2n ** 36n;
  const tooLarge =
    BigInt(a) >= maxIntegerSize ||
    BigInt(n) >= maxIntegerSize ||
    BigInt(m) >= maxIntegerSize;

  if (!filled || tooLarge) return BASE_URL;

  // Avoid linking to m=0 since mod is undefined; keep base URL in that case.
  if (m === '0') return BASE_URL;

  const params = new URLSearchParams({ a: a, n: n, m: m });
  return `${BASE_URL}?${params.toString()}`;
}

const FastExponentiation: React.FC = () => {
  const [a, setA] = useState('');
  const [n, setN] = useState('');
  const [m, setM] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
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

      if (M < 2n) throw new Error('m must be a positive integer m > 1.');

      const rVal = modPow(A, N, M);
      setResult(rVal.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
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

          <CopyableCodeBlock
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
