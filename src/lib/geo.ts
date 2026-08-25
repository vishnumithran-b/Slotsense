import { type ParkingSlot, type SlotStatus } from '@/types';

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_KM = 6371;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * 1000 * Math.asin(Math.sqrt(h));
}

export function findNearestAvailable(
  slots: ParkingSlot[],
  origin: LatLng,
): ParkingSlot | null {
  const available = slots.filter((s) => s.status === 'available');
  if (available.length === 0) return null;
  let best = available[0];
  let bestDist = haversineMeters(origin, best);
  for (const s of available.slice(1)) {
    const d = haversineMeters(origin, s);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

export function nearestZone(
  zones: { id: number; name: string; lat: number; lng: number }[],
  origin: LatLng,
): { id: number; name: string; lat: number; lng: number } | null {
  if (zones.length === 0) return null;
  let best = zones[0];
  let bestDist = haversineMeters(origin, best);
  for (const z of zones.slice(1)) {
    const d = haversineMeters(origin, z);
    if (d < bestDist) {
      best = z;
      bestDist = d;
    }
  }
  return best;
}

export function distanceToSlot(origin: LatLng, slot: ParkingSlot): number {
  return haversineMeters(origin, { lat: slot.lat, lng: slot.lng });
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export const STATUS_ORDER: SlotStatus[] = ['available', 'occupied', 'reserved', 'maintenance'];

export function nextStatus(status: SlotStatus): SlotStatus {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
}
