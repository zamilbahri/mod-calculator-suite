import type { RsaAlphabetMode, RsaEncodingMode } from '../../../types';
import { inputClass } from '../../shared/ui';
import MathText from '../../shared/MathText';

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

const ENCODING_TOOLTIPS: Record<RsaEncodingMode, React.ReactNode> = {
  'fixed-width-numeric': (
    <>
      Each character is converted to a fixed-width decimal number using the
      selected alphabet (e.g. A=01, B=02...). Blocks of characters are
      concatenated into a single integer. Simple and transparent, ideal for
      following RSA step-by-step by hand.
    </>
  ),
  radix: (
    <>
      Characters are treated as digits in base-<em>b</em> (where <em>b</em> is
      the alphabet size) and packed into a single integer:{' '}
      <MathText>{'m = c_0 + c_1 b + c_2 b^2 + \\cdots'}</MathText>. Slightly
      more space-efficient than fixed-width encoding. Still uses the selected
      alphabet.
    </>
  ),
  'pkcs1-v1_5': (
    <>
      Industry-standard byte-level encoding with random padding. The message is
      encoded as raw bytes (UTF-8), padded to the key size, then encrypted.
      Alphabet settings are ignored. Not suitable for hand-calculation, but
      matches how RSA is actually used in practice.
    </>
  ),
  'direct-integer': (
    <>
      The input is treated as a raw integer <MathText>{'m'}</MathText> and
      encrypted directly as{' '}
      <MathText>{'c = m^e \\bmod n'}</MathText>. No alphabet or block encoding
      is applied. Useful for working through textbook RSA examples where the
      plaintext is already numeric. Requires{' '}
      <MathText>{'m < n'}</MathText>.
    </>
  ),
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
          <span className="flex items-center gap-1.5 text-sm text-purple-300">
            Encoding mode
            <span className="group relative inline-flex items-center">
              <span className="flex h-4 w-4 cursor-default items-center justify-center rounded-full border border-gray-500 text-xs leading-none text-gray-400 select-none">
                i
              </span>
              <span className="pointer-events-none invisible absolute bottom-full left-0 z-10 mb-2 w-72 rounded bg-gray-800 px-3 py-2 text-xs leading-relaxed text-gray-200 shadow-lg ring-1 ring-gray-600 group-hover:visible">
                {ENCODING_TOOLTIPS[encodingMode]}
                <span className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
              </span>
            </span>
          </span>
          <select
            value={encodingMode}
            onChange={(event) =>
              onEncodingModeChange(event.target.value as RsaEncodingMode)
            }
            className={`${inputClass} h-10.5`}
          >
            <option value="direct-integer">Direct Integer</option>
            <option value="fixed-width-numeric">Fixed-Width Numeric Slicing</option>
            <option value="radix">Radix (b-adic) packing</option>
            <option value="pkcs1-v1_5">PKCS#1 v1.5 Padding</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">
            Block size (symbols per block)
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
              encodingMode === 'pkcs1-v1_5'
                ? 'Disabled for PKCS#1 v1.5'
                : encodingMode === 'direct-integer'
                  ? 'Disabled for Direct Integer'
                  : `Default: ${defaultBlockSize}`
            }
            disabled={encodingMode === 'pkcs1-v1_5' || encodingMode === 'direct-integer'}
          />
        </label>
      </div>
    </>
  );
};

export default RSAEncodingPanel;
