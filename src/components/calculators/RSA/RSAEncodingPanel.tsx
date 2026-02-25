import type { RsaAlphabetMode, RsaEncodingMode } from '../../../types';
import { inputClass } from '../../shared/ui';

type Props = {
  alphabetMode: RsaAlphabetMode;
  onAlphabetModeChange: (mode: RsaAlphabetMode) => void;
  customAlphabet: string;
  onCustomAlphabetChange: (value: string) => void;
  customIgnoreCase: boolean;
  onCustomIgnoreCaseChange: (value: boolean) => void;
  customOffset: string;
  onCustomOffsetChange: (value: string) => void;
  encodingMode: RsaEncodingMode;
  onEncodingModeChange: (mode: RsaEncodingMode) => void;
  blockSizeInput: string;
  onBlockSizeInputChange: (value: string) => void;
  defaultBlockSize: number;
};

const RSAEncodingPanel = ({
  alphabetMode,
  onAlphabetModeChange,
  customAlphabet,
  onCustomAlphabetChange,
  customIgnoreCase,
  onCustomIgnoreCaseChange,
  customOffset,
  onCustomOffsetChange,
  encodingMode,
  onEncodingModeChange,
  blockSizeInput,
  onBlockSizeInputChange,
  defaultBlockSize,
}: Props) => {
  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">Alphabet</span>
          <select
            value={alphabetMode}
            onChange={(event) =>
              onAlphabetModeChange(event.target.value as RsaAlphabetMode)
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
              onChange={(event) => onCustomAlphabetChange(event.target.value)}
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
              onChange={(event) =>
                onCustomIgnoreCaseChange(event.target.checked)
              }
            />
            Ignore case (e.g., "e" maps as "E")
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-purple-300">Alphabet offset</span>
            <input
              value={customOffset}
              onChange={(event) => {
                const next = event.target.value;
                if (/^\d*$/.test(next)) onCustomOffsetChange(next);
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
          <span className="text-sm text-purple-300">Encoding mode</span>
          <select
            value={encodingMode}
            onChange={(event) =>
              onEncodingModeChange(event.target.value as RsaEncodingMode)
            }
            className={`${inputClass} h-10.5`}
          >
            <option value="fixed-width-numeric">
              Fixed-width numeric slicing
            </option>
            <option value="radix">Radix (b-adic) packing</option>
            <option value="pkcs1-v1_5">PKCS#1 v1.5 Padding</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">
            {encodingMode === 'fixed-width-numeric'
              ? 'Block size (digits per block)'
              : 'Block size (symbols per block)'}
          </span>
          <input
            value={blockSizeInput}
            onChange={(event) => {
              const next = event.target.value;
              if (/^\d*$/.test(next)) onBlockSizeInputChange(next);
            }}
            className={`${inputClass} h-10.5`}
            inputMode="numeric"
            placeholder={
              encodingMode === 'fixed-width-numeric'
                ? `Default: ${defaultBlockSize * 2}`
                : encodingMode === 'pkcs1-v1_5'
                  ? 'Disabled for PKCS#1 v1.5'
                  : `Default: ${defaultBlockSize}`
            }
            disabled={encodingMode === 'pkcs1-v1_5'}
          />
        </label>
      </div>

      {encodingMode === 'pkcs1-v1_5' ? (
        <p className="mt-1 text-xs italic text-gray-400">
          PKCS#1 v1.5 uses byte encoding; alphabet settings are ignored.
        </p>
      ) : null}
    </>
  );
};

export default RSAEncodingPanel;
