import React from 'react';
import Header from './components/Header';
import CalculatorCard from './components/CalculatorCard';
import CalculatorGroup from './components/CalculatorGroup';
import MathText from './components/shared/MathText';
import GCDCalculator from './components/calculators/GCDCalculator';
import FastExponentiation from './components/calculators/FastExponentiation';
import CRTSolver from './components/calculators/CRTSolver';
import SingleMatrixModCalculator from './components/calculators/SingleMatrixModCalculator';
import MatrixMultiplicationCalculator from './components/calculators/MatrixMultiplicationCalculator';
import PrimeChecker from './components/calculators/PrimeChecker';
import PrimeGenerator from './components/calculators/PrimeGenerator';
import RSAEncryptorContainer from './components/calculators/RSA/RSAEncryptorContainer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Header />

        <div className="mt-8">
          <CalculatorGroup title="RSA and Primes" defaultOpen>
            <CalculatorCard
              title="RSA Calculator"
              subtitle={
                <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                  <span>Encrypt text using</span>
                  <MathText className="text-purple-200">{'(e, n)'}</MathText>
                  <span>or build</span>
                  <MathText className="text-purple-200">
                    {'n = p \\cdot q'}
                  </MathText>
                  <span>from primes.</span>
                </span>
              }
            >
              <RSAEncryptorContainer />
            </CalculatorCard>

            <CalculatorCard
              title="Prime Generator"
              subtitle={
                <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                  <span>Generate prime numbers by</span>
                  <span>bit-size or digit-size.</span>
                </span>
              }
            >
              <PrimeGenerator />
            </CalculatorCard>

            <CalculatorCard
              title="Prime Checker"
              subtitle={
                <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                  <span>Check if</span>
                  <MathText className="text-purple-200">n</MathText>
                  <span>
                    is prime using the Baillie-PSW and the Miller-Rabin
                    primality test.
                  </span>
                </span>
              }
            >
              <PrimeChecker />
            </CalculatorCard>
          </CalculatorGroup>

          <CalculatorGroup title="Modular Number Theory" defaultOpen>
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
                  <MathText className="text-purple-200">
                    {'a^n \\mod m'}
                  </MathText>
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
                  <MathText className="text-purple-200">
                    {String.raw`x \equiv a_i \pmod{m_i}`}
                  </MathText>
                  <span>
                    for multiple congruences (pairwise coprime moduli).
                  </span>
                </span>
              }
            >
              <CRTSolver />
            </CalculatorCard>
          </CalculatorGroup>

          <CalculatorGroup title="Modular Matrix Utilities" defaultOpen>
            <CalculatorCard
              title="Matrix Modular Determinant, RREF, and Inverse Calcualor"
              subtitle={
                <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                  <span>Normalize a matrix</span>
                  <MathText className="text-purple-200">{`A \\bmod m`}</MathText>
                  <span>, or evaluate</span>
                  <MathText className="text-purple-200">{`\\det(A),\\;A^{-1},\\;\\operatorname{RREF}(A)`}</MathText>
                  <span>mod</span>
                  <MathText className="text-purple-200">m</MathText>.
                </span>
              }
            >
              <SingleMatrixModCalculator />
            </CalculatorCard>

            <CalculatorCard
              title="Matrix Multiplication Calculator"
              subtitle={
                <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                  <span>Compute</span>
                  <MathText className="text-purple-200">{`A \\cdot B \\bmod m`}</MathText>
                  <span>for two user-provided matrices.</span>
                </span>
              }
            >
              <MatrixMultiplicationCalculator />
            </CalculatorCard>
          </CalculatorGroup>
        </div>
      </div>
    </div>
  );
};

export default App;
