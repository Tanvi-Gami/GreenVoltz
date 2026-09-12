import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Battery,
  CheckCircle2,
  Clock3,
  MapPin,
  Network,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusIndicator } from '@/components/ui/Badge';
import { getDisruptionData, runReplanning, type AffectedSession, type DisruptionData, type DisruptionState, type RecoveryAssignment } from '@/services/disruptionService';

const timeline = [
  ['14:32', 'Charger #04 failure detected'],
  ['14:32', '3 active sessions identified as affected'],
  ['14:33', 'Alternative charger capacity evaluated'],
  ['14:33', 'Driver constraints validated'],
  ['14:34', 'AI recovery plan generated'],
  ['14:34', '3 sessions reassigned'],
  ['14:35', 'Network returned to stable state'],
];

function Metric({ label, value, icon: Icon, tone = 'accent' }: { label: string; value: string; icon: typeof Zap; tone?: 'accent' | 'warning' | 'success' }) {
  const colors = { accent: 'bg-accent/10 text-accent', warning: 'bg-warning/10 text-warning', success: 'bg-success/10 text-success' };
  return <div className="border-r border-subtle px-4 py-3 first:pl-0 last:border-0"><div className="flex items-center gap-2 text-xs text-muted"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${colors[tone]}`}><Icon className="h-4 w-4" /></span>{label}</div><p className="mt-2 text-xl font-semibold text-primary">{value}</p></div>;
}

function AffectedSessions({ sessions }: { sessions: AffectedSession[] }) {
  return <Card padding="none"><div className="border-b border-subtle px-5 py-4"><SectionHeader title="Affected charging sessions" subtitle="These sessions were assigned to the unavailable charger." /></div><div className="divide-y divide-subtle">{sessions.map(session => <div key={session.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.25fr_1.3fr_0.5fr_0.65fr_0.9fr_auto] sm:items-center"><div><p className="text-sm font-semibold text-primary">{session.ev}</p><p className="mt-1 font-mono text-xs text-muted">Session {session.id}</p></div><p className="text-xs text-secondary">{session.charger}</p><div className="flex items-center gap-1 text-xs text-secondary"><Battery className="h-3.5 w-3.5 text-accent" />{session.battery}%</div><p className="font-mono text-xs text-secondary">{session.energyKwh} kWh</p><p className="font-mono text-xs text-secondary">{session.window}</p><Badge variant="red" dot>Affected</Badge></div>)}</div></Card>;
}

function RecoveryPlan({ assignments }: { assignments: RecoveryAssignment[] }) {
  return <Card className="border-success/30 bg-gradient-to-br from-success/5 to-bg-surface" padding="none"><div className="flex items-center justify-between border-b border-subtle px-5 py-4"><SectionHeader title="Recovery plan ready" subtitle="AI reassigned every affected session within driver constraints." /><Badge variant="green" dot>Recovered</Badge></div><div className="divide-y divide-subtle">{assignments.map(item => <div key={item.sessionId} className="px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-primary">{item.ev}</p><p className="mt-1 font-mono text-xs text-muted">{item.sessionId}</p></div><span className="font-mono text-xs font-semibold text-success">{item.delay} delay</span></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="border border-danger/25 bg-danger/5 px-2 py-1 text-muted">{item.from}</span><ArrowRight className="h-3.5 w-3.5 text-accent" /><span className="border border-success/25 bg-success/5 px-2 py-1 font-medium text-success">{item.to}</span><span className="font-mono text-muted">{item.window}</span><span className="ml-auto text-secondary">Additional cost {item.cost}</span></div><p className="mt-3 text-xs leading-5 text-secondary">{item.reason}</p></div>)}</div></Card>;
}

function NetworkImpact({ data }: { data: DisruptionData }) {
  return <Card><SectionHeader title="Network impact" subtitle="Topology view of the failed charger and nearest recovery capacity." /><div className="relative mt-5 h-64 overflow-hidden border border-subtle bg-elevated/30"><svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 260" preserveAspectRatio="none"><path d="M300 110 L130 55 M300 110 L460 55 M300 110 L480 205 M300 110 L120 205" stroke="rgb(95 113 127 / .45)" strokeDasharray="5 6" fill="none" /><path d="M300 110 L130 55" stroke="rgb(244 111 111 / .8)" strokeWidth="2" /></svg><div className="absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-danger/60 bg-danger/15 text-danger"><Zap className="h-5 w-5" /></span><p className="mt-2 text-xs font-semibold text-primary">Central Hub</p><p className="mt-1 font-mono text-[10px] text-danger">#04 FAILED</p></div>{data.alternatives.map((station, index) => { const positions = ['left-[10%] top-[10%]', 'right-[10%] top-[10%]', 'right-[7%] bottom-[10%]']; return <div key={station.name} className={`absolute ${positions[index]} w-32 text-center`}><span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success"><MapPin className="h-4 w-4" /></span><p className="mt-2 text-[11px] font-medium text-primary">{station.name}</p><p className="mt-1 font-mono text-[10px] text-muted">{station.distance} • {station.available} free</p></div>; })}<div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-muted"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-danger" /> Failed</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-success" /> Available</span></div></div></Card>;
}

function ImpactComparison() {
  const rows = [['Affected sessions', '3', '0'], ['Expected delay', '28 min', '7 min'], ['Additional cost', '₹96', '₹22'], ['CO₂ impact', '+8.4 kg', '+3.1 kg'], ['Driver requirements met', '67%', '100%']];
  return <Card><SectionHeader title="Without replanning vs GreenVoltz recovery" subtitle="Automatic recovery limits the operational impact." /><div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-x-4 text-sm"><div className="border-b border-subtle pb-2 text-xs uppercase tracking-wider text-muted">Metric</div><div className="border-b border-subtle pb-2 text-right text-xs uppercase tracking-wider text-muted">Without</div><div className="border-b border-subtle pb-2 text-right text-xs uppercase tracking-wider text-success">Recovery</div>{rows.map(row => <Fragment key={row[0]}><span className="border-b border-subtle py-3 text-secondary">{row[0]}</span><span className="border-b border-subtle py-3 text-right text-muted">{row[1]}</span><span className="border-b border-subtle py-3 text-right font-semibold text-success">{row[2]}</span></Fragment>)}</div><p className="mt-4 border border-success/25 bg-success/5 p-3 text-sm font-medium text-success">Automatic replanning prevented 21 minutes of avoidable delay and reduced recovery cost by ₹74.</p></Card>;
}

export default function DisruptionPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<DisruptionState>('healthy');
  const [data, setData] = useState<DisruptionData>(() => getDisruptionData());
  const [stage, setStage] = useState('Network healthy');

  const simulate = () => { setState('disrupted'); setStage('Charger #04 offline'); };
  const replan = async () => { setState('analyzing'); setStage('Analyzing network...'); window.setTimeout(() => { setState('replanning'); setStage('Checking charger availability...'); }, 450); window.setTimeout(() => setStage('Evaluating driver constraints...'), 900); window.setTimeout(() => setStage('Calculating optimal reassignment...'), 1250); const result = await runReplanning(); setData(result); setState('recovered'); setStage('Replanning complete'); };
  const reset = () => { setState('healthy'); setStage('Network healthy'); };
  const active = state !== 'healthy';

  return <div className="space-y-6 pb-8 animate-fade-in">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="mb-3 flex flex-wrap items-center gap-3"><StatusIndicator status={active && state !== 'recovered' ? 'degraded' : 'online'} label={active ? state === 'recovered' ? 'Operational with recovery complete' : 'Operational with 1 active disruption' : 'Network healthy'} /><span className="text-xs text-muted">Last update: Just now</span></div><h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Disruptions &amp; Replanning</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">Monitor network disruptions and automatically adapt charging schedules to keep drivers moving.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" leftIcon={<Network className="h-4 w-4" />} onClick={() => navigate('/operator')}>Back to network</Button><Button variant="ghost" leftIcon={<Route className="h-4 w-4" />} onClick={() => navigate('/optimization')}>View optimization</Button><Button leftIcon={<AlertTriangle className="h-4 w-4" />} onClick={simulate} disabled={active}>Simulate disruption</Button>{active && <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={reset}>Reset scenario</Button>}</div></div>

    {state === 'healthy' && <Card className="border-success/30 bg-success/5"><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-6 w-6 text-success" /><div><p className="text-sm font-semibold text-primary">Network healthy</p><p className="mt-1 text-sm text-secondary">All chargers are available and active sessions are operating within their planned schedules.</p></div></div><Button onClick={simulate} leftIcon={<Zap className="h-4 w-4" />}>Simulate disruption</Button></div></Card>}

    {active && <Card className="border-danger/40 bg-gradient-to-r from-danger/10 via-bg-surface to-bg-surface"><div className="flex flex-col justify-between gap-5 lg:flex-row"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger"><AlertTriangle className="h-6 w-6" /></span><div><div className="flex flex-wrap items-center gap-2"><Badge variant="red" dot>Charger failure</Badge><Badge variant="amber">High severity</Badge></div><h2 className="mt-3 text-xl font-semibold text-primary">{data.disruption.station}</h2><p className="mt-1 text-sm text-secondary">{data.disruption.charger} · Detected {data.disruption.detectedAt} · <span className="text-danger">{data.disruption.status}</span></p><p className="mt-4 text-sm font-medium text-primary">{data.disruption.affectedCount} EV sessions require reassignment.</p></div></div><div className="min-w-[220px] border border-danger/25 bg-danger/5 p-4"><p className="text-xs uppercase tracking-wider text-danger">Operational impact</p><p className="mt-2 text-2xl font-semibold text-primary">{data.disruption.affectedCount} sessions</p><p className="mt-1 text-xs text-secondary">{data.disruption.reservationsAffected} upcoming reservations affected</p><p className="mt-3 flex items-center gap-2 text-xs font-medium text-warning"><Activity className="h-4 w-4" />AI replanning required</p></div></div></Card>}

    {active && <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><AffectedSessions sessions={data.sessions} /><Card className="border-accent/30"><SectionHeader title="AI recovery plan" subtitle="Constraint-aware automatic reassignment." /><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div><p className="text-2xl font-semibold text-primary">{state === 'recovered' ? '0' : '3'}</p><p className="mt-1 text-xs text-muted">Affected</p></div><div><p className="text-2xl font-semibold text-accent">{state === 'recovered' ? '3' : '0'}</p><p className="mt-1 text-xs text-muted">Reassigned</p></div><div><p className="text-2xl font-semibold text-warning">{state === 'recovered' ? '7' : '28'} min</p><p className="mt-1 text-xs text-muted">Expected delay</p></div></div>{state !== 'recovered' ? <div className="mt-6"><p className="mb-3 flex items-center gap-2 text-sm text-secondary"><RefreshCw className={state === 'analyzing' || state === 'replanning' ? 'h-4 w-4 animate-spin text-accent' : 'h-4 w-4 text-accent'} />{stage}</p><Button className="w-full" loading={state === 'analyzing' || state === 'replanning'} onClick={replan} disabled={state === 'analyzing' || state === 'replanning'}>{state === 'disrupted' ? 'Replan with AI' : stage}</Button></div> : <div className="mt-6 border border-success/25 bg-success/5 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" />Replanning complete</p><p className="mt-2 text-xs leading-5 text-secondary">All affected sessions have a validated recovery assignment.</p></div>}</Card></div>}

    {state === 'recovered' && <><RecoveryPlan assignments={data.recovery} /><div className="grid gap-6 lg:grid-cols-2"><Card><SectionHeader title="Driver requirements preserved" subtitle="Driver readiness was prioritized before cost and carbon." /><div className="mt-5 grid grid-cols-2 gap-4"><Metric label="Departure requirements" value="100% satisfied" icon={ShieldCheck} tone="success" /><Metric label="Maximum acceptable delay" value="≤ 15 min" icon={Clock3} /><Metric label="Sessions reassigned" value="3 / 3" icon={Route} tone="success" /><Metric label="Alternative chargers" value="12 available" icon={Zap} /></div></Card><ImpactComparison /></div></>}

    {active && <NetworkImpact data={data} />}
    {active && <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"><Card><SectionHeader title="Disruption timeline" subtitle="Detection to recovery, step by step." /><div className="mt-4 space-y-0">{timeline.map(([time, text], index) => <div key={`${time}-${text}`} className="flex gap-3"><div className="flex w-14 shrink-0 flex-col items-center"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${state === 'recovered' || index < 4 ? 'bg-accent' : 'bg-elevated'}`} /><span className="h-full w-px bg-subtle last:hidden" /></div><div className="border-b border-subtle pb-4 pt-0"><span className="font-mono text-xs text-accent">{time}</span><p className="mt-1 text-sm text-secondary">{text}</p></div></div>)}</div></Card><Card><SectionHeader title="Why these assignments?" subtitle="Explainable recovery decisions for every affected EV." /><div className="mt-4 space-y-4">{data.recovery.map(item => <div key={item.sessionId} className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><div><p className="text-sm font-medium text-primary">{item.ev}</p><p className="mt-1 text-xs leading-5 text-secondary">{item.reason}</p></div></div>)}</div></Card></div>}

    <div><SectionHeader title="Recent disruptions" subtitle="The network adapts to multiple event types." /><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.history.map(item => <Card key={`${item.type}-${item.time}`} padding="sm"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium text-primary">{item.type}</p><p className="mt-1 text-xs text-muted">{item.location}</p></div><Badge variant="green" dot>Resolved</Badge></div><p className="mt-4 font-mono text-[11px] text-muted">{item.time}</p></Card>)}</div></div>
  </div>;
}
