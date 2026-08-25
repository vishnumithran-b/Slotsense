import { Activity, Clock, MapPin, RefreshCw, Car, Lock, Wrench } from 'lucide-react';
import { type SlotStats } from '@/types';
import { GlassCard, useCountUp } from '@/components/ui/Glass';

interface HeroDashboardProps {
  stats: SlotStats;
  loading: boolean;
  lastUpdated: Date;
  onRefresh: () => void;
}

function StatCard({
  label,
  value,
  total,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  total: number;
  accent: string;
  icon: typeof Activity;
}) {
  const animated = useCountUp(value, 900);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <GlassCard className="p-4 md:p-5 group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {label}
        </span>
        <span
          className="grid h-8 w-8 place-items-center rounded-xl"
          style={{ background: `${accent}22`, color: accent }}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-1">
        <span className="font-display text-3xl md:text-4xl font-bold text-white tabular-nums">
          {animated}
        </span>
        <span className="mb-1 text-sm text-white/40">/ {total}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
      </div>
    </GlassCard>
  );
}

export function HeroDashboard({ stats, loading, lastUpdated, onRefresh }: HeroDashboardProps) {
  const timeStr = lastUpdated.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateStr = lastUpdated.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <section className="relative z-10 pt-28 md:pt-32 pb-10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-mint animate-fade-up">
            <span className="h-2 w-2 rounded-full bg-mint animate-pulse-glow" />
            Live Campus Parking Intelligence
          </div>
          <h1
            className="font-display text-5xl md:text-7xl font-bold leading-[1.05] text-white text-balance animate-fade-up"
            style={{ animationDelay: '0.05s' }}
          >
            Slot<span className="shimmer-text">Sense</span>
          </h1>
          <p
            className="mt-4 max-w-xl text-base md:text-lg text-white/70 text-balance animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            Find campus parking faster with AI. Real-time slot detection, live maps, geolocation
            routing, and instant reservations — all in one liquid-glass dashboard.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-4xl glass" />
            ))}
          </div>
        ) : (
          <div
            className="mt-10 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 animate-fade-up"
            style={{ animationDelay: '0.15s' }}
          >
            <StatCard label="Total Slots" value={stats.total} total={stats.total} accent="#B7E5BA" icon={MapPin} />
            <StatCard label="Available" value={stats.available} total={stats.total} accent="#288760" icon={Activity} />
            <StatCard label="Occupied" value={stats.occupied} total={stats.total} accent="#e0584f" icon={Car} />
            <StatCard label="Reserved" value={stats.reserved} total={stats.total} accent="#f5b042" icon={Lock} />
          </div>
        )}

        <div
          className="mt-4 flex items-center justify-center animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          <GlassCard className="flex items-center gap-3 px-4 py-2.5">
            <Clock size={16} className="text-mint" />
            <span className="text-sm text-white/70">
              Last updated <span className="font-semibold text-white">{timeStr}</span> · {dateStr}
            </span>
            <button
              onClick={onRefresh}
              className="ml-1 grid h-7 w-7 place-items-center rounded-lg glass hover:bg-white/10 transition-colors"
              aria-label="Refresh data"
            >
              <RefreshCw size={13} className="text-mint" />
            </button>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
