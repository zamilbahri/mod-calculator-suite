import type { RsaMode, RsaPrimeSizeType } from '../../../types';
import ToggleGroup from '../../shared/ToggleGroup';
import {
  inputClass,
  primaryButtonClass,
} from '../../shared/ui';

type Props = {
  mode: RsaMode;
  onModeChange: (mode: RsaMode) => void;
  primeGenWorking: boolean;
  onGeneratePrimes: () => void;
  disableGeneratePrimes: boolean;
  primeGenSize: string;
  onPrimeGenSizeChange: (value: string) => void;
  primeGenSizeType: RsaPrimeSizeType;
  onPrimeGenSizeTypeChange: (value: RsaPrimeSizeType) => void;
  maxPrimeBits: number;
  maxPrimeDigits: number;
};

const RSAHeaderControls = ({
  mode,
  onModeChange,
  primeGenWorking,
  onGeneratePrimes,
  disableGeneratePrimes,
  primeGenSize,
  onPrimeGenSizeChange,
  primeGenSizeType,
  onPrimeGenSizeTypeChange,
  maxPrimeBits,
  maxPrimeDigits,
}: Props) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          ariaLabel="RSA mode"
          value={mode}
          onChange={onModeChange}
          options={[
            { value: 'encrypt', label: 'Encrypt Mode' },
            { value: 'decrypt', label: 'Decrypt Mode' },
          ]}
        />
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
          onClick={onGeneratePrimes}
          disabled={disableGeneratePrimes}
          className={primaryButtonClass}
        >
          {primeGenWorking ? 'Generating\u2026' : 'Generate Primes'}
        </button>
        <input
          value={primeGenSize}
          onChange={(event) => {
            const next = event.target.value;
            if (/^\d*$/.test(next)) onPrimeGenSizeChange(next);
          }}
          className={`${inputClass} w-26!`}
          inputMode="numeric"
          placeholder={
            primeGenSizeType === 'bits'
              ? `Max: ${maxPrimeBits}`
              : `Max: ${maxPrimeDigits}`
          }
        />
        <select
          value={primeGenSizeType}
          onChange={(event) =>
            onPrimeGenSizeTypeChange(event.target.value as RsaPrimeSizeType)
          }
          className={`${inputClass} h-10.5 w-20!`}
        >
          <option value="bits">bits</option>
          <option value="digits">digits</option>
        </select>
      </div>
    </div>
  );
};

export default RSAHeaderControls;
