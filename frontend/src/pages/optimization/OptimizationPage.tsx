import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BatteryCharging,
  Check,
  Clock3,
  Cloud,
  DollarSign,
  Leaf,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import StatusIndicator from '@/components/ui/StatusIndicator';
import {
  getOptimizationData,
  runOptimization,
  type ComparisonMetric,
  type OptimizationData,
  type OptimizationDecision,
  type ScheduleSession,
} from '@/services/optimizationService';

function Stat({ label, value, icon: Icon, tone = 'accent' }: { label: string; value: string | number; icon: typeof Zap; tone?: 'accent' | 'success' | 'cyan' }) {
  const colors = { accent: 'bg-accent/10 text-accent', success: 'bg-success/10 text-success', cyan: 'bg-cyan/10 text-cyan' };
  return (
    <div className="border-r border-subtle px-4 py-3 first:pl-0 last:border-0 sm:px-5">
      <div className="flex items-center gap-2 text-xs text-muted"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${colors[tone]}`}><Icon className="h-4 w-4" /></span>{label}</div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-primary">{value}</p>
    </div>
  );
}

function ComparisonRow({ metric }: { metric: ComparisonMetric }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-subtle py-3 last:border-0 sm:grid-cols-[1.2fr_1fr_auto_1fr]">
      <span className="text-sm text-secondary">{metric.label}</span>
      <span className="text-right text-sm text-muted">{metric.current}</span>
      <ArrowRight className="h-4 w-4 text-accent" />
      <div className="text-right"><span className="text-sm font-semibold text-primary">{metric.optimized}</span><span className="ml-2 hidden text-xs text-success sm:inline">{metric.improvement}</span></div>
    </div>
  );
}

function DecisionCard({ decision }: { decision: OptimizationDecision }) {
  const icons = { cost: DollarSign, renewable: Leaf, carbon: Cloud, peak: BarChart3 };
  const Icon = icons[decision.icon];
  return (
    <div className="border border-subtle bg-elevated/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent"><Icon className="h-4 w-4" /></span><h3 className="text-sm font-semibold uppercase tracking-wide text-primary">{decision.title}</h3></div>
        <span className="font-mono text-sm font-semibold text-success">{decision.value}</span>
      </div>
      <p className="mt-3 text-sm leading-5 text-secondary">{decision.detail}</p>
      <p className="mt-3 text-[11px] uppercase tracking-wider text-muted">{decision.metric}</p>
    </div>
  );
}

function SignalChart({ data }: { data: OptimizationData['signals'] }) {
  const line = (key: 'price' | 'renewable' | 'carbon' | 'demand') => data.map((point, index) => `${(index / (data.length - 1)) * 100},${100 - point[key]}`).join(' ');
  return (
    <Card>
      <SectionHeader title="Optimization signals" subtitle="The optimizer weighs every live network and energy condition." />
      <div className="mt-5 overflow-x-auto pb-1">
        <div className="min-w-[620px]">
          <div className="relative h-52 border-b border-l border-subtle bg-gradient-to-t from-accent/5 to-transparent">
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-subtle" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-subtle" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-subtle" />
            <div className="absolute inset-y-0 left-[60%] w-[13%] border-x border-accent/40 bg-accent/10" />
            <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polyline points={line('renewable')} fill="none" stroke="rgb(90 220 144)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
              <polyline points={line('price')} fill="none" stroke="rgb(73 211 216)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <polyline points={line('carbon')} fill="none" stroke="rgb(245 179 74)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <polyline points={line('demand')} fill="none" stroke="rgb(244 111 111)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="grid grid-cols-6 gap-2 pt-2">{data.map(point => <span key={point.time} className={`text-center font-mono text-[11px] ${point.preferred ? 'font-semibold text-accent' : 'text-muted'}`}>{point.time}</span>)}</div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-secondary">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-success" /> Renewable availability</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-cyan" /> Electricity price</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-warning" /> Grid carbon</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-danger" /> Charging demand</span>
      </div>
      <div className="mt-5 flex items-start gap-3 border border-accent/25 bg-accent/5 p-4"><Target className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><p className="text-sm font-semibold text-primary">Preferred optimization window · 14:30 – 15:15</p><p className="mt-1 text-xs leading-5 text-secondary">High renewable availability + lower grid carbon intensity + moderate network demand.</p></div></div>
    </Card>
  );
}

function ScheduleTable({ sessions, onSelect }: { sessions: ScheduleSession[]; onSelect: (session: ScheduleSession) => void }) {
  return (
    <Card padding="none">
      <div className="border-b border-subtle px-5 py-4 sm:px-6"><SectionHeader title="Optimized charging schedule" subtitle="Constraint-aware shifts across the active charging network." /></div>
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.15fr_1fr_1.4fr_1.4fr_70px_100px] gap-3 border-b border-subtle px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted sm:px-6"><span>EV / station</span><span>Current</span><span>Optimized schedule</span><span>Timeline shift</span><span>Energy</span><span>Status</span></div>
          {sessions.map(session => (
            <button key={session.id} type="button" onClick={() => onSelect(session)} className="grid w-full grid-cols-[1.15fr_1fr_1.4fr_1.4fr_70px_100px] items-center gap-3 border-b border-subtle px-5 py-4 text-left transition-colors last:border-0 hover:bg-elevated/50 focus-ring sm:px-6">
              <span className="min-w-0"><span className="block truncate text-sm font-medium text-primary">{session.ev}</span><span className="mt-1 block truncate text-xs text-muted">{session.station}</span></span>
              <span className="font-mono text-xs text-muted">{session.currentWindow}</span>
              <span className="font-mono text-xs font-semibold text-accent">{session.optimizedWindow}</span>
              <span className="relative h-5 rounded bg-elevated"><span className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded bg-muted/50" style={{ left: `${session.currentPosition}%`, width: '14%' }} /><span className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded bg-accent" style={{ left: `${session.optimizedPosition}%`, width: '14%' }} /></span>
              <span className="font-mono text-xs text-secondary">{session.energyKwh} kWh</span>
              <span><Badge variant={session.status === 'Optimized' ? 'green' : session.status === 'Fixed' ? 'amber' : 'neutral'} dot>{session.status}</Badge></span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ScheduleDetail({ session, onClose }: { session: ScheduleSession; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg border border-subtle bg-bg-surface shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="schedule-detail-title">
        <div className="flex items-start justify-between border-b border-subtle px-5 py-4"><div><p className="type-technical">Schedule detail</p><h2 id="schedule-detail-title" className="mt-1 text-lg font-semibold text-primary">{session.ev}</h2><p className="mt-1 text-sm text-secondary">{session.station}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-muted hover:bg-elevated hover:text-primary"><X className="h-5 w-5" /></button></div>
        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-3"><div className="border border-subtle bg-elevated/40 p-3"><p className="text-xs text-muted">Energy required</p><p className="mt-1 font-mono text-sm text-primary">{session.energyKwh} kWh</p></div><div className="border border-subtle bg-elevated/40 p-3"><p className="text-xs text-muted">Departure requirement</p><p className="mt-1 font-mono text-sm text-primary">{session.departureRequirement}</p></div></div>
          <div className="border-l-2 border-accent bg-accent/5 p-3"><p className="text-xs font-semibold uppercase tracking-wider text-accent">Why it moved</p><p className="mt-2 text-sm leading-6 text-secondary">{session.reason}</p></div>
          <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-muted">Current window</p><p className="mt-1 font-mono text-secondary">{session.currentWindow}</p></div><div><p className="text-xs text-muted">Optimized window</p><p className="mt-1 font-mono font-semibold text-accent">{session.optimizedWindow}</p></div><div><p className="text-xs text-muted">Estimated savings</p><p className="mt-1 font-semibold text-success">{session.savings}</p></div><div><p className="text-xs text-muted">CO₂ impact</p><p className="mt-1 font-semibold text-success">{session.carbonImpact}</p></div></div>
        </div>
      </div>
    </div>
  );
}

export default function OptimizationPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<OptimizationData>(() => getOptimizationData());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimized, setLastOptimized] = useState('Just now');
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const result = await runOptimization();
    setData(result);
    setLastOptimized('Just now');
    setIsOptimizing(false);
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><div className="mb-3 flex flex-wrap items-center gap-3"><StatusIndicator label="Optimizer active" /><span className="text-xs text-muted">Last optimized: {lastOptimized}</span></div><h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">AI Charging Optimization</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">GreenVoltz continuously adjusts charging schedules to reduce cost and carbon emissions while meeting driver requirements.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" leftIcon={<Network className="h-4 w-4" />} onClick={() => navigate('/operator')}>View network</Button><Button loading={isOptimizing} leftIcon={<RefreshCw className="h-4 w-4" />} onClick={handleOptimize}>{isOptimizing ? 'Optimizing...' : 'Run optimization'}</Button></div>
      </div>

      <Card className="border-accent/30 bg-gradient-to-r from-accent/10 via-bg-surface to-bg-surface" padding="md">
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><p className="text-sm font-semibold text-primary">GreenVoltz found {data.summary.savings} in potential savings across {data.summary.sessionsOptimized} sessions without violating driver departure requirements.</p><p className="mt-1 text-xs text-secondary">Driver constraints + charger availability + tariff + renewable energy + grid carbon = an optimized charging schedule.</p></div></div>
      </Card>

      <Card className="overflow-x-auto" padding="none"><div className="flex min-w-[620px] divide-x divide-subtle py-1"><Stat label="Sessions optimized" value={data.summary.sessionsOptimized} icon={Zap} /><Stat label="Cost reduction" value={data.summary.costReduction} icon={DollarSign} tone="success" /><Stat label="CO₂ reduction" value={data.summary.carbonReduction} icon={Leaf} tone="success" /><Stat label="Peak demand reduction" value={data.summary.peakReduction} icon={BarChart3} /><Stat label="Driver requirements met" value={data.summary.requirementsMet} icon={ShieldCheck} tone="cyan" /></div></Card>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card><SectionHeader title="Current schedule vs GreenVoltz optimized" subtitle="Every shift is evaluated against cost, carbon, energy, and driver constraints." /><div className="mt-4">{data.comparison.map(metric => <ComparisonRow key={metric.label} metric={metric} />)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="border border-success/25 bg-success/5 p-4"><p className="text-xs text-muted">Estimated savings</p><p className="mt-1 text-2xl font-semibold text-success">{data.summary.savings}</p></div><div className="border border-accent/25 bg-accent/5 p-4"><p className="text-xs text-muted">CO₂ avoided</p><p className="mt-1 text-2xl font-semibold text-accent">{data.summary.carbonAvoided}</p></div></div></Card>
        <Card><SectionHeader title="Optimization objectives" subtitle="Mandatory constraints are protected first." /><ol className="mt-5 space-y-3">{['Driver requirements', 'Charger availability', 'Grid constraints', 'Charging cost', 'Renewable energy', 'Carbon intensity'].map((objective, index) => <li key={objective} className="flex items-center gap-3 text-sm"><span className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${index < 2 ? 'bg-accent/15 text-accent' : 'bg-elevated text-muted'}`}>{index + 1}</span><span className={index < 2 ? 'font-medium text-primary' : 'text-secondary'}>{objective}</span>{index < 2 && <span className="ml-auto text-[10px] uppercase tracking-wider text-accent">Required</span>}</li>)}</ol><div className="mt-5 flex items-start gap-2 border-t border-subtle pt-4 text-xs leading-5 text-success"><Check className="mt-0.5 h-4 w-4 shrink-0" />All driver departure requirements are currently satisfied.</div></Card>
      </div>

      <ScheduleTable sessions={data.schedule} onSelect={setSelectedSession} />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]"><SignalChart data={data.signals} /><Card><SectionHeader title="Flexible charging" subtitle="The optimizer only moves sessions with usable flexibility." /><div className="mt-5 space-y-4"><div className="flex items-center justify-between"><span className="text-sm text-secondary">Flexible sessions</span><span className="font-mono text-lg font-semibold text-accent">{data.flexibility.flexibleSessions}</span></div><div className="h-2 overflow-hidden rounded-full bg-elevated"><div className="h-full w-3/4 rounded-full bg-accent" /></div><div className="grid grid-cols-2 gap-3 border-t border-subtle pt-4"><div><p className="text-xs text-muted">Fixed sessions</p><p className="mt-1 font-mono text-lg text-primary">{data.flexibility.fixedSessions}</p></div><div><p className="text-xs text-muted">Flexible energy</p><p className="mt-1 font-mono text-lg text-primary">{data.flexibility.flexibleEnergyKwh} kWh</p></div></div><div className="flex items-center gap-2 border-t border-subtle pt-4 text-xs text-success"><ShieldCheck className="h-4 w-4" />Required departure constraints: {data.flexibility.requirementsRespected} respected</div></div></Card></div>

      <div><SectionHeader title="Optimization decisions" subtitle="Explainable actions taken by the optimizer in this cycle." /><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.decisions.map(decision => <DecisionCard key={decision.title} decision={decision} />)}</div></div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]"><Card><SectionHeader title="Optimization activity" subtitle="Live signals from the optimization engine." /><div className="mt-4 space-y-1">{data.activity.map(item => <div key={item.time} className="flex gap-4 border-b border-subtle py-3 last:border-0"><span className="flex w-12 shrink-0 items-center gap-1 font-mono text-xs text-accent"><Clock3 className="h-3.5 w-3.5" />{item.time}</span><span className="text-sm text-secondary">{item.text}</span></div>)}</div></Card><Card><SectionHeader title="What the optimizer protects" /><div className="mt-4 space-y-4"><div className="flex gap-3"><BatteryCharging className="h-5 w-5 shrink-0 text-accent" /><div><p className="text-sm font-medium text-primary">Driver readiness</p><p className="mt-1 text-xs leading-5 text-secondary">Departure time and required state of charge remain non-negotiable.</p></div></div><div className="flex gap-3"><Network className="h-5 w-5 shrink-0 text-cyan" /><div><p className="text-sm font-medium text-primary">Network capacity</p><p className="mt-1 text-xs leading-5 text-secondary">Sessions are staggered to avoid charger and grid demand spikes.</p></div></div><div className="flex gap-3"><Leaf className="h-5 w-5 shrink-0 text-success" /><div><p className="text-sm font-medium text-primary">Cleaner energy</p><p className="mt-1 text-xs leading-5 text-secondary">Flexible load follows renewable availability and lower carbon intensity.</p></div></div></div></Card></div>

      {selectedSession && <ScheduleDetail session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );
}
