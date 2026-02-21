import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chevron from './shared/Chevron';

export interface CalculatorCardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CalculatorCard: React.FC<CalculatorCardProps> = ({
  title,
  subtitle,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const borderClass = useMemo(
    () => (open ? 'border-purple-500' : 'border-gray-700'),
    [open],
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => setContentHeight(el.scrollHeight);

    update();

    // Keep animations correct even if content size changes.
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setContentHeight(el.scrollHeight);
  }, [open]);

  return (
    <section
      className={`mb-8 p-6 shadow-2xl rounded-xl border transition-colors ${borderClass} ${
        !open ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-800'
      }`}
    >
      <button
        type="button"
        className="w-full text-left flex items-start gap-3 group"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="mt-1">
          <Chevron open={open} />
        </div>

        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-purple-200 group-hover:text-purple-100">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-300 group-hover:text-gray-200">
              {subtitle}
            </p>
          ) : null}
        </div>
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? contentHeight + 16 : 0 }}
      >
        <div ref={contentRef} className="pt-5 px-1">
          {children}
        </div>
      </div>
    </section>
  );
};

export default CalculatorCard;
