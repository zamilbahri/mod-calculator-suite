import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CalculatorCard from './components/CalculatorCard';
import CalculatorGroup from './components/CalculatorGroup';
import MathText from './components/shared/MathText';
import ModularMultiplicationCalculator from './components/calculators/ModularMultiplicationCalculator';
import GCDCalculator from './components/calculators/GCDCalculator';
import LinearCongruenceCalculator from './components/calculators/LinearCongruenceCalculator';
import FastExponentiation from './components/calculators/FastExponentiation';
import CRTSolver from './components/calculators/CRTSolver';
import SingleMatrixModCalculator from './components/calculators/SingleMatrixModCalculator';
import MatrixMultiplicationCalculator from './components/calculators/MatrixMultiplicationCalculator';
import PrimeChecker from './components/calculators/PrimeChecker';
import PrimeGenerator from './components/calculators/PrimeGenerator';
import RSAEncryptorContainer from './components/calculators/RSA/RSAEncryptorContainer';
import GFPolynomialArithmetic from './components/calculators/GFPolynomialArithmetic';
import GFPolynomialGCD from './components/calculators/GFPolynomialGCD';
import GFPolynomialInverse from './components/calculators/GFPolynomialInverse';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-2 py-10">
        <Header />

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Left column: RSA and Primes, then Galois Fields */}
          <div className="flex flex-col gap-6">
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

            <CalculatorGroup title="Galois Fields (Cryptography)" defaultOpen>
              <CalculatorCard
                title="GF(2) Polynomial Arithmetic"
                subtitle={
                  <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                    <span>Compute</span>
                    <MathText className="text-purple-200">{`A(x) + B(x), \\; A(x) \\cdot B(x), \\; A(x) / B(x)`}</MathText>
                    <span>over</span>
                    <MathText className="text-purple-200">GF(2)</MathText>.
                    <span>Only accepts polynomials with coefficients of 1 or 0.</span>
                  </span>
                }
              >
                <GFPolynomialArithmetic />
              </CalculatorCard>

              <CalculatorCard
                title="GF(2) Polynomial GCD"
                subtitle={
                  <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                    <span>Compute</span>
                    <MathText className="text-purple-200">{`\\gcd(A(x), B(x))`}</MathText>
                    <span>using the Euclidean algorithm.</span>
                    <span>Only accepts polynomials with coefficients of 1 or 0.</span>
                  </span>
                }
              >
                <GFPolynomialGCD />
              </CalculatorCard>

              <CalculatorCard
                title="GF(2) Polynomial Inverse"
                subtitle={
                  <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                    <span>Compute</span>
                    <MathText className="text-purple-200">{`A(x)^{-1} \\bmod P(x)`}</MathText>
                    <span>using the Extended Euclidean Algorithm.</span>
                    <span>Only accepts polynomials with coefficients of 1 or 0.</span>
                  </span>
                }
              >
                <GFPolynomialInverse />
              </CalculatorCard>
            </CalculatorGroup>
          </div>

          {/* Right column: Modular Number Theory, then Modular Matrix Utilities */}
          <div className="flex flex-col gap-6">
            <CalculatorGroup title="Modular Number Theory" defaultOpen>
              <CalculatorCard
                title="Modular Multiplication"
                subtitle={
                  <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                    <span>Compute</span>
                    <MathText className="text-purple-200">
                      {`a \\cdot b \\pmod{n}`}
                    </MathText>
                  </span>
                }
              >
                <ModularMultiplicationCalculator />
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
                title="Linear Congruence Calculator"
                subtitle={
                  <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                    <span>Solve equations of the form</span>
                    <MathText className="text-purple-200">
                      {'ax \\equiv b \\pmod n'}
                    </MathText>
                    <span>or</span>
                    <MathText className="text-purple-200">
                      {'ax + kn = b'}
                    </MathText>
                    .
                  </span>
                }
              >
                <LinearCongruenceCalculator />
              </CalculatorCard>

              <CalculatorCard
                title="Fast Exponentiation"
                subtitle={
                  <span className="flex flex-wrap gap-x-2 gap-y-1 items-baseline">
                    <span>Compute</span>
                    <MathText className="text-purple-200">
                      {'a^n \\mod m'}
                    </MathText>
                    <span>
                      using fast exponentiation (square-and-multiply).
                    </span>
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
        <Footer />
      </div>
    </div>
  );
};

export default App;
