import type { RsaCiphertextFormat, RsaMode } from '../../../types';
import NumericOutput from '../../shared/NumericOutput';
import ToggleGroup from '../../shared/ToggleGroup';
import {
  errorBoxClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../shared/ui';

type Props = {
  mode: RsaMode;
  ciphertextFormat: RsaCiphertextFormat;
  onCiphertextFormatChange: (value: RsaCiphertextFormat) => void;
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onEncrypt: () => void;
  onDecrypt: () => void;
  onClearTextBlocks: () => void;
  onClearAll: () => void;
  disableClearAll: boolean;
  working: boolean;
  recoverWorking: boolean;
  ioError: string | null;
  encryptOutput: string;
  decryptOutput: string;
};

const RSATextPanel = ({
  mode,
  ciphertextFormat,
  onCiphertextFormatChange,
  messageInput,
  onMessageInputChange,
  onEncrypt,
  onDecrypt,
  onClearTextBlocks,
  onClearAll,
  disableClearAll,
  working,
  recoverWorking,
  ioError,
  encryptOutput,
  decryptOutput,
}: Props) => {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-44 flex-col gap-1">
          <span className="text-sm text-purple-300">Ciphertext format</span>
          <ToggleGroup
            ariaLabel="Ciphertext format"
            value={ciphertextFormat}
            onChange={onCiphertextFormatChange}
            options={[
              { value: 'decimal', label: 'Decimal' },
              { value: 'base64', label: 'Base64' },
              { value: 'hex', label: 'Hex' },
            ]}
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-1">
        <span className="text-sm text-purple-300">
          {mode === 'encrypt'
            ? 'Text to encrypt (ASCII only)'
            : `Encrypted text blocks (${
                ciphertextFormat === 'decimal'
                  ? 'space-separated integers'
                  : ciphertextFormat === 'base64'
                    ? 'space-separated Base64 tokens'
                    : 'hex bytes (spaces allowed) or one hex block per line'
              })`}
        </span>
        <textarea
          value={messageInput}
          onChange={(event) => onMessageInputChange(event.target.value)}
          className={`${inputClass} min-h-28 resize-y`}
          placeholder={
            mode === 'encrypt'
              ? 'Enter plaintext'
              : ciphertextFormat === 'decimal'
                ? 'Enter ciphertext blocks (decimal)'
                : ciphertextFormat === 'base64'
                  ? 'Enter ciphertext blocks (Base64)'
                  : 'Enter ciphertext as hex'
          }
          spellCheck={false}
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {mode === 'encrypt' ? (
          <button
            type="button"
            onClick={onEncrypt}
            disabled={working || recoverWorking || messageInput === ''}
            className={primaryButtonClass}
          >
            {working ? 'Encrypting\u2026' : 'Encrypt'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onDecrypt}
            disabled={working || recoverWorking}
            className={primaryButtonClass}
          >
            {working ? 'Decrypting\u2026' : 'Decrypt'}
          </button>
        )}

        <button
          type="button"
          onClick={onClearTextBlocks}
          className={secondaryButtonClass}
        >
          Clear text
        </button>
        <button
          type="button"
          onClick={onClearAll}
          disabled={disableClearAll}
          className={`${secondaryButtonClass} border-red-500/70`}
        >
          Clear all
        </button>
      </div>

      {ioError ? <div className={errorBoxClass}>{ioError}</div> : null}

      {mode === 'encrypt' && encryptOutput ? (
        <div className="mt-6">
          <NumericOutput
            label={
              <span>
                Encrypted Text (
                {ciphertextFormat === 'decimal'
                  ? 'space-separated decimal blocks'
                  : ciphertextFormat === 'base64'
                    ? 'space-separated Base64 blocks'
                    : 'hex blocks, one line per block'}
                )
              </span>
            }
            value={encryptOutput}
          />
        </div>
      ) : null}

      {mode === 'decrypt' && decryptOutput ? (
        <div className="mt-6">
          <NumericOutput label="Decrypted Text" value={decryptOutput} />
        </div>
      ) : null}
    </>
  );
};

export default RSATextPanel;
