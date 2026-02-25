import NumericOutput from '../../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../shared/ui';

type Props = {
  onGenerate: () => void;
  onClear: () => void;
  working: boolean;
  disabled: boolean;
  error: string | null;
  publicKeyPem: string;
  privateKeyPem: string;
};

const RSAKeyPairPemPanel = ({
  onGenerate,
  onClear,
  working,
  disabled,
  error,
  publicKeyPem,
  privateKeyPem,
}: Props) => {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || working}
          className={primaryButtonClass}
        >
          {working ? 'Generating PEM\u2026' : 'Generate Key Pair PEM'}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={working}
          className={secondaryButtonClass}
        >
          Clear PEM
        </button>
        <p className="text-xs italic text-gray-400">
          Uses current key values ({' '}
          <code className="font-mono text-gray-300">p, q, e, d</code>) and
          exports PKCS#8 private + SPKI public PEM.
        </p>
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {publicKeyPem ? (
        <NumericOutput
          label={<span>Public Key (SPKI PEM)</span>}
          value={publicKeyPem}
        />
      ) : null}

      {privateKeyPem ? (
        <NumericOutput
          label={<span>Private Key (PKCS#8 PEM)</span>}
          value={privateKeyPem}
        />
      ) : null}
    </div>
  );
};

export default RSAKeyPairPemPanel;
