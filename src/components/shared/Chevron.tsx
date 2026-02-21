const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={`transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0'}`}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default Chevron;
