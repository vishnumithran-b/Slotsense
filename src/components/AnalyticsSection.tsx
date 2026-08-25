import { TrendingUp, Clock, Zap, BarChart3 } from 'lucide-react';
import { type SlotStats } from '@/types';
import { GlassCard, SectionHeading, useCountUp } from '@/components/ui/Glass';

interface AnalyticsSectionProps {
  stats: SlotStats;
}

function CircleMeter({
  label,
  value,
  suffix = '%',
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  icon: typeof TrendingUp;
}) {
  const animated = useCountUp(value, 1400);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  return (
    <GlassCard className="flex flex-col items-center p-5 text-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.2s linear', filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-white tabular-nums">
            {animated}
            <span className="text-base text-white/60">{suffix}</span>
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-white/80">
        {(() => {
          const I = Icon;
          return <I size={15} style={{ color }} />;
        })()}
        {label}
      </div>
    </GlassCard>
  );
}

function PeakBar({ bar, index }: { bar: { h: string; v: number }; index: number }) {
  const animated = useCountUp(bar.v, 1000 + index * 60);
  const isPeak = bar.v >= 90;
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="relative flex w-full flex-1 items-end">
        <div
          className="w-full rounded-t-lg transition-all duration-1000 ease-out"
          style={{
            height: `${animated}%`,
            background: isPeak
              ? 'linear-gradient(180deg, #f5b042, #288760)'
              : 'linear-gradient(180deg, #5CA87C, #288760)',
            boxShadow: isPeak
              ? '0 0 16px rgba(245,176,66,0.5)'
              : '0 0 12px rgba(40,135,96,0.4)',
          }}
        />
      </div>
      <span className="text-[10px] md:text-xs text-white/50">{bar.h}</span>
    </div>
  );
}

function BarRow({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  const animated = useCountUp(value, 1300);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold text-white tabular-nums">{value}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animated}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 12px ${color}88`,
            animationDelay: `${delay}s`,
          }}
        />
      </div>
    </div>
  );
}

const PEAK_HOURS = [
  { h: '8A', v: 45 },
  { h: '9A', v: 82 },
  { h: '10A', v: 95 },
  { h: '11A', v: 78 },
  { h: '12P', v: 88 },
  { h: '1P', v: 70 },
  { h: '2P', v: 60 },
  { h: '3P', v: 72 },
  { h: '4P', v: 90 },
  { h: '5P', v: 98 },
];

export function AnalyticsSection({ stats }: AnalyticsSectionProps) {
  const availablePct = stats.total ? Math.round((stats.available / stats.total) * 100) : 0;
  const occupancyPct = stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0;
  const peakLevel = 92;
  const timeSaved = 73;

  return (
    <section className="relative z-10 py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Analytics"
          title="Parking Intelligence"
          subtitle="Real-time occupancy metrics, peak-hour crowd levels, and the time SlotSense saves you."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
            <CircleMeter label="Available" value={availablePct} color="#288760" icon={TrendingUp} />
            <CircleMeter label="Occupancy" value={occupancyPct} color="#e0584f" icon={BarChart3} />
            <CircleMeter label="Peak Crowd" value={peakLevel} color="#f5b042" icon={Zap} />
            <CircleMeter label="Time Saved" value={timeSaved} color="#2dd4bf" icon={Clock} />
          </div>

          <GlassCard className="p-5">
            <h3 className="font-display text-lg font-bold text-white">Occupancy Breakdown</h3>
            <div className="mt-4 space-y-4">
              <BarRow label="Available" value={availablePct} color="#288760" />
              <BarRow label="Occupied" value={occupancyPct} color="#e0584f" delay={0.1} />
              <BarRow label="Reserved" value={stats.total ? Math.round((stats.reserved / stats.total) * 100) : 0} color="#f5b042" delay={0.2} />
            </div>
          </GlassCard>
        </div>

        {/* Peak hour chart */}
        <GlassCard className="mt-6 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white">Peak Hour Crowd Level</h3>
            <span className="text-xs text-white/50">Simulated campus data</span>
          </div>
          <div className="mt-6 flex h-40 items-end justify-between gap-1.5 md:gap-3">
            {PEAK_HOURS.map((bar, i) => (
              <PeakBar key={bar.h} bar={bar} index={i} />
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
