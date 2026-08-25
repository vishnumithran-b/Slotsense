import { LocateFixed, MapPinned, Info, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/Glass';
import { type LatLng, formatDistance, nearestZone } from '@/lib/geo';
import { type ParkingZone } from '@/types';

interface GeolocationBarProps {
  location: LatLng | null;
  source: 'gps' | 'manual' | null;
  error: string | null;
  requesting: boolean;
  zones: ParkingZone[];
  onUseLocation: () => void;
  onPickMode: () => void;
  onClear: () => void;
  pickMode: boolean;
}

export function GeolocationBar({
  location,
  source,
  error,
  requesting,
  zones,
  onUseLocation,
  onPickMode,
  onClear,
  pickMode,
}: GeolocationBarProps) {
  const nearest = location ? nearestZone(zones, location) : null;
  const nearestDist = location && nearest ? formatDistance(Math.round(Math.hypot((nearest.lat - location.lat) * 111000, (nearest.lng - location.lng) * 111000 * Math.cos(location.lat * Math.PI / 180)))) : null;

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onUseLocation}
            disabled={requesting}
            className="glow-btn flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            <LocateFixed size={16} className={requesting ? 'animate-spin' : ''} />
            {requesting ? 'Locating...' : 'Use My Location'}
          </button>
          <button
            onClick={onPickMode}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              pickMode ? 'bg-mint text-deep-green' : 'glass text-white/80 hover:bg-white/10'
            }`}
          >
            <MapPinned size={15} />
            {pickMode ? 'Tap on map to set location' : 'Pick on Map'}
          </button>
          {location && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 rounded-2xl glass px-3 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {location && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 text-mint">
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse-glow" />
              {source === 'gps' ? 'GPS location' : 'Manual location'}
            </span>
            <span className="text-white/60">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </span>
            {nearest && (
              <span className="text-white/70">
                Nearest zone: <span className="font-semibold text-white">{nearest.name}</span> · {nearestDist}
              </span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-2xl bg-red-500/15 px-4 py-2.5 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 text-xs text-white/45">
        <Info size={13} className="mt-0.5 shrink-0 text-mint/60" />
        <span>Location is used only to suggest nearby parking. It is never stored or tracked continuously.</span>
      </div>
    </GlassCard>
  );
}
