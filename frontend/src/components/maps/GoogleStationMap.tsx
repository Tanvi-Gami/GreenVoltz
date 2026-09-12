import { useEffect, useRef, useState } from 'react';
import { Coffee, ExternalLink, MapPin, Navigation } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Coordinates } from '@/utils/location';
import { openGoogleDirections } from '@/utils/maps';
import type { ChargingStationOption } from '@/services/driverService';

interface GoogleStationMapProps {
  stations: ChargingStationOption[];
  selectedStation: ChargingStationOption;
  nearestStation: ChargingStationOption;
  userCoords: Coordinates;
  userLocationIsLive: boolean;
  onSelect: (stationId: string) => void;
}

interface GoogleMapsApi {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Marker: new (options: Record<string, unknown>) => GoogleMarker;
    InfoWindow: new () => GoogleInfoWindow;
    places: {
      PlacesService: new (map: GoogleMap) => GooglePlacesService;
      PlacesServiceStatus: { OK: string };
    };
  };
}

interface GoogleMap {
  setCenter: (center: { lat: number; lng: number }) => void;
}

interface GoogleMarker {
  addListener: (event: string, callback: () => void) => void;
  setMap: (map: GoogleMap | null) => void;
  setIcon: (icon: Record<string, unknown>) => void;
}

interface GoogleInfoWindow {
  setContent: (content: string) => void;
  open: (map: GoogleMap, marker: GoogleMarker) => void;
}

interface GooglePlacesService {
  nearbySearch: (
    request: {
      location: { lat: number; lng: number };
      radius: number;
      keyword: string;
      type: string[];
    },
    callback: (results: GooglePlace[] | null, status: string) => void,
  ) => void;
}

interface GooglePlace {
  name?: string;
  vicinity?: string;
  rating?: number;
  geometry?: { location?: { lat: () => number; lng: () => number } };
  place_id?: string;
}

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

const MAP_SCRIPT_ID = 'greenvoltz-google-maps';
const MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (window.google) return Promise.resolve(window.google);
  if (!MAP_API_KEY) return Promise.reject(new Error('Google Maps API key is not configured.'));

  const existingScript = document.getElementById(MAP_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => window.google && resolve(window.google), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = MAP_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAP_API_KEY)}&libraries=places`;
    script.onload = () => window.google ? resolve(window.google) : reject(new Error('Google Maps API unavailable.'));
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.appendChild(script);
  });
}

export default function GoogleStationMap({
  stations,
  selectedStation,
  nearestStation,
  userCoords,
  userLocationIsLive,
  onSelect,
}: GoogleStationMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [placesError, setPlacesError] = useState<string | null>(null);

  const findRefreshments = () => {
    if (!window.google || !mapRef.current || selectedStation.latitude === undefined || selectedStation.longitude === undefined) {
      setPlacesError('Google Places is unavailable. You can still open Google Maps for nearby refreshments.');
      return;
    }
    setPlacesError(null);
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      {
        location: { lat: selectedStation.latitude, lng: selectedStation.longitude },
        radius: 1500,
        keyword: 'cafe restaurant coffee shop convenience store',
        type: ['cafe', 'restaurant', 'store'],
      },
      (results, status) => {
        if (status !== window.google?.maps.places.PlacesServiceStatus.OK || !results?.length) {
          setPlaces([]);
          setPlacesError('No refreshments were found near this station.');
          return;
        }
        setPlaces(results.slice(0, 5));
      },
    );
  };

  const openRefreshment = (place: GooglePlace) => {
    if (place.geometry?.location) {
      openGoogleDirections({
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      });
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapElement.current) return;
        const map = new google.maps.Map(mapElement.current, {
          center: { lat: 23.2156, lng: 72.6369 },
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        const infoWindow = new google.maps.InfoWindow();

        stations.forEach((station) => {
          if (station.latitude === undefined || station.longitude === undefined) return;
          const marker = new google.maps.Marker({
            map,
            position: { lat: station.latitude, lng: station.longitude },
            title: station.name,
            ...(station.id === selectedStation.id ? { animation: 1 } : {}),
          });
          marker.addListener('click', () => {
            onSelect(station.id);
            infoWindow.setContent(
              `<strong>${station.name}</strong><br>${station.availableChargers}/${station.totalChargers} chargers available`,
            );
            infoWindow.open(map, marker);
          });
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) setMapError(error instanceof Error ? error.message : 'Google Maps is unavailable.');
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
    };
  }, [onSelect, selectedStation.id, stations]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: selectedStation.latitude ?? userCoords.latitude, lng: selectedStation.longitude ?? userCoords.longitude });
    }
  }, [selectedStation, userCoords]);

  return (
    <Card padding="none" className="overflow-hidden border-cyan/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan" />
            <h2 className="text-base font-semibold text-primary">Nearest charging station</h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            {mapError
              ? `Static station view — nearest: ${nearestStation.name}. Google Maps key is not configured.`
              : `Nearest: ${nearestStation.name} • Centered on ${userLocationIsLive ? 'your live location' : 'Gandhinagar demo location'}.`}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Navigation className="h-3.5 w-3.5" />}
          onClick={() => openGoogleDirections(
            { latitude: selectedStation.latitude ?? userCoords.latitude, longitude: selectedStation.longitude ?? userCoords.longitude },
            userLocationIsLive ? userCoords : undefined,
          )}
        >
          Navigate
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-5 py-3">
        <p className="flex items-center gap-2 text-xs text-secondary">
          <Coffee className="h-4 w-4 text-accent" />
          Taking a break while you charge?
        </p>
        <Button size="sm" variant="ghost" onClick={findRefreshments}>
          Nearby refreshments
        </Button>
      </div>

      {mapError ? (
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {stations.map((station) => (
            <button
              type="button"
              key={station.id}
              onClick={() => onSelect(station.id)}
              className={`rounded-lg border p-3 text-left ${station.id === selectedStation.id ? 'border-accent bg-accent/10' : 'border-subtle bg-elevated/40'}`}
            >
              <p className="font-medium text-primary">{station.name}</p>
              <p className="mt-1 text-xs text-muted">{station.distanceKm} km • {station.availableChargers}/{station.totalChargers} available</p>
            </button>
          ))}
        </div>
      ) : (
        <div ref={mapElement} className="h-72 w-full bg-elevated/40" aria-label="Charging station map" />
      )}

      {(places.length > 0 || placesError) && (
        <div className="border-t border-subtle px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">Nearby refreshments</p>
          {placesError && <p className="text-xs text-muted">{placesError}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {places.map((place) => (
              <button
                type="button"
                key={place.place_id ?? place.name}
                onClick={() => openRefreshment(place)}
                className="flex items-center justify-between rounded-md border border-subtle bg-elevated/40 p-3 text-left hover:border-accent/50"
              >
                <span>
                  <span className="block text-sm font-medium text-primary">{place.name ?? 'Nearby place'}</span>
                  <span className="block text-xs text-muted">{place.vicinity ?? 'Near selected station'}{place.rating ? ` • ★ ${place.rating}` : ''}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-accent" />
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
