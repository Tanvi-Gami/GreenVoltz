/**
 * Location and Distance Utilities for GreenVoltz
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  label?: string;
}

export const CITY_PRESETS: Record<string, Coordinates> = {
  'Gandhinagar, Gujarat': { latitude: 23.2156, longitude: 72.6369, label: 'Gandhinagar, Gujarat (Demo)' },
  'DAU Campus, Gandhinagar': { latitude: 23.1686, longitude: 72.6369, label: 'DAU Campus, Gandhinagar (Demo)' },
  'San Francisco, CA': { latitude: 37.7749, longitude: -122.4194, label: 'San Francisco, CA' },
  'Palo Alto, CA': { latitude: 37.4419, longitude: -122.143, label: 'Palo Alto, CA' },
  'San Jose, CA': { latitude: 37.3382, longitude: -121.8863, label: 'San Jose, CA' },
  'Oakland, CA': { latitude: 37.8044, longitude: -122.2712, label: 'Oakland, CA' },
  'Mumbai, MH': { latitude: 19.076, longitude: 72.8777, label: 'Mumbai, MH' },
  'Delhi, NCR': { latitude: 28.6139, longitude: 77.209, label: 'Delhi, NCR' },
  'Bengaluru, KA': { latitude: 12.9716, longitude: 77.5946, label: 'Bengaluru, KA' },
};

/**
 * Calculates Great Circle distance between two points using the Haversine formula (km)
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(1));
}

/**
 * Converts distance in km to estimated arrival driving time in minutes
 */
export function estimateArrivalMinutes(distanceKm: number): number {
  // Average urban speed ~ 30 km/h -> 2 minutes per km
  return Math.max(3, Math.round(distanceKm * 2.2));
}

/**
 * Calculates estimated charging duration in minutes given energy needed (kWh) and charger speed (kW)
 */
export function calculateChargeDurationMinutes(energyKwh: number, speedKw: number): number {
  if (!speedKw || speedKw <= 0 || energyKwh <= 0) return 0;
  return Math.max(5, Math.round((energyKwh / speedKw) * 60));
}

/**
 * Returns formatted ETA HH:MM string given drive time in minutes
 */
export function formatEtaTime(driveMinutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + driveMinutes);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Checks if estimated arrival time falls within station charging window (e.g. "14:30 – 15:15")
 */
export function isEtaInWindow(driveMinutes: number, windowStr: string): boolean {
  if (!windowStr || !windowStr.includes('–')) return true;
  try {
    const parts = windowStr.split('–').map((s) => s.trim());
    if (parts.length !== 2) return true;

    const [startStr, endStr] = parts;
    const now = new Date();
    const eta = new Date(now.getTime() + driveMinutes * 60000);

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const startTime = new Date(now);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endH, endM, 0, 0);

    return eta >= startTime && eta <= endTime;
  } catch {
    return true;
  }
}
