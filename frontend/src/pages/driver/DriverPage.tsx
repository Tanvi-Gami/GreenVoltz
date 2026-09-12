import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cloud,
  Compass,
  CreditCard,
  DollarSign,
  Gauge,
  Leaf,
  Loader2,
  Locate,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingDown,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { driverPageData, getDriverPageData, type ChargingStationOption } from '@/services/driverService';
import { addReservation } from '@/services/reservationService';
import { Reservation } from '@/types/reservation';
import {
  CITY_PRESETS,
  calculateChargeDurationMinutes,
  estimateArrivalMinutes,
  formatEtaTime,
  haversineDistanceKm,
  isEtaInWindow,
  type Coordinates,
} from '@/utils/location';

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
  strategy,
  onReserve,
  onView,
  reserved,
}: {
  station: ChargingStationOption;
  strategy: 'TIME_OPTIMAL' | 'COST_OPTIMAL' | 'BALANCED';
  onReserve: () => void;
  onView: () => void;
  reserved: boolean;
}) {
  const isEtaMatched = isEtaInWindow(station.arrivalMinutes, station.window);

  return (
    <Card className="overflow-hidden border-accent/40 bg-gradient-to-br from-bg-surface to-accent/5" padding="none">
      <div className="border-b border-subtle px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-base font-semibold text-primary">Recommended charging plan</h2>
          </div>
          <div className="flex items-center gap-2">
            {strategy === 'TIME_OPTIMAL' && (
              <Badge variant="cyan" dot>⚡ FASTEST / TIME OPTIMAL</Badge>
            )}
            {strategy === 'COST_OPTIMAL' && (
              <Badge variant="green" dot>💰 LOWEST COST OPTIMAL</Badge>
            )}
            {strategy === 'BALANCED' && (
              <Badge variant="green" dot>🤖 AI BALANCED</Badge>
            )}
          </div>
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
              <p className="mt-1 text-sm text-secondary">{station.chargerType} • {station.chargingSpeedKw} kW Ultra Speed</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
            <DetailMetric label="Distance" value={`${station.distanceKm} km`} icon={Navigation} />
            <DetailMetric label="Estimated Arrival" value={`ETA: ${station.etaTime ?? 'On Time'} (${station.arrivalMinutes} min drive)`} icon={Clock3} />
            <DetailMetric label="Charging Speed" value={`${station.chargingSpeedKw} kW`} icon={Zap} />
            <DetailMetric label="Charging Window" value={station.window} icon={CalendarDays} />
          </div>

          {/* Time & Window Match Banner */}
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-subtle bg-elevated/60 p-3 text-xs">
            <span className="font-semibold text-primary flex items-center gap-1">
              <Timer className="h-4 w-4 text-cyan" />
              Total Trip Time:
            </span>
            <span className="font-mono text-accent font-semibold">{station.totalTripMinutes ?? station.arrivalMinutes + 25} min</span>
            <span className="text-muted">({station.arrivalMinutes}m drive + {station.chargingDurationMinutes ?? 20}m charge)</span>
            {isEtaMatched ? (
              <span className="ml-auto inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success border border-success/30">
                <Check className="h-3 w-3" /> Arrival Matched Window
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1 rounded bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning border border-warning/30">
                ⚠️ Window Fits Soon
              </span>
            )}
          </div>

          <p className="mt-4 max-w-xl text-sm leading-6 text-secondary">{station.explanation}</p>
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
  const navigate = useNavigate();
  const { driverProfile, activeVehicle, selectActiveVehicle, openProfileModal } = useAuth();
  const [pageData, setPageData] = useState(driverPageData);
  const [apiError, setApiError] = useState<string | null>(null);
  const { recommendation, alternatives, recentSessions } = pageData;

  // Dynamic location state (GPS or manual)
  const [userCoords, setUserCoords] = useState<Coordinates>({
    latitude: 37.7749,
    longitude: -122.4194,
    label: 'San Francisco, CA (Default)',
  });
  const [locationMode, setLocationMode] = useState<'preset' | 'gps' | 'manual'>('preset');
  const [customSearchText, setCustomSearchText] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Dynamic trip state (non-constant charge levels)
  const [currentSoc, setCurrentSoc] = useState<number>(driverProfile.currentSocPercent ?? 35);
  const [targetSoc, setTargetSoc] = useState<number>(driverProfile.targetSocPercent ?? 85);
  const [optimizationStrategy, setOptimizationStrategy] = useState<'TIME_OPTIMAL' | 'COST_OPTIMAL' | 'BALANCED'>('BALANCED');
  const [selectedId, setSelectedId] = useState(recommendation.id);
  const [reserved, setReserved] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showStationDetails, setShowStationDetails] = useState(false);

  // Reservation Modals State
  const [rangeWarningModal, setRangeWarningModal] = useState<{
    isOpen: boolean;
    stationName: string;
    distanceKm: number;
  }>({ isOpen: false, stationName: '', distanceKm: 0 });

  const [prepaymentModal, setPrepaymentModal] = useState<{
    isOpen: boolean;
    station: ChargingStationOption | null;
  }>({ isOpen: false, station: null });

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [reservationSuccessModal, setReservationSuccessModal] = useState<{
    isOpen: boolean;
    reservation: Reservation | null;
  }>({ isOpen: false, reservation: null });

  // Location Handlers
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({
          latitude,
          longitude,
          label: `Live GPS Location (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`,
        });
        setLocationMode('gps');
        setIsLocatingGps(false);
      },
      (err) => {
        setIsLocatingGps(false);
        setGpsError(err.message || 'GPS location permission denied or unavailable. Please choose a city below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCitySelect = (cityName: string) => {
    const preset = CITY_PRESETS[cityName];
    if (preset) {
      setUserCoords(preset);
      setLocationMode('preset');
      setGpsError(null);
    }
  };

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchText.trim()) return;
    const query = customSearchText.trim().toLowerCase();
    const matchedKey = Object.keys(CITY_PRESETS).find((k) => k.toLowerCase().includes(query));

    if (matchedKey) {
      setUserCoords(CITY_PRESETS[matchedKey]);
    } else {
      setUserCoords({
        latitude: 37.7749 + (Math.random() * 0.06 - 0.03),
        longitude: -122.4194 + (Math.random() * 0.06 - 0.03),
        label: `${customSearchText.trim()} (Custom Location)`,
      });
    }
    setLocationMode('manual');
    setGpsError(null);
  };

  // Dynamic metrics derived from active vehicle & live sliders
  const energyNeeded = Math.max(0, Math.round(activeVehicle.batteryCapacityKwh * ((targetSoc - currentSoc) / 100)));
  const estimatedRange = Math.round((currentSoc / 100) * 380);

  // Dynamic Station Distance & Time/Cost Optimization Recalculation
  const formatStationWithLocation = (station: ChargingStationOption): ChargingStationOption => {
    let dist = station.distanceKm;
    let mins = station.arrivalMinutes;
    if (station.latitude && station.longitude) {
      dist = haversineDistanceKm(userCoords.latitude, userCoords.longitude, station.latitude, station.longitude);
      mins = estimateArrivalMinutes(dist);
    }
    const cost = Math.round(energyNeeded * station.pricePerKwh);
    const carbonKg = Number((energyNeeded * 0.18).toFixed(1));

    const chargeDuration = calculateChargeDurationMinutes(energyNeeded, station.chargingSpeedKw);
    const totalTripMins = mins + chargeDuration;
    const etaStr = formatEtaTime(mins);

    // Dynamic Scores
    const timeScore = Math.min(
      99,
      Math.max(60, Math.round(70 + station.chargingSpeedKw / 6 - totalTripMins / 2 + station.availableChargers * 1.5))
    );
    const costScore = Math.min(
      99,
      Math.max(60, Math.round(55 + (12 - station.pricePerKwh) * 4 + station.renewablePercent / 3))
    );

    return {
      ...station,
      distanceKm: dist,
      arrivalMinutes: mins,
      chargingDurationMinutes: chargeDuration,
      totalTripMinutes: totalTripMins,
      etaTime: etaStr,
      timeOptimalScore: timeScore,
      costOptimalScore: costScore,
      cost,
      carbonKg,
    };
  };

  const dynamicRecommendation = formatStationWithLocation(recommendation);
  const dynamicAlternatives = alternatives.map(formatStationWithLocation);
  const allDynamicStations = [dynamicRecommendation, ...dynamicAlternatives];

  // Derive optimal choices for Time vs Cost strategy showcase
  const timeOptimalChoice = [...allDynamicStations].sort(
    (a, b) => (b.timeOptimalScore ?? 0) - (a.timeOptimalScore ?? 0)
  )[0];
  const costOptimalChoice = [...allDynamicStations].sort(
    (a, b) => (b.costOptimalScore ?? 0) - (a.costOptimalScore ?? 0)
  )[0];

  const primaryRecommendation =
    optimizationStrategy === 'TIME_OPTIMAL'
      ? timeOptimalChoice
      : optimizationStrategy === 'COST_OPTIMAL'
      ? costOptimalChoice
      : dynamicRecommendation;

  const selectedStation = allDynamicStations.find((s) => s.id === selectedId) ?? primaryRecommendation;

  // Reservation Trigger with 30km Limit Check
  const initiateReservation = (station: ChargingStationOption) => {
    if (station.distanceKm > 30) {
      setRangeWarningModal({
        isOpen: true,
        stationName: station.name,
        distanceKm: station.distanceKm,
      });
    } else {
      setPrepaymentModal({
        isOpen: true,
        station,
      });
    }
  };

  const handleConfirmPrepayment = () => {
    if (!prepaymentModal.station) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const st = prepaymentModal.station!;
      const newRes = addReservation({
        stationId: st.id,
        stationName: st.name,
        chargerType: st.chargerType,
        chargingSpeedKw: st.chargingSpeedKw,
        vehicleName: activeVehicle.makeModel,
        window: st.window,
        date: 'Today',
        depositPaid: 50,
        totalCost: st.cost,
        energyKwh: energyNeeded,
        distanceKm: st.distanceKm,
      });

      setIsProcessingPayment(false);
      setPrepaymentModal({ isOpen: false, station: null });
      setReserved(true);
      setReservationSuccessModal({
        isOpen: true,
        reservation: newRes,
      });
    }, 1200);
  };

  const selectStation = (id: string) => {
    setSelectedId(id);
    setReserved(false);
  };

  const findOptimal = () => {
    setSelectedId(recommendation.id);
    setIsHighlighted(true);
    setReserved(false);
  };

  useEffect(() => {
    let active = true;
    getDriverPageData()
      .then(nextData => {
        if (active) setPageData(nextData);
      })
      .catch(error => {
        if (active) setApiError(error instanceof Error ? error.message : 'Backend recommendation unavailable; showing demo data.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="mx-auto max-w-[1440px] space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="green" dot>AI recommendations active</Badge>
            <span className="text-xs font-semibold text-accent">• Welcome, {driverProfile.name}</span>
            {apiError && <Badge variant="amber">Demo data · API unavailable</Badge>}
          </div>
          <h1 className="type-h1">Find the best time and place to charge</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
            Adjust your current battery level and target charge below to calculate real-time station recommendations for your {activeVehicle.makeModel}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openProfileModal}>
            Manage Garage & Vehicles
          </Button>
          <Button leftIcon={<Sparkles className="h-4 w-4" />} onClick={findOptimal}>
            Recalculate Optimal Station
          </Button>
        </div>
      </div>

      {/* Interactive Location Selector (GPS & Manual Location) */}
      <Card className="border-cyan/30 bg-gradient-to-r from-bg-surface via-bg-surface to-cyan/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan/15 text-cyan">
              <Locate className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="type-technical text-cyan">Starting Location</p>
                <Badge variant={locationMode === 'gps' ? 'green' : 'neutral'}>
                  {locationMode === 'gps' ? '📍 Live GPS' : locationMode === 'manual' ? '🔍 Manual Search' : '🏙️ Preset City'}
                </Badge>
              </div>
              <h2 className="mt-0.5 text-base font-semibold text-primary">{userCoords.label}</h2>
              <p className="text-xs text-muted">
                Lat: {userCoords.latitude.toFixed(4)}, Lon: {userCoords.longitude.toFixed(4)} — Recalculates real-time arrival & distances
              </p>
            </div>
          </div>

          {/* Location Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live GPS Button */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={isLocatingGps ? <Loader2 className="h-4 w-4 animate-spin text-cyan" /> : <Locate className="h-4 w-4 text-cyan" />}
              onClick={handleDetectGps}
              disabled={isLocatingGps}
              className="border-cyan/40 hover:border-cyan hover:bg-cyan/10"
            >
              {isLocatingGps ? 'Locating...' : 'Use My Live GPS'}
            </Button>

            {/* City Preset Dropdown */}
            <div className="flex items-center gap-1.5 bg-elevated border border-subtle rounded-lg px-2.5 py-1">
              <Compass className="h-4 w-4 text-muted shrink-0" />
              <select
                value={Object.keys(CITY_PRESETS).find((k) => CITY_PRESETS[k].latitude === userCoords.latitude) || ''}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="bg-transparent text-xs font-semibold text-primary focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-surface text-muted">Select City Preset...</option>
                {Object.keys(CITY_PRESETS).map((cityName) => (
                  <option key={cityName} value={cityName} className="bg-surface text-primary">
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Location Input */}
            <form onSubmit={handleCustomSearchSubmit} className="flex items-center gap-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Type city or address..."
                  value={customSearchText}
                  onChange={(e) => setCustomSearchText(e.target.value)}
                  className="w-40 sm:w-48 pl-8 pr-2.5 py-1 text-xs bg-elevated border border-subtle rounded-lg text-primary placeholder:text-muted focus-ring"
                />
              </div>
              <Button type="submit" variant="ghost" size="sm" className="text-xs px-2.5 py-1">
                Set
              </Button>
            </form>
          </div>
        </div>

        {gpsError && (
          <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger font-medium flex items-center justify-between">
            <span>⚠️ {gpsError}</span>
            <button type="button" onClick={() => setGpsError(null)} className="text-muted hover:text-primary ml-2">✕</button>
          </div>
        )}
      </Card>

      {/* Interactive Battery & Trip Control Card */}
      <Card className={isHighlighted ? 'border-accent/50 shadow-glow-green' : ''}>
        <div className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-subtle pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-elevated text-accent"><Car className="h-5 w-5" /></span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="type-technical">Selected Vehicle ({activeVehicle.connectorType})</p>
                  {driverProfile.vehicles.length > 1 && (
                    <span className="text-[10px] bg-accent/15 text-accent font-semibold px-2 py-0.5 rounded border border-accent/30">
                      {driverProfile.vehicles.length} Registered
                    </span>
                  )}
                </div>

                {/* Vehicle Selector Dropdown */}
                {driverProfile.vehicles.length > 1 ? (
                  <select
                    value={activeVehicle.id}
                    onChange={(e) => selectActiveVehicle(e.target.value)}
                    className="mt-1 font-semibold text-lg text-primary bg-elevated border border-subtle rounded-lg px-2.5 py-1 focus-ring cursor-pointer"
                  >
                    {driverProfile.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.makeModel} ({v.batteryCapacityKwh} kWh)
                      </option>
                    ))}
                  </select>
                ) : (
                  <h2 className="mt-1 text-lg font-semibold text-primary">{activeVehicle.makeModel}</h2>
                )}

                <p className="mt-1 text-xs text-muted">Pack: {activeVehicle.batteryCapacityKwh} kWh • Connector: {activeVehicle.connectorType}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-subtle bg-elevated/50 p-3">
              <div><p className="text-xs text-muted">Current Battery</p><div className="mt-1"><BatteryLevel percent={currentSoc} /></div></div>
              <div><p className="text-xs text-muted">Target SOC</p><p className="mt-1 text-lg font-semibold text-primary">{targetSoc}%</p></div>
              <div><p className="text-xs text-muted">Energy Needed</p><p className="mt-1 text-lg font-semibold text-accent">{energyNeeded} <span className="text-xs font-normal text-muted">kWh</span></p></div>
              <div><p className="text-xs text-muted">Est. Range</p><p className="mt-1 text-lg font-semibold text-primary">{estimatedRange} <span className="text-xs font-normal text-muted">km</span></p></div>
            </div>
          </div>

          {/* Interactive Trip Controls */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Slider 1: Current SOC */}
            <div className="rounded-xl border border-subtle bg-surface/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <BatteryCharging className="h-4 w-4 text-accent" />
                  Current Battery Level ({currentSoc}%)
                </label>
                <div className="flex gap-1">
                  {[15, 35, 60].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCurrentSoc(preset)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors ${
                        currentSoc === preset
                          ? 'border-accent bg-accent/20 text-accent'
                          : 'border-subtle bg-elevated text-secondary hover:text-primary'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={95}
                value={currentSoc}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentSoc(val);
                  if (val >= targetSoc) setTargetSoc(Math.min(100, val + 10));
                }}
                className="w-full accent-accent cursor-pointer"
              />
              <p className="mt-1 text-[11px] text-muted">Slide to match your vehicle's dashboard charge</p>
            </div>

            {/* Slider 2: Target SOC */}
            <div className="rounded-xl border border-subtle bg-surface/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-cyan" />
                  Required Target Charge ({targetSoc}%)
                </label>
                <div className="flex gap-1">
                  {[80, 90, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetSoc(preset)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors ${
                        targetSoc === preset
                          ? 'border-cyan bg-cyan/20 text-cyan'
                          : 'border-subtle bg-elevated text-secondary hover:text-primary'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={Math.min(95, currentSoc + 5)}
                max={100}
                value={targetSoc}
                onChange={(e) => setTargetSoc(Number(e.target.value))}
                className="w-full accent-cyan cursor-pointer"
              />
              <p className="mt-1 text-[11px] text-muted">Set desired battery percentage for your upcoming trip</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Dual Optimization Strategy Selector (Time-Optimal vs Cost-Optimal) */}
      <Card className="border-accent/30 bg-gradient-to-r from-bg-surface via-bg-surface to-accent/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan/15 text-cyan font-semibold px-2 py-0.5 rounded border border-cyan/30">
                AI DUAL RECOMMENDATION ENGINE
              </span>
              <span className="text-xs text-muted">• ETA arrival matching active</span>
            </div>
            <h2 className="mt-1 text-lg font-semibold text-primary">Optimization Priority Mode</h2>
            <p className="text-xs text-secondary">
              Low battery or in a hurry? Choose ⚡ <strong>Time-Optimal</strong> for fastest charger speeds & drive time. Prefer savings? Choose 💰 <strong>Cost-Optimal</strong>.
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOptimizationStrategy('TIME_OPTIMAL');
                setSelectedId(timeOptimalChoice.id);
                setReserved(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                optimizationStrategy === 'TIME_OPTIMAL'
                  ? 'border-cyan bg-cyan/20 text-cyan shadow-glow-cyan'
                  : 'border-subtle bg-elevated text-secondary hover:text-primary'
              }`}
            >
              <Timer className="h-4 w-4 text-cyan" />
              ⚡ Time Optimal (Fastest)
            </button>

            <button
              type="button"
              onClick={() => {
                setOptimizationStrategy('COST_OPTIMAL');
                setSelectedId(costOptimalChoice.id);
                setReserved(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                optimizationStrategy === 'COST_OPTIMAL'
                  ? 'border-accent bg-accent/20 text-accent shadow-glow-green'
                  : 'border-subtle bg-elevated text-secondary hover:text-primary'
              }`}
            >
              <DollarSign className="h-4 w-4 text-accent" />
              💰 Cost & Eco Optimal (Cheapest)
            </button>

            <button
              type="button"
              onClick={() => {
                setOptimizationStrategy('BALANCED');
                setSelectedId(dynamicRecommendation.id);
                setReserved(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                optimizationStrategy === 'BALANCED'
                  ? 'border-primary bg-elevated text-primary'
                  : 'border-subtle bg-elevated text-secondary hover:text-primary'
              }`}
            >
              <Gauge className="h-4 w-4 text-warning" />
              🤖 AI Balanced
            </button>
          </div>
        </div>

        {/* Dual Recommendation Cards Comparison */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {/* Time Optimal Choice Box */}
          <div
            onClick={() => {
              setOptimizationStrategy('TIME_OPTIMAL');
              setSelectedId(timeOptimalChoice.id);
              setReserved(false);
            }}
            className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
              selectedStation.id === timeOptimalChoice.id
                ? 'border-cyan/70 bg-cyan/15 ring-1 ring-cyan'
                : 'border-subtle bg-surface/60 hover:border-cyan/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan">
                  <Timer className="h-4 w-4" /> ⚡ FASTEST TIME OPTIMAL
                </span>
                <span className="font-mono text-xs font-bold text-cyan">Score: {timeOptimalChoice.timeOptimalScore ?? 92}/100</span>
              </div>
              <h3 className="mt-1.5 text-base font-semibold text-primary">{timeOptimalChoice.name}</h3>
              <p className="mt-0.5 text-xs text-secondary">
                {timeOptimalChoice.chargingSpeedKw} kW Ultra Speed • Total Trip: <strong className="text-cyan">{timeOptimalChoice.totalTripMinutes} min</strong> ({timeOptimalChoice.arrivalMinutes}m drive + {timeOptimalChoice.chargingDurationMinutes}m charge)
              </p>
            </div>

            {/* Direct Reserve Button for Time Optimal */}
            <div className="mt-4 flex items-center justify-between border-t border-subtle pt-3">
              <span className="text-[11px] text-muted">Drive: {timeOptimalChoice.arrivalMinutes}m • ETA: {timeOptimalChoice.etaTime}</span>
              <Button
                size="sm"
                className="border-cyan/40 bg-cyan/20 text-cyan hover:bg-cyan/30"
                leftIcon={<CalendarDays className="h-3.5 w-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setOptimizationStrategy('TIME_OPTIMAL');
                  setSelectedId(timeOptimalChoice.id);
                  initiateReservation(timeOptimalChoice);
                }}
              >
                Reserve Fast Charger
              </Button>
            </div>
          </div>

          {/* Cost Optimal Choice Box */}
          <div
            onClick={() => {
              setOptimizationStrategy('COST_OPTIMAL');
              setSelectedId(costOptimalChoice.id);
              setReserved(false);
            }}
            className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
              selectedStation.id === costOptimalChoice.id
                ? 'border-accent/70 bg-accent/15 ring-1 ring-accent'
                : 'border-subtle bg-surface/60 hover:border-accent/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  <DollarSign className="h-4 w-4" /> 💰 LOWEST COST & ECO OPTIMAL
                </span>
                <span className="font-mono text-xs font-bold text-accent">Score: {costOptimalChoice.costOptimalScore ?? 96}/100</span>
              </div>
              <h3 className="mt-1.5 text-base font-semibold text-primary">{costOptimalChoice.name}</h3>
              <p className="mt-0.5 text-xs text-secondary">
                ₹{costOptimalChoice.pricePerKwh}/kWh • Est. Session Fee: <strong className="text-accent">₹{costOptimalChoice.cost}</strong> ({costOptimalChoice.renewablePercent}% Renewable • ₹{costOptimalChoice.savings} saved)
              </p>
            </div>

            {/* Direct Reserve Button for Cost Optimal */}
            <div className="mt-4 flex items-center justify-between border-t border-subtle pt-3">
              <span className="text-[11px] text-muted">Cost: ₹{costOptimalChoice.cost} • {costOptimalChoice.renewablePercent}% Green</span>
              <Button
                size="sm"
                className="border-accent/40 bg-accent/20 text-accent hover:bg-accent/30"
                leftIcon={<CalendarDays className="h-3.5 w-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setOptimizationStrategy('COST_OPTIMAL');
                  setSelectedId(costOptimalChoice.id);
                  initiateReservation(costOptimalChoice);
                }}
              >
                Reserve Eco Charger
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <RecommendationCard
        station={selectedStation}
        strategy={optimizationStrategy}
        onReserve={() => initiateReservation(selectedStation)}
        onView={() => setShowStationDetails(true)}
        reserved={reserved}
      />

      <div>
        <SectionHeader title="Alternative stations" subtitle="Compare nearby options against your current recommendation." />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {dynamicAlternatives.map(station => (
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

      {/* Station Details Modal */}
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

      {/* 1. Range Warning Modal (Distance > 30 km) */}
      {rangeWarningModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md border-danger/40" padding="lg">
            <div className="flex items-center gap-3 text-danger">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary">Station Out of Range</h2>
                <p className="text-xs text-danger font-medium">30 km Reservation Limit Exceeded</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-secondary">
              You are currently <strong className="text-primary">{rangeWarningModal.distanceKm} km</strong> away from <strong className="text-primary">{rangeWarningModal.stationName}</strong>.
            </p>
            <p className="mt-3 text-xs leading-5 text-muted bg-elevated/60 p-3 rounded-lg border border-subtle">
              ℹ️ To prevent spot hoarding, idle reservations, and grid capacity distortion, GreenVoltz restricts charger reservations to stations within a <strong>30 km radius</strong> of your vehicle's current location.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRangeWarningModal({ isOpen: false, stationName: '', distanceKm: 0 })}>
                Understood & Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Prepayment Deposit Modal (Distance <= 30 km) */}
      {prepaymentModal.isOpen && prepaymentModal.station && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-lg border-accent/40" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">PREPAYMENT HOLD</Badge>
                  <span className="text-xs text-muted">Step 2 of 2</span>
                </div>
                <h2 className="mt-1 text-xl font-semibold text-primary">Reserve Charger at {prepaymentModal.station.name}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPrepaymentModal({ isOpen: false, station: null })}>✕</Button>
            </div>

            {/* Booking Overview */}
            <div className="mt-4 space-y-2.5 rounded-xl border border-subtle bg-elevated/40 p-4 text-xs">
              <div className="flex justify-between"><span className="text-muted">Target Vehicle:</span><span className="font-semibold text-primary">{activeVehicle.makeModel}</span></div>
              <div className="flex justify-between"><span className="text-muted">Charging Window:</span><span className="font-semibold text-accent">{prepaymentModal.station.window}</span></div>
              <div className="flex justify-between"><span className="text-muted">Station Distance:</span><span className="font-semibold text-primary">{prepaymentModal.station.distanceKm} km ({prepaymentModal.station.arrivalMinutes} min drive)</span></div>
              <div className="flex justify-between"><span className="text-muted">Energy Requested:</span><span className="font-semibold text-primary">{energyNeeded} kWh</span></div>
              <div className="flex justify-between border-t border-subtle pt-2"><span className="text-muted">Est. Charging Fee:</span><span className="font-semibold text-primary">₹{prepaymentModal.station.cost}</span></div>
            </div>

            {/* Prepayment Hold Policy */}
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <ShieldCheck className="h-5 w-5" />
                Refundable Prepayment Deposit: ₹50
              </div>
              <p className="mt-1 text-xs text-secondary leading-5">
                To prevent slot hoarding and ensure fair charger availability, a refundable ₹50 deposit is required to lock your charger. The deposit will be fully credited toward your final charging session bill upon arrival.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-primary">Select Payment Method for ₹50 Hold:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'wallet' ? 'border-accent bg-accent/15 text-accent' : 'border-subtle bg-elevated text-secondary'
                  }`}
                >
                  <span className="text-[11px] font-semibold">GreenVolt Wallet</span>
                  <span className="text-[10px] text-muted">Bal: ₹450</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'upi' ? 'border-accent bg-accent/15 text-accent' : 'border-subtle bg-elevated text-secondary'
                  }`}
                >
                  <span className="text-[11px] font-semibold">Instant UPI / GPay</span>
                  <span className="text-[10px] text-muted">Zero Fee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'card' ? 'border-accent bg-accent/15 text-accent' : 'border-subtle bg-elevated text-secondary'
                  }`}
                >
                  <span className="text-[11px] font-semibold">Credit/Debit Card</span>
                  <span className="text-[10px] text-muted">Cards accepted</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setPrepaymentModal({ isOpen: false, station: null })}>
                Cancel
              </Button>
              <Button
                leftIcon={isProcessingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                onClick={handleConfirmPrepayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? 'Processing Hold...' : 'Pay ₹50 & Lock Charger'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 3. Success Modal (After Prepayment Deposit Confirmation) */}
      {reservationSuccessModal.isOpen && reservationSuccessModal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md border-success/40 text-center" padding="lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <Badge variant="green">RESERVATION CONFIRMED</Badge>
            <h2 className="mt-2 text-xl font-semibold text-primary">Charger Slot Locked!</h2>
            <p className="mt-1 text-xs text-muted">₹50 prepayment deposit successfully held</p>

            {/* Pass Code Card */}
            <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-4">
              <p className="text-xs text-accent font-medium">Charger Unlock Pass Code</p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-primary">
                {reservationSuccessModal.reservation.passCode}
              </p>
              <p className="mt-1 text-[11px] text-muted">Scan or enter code at station terminal</p>
            </div>

            <div className="mt-4 space-y-1.5 text-left text-xs bg-elevated/50 p-3 rounded-lg border border-subtle">
              <div className="flex justify-between"><span className="text-muted">Station:</span><span className="font-semibold text-primary">{reservationSuccessModal.reservation.stationName}</span></div>
              <div className="flex justify-between"><span className="text-muted">Window:</span><span className="font-semibold text-accent">{reservationSuccessModal.reservation.window}</span></div>
              <div className="flex justify-between"><span className="text-muted">Vehicle:</span><span className="font-semibold text-primary">{reservationSuccessModal.reservation.vehicleName}</span></div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                onClick={() => setReservationSuccessModal({ isOpen: false, reservation: null })}
              >
                Keep Browsing Dashboard
              </Button>
              <Button
                leftIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => {
                  setReservationSuccessModal({ isOpen: false, reservation: null });
                  navigate('/reservations');
                }}
              >
                Go to My Reservations
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
