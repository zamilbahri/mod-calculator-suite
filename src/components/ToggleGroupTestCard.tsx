import { useState } from 'react';
import ToggleGroup from './shared/ToggleGroup';
import { secondaryButtonClass } from './shared/ui';

type BinaryChoice = 'left' | 'right';
type TripleChoice = 'one' | 'two' | 'three';

const ToggleGroupTestCard = () => {
  const [standardTwo, setStandardTwo] = useState<BinaryChoice>('left');
  const [standardThree, setStandardThree] = useState<TripleChoice>('one');
  const [minimalTwo, setMinimalTwo] = useState<BinaryChoice>('left');
  const [minimalThree, setMinimalThree] = useState<TripleChoice>('one');

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm text-purple-300">Toggle (2 options)</p>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup
              ariaLabel="Standard two-option toggle"
              value={standardTwo}
              onChange={(next) => setStandardTwo(next)}
              options={[
                { value: 'left', label: 'Encrypt' },
                { value: 'right', label: 'Decrypt' },
              ]}
            />
            <button type="button" className={secondaryButtonClass}>
              Secondary
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-purple-300">Toggle (3 options)</p>
          <ToggleGroup
            ariaLabel="Standard three-option toggle"
            value={standardThree}
            onChange={(next) => setStandardThree(next)}
            options={[
              { value: 'one', label: 'Decimal' },
              { value: 'two', label: 'Base64' },
              { value: 'three', label: 'Hex' },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm text-purple-300">Minimal Toggle (2 options)</p>
          <ToggleGroup
            minimal
            ariaLabel="Minimal two-option toggle"
            value={minimalTwo}
            onChange={(next) => setMinimalTwo(next)}
            options={[
              { value: 'left', label: 'phi(n)' },
              { value: 'right', label: 'lambda(n)' },
            ]}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-purple-300">Minimal Toggle (3 options)</p>
          <ToggleGroup
            minimal
            ariaLabel="Minimal three-option toggle"
            value={minimalThree}
            onChange={(next) => setMinimalThree(next)}
            options={[
              { value: 'one', label: 'B' },
              { value: 'two', label: 'I' },
              { value: 'three', label: 'U' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleGroupTestCard;
