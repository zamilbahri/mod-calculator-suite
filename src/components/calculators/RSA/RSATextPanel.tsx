import type { RsaMode } from '../../../types';
import NumericOutput from '../../shared/NumericOutput';
import {
  errorBoxClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../shared/ui';

type Props = {
  mode: RsaMode;
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onEncrypt: () => void;
  onDecrypt: () => void;
  onClearTextBlocks: () => void;
  working: boolean;
  recoverWorking: boolean;
  ioError: string | null;
  encryptOutput: string;
  decryptOutput: string;
};

const RSATextPanel = ({
  mode,
  messageInput,
  onMessageInputChange,
  onEncrypt,
  onDecrypt,
  onClearTextBlocks,
  working,
  recoverWorking,
  ioError,
  encryptOutput,
  decryptOutput,
}: Props) => {
  return (
    <>
      <label className="mt-4 flex flex-col gap-1">
        <span className="text-sm text-purple-300">
          {mode === 'encrypt'
            ? 'Text to encrypt (ASCII only)'
            : 'Encrypted text blocks (space-separated integers)'}
        </span>
        <textarea
          value={messageInput}
          onChange={(event) => onMessageInputChange(event.target.value)}
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
      </div>

      {ioError ? <div className={errorBoxClass}>{ioError}</div> : null}

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
    </>
  );
};

export default RSATextPanel;
