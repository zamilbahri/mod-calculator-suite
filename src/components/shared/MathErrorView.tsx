import type { MathValidationError } from '../../utils/numberTheory';
import MathText from './MathText';

export const MathErrorView: React.FC<{ error: MathValidationError }> = ({
  error,
}) => {
  return (
    <span>
      <MathText>{error.fieldNames.join(', ')}</MathText> {error.reason}
      {error.expectedValue ? (
        <>
          {' '}
          <MathText>{error.expectedValue}</MathText>
        </>
      ) : null}
    </span>

    // Alternative rendering approach to display string with LaTeX formatting
    // <div>
    //   <MathText>{error.fieldNames.join(', ')}</MathText>
    //   <MathText>{String.raw`\text{ ${error.reason}}`}</MathText>
    //   {error.expectedValue ? (
    //     <>
    //       {' '}
    //       <MathText>{error.expectedValue}</MathText>
    //     </>
    //   ) : null}
    // </div>
  );
};
