import type { Coordinates } from '@/utils/location';

export function buildGoogleDirectionsUrl(
  destination: Coordinates,
  origin?: Coordinates,
): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: 'driving',
  });

  if (origin) {
    params.set('origin', `${origin.latitude},${origin.longitude}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function openGoogleDirections(
  destination: Coordinates,
  origin?: Coordinates,
): void {
  window.open(buildGoogleDirectionsUrl(destination, origin), '_blank', 'noopener,noreferrer');
}
