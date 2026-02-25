import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import NumericInput from '../shared/NumericInput';
import NumericOutput from '../shared/NumericOutput';
import MathText from '../shared/MathText';
import {
  errorBoxClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  gcd,
  modInverse,
  modPow,
  parseBigIntStrict,
  primalityCheck,
} from '../../utils/numberTheory';
import { PRIMES_LESS_THAN_1K } from '../../utils/numberTheory/primality/constants';

type RsaDecryptRequest = {
  type: 'recover';
  jobId: number;
  workerId: 'balanced' | 'low';
  n: string;
  start: string;
  endExclusive?: string;
  e?: string;
};

type RsaDecryptCompletedMessage = {
  type: 'completed';
  jobId: number;
  workerId: 'balanced' | 'low';
  p: string;
  q: string;
  phi: string;
  d: string;
};

type RsaDecryptHeartbeatMessage = {
  type: 'heartbeat';
  jobId: number;
  workerId: 'balanced' | 'low';
  attempts: number;
};

type RsaDecryptNotFoundMessage = {
  type: 'not_found';
  jobId: number;
  workerId: 'balanced' | 'low';
};

type RsaDecryptErrorMessage = {
  type: 'error';
  jobId: number;
  workerId: 'balanced' | 'low';
  message: string;
};

type RsaDecryptResponse =
  | RsaDecryptHeartbeatMessage
  | RsaDecryptCompletedMessage
  | RsaDecryptNotFoundMessage
  | RsaDecryptErrorMessage;

type AlphabetEncoding = {
  radix: bigint;
  normalizeChar: (ch: string) => string;
  charToValue: Map<string, bigint>;
  valueToChar: Map<bigint, string>;
};

type ComputedKeySnapshot = {
  p: string;
  q: string;
  n: string;
  phi: string;
  d: string;
};
type FactorCheckVerdict = 'Prime' | 'Probably Prime' | 'Composite';

type Mode = 'encrypt' | 'decrypt';
type EncodingMode = 'fixed-width' | 'radix';
type RecoverWorkerId = 'balanced' | 'low';
type PrimeSizeType = 'bits' | 'digits';

type PrimeGenerateRequest = {
  type: 'generate';
  jobId: number;
  options: {
    size: number;
    sizeType: PrimeSizeType;
    count: number;
  };
};

type PrimeGenerateCompletedMessage = {
  type: 'completed';
  jobId: number;
  elapsedMs: number;
  primes: string[];
};

type PrimeGenerateErrorMessage = {
  type: 'error';
  jobId: number;
  message: string;
};

type PrimeGenerateResponse =
  | PrimeGenerateCompletedMessage
  | PrimeGenerateErrorMessage;

const MAX_RECOVERY_MODULUS_BITS = 72;
const MAX_RECOVERY_MODULUS = 1n << BigInt(MAX_RECOVERY_MODULUS_BITS);
const MAX_RSA_PRIME_BITS = 2048;
const MAX_RSA_PRIME_DIGITS = 617;
const MAX_RSA_PRIME_GEN_THREADS = 2;
const DEFAULT_E = '65537';
const DEFAULT_CUSTOM_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WHEEL_PRECHECK_PRIMES = [2n, 3n, 5n, 7n, 11n] as const;
const QUICK_PRECHECK_PRIMES = PRIMES_LESS_THAN_1K.slice(5);

const createRsaDecryptWorker = (): Worker =>
  new Worker(new URL('../../workers/rsaDecrypt.worker.ts', import.meta.url), {
    type: 'module',
  });
const createPrimeGeneratorWorker = (): Worker =>
  new Worker(
    new URL('../../workers/primeGenerator.worker.ts', import.meta.url),
    {
      type: 'module',
    },
  );

const isAsciiOnly = (value: string): boolean => {
  for (let i = 0; i < value.length; i += 1) {
    if (value.charCodeAt(i) > 127) return false;
  }
  return true;
};

const getDefaultBlockSize = (n: bigint, radix: bigint): number => {
  if (n <= 1n || radix <= 1n) return 1;
  let k = 1;
  let value = radix;
  while (value * radix < n) {
    value *= radix;
    k += 1;
  }
  return k;
};

const getSymbolWidth = (values: Iterable<bigint>): number => {
  let maxValue = 0n;
  for (const value of values) {
    if (value > maxValue) maxValue = value;
  }
  return maxValue.toString().length;
};

const integerSqrt = (n: bigint): bigint => {
  if (n < 0n) throw new Error('Square root is undefined for negative values.');
  if (n < 2n) return n;

  let x = 1n << BigInt((n.toString(2).length + 1) >> 1);
  while (true) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
};

