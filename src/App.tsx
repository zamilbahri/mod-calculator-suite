import React from 'react';
import Header from './components/Header';
import CalculatorCard from './components/CalculatorCard';
import MultiplyLargeNumbers from './components/calculators/MultiplyLargeNumbers';
import MathText from './components/shared/MathText';
import GCDCalculator from './components/calculators/GCDCalculator';
import FastExponentiation from './components/calculators/FastExponentiation';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Header />

        <div className="mt-8">
          <CalculatorCard
            title="Multiply Large Numbers"
            subtitle={
              <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                <span>Compute</span>
                <MathText className="text-purple-200">{'p \\cdot q'}</MathText>
                <span>where</span>
                <MathText className="text-purple-200">{'p, q'}</MathText>
                <span>are large integers (hundreds of digits or more).</span>
              </span>
            }
            defaultOpen
          >
            <MultiplyLargeNumbers />
          </CalculatorCard>

          <CalculatorCard
            title="GCD Calculator"
            subtitle={
              <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                <span>Compute</span>
                <MathText className="text-purple-200">{'\\gcd(a, b)'}</MathText>
                <span>and coefficients</span>
                <MathText className="text-purple-200">{'x, y'}</MathText>
                <span>such that</span>
                <MathText className="text-purple-200">
                  {'ax + by = \\gcd(a, b)'}
                </MathText>
                <span> using the Extended Euclidean Algorithm.</span>
              </span>
            }
          >
            <GCDCalculator />
          </CalculatorCard>

          <CalculatorCard
            title="Fast Exponentiation"
            subtitle={
              <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                <span>Compute</span>
                <MathText className="text-purple-200">{'a^n \\mod m'}</MathText>
                <span>using square-and-multiply (BigInt).</span>
              </span>
            }
          >
            <FastExponentiation />
          </CalculatorCard>
        </div>
      </div>
    </div>
  );
};

export default App;
