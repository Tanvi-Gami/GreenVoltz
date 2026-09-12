export interface VehicleStatus {
  name: string;
  batteryPercent: number;
  targetPercent: number;
  energyNeededKwh: number;
  rangeKm: number;
  chargingStatus: string;
}

export interface ChargingStationOption {
  id: string;
  name: string;
  distanceKm: number;
  availableChargers: number;
  totalChargers: number;
  chargingSpeedKw: number;
  pricePerKwh: number;
  renewablePercent: number;
  carbonKg: number;
  score: number;
  arrivalMinutes: number;
  chargerType: string;
  window: string;
  cost: number;
  savings: number;
  carbonReductionPercent: number;
  explanation: string;
  latitude?: number;
  longitude?: number;
  chargingDurationMinutes?: number;
  totalTripMinutes?: number;
  etaTime?: string;
  timeOptimalScore?: number;
  costOptimalScore?: number;
}

export interface ChargingWindow {
  time: string;
  price: number;
  carbon: number;
  renewable: number;
  demand: number;
  optimal?: boolean;
}

export interface ChargingSession {
  station: string;
  date: string;
  energyKwh: number;
  cost: number;
}

export interface DriverPageData {
  vehicle: VehicleStatus;
  recommendation: ChargingStationOption;
  alternatives: ChargingStationOption[];
  windows: ChargingWindow[];
  recentSessions: ChargingSession[];
}

const recommendationExplanation =
  'GreenVoltz recommends this window because renewable generation is expected to peak while grid carbon intensity and charging demand are lower.';

const centralHub: ChargingStationOption = {
  id: 'central-hub',
  name: 'GreenVolt Central Hub',
  distanceKm: 2.4,
  availableChargers: 6,
  totalChargers: 8,
  chargingSpeedKw: 150,
  pricePerKwh: 6.0,
  renewablePercent: 78,
  carbonKg: 4.8,
  score: 96,
  arrivalMinutes: 8,
  chargerType: 'DC Fast',
  window: '14:30 – 15:15',
  cost: 186,
  savings: 42,
  carbonReductionPercent: 31,
  explanation: recommendationExplanation,
  latitude: 37.7749,
  longitude: -122.4194,
};

export const driverPageData: DriverPageData = {
  vehicle: {
    name: 'Tesla Model 3',
    batteryPercent: 32,
    targetPercent: 80,
    energyNeededKwh: 31,
    rangeKm: 128,
    chargingStatus: 'Not charging',
  },
  recommendation: centralHub,
  alternatives: [
    {
      id: 'riverside',
      name: 'GreenVolt Riverside',
      distanceKm: 4.1,
      availableChargers: 4,
      totalChargers: 6,
      chargingSpeedKw: 120,
      pricePerKwh: 9.2,
      renewablePercent: 65,
      carbonKg: 5.7,
      score: 91,
      arrivalMinutes: 12,
      chargerType: 'DC Fast',
      window: '15:00 – 15:50',
      cost: 205,
      savings: 23,
      carbonReductionPercent: 17,
      explanation: recommendationExplanation,
      latitude: 37.7600,
      longitude: -122.4100,
    },
    {
      id: 'north',
      name: 'CityCharge North',
      distanceKm: 5.8,
      availableChargers: 7,
      totalChargers: 10,
      chargingSpeedKw: 180,
      pricePerKwh: 10.1,
      renewablePercent: 52,
      carbonKg: 6.4,
      score: 84,
      arrivalMinutes: 16,
      chargerType: 'Ultra Fast',
      window: '16:00 – 16:35',
      cost: 228,
      savings: 0,
      carbonReductionPercent: 7,
      explanation: recommendationExplanation,
      latitude: 37.8000,
      longitude: -122.4200,
    },
    {
      id: 'west',
      name: 'EcoCharge West',
      distanceKm: 7.2,
      availableChargers: 5,
      totalChargers: 8,
      chargingSpeedKw: 100,
      pricePerKwh: 8.7,
      renewablePercent: 89,
      carbonKg: 4.2,
      score: 82,
      arrivalMinutes: 19,
      chargerType: 'DC Fast',
      window: '14:45 – 15:35',
      cost: 198,
      savings: 30,
      carbonReductionPercent: 39,
      explanation: recommendationExplanation,
      latitude: 37.7500,
      longitude: -122.4500,
    },
  ],
  windows: [
    { time: '12:00', price: 72, carbon: 78, renewable: 42, demand: 68 },
    { time: '13:00', price: 65, carbon: 68, renewable: 56, demand: 62 },
    { time: '14:00', price: 48, carbon: 44, renewable: 74, demand: 40 },
    { time: '15:00', price: 42, carbon: 36, renewable: 82, demand: 34, optimal: true },
    { time: '16:00', price: 55, carbon: 51, renewable: 64, demand: 49 },
    { time: '17:00', price: 77, carbon: 72, renewable: 45, demand: 78 },
    { time: '18:00', price: 84, carbon: 81, renewable: 32, demand: 88 },
    { time: '19:00', price: 71, carbon: 74, renewable: 36, demand: 76 },
  ],
  recentSessions: [
    { station: 'GreenVolt Central Hub', date: 'Today', energyKwh: 28, cost: 168 },
    { station: 'EcoCharge West', date: 'Yesterday', energyKwh: 34, cost: 204 },
    { station: 'CityCharge North', date: 'Sep 10', energyKwh: 22, cost: 149 },
  ],
};
