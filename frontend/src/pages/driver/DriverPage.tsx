import { useState } from 'react';
import {
  BatteryCharging,
  CalendarDays,
  Car,
  Check,
  ChevronRight,
  Clock3,
  Cloud,
  Leaf,
  MapPin,
  Navigation,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { driverPageData, type ChargingStationOption } from '@/services/driverService';

function BatteryLevel({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-20 rounded-md border-2 border-accent/70 p-1">
        <div className="h-full rounded-sm bg-accent transition-all" style={{ width: `${percent}%` }} />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-primary mix-blend-difference">
          {percent}%
        </span>
      </div>
      <BatteryCharging className="h-5 w-5 text-accent" />
    </div>
  );
}

function DetailMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof MapPin }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="truncate text-sm font-medium text-primary">{value}</p>
    </div>
  );
}

function RecommendationCard({
  station,
  onReserve,
  onView,
  reserved,
}: {
  station: ChargingStationOption;
  onReserve: () => void;
  onView: () => void;
  reserved: boolean;
}) {
  return (
    <Card className="overflow-hidden border-accent/40 bg-gradient-to-br from-bg-surface to-accent/5" padding="none">
      <div className="border-b border-subtle px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-base font-semibold text-primary">Recommended charging plan</h2>
          </div>
          <Badge variant="green" dot>AI OPTIMAL</Badge>
        </div>
      </div>
      <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="type-technical mb-2">Recommended station</p>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-primary">{station.name}</h3>
              <p className="mt-1 text-sm text-secondary">{station.chargerType} • {station.chargingSpeedKw} kW</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
            <DetailMetric label="Distance" value={`${station.distanceKm} km`} icon={Navigation} />
            <DetailMetric label="Arrival" value={`${station.arrivalMinutes} min`} icon={Clock3} />
            <DetailMetric label="Chargers" value={`${station.availableChargers} / ${station.totalChargers}`} icon={Zap} />
            <DetailMetric label="Charging window" value={station.window} icon={CalendarDays} />
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-secondary">{station.explanation}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              size="md"
              leftIcon={reserved ? <Check className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
              onClick={onReserve}
              disabled={reserved}
            >
              {reserved ? 'Charger reserved' : 'Reserve charger'}
            </Button>
            <Button variant="secondary" size="md" leftIcon={<MapPin className="h-4 w-4" />} onClick={onView}>
              View station
            </Button>
          </div>
          {reserved && (
            <p className="mt-3 text-xs font-medium text-success">
              {station.name} • {station.window}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 self-start">
          <div className="rounded-md border border-subtle bg-elevated/50 p-4">
            <p className="text-xs text-muted">Estimated cost</p>
            <p className="mt-2 text-2xl font-semibold text-primary">₹{station.cost}</p>
            <p className="mt-1 text-xs text-success">₹{station.savings} saved</p>
          </div>
          <div className="rounded-md border border-subtle bg-elevated/50 p-4">
            <p className="text-xs text-muted">Estimated CO₂</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{station.carbonKg} <span className="text-sm font-normal">kg</span></p>
            <p className="mt-1 text-xs text-success">{station.carbonReductionPercent}% lower</p>
          </div>
          <div className="col-span-2 rounded-md border border-accent/25 bg-accent/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Leaf className="h-4 w-4 text-success" />
                Renewable energy
              </div>
              <span className="font-mono text-lg font-semibold text-success">{station.renewablePercent}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div className="h-full rounded-full bg-success" style={{ width: `${station.renewablePercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function OptimalWindows() {
  const { windows } = driverPageData;
  return (
    <Card>
      <SectionHeader title="Best charging windows today" subtitle="GreenVoltz weighs price, carbon, renewable supply, and demand." />
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-8 gap-2">
            {windows.map(window => (
              <div key={window.time} className="text-center">
                <div className="mb-2 h-32 rounded-md border border-subtle bg-elevated/40 p-2">
                  <div className="flex h-full items-end justify-center gap-1">
                    <span className="w-1.5 rounded-t bg-accent/70" style={{ height: `${window.renewable}%` }} />
                    <span className="w-1.5 rounded-t bg-cyan/70" style={{ height: `${window.price}%` }} />
                    <span className="w-1.5 rounded-t bg-warning/70" style={{ height: `${window.carbon}%` }} />
                    <span className="w-1.5 rounded-t bg-danger/60" style={{ height: `${window.demand}%` }} />
                  </div>
                </div>
                <p className={`font-mono text-[11px] ${window.optimal ? 'font-semibold text-accent' : 'text-muted'}`}>{window.time}</p>
                {window.optimal && <p className="mt-1 text-[10px] font-medium text-accent">Optimal</p>}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-secondary">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" /> Renewable availability</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-cyan" /> Electricity price</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-warning" /> Grid carbon</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-danger" /> Charging demand</span>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-md border border-accent/25 bg-accent/5 px-4 py-3 text-sm font-medium text-accent">
        <Clock3 className="h-4 w-4" />
        14:30 – 15:15 — Optimal
      </div>
    </Card>
  );
}

export default function DriverPage() {
  const { vehicle, recommendation, alternatives, recentSessions } = driverPageData;
  const [selectedId, setSelectedId] = useState(recommendation.id);
  const [reserved, setReserved] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showStationDetails, setShowStationDetails] = useState(false);
  const selectedStation = [recommendation, ...alternatives].find(station => station.id === selectedId) ?? recommendation;

  const selectStation = (id: string) => {
    setSelectedId(id);
    setReserved(false);
  };

  const findOptimal = () => {
    setSelectedId(recommendation.id);
    setIsHighlighted(true);
    setReserved(false);
  };

  return (
    <>
      <div className="mx-auto max-w-[1440px] space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="green" dot>AI recommendations active</Badge>
          </div>
          <h1 className="type-h1">Find the best time and place to charge</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
            GreenVoltz uses real-time network conditions and AI optimization to recommend the most efficient charging option.
          </p>
        </div>
        <Button leftIcon={<Sparkles className="h-4 w-4" />} onClick={findOptimal}>
          Find optimal charging
        </Button>
      </div>

      <Card className={isHighlighted ? 'border-accent/50 shadow-glow-green' : ''}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-elevated text-accent"><Car className="h-5 w-5" /></span>
            <div>
              <p className="type-technical">Current vehicle</p>
              <h2 className="mt-1 text-lg font-semibold text-primary">{vehicle.name}</h2>
              <p className="mt-1 text-sm text-muted">{vehicle.chargingStatus}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div><p className="text-xs text-muted">Battery</p><div className="mt-2"><BatteryLevel percent={vehicle.batteryPercent} /></div></div>
            <div><p className="text-xs text-muted">Target</p><p className="mt-2 text-lg font-semibold text-primary">{vehicle.targetPercent}%</p></div>
            <div><p className="text-xs text-muted">Energy needed</p><p className="mt-2 text-lg font-semibold text-primary">{vehicle.energyNeededKwh} <span className="text-xs font-normal text-muted">kWh</span></p></div>
            <div><p className="text-xs text-muted">Range</p><p className="mt-2 text-lg font-semibold text-primary">{vehicle.rangeKm} <span className="text-xs font-normal text-muted">km</span></p></div>
          </div>
        </div>
      </Card>

      <RecommendationCard station={selectedStation} onReserve={() => setReserved(true)} onView={() => setShowStationDetails(true)} reserved={reserved} />

      <div>
        <SectionHeader title="Alternative stations" subtitle="Compare nearby options against your current recommendation." />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {alternatives.map(station => (
            <button
              type="button"
              key={station.id}
              onClick={() => selectStation(station.id)}
              className={`text-left focus-ring ${selectedId === station.id ? 'rounded-xl ring-1 ring-accent' : ''}`}
            >
              <Card className="h-full hover:border-accent/50" padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-semibold text-primary">{station.name}</h3><p className="mt-1 text-xs text-muted">{station.distanceKm} km away</p></div>
                  <span className="font-mono text-sm font-semibold text-accent">{station.score}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <DetailMetric label="Available" value={`${station.availableChargers} / ${station.totalChargers}`} icon={Zap} />
                  <DetailMetric label="Speed" value={`${station.chargingSpeedKw} kW`} icon={BatteryCharging} />
                  <DetailMetric label="Renewable" value={`${station.renewablePercent}%`} icon={Leaf} />
                  <DetailMetric label="CO₂" value={`${station.carbonKg} kg`} icon={Cloud} />
                </div>
                <Divider className="my-4" />
                <div className="flex items-center justify-between text-xs"><span className="text-muted">Price</span><span className="font-medium text-primary">₹{station.pricePerKwh} / kWh</span><ChevronRight className="h-4 w-4 text-muted" /></div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <OptimalWindows />
        <Card>
          <SectionHeader title="Why wait 45 minutes?" subtitle="The value of timing your charge." />
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-md bg-elevated/60 p-3"><div><p className="text-xs text-muted">Charge now</p><p className="mt-1 text-lg font-semibold text-primary">₹228</p><p className="text-xs text-muted">6.9 kg CO₂</p></div><Zap className="h-5 w-5 text-warning" /></div>
            <div className="flex items-center justify-between rounded-md border border-accent/30 bg-accent/5 p-3"><div><p className="text-xs text-accent">GreenVoltz recommendation</p><p className="mt-1 text-lg font-semibold text-primary">₹186</p><p className="text-xs text-success">4.8 kg CO₂</p></div><Leaf className="h-5 w-5 text-success" /></div>
            <div className="flex items-center justify-between border-t border-subtle pt-4"><div><p className="text-xs text-muted">Savings</p><p className="mt-1 text-lg font-semibold text-success">₹42</p></div><div className="text-right"><p className="text-xs text-muted">CO₂ reduction</p><p className="mt-1 flex items-center gap-1 text-lg font-semibold text-success"><TrendingDown className="h-4 w-4" /> 31%</p></div></div>
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader title="Recent charging" subtitle="Your latest charging sessions." />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {recentSessions.map(session => (
            <Card key={`${session.station}-${session.date}`} padding="sm">
              <div className="flex items-start justify-between gap-3"><div><p className="font-medium text-primary">{session.station}</p><p className="mt-1 text-xs text-muted">{session.date}</p></div><Check className="h-4 w-4 text-success" /></div>
              <div className="mt-4 flex items-end justify-between"><span className="font-mono text-sm text-secondary">{session.energyKwh} kWh</span><span className="text-sm font-semibold text-primary">₹{session.cost}</span></div>
            </Card>
          ))}
        </div>
      </div>
      </div>
      {showStationDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true" aria-labelledby="station-details-title">
          <Card className="w-full max-w-md" padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="type-technical">Station detail</p>
                <h2 id="station-details-title" className="mt-1 text-xl font-semibold text-primary">{selectedStation.name}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowStationDetails(false)}>Close</Button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <DetailMetric label="Distance" value={`${selectedStation.distanceKm} km`} icon={MapPin} />
              <DetailMetric label="Availability" value={`${selectedStation.availableChargers} / ${selectedStation.totalChargers}`} icon={Zap} />
              <DetailMetric label="Charger" value={`${selectedStation.chargerType} • ${selectedStation.chargingSpeedKw} kW`} icon={BatteryCharging} />
              <DetailMetric label="Renewable" value={`${selectedStation.renewablePercent}%`} icon={Leaf} />
            </div>
            <p className="mt-5 text-sm leading-6 text-secondary">{selectedStation.explanation}</p>
          </Card>
        </div>
      )}
    </>
  );
}
