import { PGlite } from '@electric-sql/pglite';
import { SEED_ZONES, SEED_SLOTS } from '@/data/campus';
import {
  type ParkingZone,
  type ParkingSlot,
  type Reservation,
  type ActivityLog,
  type SlotStats,
  type SlotStatus,
  type AdminUser,
} from '@/types';

let dbPromise: Promise<PGlite> | null = null;

function getDb(): Promise<PGlite> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PGlite('idb://slotsense_v2');
      await initSchema(db);
      await seed(db);
      return db;
    })();
  }
  return dbPromise;
}

async function initSchema(db: PGlite) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS parking_zones (
      id    SERIAL PRIMARY KEY,
      name  TEXT NOT NULL,
      color TEXT NOT NULL,
      lat   DOUBLE PRECISION NOT NULL,
      lng   DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parking_slots (
      id         SERIAL PRIMARY KEY,
      label      TEXT NOT NULL,
      zone_id    INTEGER REFERENCES parking_zones(id) ON DELETE CASCADE,
      status     TEXT NOT NULL DEFAULT 'available',
      confidence REAL NOT NULL DEFAULT 95,
      distance   REAL NOT NULL DEFAULT 0,
      lat        DOUBLE PRECISION NOT NULL,
      lng        DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id         SERIAL PRIMARY KEY,
      slot_id    INTEGER REFERENCES parking_slots(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id         SERIAL PRIMARY KEY,
      action     TEXT NOT NULL,
      detail     TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id       SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      pass     TEXT NOT NULL
    );
  `);
}

async function seed(db: PGlite) {
  const { rows: existingZones } = await db.query<{ id: number }>(
    'SELECT id FROM parking_zones LIMIT 1',
  );
  if (existingZones.length > 0) return;

  for (const z of SEED_ZONES) {
    await db.query(
      'INSERT INTO parking_zones (name, color, lat, lng) VALUES ($1, $2, $3, $4)',
      [z.name, z.color, z.lat, z.lng],
    );
  }

  const { rows: zones } = await db.query<ParkingZone>(
    'SELECT id, name, color, lat, lng FROM parking_zones ORDER BY id',
  );

  for (const s of SEED_SLOTS) {
    const zone = zones[s.zoneIdx];
    await db.query(
      'INSERT INTO parking_slots (label, zone_id, status, confidence, distance, lat, lng) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [s.label, zone.id, s.status, s.confidence, s.distance, s.lat, s.lng],
    );
  }

  await db.query(
    "INSERT INTO admin_users (username, pass) VALUES ('admin', 'admin123') ON CONFLICT DO NOTHING",
  );

  await db.query(
    "INSERT INTO activity_logs (action, detail) VALUES ('system', 'Database seeded with 20 demo slots across 2 zones')",
  );
}

function mapSlot(r: Record<string, unknown>): ParkingSlot {
  return {
    id: r.id as number,
    label: r.label as string,
    zone_id: r.zone_id as number,
    zone_name: r.zone_name as string,
    zone_color: r.zone_color as string,
    status: r.status as SlotStatus,
    confidence: r.confidence as number,
    distance: r.distance as number,
    lat: r.lat as number,
    lng: r.lng as number,
  };
}

export async function fetchSlots(): Promise<ParkingSlot[]> {
  const db = await getDb();
  const { rows } = await db.query<Record<string, unknown>>(
    `SELECT s.id, s.label, s.zone_id, z.name AS zone_name, z.color AS zone_color,
            s.status, s.confidence, s.distance, s.lat, s.lng
     FROM parking_slots s
     JOIN parking_zones z ON s.zone_id = z.id
     ORDER BY s.id`,
  );
  return rows.map(mapSlot);
}

export async function fetchZones(): Promise<ParkingZone[]> {
  const db = await getDb();
  const { rows } = await db.query<ParkingZone>(
    'SELECT id, name, color, lat, lng FROM parking_zones ORDER BY id',
  );
  return rows;
}

export async function fetchStats(): Promise<SlotStats> {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE status = 'available')::int AS available,
       count(*) FILTER (WHERE status = 'occupied')::int AS occupied,
       count(*) FILTER (WHERE status = 'reserved')::int AS reserved,
       count(*) FILTER (WHERE status = 'maintenance')::int AS maintenance
     FROM parking_slots`,
  );
  return rows[0] as SlotStats;
}

