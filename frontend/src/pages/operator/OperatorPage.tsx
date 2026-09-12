import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Building2,
  CheckCircle2,
  Cloud,
  DollarSign,
  Gauge,
  Leaf,
  MapPin,
  Power,
  RefreshCw,
  Settings2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getBackendOperatorData, getNetworkOverview, type StationStatusRecord } from '@/services/operatorService';
import { USE_MOCKS } from '@/services/apiClient';

let overview = getNetworkOverview();


function LivePortControl() {
  const { operatorProfile, openProfileModal } = useAuth();
  const [loadBalancing, setLoadBalancing] = useState(true);
  const [smartGridControl, setSmartGridControl] = useState(true);

  const chargers = Array.from({ length: operatorProfile.totalPorts || 8 }, (_, i) => {
    const portNumber = i + 1;
    const isFaulted = portNumber === 3;
    const isOccupied = portNumber % 2 === 1 && !isFaulted;
    const connector =
      operatorProfile.supportedConnectors[i % operatorProfile.supportedConnectors.length] || 'CCS';

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

  const activeCount = chargers.filter(c => c.status === 'occupied').length;
  const availableCount = chargers.filter(c => c.status === 'available').length;
  const faultedCount = chargers.filter(c => c.status === 'faulted').length;
  const totalKwInUse = chargers.reduce((sum, c) => sum + c.currentPower, 0);
  const totalRevenueToday = (
    totalKwInUse *
    0.85 *
    operatorProfile.tariffRatePerKwh
  ).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="green" dot>OPERATOR LIVE SYSTEM</Badge>
            <span className="text-xs font-semibold text-accent">• {operatorProfile.operatorName}</span>
          </div>
          <h2 className="type-h1">{operatorProfile.stationName}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-secondary">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <span>{operatorProfile.address}, {operatorProfile.city}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openProfileModal}>Edit Station Profile</Button>
          <Button leftIcon={<Zap className="h-4 w-4" />}>Run AI Dispatch Optimiser</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Station Ports</span><Building2 className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            {availableCount} <span className="text-sm font-normal text-muted">/ {operatorProfile.totalPorts} available</span>
          </p>
          <p className="mt-1 text-xs text-success">{activeCount} actively charging</p>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Total Load Output</span><Activity className="h-4 w-4 text-cyan" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">{totalKwInUse} <span className="text-sm font-normal text-muted">kW</span></p>
          <p className="mt-1 text-xs text-secondary">Capacity: {operatorProfile.maxPowerKw * operatorProfile.totalPorts / 2} kW</p>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Current Tariff Rate</span><DollarSign className="h-4 w-4 text-success" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            ₹{(operatorProfile.tariffRatePerKwh * 85).toFixed(2)} <span className="text-sm font-normal text-muted">/ kWh</span>
          </p>
          <p className="mt-1 text-xs text-success">Peak Off-grid Tariff</p>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Estimated Daily Revenue</span><ShieldCheck className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">₹{(Number(totalRevenueToday) * 85).toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-success">GreenVoltz AI Optimized</p>
        </Card>
      </div>

      <Card>
        <SectionHeader
          title="Grid & Dynamic Load Management"
          subtitle="Control automated peak shaving and dynamic power throttling across charging ports."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-subtle bg-elevated/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent"><Power className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-primary">Dynamic Load Balancing</p>
                <p className="text-xs text-secondary">Prevents grid sub-station overload by throttling port kW</p>
              </div>
            </div>
            <button type="button" onClick={() => setLoadBalancing(prev => !prev)}
              className={`relative h-6 w-11 rounded-full transition-colors focus-ring ${loadBalancing ? 'bg-accent' : 'bg-subtle'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${loadBalancing ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-subtle bg-elevated/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/15 text-cyan"><Zap className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-primary">Smart Carbon Shift</p>
                <p className="text-xs text-secondary">Prioritizes high-renewable windows automatically</p>
              </div>
            </div>
            <button type="button" onClick={() => setSmartGridControl(prev => !prev)}
              className={`relative h-6 w-11 rounded-full transition-colors focus-ring ${smartGridControl ? 'bg-accent' : 'bg-subtle'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${smartGridControl ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-subtle px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-primary">Live Charging Port Monitor</h2>
            <p className="text-xs text-secondary">Real-time telemetry for {operatorProfile.stationName}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-success" /> Available ({availableCount})</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-warning" /> Occupied ({activeCount})</span>
            {faultedCount > 0 && <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-danger" /> Faulted ({faultedCount})</span>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated/70 text-xs uppercase tracking-wider text-muted border-b border-subtle">
              <tr>
                <th className="px-6 py-3">Port ID</th><th className="px-6 py-3">Connector</th>
                <th className="px-6 py-3">Status</th><th className="px-6 py-3">Power Output</th>
                <th className="px-6 py-3">Connected Vehicle</th><th className="px-6 py-3">Session Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/60">
              {chargers.map(c => (
                <tr key={c.id} className="hover:bg-elevated/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-primary">{c.id}</td>
                  <td className="px-6 py-4 text-secondary">{c.connector}</td>
                  <td className="px-6 py-4">
                    {c.status === 'available' && <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success border border-success/30"><CheckCircle2 className="h-3 w-3" /> Available</span>}
                    {c.status === 'occupied' && <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning border border-warning/30"><Zap className="h-3 w-3" /> Charging</span>}
                    {c.status === 'faulted' && <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger border border-danger/30"><AlertTriangle className="h-3 w-3" /> Faulted</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-primary">{c.currentPower > 0 ? <span className="text-accent font-semibold">{c.currentPower} kW</span> : <span className="text-muted">0 kW</span>}</td>
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

function Metric({ label, value, context, positive, icon: Icon }: { label: string; value: string; context: string; positive?: boolean; icon: typeof Activity }) {
  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">{value}</p>
          <p className={`mt-2 flex items-center gap-1 text-xs ${positive ? 'text-success' : 'text-secondary'}`}>
            {positive ? <TrendingUp className="h-3.5 w-3.5" /> : null}{context}
          </p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-elevated text-accent"><Icon className="h-4 w-4" /></span>
      </div>
    </Card>
  );
}

function StationStatus({ station, onSelect }: { station: StationStatusRecord; onSelect: () => void }) {
  const statusTone = station.status === 'Operational' ? 'green' : station.status === 'High demand' ? 'amber' : 'red';
  return (
    <button type="button" onClick={onSelect} className="w-full text-left focus-ring">
      <Card className="h-full hover:border-accent/50" padding="sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-primary">{station.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" />{station.location}</p>
          </div>
          <Badge variant={statusTone} dot>{station.status}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div><p className="text-muted">Chargers</p><p className="mt-1 font-medium text-primary">{station.chargers}</p></div>
          <div><p className="text-muted">Available</p><p className="mt-1 font-medium text-primary">{station.available}</p></div>
          <div className="col-span-2">
            <div className="flex justify-between text-muted"><span>Utilization</span><span className="font-mono text-primary">{station.utilization}%</span></div>
            <div className="mt-2 h-1.5 rounded-full bg-elevated"><div className={`h-full rounded-full ${station.utilization > 80 ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${station.utilization}%` }} /></div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function NetworkMap({ onSelect }: { onSelect: (station: StationStatusRecord) => void }) {
  return (
    <Card className="overflow-hidden" padding="none">
      <div className="flex items-start justify-between gap-3 border-b border-subtle px-5 py-4">
        <SectionHeader title="Network map" subtitle="Live station distribution and health." />
        <Badge variant="green" dot>Live network</Badge>
      </div>
      <div className="relative h-[330px] overflow-hidden bg-background/50">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgb(var(--color-border-subtle) / 0.3) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-border-subtle) / 0.3) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M9 31 L29 34 L46 79 M29 34 L58 24 L76 18 M29 34 L63 52 L80 70 M63 52 L46 79" fill="none" stroke="rgb(var(--color-border-strong) / .55)" strokeWidth=".35" strokeDasharray="1.5 1.5" />
        </svg>
        {overview.stations.map(station => {
          const attention = station.status === 'Attention required';
          const busy = station.status === 'High demand';
          return (
            <button key={station.id} type="button" onClick={() => onSelect(station)} className="group absolute -translate-x-1/2 -translate-y-1/2 focus-ring" style={{ left: `${station.x}%`, top: `${station.y}%` }} aria-label={`View ${station.name}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${attention ? 'border-danger bg-danger/20' : busy ? 'border-warning bg-warning/20' : 'border-accent bg-accent/20'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${attention ? 'bg-danger' : busy ? 'bg-warning' : 'bg-accent'}`} />
              </span>
              <span className="pointer-events-none absolute left-1/2 top-6 hidden -translate-x-1/2 whitespace-nowrap rounded border border-subtle bg-elevated px-2 py-1 text-[10px] text-primary shadow-lg group-hover:block">{station.name}</span>
            </button>
          );
        })}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-md border border-subtle bg-surface/90 px-3 py-2 text-[11px] text-secondary">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" />Operational</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-warning" />High demand</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-danger" />Attention</span>
        </div>
      </div>
    </Card>
  );
}

function DemandEnergyChart() {
  const points = overview.demandEnergy;
  const pointString = (key: 'demand' | 'renewable') => points.map((point, index) => `${(index * 20) + 2},${100 - point[key]}`).join(' ');
  return (
    <Card>
      <SectionHeader title="Demand & energy conditions" subtitle="Network demand against renewable availability." />
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="relative h-52 rounded-md border border-subtle bg-elevated/30 p-3">
            <div className="absolute inset-x-3 top-1/2 border-t border-dashed border-subtle" />
            <svg className="h-full w-full overflow-visible" viewBox="0 0 102 100" preserveAspectRatio="none">
              <polygon points={`${pointString('renewable')} 102,100 2,100`} fill="rgb(var(--color-electric-green) / .10)" />
              <polyline points={pointString('renewable')} fill="none" stroke="rgb(var(--color-electric-green))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <polyline points={pointString('demand')} fill="none" stroke="rgb(var(--color-cyan))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <rect x="38" y="0" width="20" height="100" fill="rgb(var(--color-electric-green) / .07)" />
            </svg>
          </div>
          <div className="mt-2 grid grid-cols-6 text-center font-mono text-[10px] text-muted">{points.map(point => <span key={point.time}>{point.time}</span>)}</div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-secondary">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-cyan" />Charging demand</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" />Renewable availability</span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-secondary"><span className="font-medium text-accent">Optimal charging period · 14:00–15:30</span> — Renewable generation is expected to peak while network demand remains moderate.</div>
    </Card>
  );
}

function CarbonCard() {
  const points = overview.carbon;
  const line = points.map((point, index) => `${(index * 20) + 2},${100 - ((point.value - 130) / 80) * 100}`).join(' ');
  return (
    <Card>
      <SectionHeader title="Grid carbon intensity" subtitle="Forecast from the live energy mix." />
      <div className="mt-5 flex items-end justify-between gap-4">
        <div><p className="text-3xl font-semibold text-primary">154 <span className="text-sm font-normal text-muted">gCO₂/kWh</span></p><p className="mt-2 flex items-center gap-1 text-xs text-success"><TrendingDown className="h-3.5 w-3.5" />22% over next 2 hours</p></div>
        <Cloud className="h-7 w-7 text-cyan" />
      </div>
      <svg className="mt-6 h-20 w-full" viewBox="0 0 102 100" preserveAspectRatio="none"><polyline points={line} fill="none" stroke="rgb(var(--color-cyan))" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>
      <Divider className="my-4" />
      <p className="text-xs text-muted">Best window</p><p className="mt-1 text-sm font-semibold text-accent">14:30 – 15:15</p>
    </Card>
  );
}

export default function OperatorPage() {
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [selectedStation, setSelectedStation] = useState<StationStatusRecord | null>(null);
  useEffect(() => {
    if (USE_MOCKS) return;
    getBackendOperatorData().then(({ stations, analytics, sessions, signals }) => {
      overview = {
        ...overview,
        stations: stations.map((station, index) => ({
          id: String(station.id),
          name: station.name,
          location: `${station.latitude.toFixed(3)}, ${station.longitude.toFixed(3)}`,
          chargers: station.total_chargers,
          available: station.total_chargers,
          utilization: 0,
          status: 'Operational' as const,
          x: 12 + (index % 4) * 24,
          y: 20 + Math.floor(index / 4) * 45,
        })),
        activeSessions: sessions.map(session => ({
          id: String(session.session_id),
          vehicle: `Vehicle ${session.vehicle_id ?? 'unknown'}`,
          station: `Station ${session.station_id}`,
          battery: session.battery_percent,
          powerKw: session.current_power_kw,
          minutesRemaining: session.estimated_completion_time
            ? Math.max(0, Math.round((Date.parse(session.estimated_completion_time) - Date.now()) / 60000))
            : 0,
          status: 'Charging' as const,
        })),
        demandEnergy: signals.map(signal => ({
          time: new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          demand: Math.min(100, signal.demand_kw),
          renewable: signal.renewable_percent,
        })),
        carbon: signals.map(signal => ({
          time: new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: signal.carbon_intensity_gco2,
        })),
        optimizationImpact: [
          { metric: 'Charging cost', without: `₹${analytics.estimated_cost.toFixed(0)}`, with: `₹${analytics.estimated_cost.toFixed(0)}`, improvement: 'Live aggregate' },
          { metric: 'CO₂ emissions', without: `${(analytics.estimated_carbon_gco2 / 1000).toFixed(1)} kg`, with: `${(analytics.estimated_carbon_gco2 / 1000).toFixed(1)} kg`, improvement: 'Live aggregate' },
        ],
      };
      setLastUpdated('Just now');
    }).catch(() => setLastUpdated('API unavailable · demo data'));
  }, []);
  const refresh = () => setLastUpdated('A few seconds ago');
  return (
    <>
      <div className="mx-auto max-w-[1440px] space-y-6 animate-fade-in">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex flex-wrap gap-2"><Badge variant="green" dot>Operational</Badge><Badge variant="cyan" dot>Optimizing continuously</Badge></div>
            <h1 className="type-h1">Network Overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">Real-time visibility into charging demand, energy conditions, and optimization performance.</p>
          </div>
          <Button variant="secondary" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>Refresh · {lastUpdated}</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Active charging sessions" value="24" context="8 new in last hour" positive icon={BatteryCharging} />
          <Metric label="Available chargers" value="68 / 82" context="82.9% availability" positive icon={Zap} />
          <Metric label="Network utilization" value="71%" context="↑ 8% vs yesterday" positive icon={Gauge} />
          <Metric label="Today's charging cost" value="₹18,420" context="↓ 6.4% vs baseline" icon={Activity} />
          <Metric label="CO₂ avoided" value="126 kg" context="↑ 18% today" positive icon={Leaf} />
        </div>

        <LivePortControl />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <NetworkMap onSelect={setSelectedStation} />
          <div>
            <SectionHeader title="Station network" subtitle="Tap a station for operational detail." />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {overview.stations.slice(0, 6).map(station => <StationStatus key={station.id} station={station} onSelect={() => setSelectedStation(station)} />)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <DemandEnergyChart />
          <CarbonCard />
        </div>

        <Card>
          <SectionHeader title="Optimization impact" subtitle="The measurable value of continuous orchestration." action={<Badge variant="green" dot>GreenVoltz active</Badge>} />
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overview.optimizationImpact.map(item => <div key={item.metric} className="rounded-md border border-subtle bg-elevated/30 p-4"><p className="text-xs text-muted">{item.metric}</p><div className="mt-3 flex items-end gap-2"><span className="text-sm text-muted line-through">{item.without}</span><span className="text-xl font-semibold text-primary">→ {item.with}</span></div><p className="mt-2 text-xs font-medium text-success">{item.improvement}</p></div>)}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-secondary">GreenVoltz continuously shifts flexible charging sessions toward lower-cost, lower-carbon periods while maintaining driver requirements.</p>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card padding="none">
            <div className="flex items-center justify-between border-b border-subtle px-5 py-4"><SectionHeader title="Active charging sessions" subtitle="Live network activity." /><Activity className="h-5 w-5 text-accent" /></div>
            <div className="divide-y divide-subtle">
              {overview.activeSessions.map(session => <div key={session.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.3fr_1fr_0.65fr_0.65fr_0.7fr_auto] sm:items-center"><div><p className="text-sm font-medium text-primary">{session.vehicle}</p><p className="mt-1 text-xs text-muted">{session.station}</p></div><div><p className="text-xs text-muted">Battery</p><p className="mt-1 text-sm text-primary">{session.battery}%</p></div><div><p className="text-xs text-muted">Power</p><p className="mt-1 font-mono text-sm text-primary">{session.powerKw} kW</p></div><div><p className="text-xs text-muted">Remaining</p><p className="mt-1 text-sm text-primary">{session.minutesRemaining} min</p></div><Badge variant={session.status === 'Charging' ? 'cyan' : 'green'} dot>{session.status}</Badge></div>)}
            </div>
          </Card>
          <Card>
            <SectionHeader title="AI network insights" subtitle="Actionable signals from the optimization engine." />
            <div className="mt-4 space-y-4">{overview.insights.map(insight => <div key={insight.type} className="flex gap-3"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">{insight.type === 'Demand forecast' ? <TrendingUp className="h-4 w-4" /> : insight.type === 'Energy opportunity' ? <Zap className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}</span><div><p className="text-xs font-semibold text-primary">{insight.type}</p><p className="mt-1 text-xs leading-5 text-secondary">{insight.text}</p></div></div>)}</div>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-subtle pt-5">
          <p className="type-technical mr-2">Quick actions</p>
          <Button variant="secondary" size="sm" leftIcon={<Settings2 className="h-3.5 w-3.5" />}><Link to="/optimization">View optimization</Link></Button>
          <Button variant="secondary" size="sm" leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}><Link to="/disruptions">View disruptions</Link></Button>
          <Button variant="ghost" size="sm" leftIcon={<MapPin className="h-3.5 w-3.5" />}><Link to="/operator">Manage stations</Link></Button>
        </div>
      </div>
      {selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true" aria-labelledby="station-dialog-title">
          <Card className="w-full max-w-md" padding="lg">
            <div className="flex items-start justify-between gap-4"><div><p className="type-technical">Station detail</p><h2 id="station-dialog-title" className="mt-1 text-xl font-semibold text-primary">{selectedStation.name}</h2><p className="mt-1 text-sm text-secondary">{selectedStation.location}</p></div><Button variant="ghost" size="sm" onClick={() => setSelectedStation(null)}>Close</Button></div>
            <div className="mt-6 grid grid-cols-2 gap-4"><div><p className="text-xs text-muted">Status</p><div className="mt-2"><Badge variant={selectedStation.status === 'Operational' ? 'green' : selectedStation.status === 'High demand' ? 'amber' : 'red'} dot>{selectedStation.status}</Badge></div></div><div><p className="text-xs text-muted">Utilization</p><p className="mt-2 text-lg font-semibold text-primary">{selectedStation.utilization}%</p></div><div><p className="text-xs text-muted">Chargers</p><p className="mt-2 text-lg font-semibold text-primary">{selectedStation.available} / {selectedStation.chargers} available</p></div><div><p className="text-xs text-muted">Network signal</p><p className="mt-2 flex items-center gap-1 text-sm text-success"><CheckCircle2 className="h-4 w-4" />Telemetry healthy</p></div></div>
          </Card>
        </div>
      )}
    </>

  );
}
