import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type ParkingSlot, type ParkingZone, type SlotStatus } from '@/types';
import { STATUS_COLORS } from '@/types';
import { CAMPUS_CENTER, CAMPUS_ZOOM, ENTRANCE } from '@/data/campus';
import { type LatLng } from '@/lib/geo';

export interface MapViewProps {
  slots: ParkingSlot[];
  zones: ParkingZone[];
  userLocation: LatLng | null;
  selectedId: number | null;
  recommendedId: number | null;
  route: LatLng[] | null;
  onSlotClick: (slot: ParkingSlot) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pickMode?: boolean;
}

function slotIcon(slot: ParkingSlot, selected: boolean, recommended: boolean): L.DivIcon {
  const color = STATUS_COLORS[slot.status];
  const ring = selected ? '#2dd4bf' : recommended ? '#a7f3d0' : color;
  const glow = selected
    ? '0 0 18px rgba(45,212,191,0.9)'
    : recommended
      ? '0 0 16px rgba(167,243,208,0.8)'
      : `0 0 10px ${color}88`;
  return L.divIcon({
    className: 'slotsense-marker',
    html: `
      <div style="
        width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 2px solid ${ring}; box-shadow: ${glow};
        display: grid; place-items: center;
      ">
        <span style="transform: rotate(45deg); font-size: 9px; font-weight: 700; color: #fff; font-family: 'Space Grotesk', sans-serif;">${slot.label}</span>
      </div>
      ${recommended ? '<div style="position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-size:8px; font-weight:700; background:#B7E5BA; color:#1A5140; padding:1px 5px; border-radius:6px; white-space:nowrap;">BEST</div>' : ''}
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    className: 'slotsense-user',
    html: `
      <div style="position:relative; width:20px; height:20px;">
        <div style="position:absolute; inset:0; border-radius:50%; background:#2dd4bf; opacity:0.3; animation: slotsense-ping 1.6s ease-out infinite;"></div>
        <div style="position:absolute; inset:4px; border-radius:50%; background:#2dd4bf; border:2px solid #fff; box-shadow:0 0 12px rgba(45,212,191,0.8);"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function entranceIcon(): L.DivIcon {
  return L.divIcon({
    className: 'slotsense-entry',
    html: `
      <div style="
        width:28px; height:28px; border-radius:50%;
        background:#1A5140; border:2px solid #B7E5BA;
        display:grid; place-items:center; box-shadow:0 0 14px rgba(183,229,186,0.6);
        font-size:14px;">🅿</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function MapView({
  slots,
  zones,
  userLocation,
  selectedId,
  recommendedId,
  route,
  onSlotClick,
  onMapClick,
  pickMode,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const slotMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng],
      zoom: CAMPUS_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 21,
    }).addTo(map);
    L.marker([ENTRANCE.lat, ENTRANCE.lng], { icon: entranceIcon() })
      .addTo(map)
      .bindTooltip('Campus Entrance', { direction: 'top' });
    mapRef.current = map;

    // inject ping keyframes once
    const styleId = 'slotsense-map-style';
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `@keyframes slotsense-ping { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.6);opacity:0} }`;
      document.head.appendChild(s);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // handle map clicks
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: L.LeafletMouseEvent) => {
      if (pickMode && onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [pickMode, onMapClick]);

  // update slot markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existing = slotMarkersRef.current;
    const seen = new Set<number>();

    for (const slot of slots) {
      seen.add(slot.id);
      const isSelected = selectedId === slot.id;
      const isRecommended = recommendedId === slot.id;
      const icon = slotIcon(slot, isSelected, isRecommended);
      const existingMarker = existing.get(slot.id);
      if (existingMarker) {
        existingMarker.setIcon(icon);
        existingMarker.setLatLng([slot.lat, slot.lng]);
      } else {
        const marker = L.marker([slot.lat, slot.lng], { icon }).addTo(map);
        marker.on('click', () => onSlotClick(slot));
        existing.set(slot.id, marker);
      }
    }

    // remove markers for slots no longer present
    for (const [id, marker] of existing) {
      if (!seen.has(id)) {
        map.removeLayer(marker);
        existing.delete(id);
      }
    }
  }, [slots, selectedId, recommendedId, onSlotClick]);

  // user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userLocation) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon(),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip('You are here', { direction: 'top', permanent: false });
    }
  }, [userLocation]);

  // route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    if (route && route.length >= 2) {
      const latlngs = route.map((p) => [p.lat, p.lng]) as [number, number][];
      routeRef.current = L.polyline(latlngs, {
        color: '#2dd4bf',
        weight: 4,
        opacity: 0.85,
        dashArray: '8 8',
        lineCap: 'round',
      }).addTo(map);
      // fit bounds to route
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds.pad(0.3), { animate: true, maxZoom: 19 });
    }
  }, [route]);

  return <div ref={containerRef} className="h-full w-full" style={{ minHeight: 380, borderRadius: '1.5rem', zIndex: 0 }} />;
}
