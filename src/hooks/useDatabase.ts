import { useCallback, useEffect, useState } from 'react';
import {
  fetchSlots,
  fetchZones,
  fetchStats,
  fetchLogs,
  fetchReservations,
} from '@/lib/db';
import { type ParkingSlot, type ParkingZone, type SlotStats, type ActivityLog, type Reservation } from '@/types';

interface DatabaseState {
  slots: ParkingSlot[];
  zones: ParkingZone[];
  stats: SlotStats;
  logs: ActivityLog[];
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDatabase(): DatabaseState {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [stats, setStats] = useState<SlotStats>({ total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, z, st, l, r] = await Promise.all([
        fetchSlots(),
        fetchZones(),
        fetchStats(),
        fetchLogs(),
        fetchReservations(),
      ]);
      setSlots(s);
      setZones(z);
      setStats(st);
      setLogs(l);
      setReservations(r);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { slots, zones, stats, logs, reservations, loading, error, refresh };
}
