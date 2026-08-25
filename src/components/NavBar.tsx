import { useEffect, useState } from 'react';
import { ParkingCircle, Shield, ShieldCheck } from 'lucide-react';

interface NavBarProps {
  isAdmin: boolean;
}

export function NavBar({ isAdmin }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3">
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 ${
          scrolled ? 'glass-strong' : 'glass'
        }`}
      >
        <a href="#dashboard" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl glow-btn">
            <ParkingCircle size={18} className="text-white" />
          </span>
          <div className="leading-none">
            <div className="font-display text-base font-bold text-white">
              Slot<span className="text-mint">Sense</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Smart Parking</div>
          </div>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {[
            { label: 'Dashboard', href: '#dashboard' },
            { label: 'Map', href: '#map' },
            { label: 'AI Vision', href: '#camera' },
            { label: 'Analytics', href: '#analytics' },
            { label: 'Admin', href: '#admin' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#admin"
          className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            isAdmin ? 'glow-btn text-white' : 'glass text-white/70 hover:text-white'
          }`}
        >
          {(() => {
            const Icon = isAdmin ? ShieldCheck : Shield;
            return <Icon size={14} />;
          })()}
          <span className="hidden sm:inline">{isAdmin ? 'Admin On' : 'Admin'}</span>
        </a>
      </nav>
    </header>
  );
}
