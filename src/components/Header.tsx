import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-purple-200">
        Cryptography & Modular Math Suite
      </h1>
      <p className="mt-2 text-gray-300">
        A cryptography-focused utility toolkit (RSA math, primes, modular
        arithmetic).
      </p>
    </header>
  );
};

export default Header;