const RSAEncryptor: React.FC = () => {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [encodingMode, setEncodingMode] = useState<EncodingMode>('fixed-width');
  const [pInput, setPInput] = useState('');
  const [qInput, setQInput] = useState('');
  const [eInput, setEInput] = useState(DEFAULT_E);
  const [nInput, setNInput] = useState('');
  const [primeGenSize, setPrimeGenSize] = useState('');
  const [primeGenSizeType, setPrimeGenSizeType] =
    useState<PrimeSizeType>('bits');
  const [primeGenWorking, setPrimeGenWorking] = useState(false);
  const [phiValue, setPhiValue] = useState('');
  const [dValue, setDValue] = useState('');
  const [computedKeySnapshot, setComputedKeySnapshot] =
    useState<ComputedKeySnapshot | null>(null);
  const [alphabetMode, setAlphabetMode] = useState<'ascii' | 'custom'>('ascii');
  const [customAlphabet, setCustomAlphabet] = useState(DEFAULT_CUSTOM_ALPHABET);
  const [customIgnoreCase, setCustomIgnoreCase] = useState(true);
  const [customOffset, setCustomOffset] = useState('0');
  const [blockSizeInput, setBlockSizeInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [encryptOutput, setEncryptOutput] = useState('');
  const [decryptOutput, setDecryptOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [computeWorking, setComputeWorking] = useState(false);
  const [recoverWorking, setRecoverWorking] = useState(false);
  const [primeFactorsFound, setPrimeFactorsFound] = useState(false);
  const [showRecoveredFactors, setShowRecoveredFactors] = useState(false);
  const [recoverElapsedMs, setRecoverElapsedMs] = useState<number | null>(null);
  const [recoverAttemptCounts, setRecoverAttemptCounts] = useState<{
    balanced: number;
    low: number;
  }>({ balanced: 0, low: 0 });
  const [recoverLiveElapsedMs, setRecoverLiveElapsedMs] = useState(0);
  const [pFactorCheck, setPFactorCheck] = useState<FactorCheckVerdict | null>(
    null,
  );
  const [qFactorCheck, setQFactorCheck] = useState<FactorCheckVerdict | null>(
    null,
  );

  const recoverWorkersRef = useRef<Worker[]>([]);
  const recoverJobIdRef = useRef(0);
  const recoverStartedAtRef = useRef(0);
  const primeGenWorkersRef = useRef<Worker[]>([]);
  const primeGenJobIdRef = useRef(0);
  const primeGenRunIdRef = useRef(0);
  const primeGenWorkerJobIdRef = useRef(new Map<Worker, number>());

  const terminateRecoverWorkers = () => {
    for (const worker of recoverWorkersRef.current) worker.terminate();
    recoverWorkersRef.current = [];
  };
  const terminatePrimeGenWorkers = () => {
    primeGenRunIdRef.current += 1;
    for (const worker of primeGenWorkersRef.current) worker.terminate();
    primeGenWorkersRef.current = [];
    primeGenWorkerJobIdRef.current.clear();
  };

  useEffect(() => {
    return () => {
      terminateRecoverWorkers();
      terminatePrimeGenWorkers();
    };
  }, []);

  useEffect(() => {
    if (!recoverWorking) {
      setRecoverLiveElapsedMs(0);
      return;
    }

    const timer = window.setInterval(() => {
      if (recoverStartedAtRef.current <= 0) return;
      setRecoverLiveElapsedMs(performance.now() - recoverStartedAtRef.current);
    }, 100);

    return () => window.clearInterval(timer);
  }, [recoverWorking]);

  useEffect(() => {
    setPFactorCheck(null);
    setQFactorCheck(null);
  }, [computedKeySnapshot]);

  const hasPAndQ = pInput.trim() !== '' && qInput.trim() !== '';
  const primeGenSizeValue = useMemo(
    () => Number.parseInt(primeGenSize, 10),
    [primeGenSize],
  );
  const primeGenMaxForType =
    primeGenSizeType === 'bits' ? MAX_RSA_PRIME_BITS : MAX_RSA_PRIME_DIGITS;

  const checkRecoveredFactor = (factor: 'p' | 'q') => {
    if (!computedKeySnapshot) return;
    try {
      const value =
        factor === 'p' ? computedKeySnapshot.p : computedKeySnapshot.q;
      const verdict = primalityCheck(BigInt(value))
        .verdict as FactorCheckVerdict;
      if (factor === 'p') setPFactorCheck(verdict);
      else setQFactorCheck(verdict);
    } catch {
      if (factor === 'p') setPFactorCheck(null);
      else setQFactorCheck(null);
    }
  };

  const buildAlphabetEncoding = useCallback((): AlphabetEncoding => {
    const charToValue = new Map<string, bigint>();
    const valueToChar = new Map<bigint, string>();

    if (alphabetMode === 'ascii') {
      for (let i = 0; i < 128; i += 1) {
        const ch = String.fromCharCode(i);
        const v = BigInt(i);
        charToValue.set(ch, v);
        valueToChar.set(v, ch);
      }
      return {
        radix: 128n,
        normalizeChar: (ch: string) => ch,
        charToValue,
        valueToChar,
      };
    }

    if (customAlphabet === '')
      throw new Error('Custom alphabet cannot be empty.');
    if (!isAsciiOnly(customAlphabet)) {
      throw new Error('Custom alphabet must use ASCII characters only.');
    }

    const offset = parseBigIntStrict(
      customOffset.trim() === '' ? '0' : customOffset,
      'alphabet offset',
    );
    const source = customIgnoreCase
      ? customAlphabet.toUpperCase()
      : customAlphabet;

    for (let i = 0; i < source.length; i += 1) {
      const ch = source[i];
      if (charToValue.has(ch)) {
        throw new Error('Custom alphabet cannot contain duplicate characters.');
      }
      const value = offset + BigInt(i);
      charToValue.set(ch, value);
      valueToChar.set(value, ch);
    }

    return {
      radix: offset + BigInt(source.length),
      normalizeChar: (ch: string) => (customIgnoreCase ? ch.toUpperCase() : ch),
      charToValue,
      valueToChar,
    };
  }, [alphabetMode, customAlphabet, customIgnoreCase, customOffset]);

  const defaultBlockSize = useMemo(() => {
    try {
      const encoding = buildAlphabetEncoding();
      const n = nInput.trim() === '' ? null : BigInt(nInput);
      if (n === null || n <= 1n) return 1;
      return getDefaultBlockSize(n, encoding.radix);
    } catch {
      return 1;
    }
  }, [buildAlphabetEncoding, nInput]);

  const computeKeyDetails = async () => {
    setError(null);
    setComputeWorking(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const p = parseBigIntStrict(pInput, 'p');
      const q = parseBigIntStrict(qInput, 'q');
      if (
        !primalityCheck(p).isProbablePrime ||
        !primalityCheck(q).isProbablePrime
      ) {
        throw new Error('p and q must be prime.');
      }
      const n = p * q;
      const phi = (p - 1n) * (q - 1n);
      setNInput(n.toString());
      setPhiValue(phi.toString());

      if (eInput.trim() === '') {
        const defaultEs = [65537n, 257n, 17n, 3n];
        const selectedE = defaultEs.find(
          (candidate) =>
            candidate > 1n && candidate < phi && gcd(candidate, phi) === 1n,
        );
        if (!selectedE) {
          const hint = 'Enter e coprime to ϕ and e < n';
          setDValue(hint);
          setComputedKeySnapshot({
            p: p.toString(),
            q: q.toString(),
            n: n.toString(),
            phi: phi.toString(),
            d: hint,
          });
          setShowRecoveredFactors(false);
          return;
        }

        setEInput(selectedE.toString());
        const autoD = modInverse(selectedE, phi).toString();
        setDValue(autoD);
        setComputedKeySnapshot({
          p: p.toString(),
          q: q.toString(),
          n: n.toString(),
          phi: phi.toString(),
          d: autoD,
        });
        setShowRecoveredFactors(false);
        return;
      }

      const e = parseBigIntStrict(eInput, 'e');
      if (e <= 1n || e >= phi || gcd(e, phi) !== 1n) {
        const hint = 'Enter e coprime to ϕ and e < n';
        setDValue(hint);
        setComputedKeySnapshot({
          p: p.toString(),
          q: q.toString(),
          n: n.toString(),
          phi: phi.toString(),
          d: hint,
        });
        setShowRecoveredFactors(false);
        return;
      }

      const d = modInverse(e, phi);
      const dText = d.toString();
      setDValue(dText);
      setComputedKeySnapshot({
        p: p.toString(),
        q: q.toString(),
        n: n.toString(),
        phi: phi.toString(),
        d: dText,
      });
      setShowRecoveredFactors(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to compute key values.',
      );
    } finally {
      setComputeWorking(false);
    }
  };

  const encrypt = async () => {
    if (mode !== 'encrypt') return;
    if (messageInput === '') return;

    setError(null);
    setWorking(true);
    setEncryptOutput('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (!isAsciiOnly(messageInput)) {
        throw new Error('Text to encrypt must contain ASCII characters only.');
      }

      const e = parseBigIntStrict(eInput, 'e');
      const n = parseBigIntStrict(nInput, 'n');
      if (e <= 1n || n <= 1n)
        throw new Error('e and n must both be greater than 1.');
      if (e >= n) throw new Error('e must be smaller than n.');

      const encoding = buildAlphabetEncoding();
      const symbolWidth = getSymbolWidth(encoding.valueToChar.keys());
      const blockSize =
        blockSizeInput.trim() === ''
          ? defaultBlockSize
          : Number.parseInt(blockSizeInput, 10);
      if (!Number.isInteger(blockSize) || blockSize < 1) {
        throw new Error('Block size must be a positive integer.');
      }

      const symbols: bigint[] = [];
      for (const rawChar of messageInput) {
        const ch = encoding.normalizeChar(rawChar);
        const symbol = encoding.charToValue.get(ch);
        if (symbol === undefined) {
          throw new Error(
            `Character "${rawChar}" is not present in the selected alphabet.`,
          );
        }
        symbols.push(symbol);
      }

      const blocks: string[] = [];
      for (let i = 0; i < symbols.length; i += blockSize) {
        const chunk = symbols.slice(i, i + blockSize);
        let m = 0n;
        if (encodingMode === 'fixed-width') {
          const packed = chunk
            .map((symbol) => symbol.toString().padStart(symbolWidth, '0'))
            .join('');
          m = BigInt(packed);
        } else {
          for (const symbol of chunk) {
            m = m * encoding.radix + symbol;
          }
        }
        if (m >= n)
          throw new Error(
            'A plaintext block is >= n. Reduce block size or increase n.',
          );
        blocks.push(modPow(m, e, n).toString());
      }

      setEncryptOutput(blocks.join(' '));
      setDecryptOutput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Encryption failed.');
    } finally {
      setWorking(false);
    }
  };

  const decrypt = async () => {
    if (mode !== 'decrypt') return;

    setError(null);
    setWorking(true);
    setDecryptOutput('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (messageInput.trim() === '') {
        throw new Error('Encrypted text cannot be empty.');
      }
      if (
        dValue.trim() === '' ||
        phiValue.trim() === '' ||
        !/^\d+$/.test(dValue)
      ) {
        throw new Error(
          'Compute d first (requires p, q, and e coprime to phi).',
        );
      }

      const d = parseBigIntStrict(dValue, 'd');
      const n = parseBigIntStrict(nInput, 'n');
      const encoding = buildAlphabetEncoding();
      const symbolWidth = getSymbolWidth(encoding.valueToChar.keys());
      const blockSize =
        blockSizeInput.trim() === ''
          ? defaultBlockSize
          : Number.parseInt(blockSizeInput, 10);
      if (!Number.isInteger(blockSize) || blockSize < 1) {
        throw new Error('Block size must be a positive integer.');
      }

      const tokens = messageInput.trim().split(/\s+/);
      let text = '';

      for (let i = 0; i < tokens.length; i += 1) {
        const c = parseBigIntStrict(tokens[i], 'ciphertext block');
        const m = modPow(c, d, n);
        const decoded: string[] = [];

        if (encodingMode === 'fixed-width') {
          const digits = m.toString().padStart(blockSize * symbolWidth, '0');
          for (let j = 0; j < digits.length; j += symbolWidth) {
            const symbolStr = digits.slice(j, j + symbolWidth);
            const symbol = BigInt(symbolStr);
            const ch = encoding.valueToChar.get(symbol);
            if (ch === undefined) {
              throw new Error(
                'Cannot map decrypted symbol back to the selected alphabet.',
              );
            }
            decoded.push(ch);
          }
        } else {
          let value = m;
          for (let j = 0; j < blockSize; j += 1) {
            const symbol = value % encoding.radix;
            value /= encoding.radix;
            const ch = encoding.valueToChar.get(symbol);
            if (ch === undefined) {
              throw new Error(
                'Cannot map decrypted symbol back to the selected alphabet.',
              );
            }
            decoded.push(ch);
          }
          decoded.reverse();
          if (i === tokens.length - 1) {
            while (decoded.length > 0 && decoded[0] === '\u0000')
              decoded.shift();
          }
        }

        text += decoded.join('');
      }

      setDecryptOutput(text);
      setEncryptOutput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decryption failed.');
    } finally {
      setWorking(false);
    }
  };

  const tryGetRecoverInputs = (): { n: bigint; e?: bigint } | null => {
    try {
      const n = parseBigIntStrict(nInput, 'n');
      if (n <= 1n) return null;

      if (eInput.trim() === '') return { n };

      const e = parseBigIntStrict(eInput, 'e');
      if (e <= 1n || e >= n) return { n };
      return { n, e };
    } catch {
      return null;
    }
  };

  const recoverInputs = tryGetRecoverInputs();
  const canRecoverPrimes =
    mode === 'decrypt' &&
    recoverInputs !== null &&
    recoverInputs.n < MAX_RECOVERY_MODULUS &&
    !recoverWorking &&
    !computeWorking &&
    !primeGenWorking &&
    !working;
  const canStopRecovery = recoverWorking && recoverLiveElapsedMs >= 1000;

  const stopRecovery = () => {
    if (!recoverWorking) return;
    terminateRecoverWorkers();
    recoverStartedAtRef.current = 0;
    setRecoverWorking(false);
    setError('Prime recovery stopped.');
  };

  const recoverPrimes = () => {
    if (!recoverInputs) {
      setError('Enter a valid modulus n first.');
      return;
    }
    const startedAt = performance.now();
    const n = recoverInputs.n;
    const sqrtN = integerSqrt(n);
    const trialUpperExclusive = sqrtN + 1n;

    const commitRecoveredFactors = (p: bigint, q: bigint, n: bigint) => {
      const phi = (p - 1n) * (q - 1n);
      let nextD = 'Enter e coprime to ϕ and e < n';
      if (recoverInputs.e !== undefined) {
        const e = recoverInputs.e;
        if (e > 1n && e < phi && gcd(e, phi) === 1n) {
          nextD = modInverse(e, phi).toString();
        }
      }

      setPInput(p.toString());
      setQInput(q.toString());
      setPhiValue(phi.toString());
      setDValue(nextD);
      setComputedKeySnapshot({
        p: p.toString(),
        q: q.toString(),
        n: n.toString(),
        phi: phi.toString(),
        d: nextD,
      });
      setShowRecoveredFactors(true);
      setRecoverAttemptCounts({ balanced: 0, low: 0 });
      setPrimeFactorsFound(true);
      setRecoverElapsedMs(performance.now() - startedAt);
    };

    const runRecoveryPrechecks = (): { p: bigint; q: bigint } | null => {
      for (const candidate of WHEEL_PRECHECK_PRIMES) {
        if (n % candidate === 0n) {
          const otherFactor = n / candidate;
          if (otherFactor > 1n) return { p: candidate, q: otherFactor };
        }
      }

      for (const candidate of QUICK_PRECHECK_PRIMES) {
        if (candidate > sqrtN) break;
        if (n % candidate === 0n) {
          const otherFactor = n / candidate;
          if (otherFactor > 1n) return { p: candidate, q: otherFactor };
        }
      }

      if (sqrtN > 1n && sqrtN * sqrtN === n) return { p: sqrtN, q: sqrtN };

      if (pInput.trim() !== '') {
        try {
          const p = parseBigIntStrict(pInput, 'p');
          if (p > 1n && n % p === 0n) {
            const q = n / p;
            if (q > 1n) return { p, q };
          }
        } catch {
          // Continue prechecks.
        }
      }

      if (qInput.trim() !== '') {
        try {
          const q = parseBigIntStrict(qInput, 'q');
          if (q > 1n && n % q === 0n) {
            const p = n / q;
            if (p > 1n) return { p, q };
          }
        } catch {
          // Continue prechecks.
        }
      }

      if (pInput.trim() !== '' && qInput.trim() !== '') {
        try {
          const p = parseBigIntStrict(pInput, 'p');
          const q = parseBigIntStrict(qInput, 'q');
          if (p * q === n) return { p, q };
        } catch {
          // Continue to worker search.
        }
      }

      return null;
    };

    const prechecked = runRecoveryPrechecks();
    if (prechecked) {
      commitRecoveredFactors(prechecked.p, prechecked.q, n);
      return;
    }

    const bitLen = n.toString(2).length;
    const balancedStartRaw =
      1n << BigInt(Math.max(0, Math.floor(bitLen / 2) - 1));
    const balancedStart = balancedStartRaw > 7n ? balancedStartRaw : 7n;
    const lowRangeEndExclusive =
      balancedStart < trialUpperExclusive ? balancedStart : trialUpperExclusive;

    const ranges: Array<{
      workerId: RecoverWorkerId;
      start: bigint;
      endExclusive?: bigint;
    }> = [];
    if (balancedStart < trialUpperExclusive) {
      ranges.push({
        workerId: 'balanced',
        start: balancedStart,
        endExclusive: trialUpperExclusive,
      });
    }
    if (lowRangeEndExclusive > 7n) {
      ranges.push({
        workerId: 'low',
        start: 7n,
        endExclusive: lowRangeEndExclusive,
      });
    }

    if (ranges.length === 0) {
      setError('Failed to factor n. Use a semiprime modulus.');
      return;
    }

    terminateRecoverWorkers();
    setRecoverWorking(true);
    setPrimeFactorsFound(false);
    setRecoverAttemptCounts({ balanced: 0, low: 0 });
    setError(null);
    recoverStartedAtRef.current = performance.now();

    const jobId = ++recoverJobIdRef.current;
    let resolved = false;
    let notFoundCount = 0;

    const finishWithError = (message: string) => {
      if (resolved) return;
      resolved = true;
      setRecoverWorking(false);
      recoverStartedAtRef.current = 0;
      setError(message);
      terminateRecoverWorkers();
    };

    const finishWithFactors = (msg: RsaDecryptCompletedMessage) => {
      if (resolved) return;
      resolved = true;
      setPInput(msg.p);
      setQInput(msg.q);
      setPhiValue(msg.phi);
      const nextD = msg.d !== '' ? msg.d : 'Enter e coprime to ϕ and e < n';
      setDValue(nextD);
      setComputedKeySnapshot({
        p: msg.p,
        q: msg.q,
        n: n.toString(),
        phi: msg.phi,
        d: nextD,
      });
      setShowRecoveredFactors(true);
      setPrimeFactorsFound(true);
      setRecoverElapsedMs(performance.now() - startedAt);
      setRecoverWorking(false);
      recoverStartedAtRef.current = 0;
      terminateRecoverWorkers();
    };

    for (const range of ranges) {
      const worker = createRsaDecryptWorker();
      recoverWorkersRef.current.push(worker);

      worker.onmessage = (event: MessageEvent<RsaDecryptResponse>) => {
        const msg = event.data;
        if (msg.jobId !== jobId || resolved) return;

        if (msg.type === 'heartbeat') {
          setRecoverAttemptCounts((prev) => ({
            ...prev,
            [msg.workerId]: msg.attempts,
          }));
          return;
        }

        if (msg.type === 'error') {
          finishWithError(msg.message);
          return;
        }

        if (msg.type === 'not_found') {
          notFoundCount += 1;
          if (notFoundCount >= ranges.length) {
            finishWithError('Failed to factor n. Use a semiprime modulus.');
          }
          return;
        }

        finishWithFactors(msg);
      };

      const request: RsaDecryptRequest = {
        type: 'recover',
        jobId,
        workerId: range.workerId,
        n: n.toString(),
        start: range.start.toString(),
      };
      if (range.endExclusive !== undefined) {
        request.endExclusive = range.endExclusive.toString();
      }
      if (recoverInputs.e !== undefined) {
        request.e = recoverInputs.e.toString();
      }
      worker.postMessage(request);
    }
  };

  const clearKeyInputs = () => {
    terminatePrimeGenWorkers();
    setPrimeGenWorking(false);
    setPInput('');
    setQInput('');
    setEInput(DEFAULT_E);
    setNInput('');
    setPhiValue('');
    setDValue('');
    setComputedKeySnapshot(null);
    setShowRecoveredFactors(false);
  };

  const clearTextBlocks = () => {
    setMessageInput('');
    setEncryptOutput('');
    setDecryptOutput('');
  };

  const generatePrimes = () => {
    setError(null);

    if (!Number.isInteger(primeGenSizeValue) || primeGenSizeValue <= 0) {
      setError('Prime size must be a positive integer.');
      return;
    }
    if (primeGenSizeValue > primeGenMaxForType) {
      setError(`Maximum size is ${primeGenMaxForType} ${primeGenSizeType}.`);
      return;
    }

    // Generation acts as a clear for derived key outputs.
    setNInput('');
    setPhiValue('');
    setDValue('');
    setComputedKeySnapshot(null);
    setShowRecoveredFactors(false);

    terminatePrimeGenWorkers();
    const workerCount = Math.max(
      1,
      Math.min(MAX_RSA_PRIME_GEN_THREADS, navigator.hardwareConcurrency ?? 2),
    );
    primeGenWorkersRef.current = Array.from({ length: workerCount }, () =>
      createPrimeGeneratorWorker(),
    );

    setPrimeGenWorking(true);

    primeGenRunIdRef.current += 1;
    const runId = primeGenRunIdRef.current;
    const found = new Set<string>();
    let resolved = false;

    const dispatchPrimeJob = (worker: Worker) => {
      const nextJobId = ++primeGenJobIdRef.current;
      primeGenWorkerJobIdRef.current.set(worker, nextJobId);
      const request: PrimeGenerateRequest = {
        type: 'generate',
        jobId: nextJobId,
        options: {
          size: primeGenSizeValue,
          sizeType: primeGenSizeType,
          count: 1,
        },
      };
      worker.postMessage(request);
    };

    const finishSuccess = () => {
      const [p, q] = Array.from(found);
      if (!p || !q) return;
      setPInput(p);
      setQInput(q);
      try {
        setNInput((BigInt(p) * BigInt(q)).toString());
      } catch {
        setNInput('');
      }
      setPrimeGenWorking(false);
      terminatePrimeGenWorkers();
    };

    const finishError = (message: string) => {
      if (resolved) return;
      resolved = true;
      primeGenRunIdRef.current += 1;
      setPrimeGenWorking(false);
      setError(message);
      terminatePrimeGenWorkers();
    };

    for (const worker of primeGenWorkersRef.current) {
      worker.onmessage = (event: MessageEvent<PrimeGenerateResponse>) => {
        if (resolved || primeGenRunIdRef.current !== runId) return;
        const msg = event.data;
        const expectedJobId = primeGenWorkerJobIdRef.current.get(worker);
        if (expectedJobId !== msg.jobId) return;

        if (msg.type === 'error') {
          finishError(msg.message);
          return;
        }

        const prime = msg.primes[0];
        if (prime) found.add(prime);
        if (found.size >= 2) {
          resolved = true;
          primeGenRunIdRef.current += 1;
          finishSuccess();
          return;
        }

        dispatchPrimeJob(worker);
      };

      dispatchPrimeJob(worker);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('encrypt')}
            className={
              mode === 'encrypt'
                ? primaryButtonClass
                : `${secondaryButtonClass} disabled:opacity-100`
            }
          >
            Encrypt Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('decrypt')}
            className={
              mode === 'decrypt'
                ? primaryButtonClass
                : `${secondaryButtonClass} disabled:opacity-100`
            }
          >
            Decrypt Mode
          </button>
        </div>
        <div className="ml-auto flex items-center justify-end gap-2 whitespace-nowrap">
          {primeGenWorking ? (
            <span
              aria-hidden="true"
              className="block h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-gray-300"
            />
          ) : null}
          <button
            type="button"
            onClick={generatePrimes}
            disabled={
              working || recoverWorking || computeWorking || primeGenWorking
            }
            className={primaryButtonClass}
          >
            {primeGenWorking ? 'Generating…' : 'Generate Primes'}
          </button>
          <input
            value={primeGenSize}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*$/.test(v)) setPrimeGenSize(v);
            }}
            className={`${inputClass} w-26!`}
            inputMode="numeric"
            placeholder={primeGenSizeType === 'bits' ? 'Max: 2048' : 'Max: 617'}
          />
          <select
            value={primeGenSizeType}
            onChange={(e) =>
              setPrimeGenSizeType(e.target.value as PrimeSizeType)
            }
            className={`${inputClass} h-10.5 w-20!`}
          >
            <option value="bits">bits</option>
            <option value="digits">digits</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <NumericInput
          label={
            <span>
              Prime <MathText>p</MathText>
            </span>
          }
          value={pInput}
          onChange={setPInput}
          placeholder="Prime p"
          minRows={1}
          rows={4}
        />
        <NumericInput
          label={
            <span>
              Prime <MathText>q</MathText>
            </span>
          }
          value={qInput}
          onChange={setQInput}
          placeholder="Prime q"
          minRows={1}
          rows={4}
        />
      </div>

      {mode === 'decrypt' ? (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <NumericInput
            label={
              <span>
                Public exp <MathText>e</MathText>
              </span>
            }
            value={eInput}
            onChange={setEInput}
            placeholder={DEFAULT_E}
            minRows={1}
            rows={4}
          />
          <NumericInput
            label={
              <span>
                Private exp <MathText>d</MathText>
              </span>
            }
            value={dValue}
            onChange={setDValue}
            placeholder="Private exponent d"
            minRows={1}
            rows={4}
          />
          <NumericInput
            label={
              <span>
                Modulus <MathText>n</MathText>
              </span>
            }
            value={nInput}
            onChange={setNInput}
            placeholder="Modulus n"
            minRows={1}
            rows={4}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <NumericInput
            label={
              <span>
                Public exponent <MathText>e</MathText>
              </span>
            }
            value={eInput}
            onChange={setEInput}
            placeholder={DEFAULT_E}
            minRows={1}
            rows={4}
          />
          <NumericInput
            label={
              <span>
                Modulus <MathText>n</MathText>
              </span>
            }
            value={nInput}
            onChange={setNInput}
            placeholder="Modulus n"
            minRows={1}
            rows={4}
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={computeKeyDetails}
          disabled={
            !hasPAndQ ||
            working ||
            recoverWorking ||
            primeGenWorking ||
            computeWorking
          }
          className={primaryButtonClass}
        >
          Compute
        </button>
        {mode === 'decrypt' ? (
          <>
            <button
              type="button"
              onClick={canStopRecovery ? stopRecovery : recoverPrimes}
              disabled={!canRecoverPrimes && !canStopRecovery}
              className={`${secondaryButtonClass} relative disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="invisible">Recover primes</span>
              <span className="absolute inset-0 flex items-center justify-center">
                {canStopRecovery
                  ? 'Stop'
                  : recoverWorking
                    ? 'Recovering…'
                    : 'Recover primes'}
              </span>
            </button>
            {primeFactorsFound && recoverElapsedMs !== null ? (
              <p className="text-sm text-gray-300">
                Factors found in {(recoverElapsedMs / 1000).toFixed(2)} seconds
              </p>
            ) : null}
          </>
        ) : null}
        {recoverWorking ? (
          <div className="text-sm text-gray-300">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
              Searching via trial division...
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <p>
                Worker 1: ~
                {(recoverAttemptCounts.balanced / 1_000_000).toLocaleString(
                  undefined,
                  { maximumFractionDigits: 1 },
                )}
                M checked
              </p>
              <span aria-hidden="true">•</span>
              <p>
                Worker 2: ~
                {(recoverAttemptCounts.low / 1_000_000).toLocaleString(
                  undefined,
                  { maximumFractionDigits: 1 },
                )}
                M checked
              </p>
            </div>
          </div>
        ) : computeWorking ? (
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
            Computing{' '}
            <MathText className="inline">{`n,\\varphi(n),d`}</MathText>
          </p>
        ) : null}
        <button
          type="button"
          onClick={clearKeyInputs}
          disabled={working || recoverWorking || primeGenWorking}
          className={`${secondaryButtonClass} ml-auto disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Clear keys
        </button>
      </div>
      {mode === 'decrypt' ? (
        <p className="mt-1 text-xs italic text-gray-400">
          Recover primes is only enabled for{' '}
          <MathText>{`n < 2^{${MAX_RECOVERY_MODULUS_BITS}}`}</MathText>. May
          take a few minutes for <MathText>{`n > 2^{${60}}`}</MathText>{' '}
          depending on hardware.
        </p>
      ) : null}
      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {computedKeySnapshot ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            {mode === 'decrypt' && showRecoveredFactors ? (
              <div className="space-y-1">
                <NumericOutput
                  label={
                    <span>
                      Recovered factor <MathText>p</MathText>
                    </span>
                  }
                  value={computedKeySnapshot.p}
                />
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => checkRecoveredFactor('p')}
                    className="rounded border border-gray-600 px-2 py-0.5 text-xs text-gray-200 hover:bg-gray-700"
                  >
                    Check primality
                  </button>
                  {pFactorCheck ? (
                    <p
                      className={`inline-flex items-center gap-2 text-sm font-semibold ${
                        pFactorCheck === 'Composite'
                          ? 'text-amber-300'
                          : 'text-green-300'
                      }`}
                    >
                      {pFactorCheck === 'Composite' ? null : (
                        <span aria-hidden="true">✓</span>
                      )}
                      {pFactorCheck}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {mode === 'decrypt' && showRecoveredFactors ? (
              <div className="space-y-1">
                <NumericOutput
                  label={
                    <span>
                      Recovered factor <MathText>q</MathText>
                    </span>
                  }
                  value={computedKeySnapshot.q}
                />
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => checkRecoveredFactor('q')}
                    className="rounded border border-gray-600 px-2 py-0.5 text-xs text-gray-200 hover:bg-gray-700"
                  >
                    Check primality
                  </button>
                  {qFactorCheck ? (
                    <p
                      className={`inline-flex items-center gap-2 text-sm font-semibold ${
                        qFactorCheck === 'Composite'
                          ? 'text-amber-300'
                          : 'text-green-300'
                      }`}
                    >
                      {qFactorCheck === 'Composite' ? null : (
                        <span aria-hidden="true">✓</span>
                      )}
                      {qFactorCheck}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <NumericOutput
              label={<MathText>{`\\varphi(n)`}</MathText>}
              value={computedKeySnapshot.phi}
            />
            {computedKeySnapshot.d !== '' ? (
              <NumericOutput
                label={<MathText>{`d = e^{-1} \\bmod \\varphi(n)`}</MathText>}
                value={computedKeySnapshot.d}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">Alphabet</span>
          <select
            value={alphabetMode}
            onChange={(e) =>
              setAlphabetMode(e.target.value as 'ascii' | 'custom')
            }
            className={`${inputClass} h-10.5`}
          >
            <option value="ascii">ASCII (default)</option>
            <option value="custom">Custom alphabet builder</option>
          </select>
        </label>

        {alphabetMode === 'custom' ? (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-purple-300">Custom alphabet</span>
            <input
              value={customAlphabet}
              onChange={(e) => setCustomAlphabet(e.target.value)}
              className={inputClass}
              placeholder="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            />
          </label>
        ) : (
          <div />
        )}
      </div>

      {alphabetMode === 'custom' ? (
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={customIgnoreCase}
              onChange={(e) => setCustomIgnoreCase(e.target.checked)}
            />
            Ignore case (e.g., "e" maps as "E")
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-purple-300">Alphabet offset</span>
            <input
              value={customOffset}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setCustomOffset(v);
              }}
              className={inputClass}
              inputMode="numeric"
              placeholder="0"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">
            Custom block size (symbols per block)
          </span>
          <input
            value={blockSizeInput}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*$/.test(v)) setBlockSizeInput(v);
            }}
            className={`${inputClass} h-10.5`}
            inputMode="numeric"
            placeholder={`Default: ${defaultBlockSize}`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">Encoding mode</span>
          <select
            value={encodingMode}
            onChange={(e) => setEncodingMode(e.target.value as EncodingMode)}
            className={`${inputClass} h-10.5`}
          >
            <option value="fixed-width">Fixed-width</option>
            <option value="radix">Radix packing</option>
          </select>
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-1">
        <span className="text-sm text-purple-300">
          {mode === 'encrypt'
            ? 'Text to encrypt (ASCII only)'
            : 'Encrypted text blocks (space-separated integers)'}
        </span>
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className={`${inputClass} min-h-28 resize-y`}
          placeholder={
            mode === 'encrypt' ? 'Enter plaintext' : 'Enter ciphertext blocks'
          }
          spellCheck={false}
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {mode === 'encrypt' ? (
          <button
            type="button"
            onClick={encrypt}
            disabled={working || recoverWorking || messageInput === ''}
            className={primaryButtonClass}
          >
            {working ? 'Encrypting…' : 'Encrypt'}
          </button>
        ) : (
          <button
            type="button"
            onClick={decrypt}
            disabled={working || recoverWorking}
            className={primaryButtonClass}
          >
            {working ? 'Decrypting…' : 'Decrypt'}
          </button>
        )}

        <button
          type="button"
          onClick={clearTextBlocks}
          className={secondaryButtonClass}
        >
          Clear text
        </button>
      </div>

      {mode === 'encrypt' && encryptOutput ? (
        <div className="mt-6">
          <NumericOutput
            label={<span>Encrypted Text (space-separated numeric blocks)</span>}
            value={encryptOutput}
          />
        </div>
      ) : null}

      {mode === 'decrypt' && decryptOutput ? (
        <div className="mt-6">
          <NumericOutput label="Decrypted Text" value={decryptOutput} />
        </div>
      ) : null}
    </div>
  );
};

export default RSAEncryptor;
