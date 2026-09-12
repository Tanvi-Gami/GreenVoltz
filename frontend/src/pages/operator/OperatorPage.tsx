import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  DollarSign,
  MapPin,
  Power,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function OperatorPage() {
  const { operatorProfile, openProfileModal } = useAuth();
  const [loadBalancing, setLoadBalancing] = useState(true);
  const [smartGridControl, setSmartGridControl] = useState(true);

  // Generate simulated chargers based on operator totalPorts profile
  const chargers = Array.from({ length: operatorProfile.totalPorts || 8 }, (_, i) => {
    const portNumber = i + 1;
    const isFaulted = portNumber === 3;
    const isOccupied = portNumber % 2 === 1 && !isFaulted;
    const connector = operatorProfile.supportedConnectors[i % operatorProfile.supportedConnectors.length] || 'CCS';
    return {
      id: `PORT-${String(portNumber).padStart(2, '0')}`,
      connector,
      powerKw: operatorProfile.maxPowerKw > 100 ? 150 : 50,
      status: isFaulted ? 'faulted' : isOccupied ? 'occupied' : 'available',
      currentPower: isOccupied ? (loadBalancing ? 120 : 150) : 0,
      evModel: isOccupied ? (i % 3 === 0 ? 'Tesla Model Y' : 'Hyundai Ioniq 5') : '—',
      sessionTime: isOccupied ? `${25 + i * 5} min` : '—',
    };
  });

  const activeCount = chargers.filter((c) => c.status === 'occupied').length;
  const availableCount = chargers.filter((c) => c.status === 'available').length;
  const faultedCount = chargers.filter((c) => c.status === 'faulted').length;
  const totalKwInUse = chargers.reduce((sum, c) => sum + c.currentPower, 0);
  const totalRevenueToday = (totalKwInUse * 0.85 * operatorProfile.tariffRatePerKwh).toFixed(2);

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="green" dot>OPERATOR LIVE SYSTEM</Badge>
            <span className="text-xs font-semibold text-accent">• {operatorProfile.operatorName}</span>
          </div>
          <h1 className="type-h1">{operatorProfile.stationName}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-secondary">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <span>{operatorProfile.address}, {operatorProfile.city}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openProfileModal}>
            Edit Station Profile
          </Button>
          <Button leftIcon={<Zap className="h-4 w-4" />}>
            Run AI Dispatch Optimiser
          </Button>
        </div>
      </div>

      {/* Overview Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Station Ports</span>
            <Building2 className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            {availableCount} <span className="text-sm font-normal text-muted">/ {operatorProfile.totalPorts} available</span>
          </p>
          <p className="mt-1 text-xs text-success">{activeCount} actively charging</p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Total Load Output</span>
            <Activity className="h-4 w-4 text-cyan" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            {totalKwInUse} <span className="text-sm font-normal text-muted">kW</span>
          </p>
          <p className="mt-1 text-xs text-secondary">Capacity: {operatorProfile.maxPowerKw * operatorProfile.totalPorts / 2} kW</p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Current Tariff Rate</span>
            <DollarSign className="h-4 w-4 text-success" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            ₹{(operatorProfile.tariffRatePerKwh * 85).toFixed(2)} <span className="text-sm font-normal text-muted">/ kWh</span>
          </p>
          <p className="mt-1 text-xs text-success">Peak Off-grid Tariff</p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Estimated Daily Revenue</span>
            <ShieldCheck className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            ₹{(Number(totalRevenueToday) * 85).toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-success">GreenVoltz AI Optimized</p>
        </Card>
      </div>

      {/* Power Control & Smart Grid Toggles */}
      <Card>
        <SectionHeader
          title="Grid & Dynamic Load Management"
          subtitle="Control automated peak shaving and dynamic power throttling across charging ports."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-subtle bg-elevated/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Power className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Dynamic Load Balancing</p>
                <p className="text-xs text-secondary">Prevents grid sub-station overload by throttling port kW</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLoadBalancing((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition-colors focus-ring ${
                loadBalancing ? 'bg-accent' : 'bg-subtle'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  loadBalancing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-subtle bg-elevated/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/15 text-cyan">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Smart Carbon Shift</p>
                <p className="text-xs text-secondary">Prioritizes high-renewable windows automatically</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSmartGridControl((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition-colors focus-ring ${
                smartGridControl ? 'bg-accent' : 'bg-subtle'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  smartGridControl ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Live Port Monitor Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-subtle px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-primary">Live Charging Port Monitor</h2>
            <p className="text-xs text-secondary">Real-time telemetry for {operatorProfile.stationName}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-success" /> Available ({availableCount})</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-warning" /> Occupied ({activeCount})</span>
            {faultedCount > 0 && (
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-danger" /> Faulted ({faultedCount})</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated/70 text-xs uppercase tracking-wider text-muted border-b border-subtle">
              <tr>
                <th className="px-6 py-3">Port ID</th>
                <th className="px-6 py-3">Connector</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Power Output</th>
                <th className="px-6 py-3">Connected Vehicle</th>
                <th className="px-6 py-3">Session Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/60">
              {chargers.map((c) => (
                <tr key={c.id} className="hover:bg-elevated/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-primary">{c.id}</td>
                  <td className="px-6 py-4 text-secondary">{c.connector}</td>
                  <td className="px-6 py-4">
                    {c.status === 'available' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success border border-success/30">
                        <CheckCircle2 className="h-3 w-3" /> Available
                      </span>
                    )}
                    {c.status === 'occupied' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning border border-warning/30">
                        <Zap className="h-3 w-3" /> Charging
                      </span>
                    )}
                    {c.status === 'faulted' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger border border-danger/30">
                        <AlertTriangle className="h-3 w-3" /> Faulted
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-primary">
                    {c.currentPower > 0 ? (
                      <span className="text-accent font-semibold">{c.currentPower} kW</span>
                    ) : (
                      <span className="text-muted">0 kW</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-secondary">{c.evModel}</td>
                  <td className="px-6 py-4 text-muted font-mono text-xs">{c.sessionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
