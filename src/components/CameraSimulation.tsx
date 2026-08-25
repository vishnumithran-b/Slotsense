import { useEffect, useState } from 'react';
import { ScanLine, Cpu, Camera, Radio, Play, Loader2 } from 'lucide-react';
import { GlassCard, SectionHeading } from '@/components/ui/Glass';
import { runAiScan } from '@/lib/db';

interface DetectionBox {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
  kind: 'car' | 'empty' | 'scan';
}

const LABELS_CAR = ['Vehicle Detected', 'Sedan', 'SUV', 'Hatchback'];
const LABELS_EMPTY = ['Slot Empty', 'Vacant', 'Clear'];

function makeBoxes(): DetectionBox[] {
  const boxes: DetectionBox[] = [];
  let id = 0;
  for (let i = 0; i < 2; i++) {
    boxes.push({
      id: id++,
      x: 8 + i * 38 + Math.random() * 4,
      y: 30 + Math.random() * 30,
      w: 26 + Math.random() * 6,
      h: 30 + Math.random() * 8,
      label: LABELS_CAR[Math.floor(Math.random() * LABELS_CAR.length)],
      confidence: 90 + Math.random() * 9,
      kind: 'car',
    });
  }
  boxes.push({
    id: id++,
    x: 60 + Math.random() * 8,
    y: 35 + Math.random() * 20,
    w: 24,
    h: 28,
    label: LABELS_EMPTY[Math.floor(Math.random() * LABELS_EMPTY.length)],
    confidence: 88 + Math.random() * 10,
    kind: 'empty',
  });
  return boxes;
}

interface CameraSimulationProps {
  onScanComplete: () => void;
}

export function CameraSimulation({ onScanComplete }: CameraSimulationProps) {
  const [boxes, setBoxes] = useState<DetectionBox[]>(makeBoxes);
  const [frameLabel, setFrameLabel] = useState('Analyzing Frame');
  const [avgConf, setAvgConf] = useState(94.2);
  const [fps, setFps] = useState(30);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  useEffect(() => {
    const boxTimer = setInterval(() => setBoxes(makeBoxes()), 2600);
    const labelTimer = setInterval(() => {
      const labels = ['Analyzing Frame', 'Object Detected', 'Tracking', 'Idle Scan'];
      setFrameLabel(labels[Math.floor(Math.random() * labels.length)]);
    }, 1800);
    const confTimer = setInterval(() => {
      setAvgConf((p) => Math.round((90 + Math.random() * 9) * 10) / 10);
      setFps(28 + Math.floor(Math.random() * 5));
    }, 1200);
    return () => {
      clearInterval(boxTimer);
      clearInterval(labelTimer);
      clearInterval(confTimer);
    };
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setScanMsg(null);
    setFrameLabel('Running AI Scan...');
    try {
      const result = await runAiScan();
      setScanMsg(`AI scan complete — ${result.updated} slots updated and saved.`);
      await onScanComplete();
    } catch {
      setScanMsg('Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <section className="relative z-10 py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="AI Vision"
          title="Live Camera Simulation"
          subtitle="A simulated real-time feed showing how SlotSense detects vehicles and empty slots. Run an AI scan to update live slot statuses."
        />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <GlassCard strong className="p-3 md:p-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gradient-to-br from-deep-green/80 to-ink">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(183,229,186,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(183,229,186,0.18) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-mint/60"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    top: `${(i * 53) % 100}%`,
                    animation: `float ${4 + (i % 5)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 rounded-t-lg bg-white/5 border border-white/10"
                  style={{ left: `${i * 20 + 2}%`, width: '16%', height: `${40 + (i % 3) * 8}%` }}
                />
              ))}

              {boxes.map((b) => {
                const isCar = b.kind === 'car';
                const color = isCar ? '#2dd4bf' : '#f5b042';
                return (
                  <div
                    key={b.id}
                    className="absolute transition-all duration-700 ease-out animate-fade-up"
                    style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
                  >
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{ border: `1.5px solid ${color}`, boxShadow: `0 0 14px ${color}66, inset 0 0 14px ${color}22` }}
                    />
                    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos) => (
                      <span
                        key={pos}
                        className={`absolute ${pos} h-2 w-2 ${pos.includes('right') ? 'border-r' : 'border-l'} ${pos.includes('bottom') ? 'border-b' : 'border-t'}`}
                        style={{ borderColor: color }}
                      />
                    ))}
                    <div
                      className="absolute -top-6 left-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ background: color, color: '#06150f' }}
                    >
                      {b.label} · {b.confidence.toFixed(1)}%
                    </div>
                  </div>
                );
              })}

              <div className="absolute inset-x-0 top-0 h-full overflow-hidden rounded-3xl">
                <div
                  className="absolute inset-x-0 h-1 animate-scan-line"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)',
                    boxShadow: '0 0 16px 2px rgba(45,212,191,0.7)',
                  }}
                />
              </div>

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-mint backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  REC · CAM-01
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
                  <ScanLine size={12} className="text-mint" />
                  {frameLabel}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/70 backdrop-blur">
                  {fps} FPS
                </span>
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-mint backdrop-blur">
                  Avg Confidence {avgConf}%
                </span>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-jade/20 text-mint">
                  <Cpu size={20} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Detection Engine</h3>
                  <p className="text-sm text-white/55">YOLO-style vision model (simulated)</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <Meter label="Model Confidence" value={avgConf} color="#288760" />
                <Meter label="Frame Rate" value={fps} max={60} color="#2dd4bf" />
                <Meter label="Detection Coverage" value={96} color="#5CA87C" />
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="font-display text-lg font-bold text-white">AI Scan Control</h3>
              <p className="mt-1 text-sm text-white/55">
                Run a simulated detection pass. Slot statuses update randomly and save to the database.
              </p>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="glow-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {scanning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                {scanning ? 'Scanning...' : 'Run AI Scan'}
              </button>
              {scanMsg && (
                <div className="mt-3 animate-fade-up rounded-2xl glass px-4 py-3 text-sm text-mint">
                  {scanMsg}
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-jade/20 text-mint">
                  <Camera size={20} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Active Feeds</h3>
                  <p className="text-sm text-white/55">4 cameras across campus zones</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {['CAM-01 · Zone A', 'CAM-02 · Zone B', 'CAM-03 · Zone C', 'CAM-04 · Entry'].map((c, i) => (
                  <div key={c} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs">
                    <Radio size={12} className={i === 0 ? 'text-mint animate-pulse' : 'text-white/30'} />
                    <span className={i === 0 ? 'text-white' : 'text-white/50'}>{c}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meter({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-semibold text-white tabular-nums">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
}
