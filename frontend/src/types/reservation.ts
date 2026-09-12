export interface Reservation {
  id: string;
  stationId: string;
  stationName: string;
  chargerType: string;
  chargingSpeedKw: number;
  vehicleName: string;
  window: string;
  date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  depositPaid: number;
  totalCost: number;
  energyKwh: number;
  passCode: string;
  distanceKm: number;
  createdAt: string;
}
