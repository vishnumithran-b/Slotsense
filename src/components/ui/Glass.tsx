import { type ReactNode, useEffect, useRef, useState } from 'react';

export function GlassCard({
  children,
  className = '',
  strong = false,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`glass-panel glass glass-edge ${strong ? 'glass-strong' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-semibold uppercase tracking-widest text-mint">
        <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse-glow" />
        {eyebrow}
      </div>
      <h2 className="font-display text-2xl md:text-4xl font-bold text-white text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm md:text-base text-white/60 text-balance">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}
