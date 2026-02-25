import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  RsaCiphertextFormat,
  RsaComputedKeySnapshot,
  RsaDecryptCompletedMessage,
  RsaDecryptRecoverRequest,
  RsaDecryptWorkerResponse,
  RsaEncodingMode,
  RsaFactorCheckVerdict,
  RsaMode,
  RsaPrimeSizeType,
} from '../../../types';
import {
  MAX_GENERATED_PRIME_BITS,
  MAX_GENERATED_PRIME_DIGITS,
  buildAlphabetEncoding,
  buildRsaRecoveryRanges,
  computeLambdaN,
  computeModulus,
  computePhi,
  computePrivateExponent,
  decryptRsaMessage,
  DEFAULT_CUSTOM_ALPHABET,
  DEFAULT_RSA_PUBLIC_EXPONENT,
  encryptRsaMessage,
  exportRsaKeyPairToPem,
  formatCiphertextBlocks,
  getDefaultBlockSize,
  integerSqrt,
  INVALID_RSA_EXPONENT_HINT,
  isAsciiOnly,
  isValidPublicExponentForPhi,
  parseBigIntStrict,
  primalityCheck,
  parseCiphertextInputToDecimal,
  resolveRsaBlockSize,
  runRsaRecoveryPrechecks,
  selectDefaultPublicExponent,
} from '../../../utils/numberTheory';
import type { RsaAlphabetMode } from '../../../types';
import RSAEncodingPanel from './RSAEncodingPanel';
import RSAHeaderControls from './RSAHeaderControls';
import RSAKeyPanel from './RSAKeyPanel';
import RSAKeyPairPemPanel from './RSAKeyPairPemPanel';
import RSATextPanel from './RSATextPanel';

