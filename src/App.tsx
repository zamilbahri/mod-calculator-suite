import React from 'react';
import Header from './components/Header';
import CalculatorCard from './components/CalculatorCard';
import MultiplyLargeNumbers from './components/calculators/MultiplyLargeNumbers';
import MathText from './components/shared/MathText';
import GCDCalculator from './components/calculators/GCDCalculator';
import FastExponentiation from './components/calculators/FastExponentiation';
import CRTSolver from './components/calculators/CRTSolver';
import PrimeChecker from './components/calculators/PrimeChecker';

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
                <MathText className="text-purple-200">
                  {'n = p \\cdot q'}
                </MathText>
                <span>where</span>
                <MathText className="text-purple-200">{'p, q'}</MathText>
                <span>are large integers (hundreds of digits or more).</span>
              </span>
            }
          >
            <MultiplyLargeNumbers />
          </CalculatorCard>

          <CalculatorCard
            title="EGCD and Modular Inverse Calculator"
            subtitle={
              <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                <span>Compute</span>
                <MathText className="text-purple-200">
                  {'\\gcd(a, b),'}
                </MathText>
                <span>coefficients</span>
                <MathText className="text-purple-200">{'x, y'}</MathText>
                <span>such that</span>
                <MathText className="text-purple-200">
                  {'ax + by = \\gcd(a, b),'}
                </MathText>
                <span>and</span>
                <MathText className="text-purple-200">
                  {'a^{-1} \\bmod b'}
                </MathText>
                .
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
                <span>using fast exponentiation (square-and-multiply).</span>
              </span>
            }
          >
            <FastExponentiation />
          </CalculatorCard>

          <CalculatorCard
            title="CRT Solver"
            subtitle={
              <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                <span>Solve</span>
                <MathText className="text-purple-200">{String.raw`x \equiv a_i \pmod{m_i}`}</MathText>
                <span>for multiple congruences (pairwise coprime moduli).</span>
              </span>
            }
          >
            <CRTSolver />
          </CalculatorCard>

          <CalculatorCard
            title="Prime Checker"
            subtitle={
              <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                <span>Check if</span>
                <MathText className="text-purple-200">n</MathText>
                <span>
                  is prime using the Baillie-PSW and the Miller-Rabin primality
                  test.
                </span>
              </span>
            }
          >
            <PrimeChecker />
          </CalculatorCard>
        </div>
      </div>
    </div>
  );
};

export default App;
