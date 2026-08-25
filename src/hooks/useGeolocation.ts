import { useCallback, useState } from 'react';
import { type LatLng } from '@/lib/geo';

export type LocationState = {
  location: LatLng | null;
  source: 'gps' | 'manual' | null;
  error: string | null;
  requesting: boolean;
};

export function useGeolocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    source: null,
    error: null,
    requesting: false,
  });

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }
    setState((s) => ({ ...s, requesting: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          source: 'gps',
          error: null,
          requesting: false,
        });
      },
      (err) => {
        let msg = 'Could not get your location.';
        if (err.code === err.PERMISSION_DENIED)
          msg = 'Location permission denied. You can pick a spot on the map instead.';
        setState((s) => ({ ...s, error: msg, requesting: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const setManualLocation = useCallback((loc: LatLng) => {
    setState({
      location: loc,
      source: 'manual',
      error: null,
      requesting: false,
    });
  }, []);

  const clearLocation = useCallback(() => {
    setState({ location: null, source: null, error: null, requesting: false });
  }, []);

  return { ...state, requestLocation, setManualLocation, clearLocation };
}
