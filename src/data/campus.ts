// Campus center — Rathinam College of Arts & Science, Eachanari, Coimbatore.
// 10.9346°N, 76.9786°E — Pollachi Road, Eachanari, Coimbatore, Tamil Nadu 641021.
export const CAMPUS_CENTER = { lat: 10.9346, lng: 76.9786 };
export const CAMPUS_ZOOM = 18;

// Main parking entrance marker — near the campus gate on Pollachi Road.
export const ENTRANCE = { lat: 10.9341, lng: 76.9781 };

// Two seed zones with their own anchor coordinates within the Rathinam campus.
// Zone A is the north parking lot, Zone B is the south parking lot.
export const SEED_ZONES = [
  { name: 'Zone A · North Lot', color: '#288760', lat: 10.9352, lng: 76.9789 },
  { name: 'Zone B · South Lot', color: '#5CA87C', lat: 10.9340, lng: 76.9783 },
] as const;

// Spread offset (in degrees) for slot positions around a zone anchor.
const OFFSET = 0.00045;

function slotPosition(zoneIdx: number, i: number) {
  const zone = SEED_ZONES[zoneIdx];
  const perRow = 5;
  const row = Math.floor(i / perRow);
  const col = i % perRow;
  const dx = (col - 2) * OFFSET * 0.6;
  const dy = (row - 0.5) * OFFSET * 0.8;
  return { lat: zone.lat + dy, lng: zone.lng + dx };
}

export interface SeedSlot {
  label: string;
  zoneIdx: number;
  status: 'available' | 'occupied' | 'reserved';
  confidence: number;
  distance: number;
  lat: number;
  lng: number;
}

export const SEED_SLOTS: SeedSlot[] = Array.from({ length: 20 }, (_, i) => {
  const zoneIdx = i < 10 ? 0 : 1;
  const pos = slotPosition(zoneIdx, i % 10);
  let status: SeedSlot['status'] = 'available';
  if (i % 3 === 0) status = 'occupied';
  else if (i % 7 === 0) status = 'reserved';
  return {
    label: `${zoneIdx === 0 ? 'A' : 'B'}${String(i % 10 + 1).padStart(2, '0')}`,
    zoneIdx,
    status,
    confidence: Math.round((82 + ((i * 1.7) % 17)) * 10) / 10,
    distance: Math.round((zoneIdx * 8 + (i % 10) * 3 + 4) * 10) / 10,
    lat: pos.lat,
    lng: pos.lng,
  };
});
