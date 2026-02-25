import React, { useEffect, useRef, useState } from 'react';
import Chevron from './shared/Chevron';

export interface CalculatorGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CalculatorGroup: React.FC<CalculatorGroupProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => setContentHeight(el.scrollHeight);
    update();

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
    <section className="mb-10">
      <button
        type="button"
        className="w-full text-left group"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 shrink-0 text-gray-300 group-hover:text-gray-200">
            <Chevron open={open} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-purple-200 group-hover:text-purple-100">
              {title}
            </h2>
            <span
              aria-hidden="true"
              className="mt-2 block h-px w-full bg-gray-700 group-hover:bg-gray-600"
            />
          </div>
        </div>
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? contentHeight + 16 : 0 }}
      >
        <div ref={contentRef} className="pt-5">
          {children}
        </div>
      </div>
    </section>
  );
};

export default CalculatorGroup;
