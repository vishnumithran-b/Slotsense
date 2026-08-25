import { useCallback, useState } from 'react';
import { Sparkles, Navigation, MapPin } from 'lucide-react';
import { type ParkingSlot, type ParkingZone, type SlotStats } from '@/types';
import { GlassCard, SectionHeading } from '@/components/ui/Glass';
import { MapView } from '@/components/map/MapView';
import { GeolocationBar } from '@/components/map/GeolocationBar';
import { SlotPopup } from './SlotPopup';
import { type LatLng, findNearestAvailable, formatDistance, distanceToSlot } from '@/lib/geo';
import { reserveSlot } from '@/lib/db';
import { useGeolocation } from '@/hooks/useGeolocation';

interface ParkingMapSectionProps {
  slots: ParkingSlot[];
  zones: ParkingZone[];
  stats: SlotStats;
  isAdmin: boolean;
  onSlotChanged: () => void;
}

interface PopupState {
  slot: ParkingSlot;
  rect: DOMRect;
}

export function ParkingMapSection({
  slots,
  zones,
  isAdmin,
  onSlotChanged,
}: ParkingMapSectionProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [recommendedId, setRecommendedId] = useState<number | null>(null);
  const [recommendMsg, setRecommendMsg] = useState<string | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const [reserving, setReserving] = useState(false);
  const [pickMode, setPickMode] = useState(false);

  const {
    location,
    source,
    error: geoError,
    requesting,
    requestLocation,
    setManualLocation,
    clearLocation,
  } = useGeolocation();

  const handleSlotClick = useCallback((slot: ParkingSlot) => {
    const el = document.querySelector<HTMLElement>(`[data-slot-marker="${slot.id}"]`);
    const rect = el?.getBoundingClientRect() ?? new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
    setPopup({ slot, rect });
    setRecommendedId(null);
    setRecommendMsg(null);
    setRoute(null);
  }, []);

  const handleClose = useCallback(() => setPopup(null), []);

  const handleReserve = useCallback(async () => {
    if (!popup) return;
    setReserving(true);
    try {
      await reserveSlot(popup.slot.id);
      await onSlotChanged();
      setPopup((prev) =>
        prev ? { ...prev, slot: { ...prev.slot, status: 'reserved' as const } } : prev,
      );
    } finally {
      setReserving(false);
    }
  }, [popup, onSlotChanged]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setManualLocation({ lat, lng });
      setPickMode(false);
    },
    [setManualLocation],
  );

  const findBestSlot = useCallback(() => {
    const origin = location ?? { lat: zones[0]?.lat ?? 0, lng: zones[0]?.lng ?? 0 };
    if (!location) {
      requestLocation();
    }
    const best = findNearestAvailable(slots, origin);
    if (!best) {
      setRecommendMsg('No available slots right now — try again later.');
      setRecommendedId(null);
      setRoute(null);
      return;
    }
    setRecommendedId(best.id);
    setRecommendMsg(`Recommended Slot: ${best.label}`);
    const entrance = { lat: zones[0]?.lat ?? origin.lat, lng: zones[0]?.lng ?? origin.lng };
    setRoute([origin, entrance, { lat: best.lat, lng: best.lng }]);
    setPopup(null);
  }, [slots, location, zones, requestLocation]);

  const nearestAvailable = location ? findNearestAvailable(slots, location) : null;
  const nearestDist = location && nearestAvailable ? distanceToSlot(location, nearestAvailable) : null;

  return (
    <section className="relative z-10 py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Interactive Map"
          title="Live Campus Parking Map"
          subtitle="Real OpenStreetMap with live slot markers. Use your location to find the nearest open spot and get a routed path."
        />

        <GeolocationBar
          location={location}
          source={source}
          error={geoError}
          requesting={requesting}
          zones={zones}
          onUseLocation={requestLocation}
          onPickMode={() => setPickMode((p) => !p)}
          onClear={clearLocation}
          pickMode={pickMode}
        />

        {nearestAvailable && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl glass px-4 py-2.5 text-sm animate-fade-up">
            <MapPin size={15} className="text-mint" />
            <span className="text-white/70">
              Nearest available slot:{' '}
              <span className="font-semibold text-white">{nearestAvailable.label}</span>
              {nearestDist !== null && (
                <> · {formatDistance(nearestDist)} away</>
              )}
            </span>
          </div>
        )}

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative">
            <GlassCard className="overflow-hidden p-1.5">
              <div className="h-[420px] md:h-[480px]">
                <MapView
                  slots={slots}
                  zones={zones}
                  userLocation={location}
                  selectedId={popup?.slot.id ?? null}
                  recommendedId={recommendedId}
                  route={route}
                  onSlotClick={handleSlotClick}
                  onMapClick={handleMapClick}
                  pickMode={pickMode}
                />
              </div>
            </GlassCard>
            {pickMode && (
              <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-mint px-4 py-1.5 text-xs font-bold text-deep-green shadow-lg">
                Tap anywhere on the map to set your location
              </div>
            )}
          </div>

          {/* Controls panel */}
          <div className="flex flex-col gap-4">
            <GlassCard className="p-5">
              <h3 className="font-display text-lg font-bold text-white">Smart Actions</h3>
              <p className="mt-1 text-sm text-white/55">
                {location
                  ? 'Using your location to find the nearest open slot.'
                  : 'Share your location for the best recommendation, or pick a spot on the map.'}
              </p>

              <button
                onClick={findBestSlot}
                className="glow-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white"
              >
                <Sparkles size={18} />
                Find Best Slot
              </button>

              {recommendMsg && (
                <div className="mt-3 animate-fade-up rounded-2xl glass px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-mint">
                    <Navigation size={15} />
                    <span className="font-semibold">{recommendMsg}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">
                    {recommendedId
                      ? 'Route drawn from your location through the entrance to the slot.'
                      : 'All slots are currently full.'}
                  </p>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="font-display text-lg font-bold text-white">Legend</h3>
              <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
                <LegendItem color="#288760" label="Available" />
                <LegendItem color="#c0392b" label="Occupied" />
                <LegendItem color="#f5b042" label="Reserved" />
                <LegendItem color="#7f8c8d" label="Maintenance" />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/45">
                <MapPin size={13} className="text-mint" />
                Click any slot marker to view details and reserve.
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {popup && (
        <SlotPopup
          slot={popup.slot}
          rect={popup.rect}
          userLocation={location}
          reserving={reserving}
          onReserve={handleReserve}
          onClose={handleClose}
        />
      )}
    </section>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-white/70">
      <span
        className="h-3 w-3 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
    </span>
  );
}
