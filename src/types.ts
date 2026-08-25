export type SlotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface ParkingZone {
  id: number;
  name: string;
  color: string;
  lat: number;
  lng: number;
}

export interface ParkingSlot {
  id: number;
  label: string;
  zone_id: number;
  zone_name: string;
  zone_color: string;
  status: SlotStatus;
  confidence: number;
  distance: number;
  lat: number;
  lng: number;
}

export interface Reservation {
  id: number;
  slot_id: number;
  slot_label: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  detail: string;
  created_at: string;
}

export interface SlotStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}

export interface AdminUser {
  id: number;
  username: string;
}

export const STATUS_LABEL: Record<SlotStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
};

export const STATUS_COLORS: Record<SlotStatus, string> = {
  available: '#288760',
  occupied: '#c0392b',
  reserved: '#f5b042',
  maintenance: '#7f8c8d',
};