type PrimeGenerateRequest = {
  type: 'generate';
  jobId: number;
  options: {
    size: number;
    sizeType: RsaPrimeSizeType;
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
const MAX_RSA_PRIME_GEN_THREADS = 2;

const createRsaDecryptWorker = (): Worker =>
  new Worker(new URL('../../../workers/rsaDecrypt.worker.ts', import.meta.url), {
    type: 'module',
  });

const createPrimeGeneratorWorker = (): Worker =>
  new Worker(
    new URL('../../../workers/primeGenerator.worker.ts', import.meta.url),
    {
      type: 'module',
    },
  );

const parseOptionalFactor = (value: string, field: 'p' | 'q'): bigint | null => {
  if (value.trim() === '') return null;
  try {
    return parseBigIntStrict(value, field);
  } catch {
    return null;
  }
};

const RSAEncryptorContainer: React.FC = () => {
  const [mode, setMode] = useState<RsaMode>('encrypt');
  const [encodingMode, setEncodingMode] =
    useState<RsaEncodingMode>('fixed-width-numeric');
  const [ciphertextFormat, setCiphertextFormat] =
    useState<RsaCiphertextFormat>('decimal');
  const [pInput, setPInput] = useState('');
  const [qInput, setQInput] = useState('');
  const [eInput, setEInput] = useState(DEFAULT_RSA_PUBLIC_EXPONENT);
  const [nInput, setNInput] = useState('');
  const [primeGenSize, setPrimeGenSize] = useState('');
  const [primeGenSizeType, setPrimeGenSizeType] =
    useState<RsaPrimeSizeType>('bits');
  const [primeGenWorking, setPrimeGenWorking] = useState(false);
  const [dValue, setDValue] = useState('');
  const [computedKeySnapshot, setComputedKeySnapshot] =
    useState<RsaComputedKeySnapshot | null>(null);
  const [alphabetMode, setAlphabetMode] = useState<RsaAlphabetMode>('ascii');
  const [customAlphabet, setCustomAlphabet] = useState(DEFAULT_CUSTOM_ALPHABET);
  const [customIgnoreCase, setCustomIgnoreCase] = useState(true);
  const [customOffset, setCustomOffset] = useState('0');
  const [blockSizeInput, setBlockSizeInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [encryptOutputDecimal, setEncryptOutputDecimal] = useState('');
  const [encryptOutputBase64, setEncryptOutputBase64] = useState('');
  const [decryptOutput, setDecryptOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ioError, setIoError] = useState<string | null>(null);
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
  const [pFactorCheck, setPFactorCheck] = useState<RsaFactorCheckVerdict | null>(
    null,
  );
  const [qFactorCheck, setQFactorCheck] = useState<RsaFactorCheckVerdict | null>(
    null,
  );
  const [pemWorking, setPemWorking] = useState(false);
  const [pemError, setPemError] = useState<string | null>(null);
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');

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
    primeGenSizeType === 'bits'
      ? MAX_GENERATED_PRIME_BITS
      : MAX_GENERATED_PRIME_DIGITS;

  const checkRecoveredFactor = (factor: 'p' | 'q') => {
    if (!computedKeySnapshot) return;
    try {
      const value =
        factor === 'p' ? computedKeySnapshot.p : computedKeySnapshot.q;
      const verdict = primalityCheck(BigInt(value))
        .verdict as RsaFactorCheckVerdict;
      if (factor === 'p') setPFactorCheck(verdict);
      else setQFactorCheck(verdict);
    } catch {
      if (factor === 'p') setPFactorCheck(null);
      else setQFactorCheck(null);
    }
  };

  const buildEncoding = useCallback(() => {
    return buildAlphabetEncoding({
      alphabetMode,
      customAlphabet,
      customIgnoreCase,
      customOffset,
    });
  }, [alphabetMode, customAlphabet, customIgnoreCase, customOffset]);

  const defaultBlockSize = useMemo(() => {
    try {
      const encoding = buildEncoding();
      const n = nInput.trim() === '' ? null : BigInt(nInput);
      if (n === null || n <= 1n) return 1;
      return getDefaultBlockSize(n, encoding.radix);
    } catch {
      return 1;
    }
  }, [buildEncoding, nInput]);

  const encryptOutput =
    ciphertextFormat === 'decimal' ? encryptOutputDecimal : encryptOutputBase64;

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

      const n = computeModulus(p, q);
      const phi = computePhi(p, q);
      setNInput(n.toString());

      if (eInput.trim() === '') {
        const selectedE = selectDefaultPublicExponent(phi);
        if (!selectedE) {
          setDValue(INVALID_RSA_EXPONENT_HINT);
          setComputedKeySnapshot({
            p: p.toString(),
            q: q.toString(),
            n: n.toString(),
            phi: phi.toString(),
            d: INVALID_RSA_EXPONENT_HINT,
          });
          setShowRecoveredFactors(false);
          return;
        }

        setEInput(selectedE.toString());
        const autoD = computePrivateExponent(selectedE, phi).toString();
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
      if (!isValidPublicExponentForPhi(e, phi)) {
        setDValue(INVALID_RSA_EXPONENT_HINT);
        setComputedKeySnapshot({
          p: p.toString(),
          q: q.toString(),
          n: n.toString(),
          phi: phi.toString(),
          d: INVALID_RSA_EXPONENT_HINT,
        });
        setShowRecoveredFactors(false);
        return;
      }

      const d = computePrivateExponent(e, phi).toString();
      setDValue(d);
      setComputedKeySnapshot({
        p: p.toString(),
        q: q.toString(),
        n: n.toString(),
        phi: phi.toString(),
        d,
      });
      setShowRecoveredFactors(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Failed to compute key values.',
      );
    } finally {
      setComputeWorking(false);
    }
  };

  const encrypt = async () => {
    if (mode !== 'encrypt') return;
    if (messageInput === '') return;

    setIoError(null);
    setWorking(true);
    setEncryptOutputDecimal('');
    setEncryptOutputBase64('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!isAsciiOnly(messageInput)) {
        throw new Error('Text to encrypt must contain ASCII characters only.');
      }

      const e = parseBigIntStrict(eInput, 'e');
      const n = parseBigIntStrict(nInput, 'n');
      const encoding = buildEncoding();
      const blockSize = resolveRsaBlockSize({
        blockSizeInput,
        encodingMode,
        defaultBlockSize,
      });

      const blocks = encryptRsaMessage({
        message: messageInput,
        e,
        n,
        encodingMode,
        blockSize,
        encoding,
      });

      setEncryptOutputDecimal(formatCiphertextBlocks(blocks, 'decimal'));
      setEncryptOutputBase64(formatCiphertextBlocks(blocks, 'base64'));
      setDecryptOutput('');
    } catch (cause) {
      setIoError(cause instanceof Error ? cause.message : 'Encryption failed.');
    } finally {
      setWorking(false);
    }
  };

  const decrypt = async () => {
    if (mode !== 'decrypt') return;

    setIoError(null);
    setWorking(true);
    setDecryptOutput('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (messageInput.trim() === '') {
        throw new Error('Encrypted text cannot be empty.');
      }

      let d: bigint;
      let n = parseBigIntStrict(nInput, 'n');
      if (dValue.trim() === '' || !/^\d+$/.test(dValue)) {
        if (pInput.trim() === '' || qInput.trim() === '') {
          throw new Error(
            'Provide secret component d, or use "Recover primes" to compute d',
          );
        }

        const p = parseBigIntStrict(pInput, 'p');
        const q = parseBigIntStrict(qInput, 'q');
        const derivedN = computeModulus(p, q);
        const phi = computePhi(p, q);

        let e: bigint;
        if (eInput.trim() === '') {
          const selected = selectDefaultPublicExponent(phi);
          if (!selected) {
            throw new Error('Could not derive d: no valid default exponent e.');
          }
          e = selected;
          setEInput(e.toString());
        } else {
          e = parseBigIntStrict(eInput, 'e');
        }

        if (!isValidPublicExponentForPhi(e, phi)) {
          throw new Error(
            'Cannot derive d: e must be coprime to \u03D5 and e < \u03D5.',
          );
        }

        d = computePrivateExponent(e, phi);
        n = derivedN;
        setNInput(derivedN.toString());
        setDValue(d.toString());
        setComputedKeySnapshot({
          p: p.toString(),
          q: q.toString(),
          n: derivedN.toString(),
          phi: phi.toString(),
          d: d.toString(),
        });
      } else {
        d = parseBigIntStrict(dValue, 'd');
      }

      const encoding = buildEncoding();
      const blockSize = resolveRsaBlockSize({
        blockSizeInput,
        encodingMode,
        defaultBlockSize,
      });
      const normalizedCiphertext = parseCiphertextInputToDecimal(
        messageInput,
        ciphertextFormat,
      );
      const text = decryptRsaMessage({
        ciphertext: normalizedCiphertext,
        d,
        n,
        encodingMode,
        blockSize,
        encoding,
      });

      setDecryptOutput(text);
      setEncryptOutputDecimal('');
      setEncryptOutputBase64('');
    } catch (cause) {
      setIoError(cause instanceof Error ? cause.message : 'Decryption failed.');
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

    const commitRecoveredFactors = (p: bigint, q: bigint, modulus: bigint) => {
      const phi = computePhi(p, q);
      let nextD = INVALID_RSA_EXPONENT_HINT;
      if (
        recoverInputs.e !== undefined &&
        isValidPublicExponentForPhi(recoverInputs.e, phi)
      ) {
        nextD = computePrivateExponent(recoverInputs.e, phi).toString();
      }

      setPInput(p.toString());
      setQInput(q.toString());
      setDValue(nextD);
      setComputedKeySnapshot({
        p: p.toString(),
        q: q.toString(),
        n: modulus.toString(),
        phi: phi.toString(),
        d: nextD,
      });
      setShowRecoveredFactors(true);
      setRecoverAttemptCounts({ balanced: 0, low: 0 });
      setPrimeFactorsFound(true);
      setRecoverElapsedMs(performance.now() - startedAt);
    };

    const prechecked = runRsaRecoveryPrechecks({
      n,
      sqrtN,
      pCandidate: parseOptionalFactor(pInput, 'p'),
      qCandidate: parseOptionalFactor(qInput, 'q'),
    });
    if (prechecked) {
      commitRecoveredFactors(prechecked.p, prechecked.q, n);
      return;
    }

    const ranges = buildRsaRecoveryRanges(n, trialUpperExclusive);
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
      const nextD = msg.d !== '' ? msg.d : INVALID_RSA_EXPONENT_HINT;
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

      worker.onmessage = (event: MessageEvent<RsaDecryptWorkerResponse>) => {
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

      const request: RsaDecryptRecoverRequest = {
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
    setEInput(DEFAULT_RSA_PUBLIC_EXPONENT);
    setNInput('');
    setDValue('');
    setComputedKeySnapshot(null);
    setShowRecoveredFactors(false);
    clearPemOutputs();
  };

  const clearTextBlocks = () => {
    setMessageInput('');
    setEncryptOutputDecimal('');
    setEncryptOutputBase64('');
    setDecryptOutput('');
    setIoError(null);
  };

  const handleCiphertextFormatChange = (nextFormat: RsaCiphertextFormat) => {
    setCiphertextFormat(nextFormat);
    setIoError(null);
  };

  const clearPemOutputs = () => {
    setPemError(null);
    setPublicKeyPem('');
    setPrivateKeyPem('');
  };

  const generateKeyPairPem = async () => {
    setPemError(null);
    setPemWorking(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      const p = parseBigIntStrict(pInput, 'p');
      const q = parseBigIntStrict(qInput, 'q');
      if (
        !primalityCheck(p).isProbablePrime ||
        !primalityCheck(q).isProbablePrime
      ) {
        throw new Error('p and q must be prime to export a valid RSA key.');
      }

      const n = computeModulus(p, q);
      const phi = computePhi(p, q);
      const lambda = computeLambdaN(p, q);

      let e: bigint;
      if (eInput.trim() === '') {
        const selected = selectDefaultPublicExponent(phi);
        if (!selected) {
          throw new Error('Could not derive e for PEM export.');
        }
        e = selected;
        setEInput(e.toString());
      } else {
        e = parseBigIntStrict(eInput, 'e');
      }

      if (!isValidPublicExponentForPhi(e, phi)) {
        throw new Error('e must be coprime to \u03D5 and e < \u03D5.');
      }

      let d: bigint;
      if (dValue.trim() !== '' && /^\d+$/.test(dValue.trim())) {
        d = parseBigIntStrict(dValue, 'd');
        if ((d * e) % lambda !== 1n) {
          throw new Error('Provided d is not valid for the current p, q, and e.');
        }
      } else {
        d = computePrivateExponent(e, lambda);
        setDValue(d.toString());
      }

      const exported = await exportRsaKeyPairToPem({ p, q, e, d, n });

      setNInput(n.toString());
      setComputedKeySnapshot({
        p: p.toString(),
        q: q.toString(),
        n: n.toString(),
        phi: phi.toString(),
        d: d.toString(),
      });
      setShowRecoveredFactors(false);
      setPublicKeyPem(exported.publicKeyPem);
      setPrivateKeyPem(exported.privateKeyPem);
    } catch (cause) {
      setPemError(
        cause instanceof Error ? cause.message : 'Failed to generate PEM keys.',
      );
    } finally {
      setPemWorking(false);
    }
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

    setNInput('');
    setDValue('');
    setComputedKeySnapshot(null);
    setShowRecoveredFactors(false);
    clearPemOutputs();

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
        setNInput(computeModulus(BigInt(p), BigInt(q)).toString());
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
      <RSAHeaderControls
        mode={mode}
        onModeChange={setMode}
        primeGenWorking={primeGenWorking}
        onGeneratePrimes={generatePrimes}
        disableGeneratePrimes={
          working || recoverWorking || computeWorking || primeGenWorking
        }
        primeGenSize={primeGenSize}
        onPrimeGenSizeChange={setPrimeGenSize}
        primeGenSizeType={primeGenSizeType}
        onPrimeGenSizeTypeChange={setPrimeGenSizeType}
        maxPrimeBits={MAX_GENERATED_PRIME_BITS}
        maxPrimeDigits={MAX_GENERATED_PRIME_DIGITS}
      />

      <RSAKeyPanel
        mode={mode}
        defaultPublicExponent={DEFAULT_RSA_PUBLIC_EXPONENT}
        pInput={pInput}
        qInput={qInput}
        eInput={eInput}
        dValue={dValue}
        nInput={nInput}
        onPInputChange={setPInput}
        onQInputChange={setQInput}
        onEInputChange={setEInput}
        onDValueChange={setDValue}
        onNInputChange={setNInput}
        onComputeKeyDetails={computeKeyDetails}
        disableCompute={
          !hasPAndQ ||
          working ||
          recoverWorking ||
          primeGenWorking ||
          computeWorking
        }
        canRecoverPrimes={canRecoverPrimes}
        canStopRecovery={canStopRecovery}
        recoverWorking={recoverWorking}
        onRecoverPrimes={recoverPrimes}
        onStopRecovery={stopRecovery}
        primeFactorsFound={primeFactorsFound}
        recoverElapsedMs={recoverElapsedMs}
        recoverAttemptCounts={recoverAttemptCounts}
        computeWorking={computeWorking}
        onClearKeyInputs={clearKeyInputs}
        disableClearKeys={working || recoverWorking || primeGenWorking}
        maxRecoveryModulusBits={MAX_RECOVERY_MODULUS_BITS}
        error={error}
        computedKeySnapshot={computedKeySnapshot}
        showRecoveredFactors={showRecoveredFactors}
        pFactorCheck={pFactorCheck}
        qFactorCheck={qFactorCheck}
        onCheckRecoveredFactor={checkRecoveredFactor}
      />

      <RSAKeyPairPemPanel
        onGenerate={generateKeyPairPem}
        onClear={clearPemOutputs}
        working={pemWorking}
        disabled={
          working ||
          recoverWorking ||
          computeWorking ||
          primeGenWorking ||
          pInput.trim() === '' ||
          qInput.trim() === ''
        }
        error={pemError}
        publicKeyPem={publicKeyPem}
        privateKeyPem={privateKeyPem}
      />

      <RSAEncodingPanel
        alphabetMode={alphabetMode}
        onAlphabetModeChange={setAlphabetMode}
        customAlphabet={customAlphabet}
        onCustomAlphabetChange={setCustomAlphabet}
        customIgnoreCase={customIgnoreCase}
        onCustomIgnoreCaseChange={setCustomIgnoreCase}
        customOffset={customOffset}
        onCustomOffsetChange={setCustomOffset}
        encodingMode={encodingMode}
        onEncodingModeChange={setEncodingMode}
        blockSizeInput={blockSizeInput}
        onBlockSizeInputChange={setBlockSizeInput}
        defaultBlockSize={defaultBlockSize}
      />

      <RSATextPanel
        mode={mode}
        ciphertextFormat={ciphertextFormat}
        onCiphertextFormatChange={handleCiphertextFormatChange}
        messageInput={messageInput}
        onMessageInputChange={setMessageInput}
        onEncrypt={encrypt}
        onDecrypt={decrypt}
        onClearTextBlocks={clearTextBlocks}
        working={working}
        recoverWorking={recoverWorking}
        ioError={ioError}
        encryptOutput={encryptOutput}
        decryptOutput={decryptOutput}
      />
    </div>
  );
};

export default RSAEncryptorContainer;
