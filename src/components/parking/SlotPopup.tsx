import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, Car, CircleDot, Lock, Gauge, Ruler, MapPin, ShieldCheck, Wrench, CalendarCheck, Loader2 } from 'lucide-react';
import { type ParkingSlot, type SlotStatus, STATUS_LABEL, STATUS_COLORS } from '@/types';
import { type LatLng, formatDistance, distanceToSlot } from '@/lib/geo';

interface SlotPopupProps {
  slot: ParkingSlot;
  rect: DOMRect;
  userLocation: LatLng | null;
  reserving: boolean;
  onReserve: () => void;
  onClose: () => void;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Car; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-mint">
        <Icon size={16} />
      </span>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/50">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

const STATUS_ICON: Record<SlotStatus, typeof Car> = {
  available: CircleDot,
  occupied: Car,
  reserved: Lock,
  maintenance: Wrench,
};

export function SlotPopup({
  slot,
  rect,
  userLocation,
  reserving,
  onReserve,
  onClose,
}: SlotPopupProps) {
  const c = STATUS_COLORS[slot.status];
  const StatusIcon = STATUS_ICON[slot.status];
  const liveDist = userLocation ? distanceToSlot(userLocation, slot) : null;

  const popupWidth = 290;
  const margin = 12;
  let left = rect.left + rect.width / 2 - popupWidth / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - popupWidth - margin));
  const height = 380;
  const below = rect.bottom + margin + 10;
  const placeBelow = below + height < window.innerHeight;
  const top = placeBelow ? below : Math.max(margin, rect.top - height - margin);

  const canReserve = slot.status === 'available';

  const content = (
    <div
      className="fixed z-50 animate-fade-up"
      style={{ left, top, width: popupWidth }}
      role="dialog"
      aria-label={`Slot ${slot.label} details`}
    >
      <div className="glass-panel glass-strong glass-edge rounded-3xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl font-display text-lg font-bold"
              style={{
                background: `${c}33`,
                color: c,
                boxShadow: `0 0 20px ${c}88`,
                border: `1px solid ${c}66`,
              }}
            >
              {slot.label}
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-white/50">Parking Slot</div>
              <div className="font-display text-xl font-bold text-white">{slot.label}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl glass hover:bg-white/15 transition-colors"
            aria-label="Close"
          >
            <X size={15} className="text-white/70" />
          </button>
        </div>

        <div
          className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: `${c}1a`, border: `1px solid ${c}44` }}
        >
          <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: c }}>
            <StatusIcon size={16} />
            {STATUS_LABEL[slot.status]}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <ShieldCheck size={13} className="text-mint" />
            AI Verified
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat icon={MapPin} label="Zone" value={slot.zone_name} />
          <Stat icon={Gauge} label="AI Confidence" value={`${slot.confidence}%`} />
          <Stat
            icon={Ruler}
            label="From Entrance"
            value={formatDistance(slot.distance)}
          />
          {liveDist !== null && (
            <Stat icon={MapPin} label="From You" value={formatDistance(liveDist)} />
          )}
        </div>

        {canReserve ? (
          <button
            onClick={onReserve}
            disabled={reserving}
            className="glow-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {reserving ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
            {reserving ? 'Reserving...' : 'Reserve Slot'}
          </button>
        ) : (
          <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-center text-sm text-white/50">
            {slot.status === 'reserved'
              ? 'This slot is already reserved.'
              : slot.status === 'maintenance'
                ? 'This slot is under maintenance.'
                : 'This slot is currently occupied.'}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
