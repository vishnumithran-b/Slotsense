import {
  Camera,
  Image,
  BrainCircuit,
  Database,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { GlassCard, SectionHeading } from '@/components/ui/Glass';

const STEPS = [
  { icon: Camera, title: 'Camera Feed', desc: 'Live campus cameras capture the lot' },
  { icon: Image, title: 'Image Frames', desc: 'Frames extracted at 30 FPS' },
  { icon: BrainCircuit, title: 'AI Detection', desc: 'Vision model finds vehicles & empty slots' },
  { icon: Database, title: 'Slot Status Logic', desc: 'States mapped to parking slots' },
  { icon: LayoutDashboard, title: 'Website Dashboard', desc: 'Real-time glass UI updates' },
  { icon: MapPin, title: 'User Finds Slot', desc: 'Driver navigates to the best slot' },
  { icon: RefreshCw, title: 'Feedback Loop', desc: 'Occupancy feeds back into the model' },
];

export function SystemFlowSection() {
  return (
    <section className="relative z-10 py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="System Flow"
          subtitle="From camera frames to a driver finding a spot — the full SlotSense pipeline."
        />

        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-stretch">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.title} className="flex items-center gap-3 md:flex-1 md:flex-col md:gap-0">
                <GlassCard className="group flex-1 p-4 hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-3 md:flex-col md:text-center">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-jade/20 text-mint group-hover:animate-pulse-glow">
                      <Icon size={22} />
                    </span>
                    <div className="md:mt-3">
                      <div className="flex items-center gap-2 md:justify-center">
                        <span className="font-display text-xs font-bold text-mint/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-sm font-bold text-white">{step.title}</h3>
                      </div>
                      <p className="mt-1 text-xs text-white/55">{step.desc}</p>
                    </div>
                  </div>
                </GlassCard>
                {!isLast && (
                  <div className="flex shrink-0 items-center justify-center md:w-full md:py-1">
                    <span className="grid h-7 w-7 place-items-center rounded-full glass text-mint md:rotate-90">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Loop indicator */}
        <div className="mt-6 flex items-center justify-center">
          <GlassCard className="flex items-center gap-3 px-5 py-3">
            <RefreshCw size={16} className="text-mint animate-spin-slow" />
            <span className="text-sm text-white/70">
              Continuous feedback loop — the system keeps learning and improving
            </span>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
