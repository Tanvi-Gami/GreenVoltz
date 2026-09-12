import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Cloud,
  DollarSign,
  Gauge,
  Leaf,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import { getEnergyData, type EnergyData, type EnergySignal } from '@/services/energyService';

function formatNumber(value: number, digits = 0) {
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function valuePosition(value: number, values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return max === min ? 50 : ((value - min) / (max - min)) * 100;
}

function SignalRow({ label, unit, values, color, format }: {
  label: string;
  unit: string;
  values: number[];
  color: string;
  format: (value: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-medium text-secondary">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          {label}
        </span>
        <span className="text-[11px] text-muted">{unit}</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {values.map((value, index) => (
          <div key={`${label}-${index}`} className="group relative h-12 overflow-hidden border border-subtle bg-elevated/40">
            <div
              className={`absolute inset-x-1 bottom-1 rounded-sm ${color} opacity-80 transition-all group-hover:opacity-100`}
              style={{ height: `${Math.max(12, valuePosition(value, values) * 0.72 + 10)}%` }}
            />
            <span className="absolute inset-x-0 top-1 text-center font-mono text-[9px] text-primary">
              {format(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, tone }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Zap;
  tone: 'green' | 'cyan' | 'amber';
}) {
  const tones = {
    green: 'bg-success/10 text-success',
    cyan: 'bg-cyan/10 text-cyan',
    amber: 'bg-warning/10 text-warning',
  };
  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tabular-nums text-primary">{value}</p>
          <p className="mt-1 text-xs text-secondary">{detail}</p>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

function WindowCard({ signal, index, signals }: { signal: EnergySignal; index: number; signals: EnergySignal[] }) {
  const previous = signals[index - 1];
  const tariffTrend = previous ? signal.tariff - previous.tariff : 0;
  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-bg-surface to-bg-surface" padding="lg" glow="green">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="green" dot>Recommended window</Badge>
          <h2 className="mt-4 text-xl font-semibold text-primary">{signal.time}</h2>
          <p className="mt-1 text-sm text-secondary">Lowest combined cost + carbon intensity in the available signals.</p>
        </div>
        <Sparkles className="h-5 w-5 text-accent" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-subtle py-4">
        <div><p className="text-[11px] text-muted">Tariff</p><p className="mt-1 font-mono text-sm text-primary">₹{signal.tariff.toFixed(1)}/kWh</p></div>
        <div><p className="text-[11px] text-muted">Carbon</p><p className="mt-1 font-mono text-sm text-primary">{formatNumber(signal.carbonIntensity)} gCO₂</p></div>
        <div><p className="text-[11px] text-muted">Renewable</p><p className="mt-1 font-mono text-sm text-success">{formatNumber(signal.renewablePercent)}%</p></div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-secondary">
        {tariffTrend <= 0 ? <ArrowDownRight className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-warning" />}
        {signal.renewablePercent >= 60 ? 'High renewable availability supports cleaner charging.' : 'This period balances price and grid conditions best.'}
      </p>
    </Card>
  );
}

function Tradeoff({ signal, signals }: { signal: EnergySignal; signals: EnergySignal[] }) {
  const tariffMedian = signals.map(item => item.tariff).sort((a, b) => a - b)[Math.floor(signals.length / 2)];
  const carbonMedian = signals.map(item => item.carbonIntensity).sort((a, b) => a - b)[Math.floor(signals.length / 2)];
  const left = signal.tariff <= tariffMedian ? 'left-[24%]' : 'left-[76%]';
  const top = signal.carbonIntensity <= carbonMedian ? 'top-[25%]' : 'top-[75%]';
  return (
    <Card>
      <SectionHeader title="Cost × Carbon" subtitle="The recommended window balances affordability with cleaner grid energy." />
      <div className="relative mt-5 h-52 border border-subtle bg-elevated/20">
        <div className="absolute inset-x-1/2 top-3 bottom-3 border-l border-dashed border-subtle" />
        <div className="absolute inset-x-3 top-1/2 border-t border-dashed border-subtle" />
        <span className="absolute left-3 top-3 text-[10px] text-success">Cheap + Clean</span>
        <span className="absolute right-3 top-3 text-right text-[10px] text-warning">Expensive + Clean</span>
        <span className="absolute bottom-3 left-3 text-[10px] text-muted">Cheap + Carbon-heavy</span>
        <span className="absolute bottom-3 right-3 text-right text-[10px] text-danger">Expensive + Carbon-heavy</span>
        <span className={`absolute ${left} ${top} flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-accent bg-accent/15 px-2 py-1 text-[10px] font-semibold text-accent`}>
          <Zap className="h-3 w-3" /> {signal.time}
        </span>
      </div>
      <p className="mt-3 text-xs text-secondary">GreenVoltz favors the highlighted period while still respecting vehicle, charger, and departure constraints.</p>
    </Card>
  );
}

export default function EnergyPage() {
  const [data, setData] = useState<EnergyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getEnergyData());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Energy signals could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const recommendation = useMemo(() => {
    if (!data?.signals.length) return null;
    return data.signals.reduce((best, item) => {
      const score = item.tariff / 10 + item.carbonIntensity / 250 - item.renewablePercent / 100;
      const bestScore = best.tariff / 10 + best.carbonIntensity / 250 - best.renewablePercent / 100;
      return score < bestScore ? item : best;
    });
  }, [data]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><RefreshCw className="h-5 w-5 animate-spin text-accent" /><span className="ml-3 text-sm text-secondary">Loading energy signals...</span></div>;
  }

  if (!data || !data.signals.length) {
    return <EmptyState icon={<Gauge className="h-8 w-8" />} title="Energy signals unavailable" description={error ?? 'No energy signal data is available yet.'} />;
  }

  const first = data.signals[0];
  const last = data.signals[data.signals.length - 1];
  const renewableAverage = data.signals.reduce((sum, item) => sum + item.renewablePercent, 0) / data.signals.length;
  const dailySavings = data.overview ? data.overview.estimated_cost * 0.137 : null;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3"><Badge variant="green" dot>{data.source === 'live' ? 'LIVE ENERGY SIGNALS' : 'SEEDED DEMO SIGNALS'}</Badge><span className="text-xs text-muted">Network online</span></div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Energy &amp; Forecasting</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">Live energy signals powering GreenVoltz charging decisions.</p>
        </div>
        <Button variant="secondary" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => void load()}>Refresh signals</Button>
      </div>
      {error && <Card className="border-danger/30 bg-danger/5 p-4"><p className="text-sm text-danger">Energy signals error: {error}</p><p className="mt-1 text-xs text-secondary">Showing the last available data.</p></Card>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Current grid carbon" value={`${formatNumber(first.carbonIntensity)} gCO₂/kWh`} detail="Current intensity" icon={Cloud} tone="amber" />
        <Metric label="Renewable availability" value={`${formatNumber(first.renewablePercent)}%`} detail="Current renewable share" icon={Leaf} tone="green" />
        <Metric label="Current energy price" value={`₹${first.tariff.toFixed(1)}/kWh`} detail="Current tariff" icon={DollarSign} tone="cyan" />
        <Metric label="Optimization opportunity" value={dailySavings === null ? '—' : `₹${dailySavings.toFixed(0)}`} detail={dailySavings === null ? 'Not available' : 'Estimated daily savings'} icon={Zap} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <SectionHeader title="Energy Signal Forecast" subtitle="Price, carbon intensity, renewable availability, and network demand from the available signal series." />
          <p className="mt-3 text-xs text-muted">{data.source === 'live' ? 'Backend signal series · values are presented as available, not as an ML forecast.' : 'Deterministic seeded demo signal series.'}</p>
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-6 gap-1.5 pl-28 text-center font-mono text-[10px] text-muted">{data.signals.map(item => <span key={item.timestamp}>{item.time}</span>)}</div>
            <SignalRow label="Energy price" unit="₹/kWh" values={data.signals.map(item => item.tariff)} color="bg-cyan" format={value => `₹${value.toFixed(1)}`} />
            <SignalRow label="Grid carbon" unit="gCO₂/kWh" values={data.signals.map(item => item.carbonIntensity)} color="bg-warning" format={value => formatNumber(value)} />
            <SignalRow label="Renewable" unit="%" values={data.signals.map(item => item.renewablePercent)} color="bg-success" format={value => `${formatNumber(value)}%`} />
            <SignalRow label="Network demand" unit="kW" values={data.signals.map(item => item.demandKw)} color="bg-danger" format={value => formatNumber(value)} />
          </div>
        </Card>
        {recommendation && <WindowCard signal={recommendation} index={data.signals.indexOf(recommendation)} signals={data.signals} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {recommendation && <Tradeoff signal={recommendation} signals={data.signals} />}
        <Card>
          <SectionHeader title="Renewable availability" subtitle="Cleaner charging opportunities across the available signal series." />
          <div className="mt-6 flex items-center gap-5">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-success/20">
              <div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-t-success border-r-success" />
              <span className="font-mono text-xl font-semibold text-primary">{formatNumber(renewableAverage)}%</span>
            </div>
            <div><p className="text-sm font-semibold text-primary">Average available renewable energy</p><p className="mt-2 text-xs leading-5 text-secondary">Charging during high-renewable periods reduces grid emissions without changing driver requirements.</p></div>
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-subtle pt-4 text-xs text-success"><Leaf className="h-4 w-4" />Peak available signal: {formatNumber(Math.max(...data.signals.map(item => item.renewablePercent)))}%</div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Network energy signals" subtitle="Current network-level indicators from the backend signal series." />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="border border-subtle bg-elevated/30 p-4"><Gauge className="h-4 w-4 text-accent" /><p className="mt-3 text-xs text-muted">Current demand</p><p className="mt-1 font-mono text-lg text-primary">{formatNumber(first.demandKw)} kW</p></div>
          <div className="border border-subtle bg-elevated/30 p-4"><ArrowUpRight className="h-4 w-4 text-warning" /><p className="mt-3 text-xs text-muted">Demand range</p><p className="mt-1 font-mono text-lg text-primary">{formatNumber(Math.min(...data.signals.map(item => item.demandKw)))}–{formatNumber(Math.max(...data.signals.map(item => item.demandKw)))} kW</p></div>
          <div className="border border-subtle bg-elevated/30 p-4"><Cloud className="h-4 w-4 text-cyan" /><p className="mt-3 text-xs text-muted">Latest carbon signal</p><p className="mt-1 font-mono text-lg text-primary">{formatNumber(last.carbonIntensity)} gCO₂/kWh</p></div>
        </div>
      </Card>

      <Card className="border-accent/25 bg-accent/5">
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><h2 className="text-sm font-semibold text-primary">Why GreenVoltz recommends this</h2><p className="mt-2 text-sm leading-6 text-secondary">GreenVoltz balances three signals to guide each charging decision:</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{['Energy cost', 'Grid carbon intensity', 'Renewable availability'].map(item => <span key={item} className="flex items-center gap-2 text-xs font-medium text-primary"><Check className="h-4 w-4 text-success" />{item}</span>)}</div><p className="mt-4 text-xs leading-5 text-secondary">The recommended window favors periods where energy is both cheaper and cleaner while respecting vehicle, charger, and departure constraints.</p></div></div>
      </Card>
    </div>
  );
}