export async function fetchReservations(): Promise<Reservation[]> {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT r.id, r.slot_id, s.label AS slot_label, r.created_at
     FROM reservations r
     JOIN parking_slots s ON r.slot_id = s.id
     ORDER BY r.id DESC`,
  );
  return rows as Reservation[];
}

export async function fetchLogs(limit = 50): Promise<ActivityLog[]> {
  const db = await getDb();
  const { rows } = await db.query(
    'SELECT id, action, detail, created_at FROM activity_logs ORDER BY id DESC LIMIT $1',
    [limit],
  );
  return rows as ActivityLog[];
}

export async function reserveSlot(slotId: number): Promise<void> {
  const db = await getDb();
  await db.query("UPDATE parking_slots SET status = 'reserved' WHERE id = $1", [slotId]);
  const { rows } = await db.query<{ label: string }>(
    'SELECT label FROM parking_slots WHERE id = $1',
    [slotId],
  );
  const label = rows[0]?.label ?? `#${slotId}`;
  await db.query(
    'INSERT INTO reservations (slot_id) VALUES ($1)',
    [slotId],
  );
  await db.query(
    'INSERT INTO activity_logs (action, detail) VALUES ($1, $2)',
    ['reserve', `Slot ${label} reserved by user`],
  );
}

export async function setSlotStatus(slotId: number, status: SlotStatus): Promise<void> {
  const db = await getDb();
  await db.query('UPDATE parking_slots SET status = $1 WHERE id = $1', [status, slotId]);
  const { rows } = await db.query<{ label: string }>(
    'SELECT label FROM parking_slots WHERE id = $1',
    [slotId],
  );
  const label = rows[0]?.label ?? `#${slotId}`;
  await db.query(
    'INSERT INTO activity_logs (action, detail) VALUES ($1, $2)',
    ['status_change', `Slot ${label} set to ${status} (admin)`],
  );
}

export async function cycleSlotStatus(slotId: number): Promise<SlotStatus> {
  const db = await getDb();
  const { rows } = await db.query<{ status: SlotStatus }>(
    'SELECT status FROM parking_slots WHERE id = $1',
    [slotId],
  );
  if (rows.length === 0) throw new Error('Slot not found');
  const order: SlotStatus[] = ['available', 'occupied', 'reserved', 'maintenance'];
  const next = order[(order.indexOf(rows[0].status) + 1) % order.length];
  await setSlotStatus(slotId, next);
  return next;
}

export async function runAiScan(): Promise<{ updated: number }> {
  const db = await getDb();
  const { rows } = await db.query<{ id: number; status: SlotStatus }>(
    'SELECT id, status FROM parking_slots WHERE status IN ($1, $2) ORDER BY random() LIMIT 5',
    ['available', 'occupied'],
  );
  let updated = 0;
  for (const row of rows) {
    const flip: SlotStatus = row.status === 'available' ? 'occupied' : 'available';
    await db.query('UPDATE parking_slots SET status = $1, confidence = $2 WHERE id = $3', [
      flip,
      Math.round((88 + Math.random() * 11) * 10) / 10,
      row.id,
    ]);
    updated++;
  }
  await db.query(
    'INSERT INTO activity_logs (action, detail) VALUES ($1, $2)',
    ['ai_scan', `AI scan simulated: ${updated} slots updated`],
  );
  return { updated };
}

export async function resetAllSlots(): Promise<void> {
  const db = await getDb();
  await db.query("UPDATE parking_slots SET status = 'available', confidence = 95");
  await db.query('DELETE FROM reservations');
  await db.query(
    'INSERT INTO activity_logs (action, detail) VALUES ($1, $2)',
    ['reset', 'All slots reset to available (admin)'],
  );
}

export async function updateZone(
  id: number,
  data: { name: string; color: string; lat: number; lng: number },
): Promise<void> {
  const db = await getDb();
  await db.query(
    'UPDATE parking_zones SET name = $1, color = $2, lat = $3, lng = $4 WHERE id = $5',
    [data.name, data.color, data.lat, data.lng, id],
  );
  await db.query(
    'INSERT INTO activity_logs (action, detail) VALUES ($1, $2)',
    ['zone_edit', `Zone ${data.name} updated (admin)`],
  );
}

export async function updateSlotLocation(
  slotId: number,
  lat: number,
  lng: number,
): Promise<void> {
  const db = await getDb();
  await db.query('UPDATE parking_slots SET lat = $1, lng = $2 WHERE id = $3', [lat, lng, slotId]);
  await db.query(
    'INSERT INTO activity_logs (action, detail) VALUES ($1, $2)',
    ['slot_move', `Slot #${slotId} location updated (admin)`],
  );
}

export async function verifyAdmin(username: string, pass: string): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query<AdminUser>(
    'SELECT id, username FROM admin_users WHERE username = $1 AND pass = $2',
    [username, pass],
  );
  return rows.length > 0;
}
