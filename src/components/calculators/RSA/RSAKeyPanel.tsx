import type {
  RsaComputedKeySnapshot,
  RsaFactorCheckVerdict,
  RsaMode,
} from '../../../types';
import MathText from '../../shared/MathText';
import NumericInput from '../../shared/NumericInput';
import NumericOutput from '../../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../shared/ui';

type RecoverAttemptCounts = {
  balanced: number;
  low: number;
};

type Props = {
  mode: RsaMode;
  defaultPublicExponent: string;
  pInput: string;
  qInput: string;
  eInput: string;
  dValue: string;
  nInput: string;
  onPInputChange: (value: string) => void;
  onQInputChange: (value: string) => void;
  onEInputChange: (value: string) => void;
  onDValueChange: (value: string) => void;
  onNInputChange: (value: string) => void;
  onComputeKeyDetails: () => void;
  disableCompute: boolean;
  canRecoverPrimes: boolean;
  canStopRecovery: boolean;
  recoverWorking: boolean;
  onRecoverPrimes: () => void;
  onStopRecovery: () => void;
  primeFactorsFound: boolean;
  recoverElapsedMs: number | null;
  recoverAttemptCounts: RecoverAttemptCounts;
  computeWorking: boolean;
  onClearKeyInputs: () => void;
  disableClearKeys: boolean;
  maxRecoveryModulusBits: number;
  error: string | null;
  computedKeySnapshot: RsaComputedKeySnapshot | null;
  showRecoveredFactors: boolean;
  pFactorCheck: RsaFactorCheckVerdict | null;
  qFactorCheck: RsaFactorCheckVerdict | null;
  onCheckRecoveredFactor: (factor: 'p' | 'q') => void;
};

const RSAKeyPanel = ({
  mode,
  defaultPublicExponent,
  pInput,
  qInput,
  eInput,
  dValue,
  nInput,
  onPInputChange,
  onQInputChange,
  onEInputChange,
  onDValueChange,
  onNInputChange,
  onComputeKeyDetails,
  disableCompute,
  canRecoverPrimes,
  canStopRecovery,
  recoverWorking,
  onRecoverPrimes,
  onStopRecovery,
  primeFactorsFound,
  recoverElapsedMs,
  recoverAttemptCounts,
  computeWorking,
  onClearKeyInputs,
  disableClearKeys,
  maxRecoveryModulusBits,
  error,
  computedKeySnapshot,
  showRecoveredFactors,
  pFactorCheck,
  qFactorCheck,
  onCheckRecoveredFactor,
}: Props) => {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <NumericInput
          label={
            <span>
              Prime <MathText>p</MathText>
            </span>
          }
          value={pInput}
          onChange={onPInputChange}
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
          onChange={onQInputChange}
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
            onChange={onEInputChange}
            placeholder={defaultPublicExponent}
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
            onChange={onDValueChange}
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
            onChange={onNInputChange}
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
            onChange={onEInputChange}
            placeholder={defaultPublicExponent}
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
            onChange={onNInputChange}
            placeholder="Modulus n"
            minRows={1}
            rows={4}
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onComputeKeyDetails}
          disabled={disableCompute}
          className={primaryButtonClass}
        >
          Compute
        </button>
        {mode === 'decrypt' ? (
          <>
            <button
              type="button"
              onClick={canStopRecovery ? onStopRecovery : onRecoverPrimes}
              disabled={!canRecoverPrimes && !canStopRecovery}
              className={`${secondaryButtonClass} relative disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="invisible">Recover primes</span>
              <span className="absolute inset-0 flex items-center justify-center">
                {canStopRecovery
                  ? 'Stop'
                  : recoverWorking
                    ? 'Recovering\u2026'
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
              <span aria-hidden="true">&bull;</span>
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
            Computing <MathText className="inline">{`n,\\varphi(n),d`}</MathText>
          </p>
        ) : null}
        <button
          type="button"
          onClick={onClearKeyInputs}
          disabled={disableClearKeys}
          className={`${secondaryButtonClass} ml-auto disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Clear keys
        </button>
      </div>

      {mode === 'decrypt' ? (
        <p className="mt-1 text-xs italic text-gray-400">
          Recover primes is only enabled for{' '}
          <MathText>{`n < 2^{${maxRecoveryModulusBits}}`}</MathText>. May take a
          few minutes for <MathText>{`n > 2^{60}`}</MathText> depending on
          hardware.
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
                    onClick={() => onCheckRecoveredFactor('p')}
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
                    onClick={() => onCheckRecoveredFactor('q')}
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
    </>
  );
};

export default RSAKeyPanel;
