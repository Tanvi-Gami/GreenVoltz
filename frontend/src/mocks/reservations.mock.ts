import type { Reservation } from '@/types';

export function mockReservations(): Reservation[] {
  const now = new Date();
  const in1h = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'res-001',
      station_id: 'sta-001',
      charger_id: 'chr-001-03',
      user_id: 'usr-demo',
      start_time: now.toISOString(),
      end_time: in1h,
      estimated_energy_kwh: 30,
      status: 'active',
    },
    {
      id: 'res-002',
      station_id: 'sta-003',
      charger_id: 'chr-003-01',
      user_id: 'usr-demo',
      start_time: in1h,
      end_time: in2h,
      estimated_energy_kwh: 50,
      status: 'confirmed',
    },
  ];
}
