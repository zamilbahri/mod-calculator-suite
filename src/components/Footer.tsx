import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 pb-8 text-center text-gray-400 text-sm border-t border-gray-800 pt-8">
      <p>
        Check out the source code at{' '}
        <a
          href="https://github.com/zamilbahri/mod-calculator-suite"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 transition-colors underline decoration-purple-800 underline-offset-4"
        >
          github.com/zamilbahri/mod-calculator-suite
        </a>
      </p>
      <p className="mt-2 text-xs opacity-50">
        &copy; {new Date().getFullYear()} Zamil Bahri. Licensed under MIT.
      </p>
    </footer>
  );
};

export default Footer;
