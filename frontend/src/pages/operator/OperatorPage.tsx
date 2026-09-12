import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Cloud,
  Gauge,
  Leaf,
  MapPin,
  RefreshCw,
  Settings2,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getNetworkOverview, type StationStatusRecord } from '@/services/operatorService';

const overview = getNetworkOverview();

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
