import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BatteryCharging,
  Building2,
  Car,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    activeRole,
    driverProfile,
    operatorProfile,
    activeVehicle,
    loginAsDriver,
    loginAsOperator,
  } = useAuth();

  const [role, setRole] = useState<UserRole>(activeRole || 'driver');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ─── Driver Form State ───────────────────────────────────────────────────────
  const [driverName, setDriverName] = useState(driverProfile.name);
  const [driverEmail, setDriverEmail] = useState(driverProfile.email);
  const [driverPhone, setDriverPhone] = useState(driverProfile.phone);
  const [vehicleMakeModel, setVehicleMakeModel] = useState(activeVehicle.makeModel);
  const [batteryCapacity, setBatteryCapacity] = useState(activeVehicle.batteryCapacityKwh);
  const [connectorType, setConnectorType] = useState(activeVehicle.connectorType);
  const [targetSoc, setTargetSoc] = useState(driverProfile.targetSocPercent);

  // ─── Operator Form State ─────────────────────────────────────────────────────
  const [operatorName, setOperatorName] = useState(operatorProfile.operatorName);
  const [stationName, setStationName] = useState(operatorProfile.stationName);
  const [operatorEmail, setOperatorEmail] = useState(operatorProfile.email);
  const [operatorPhone, setOperatorPhone] = useState(operatorProfile.phone);
  const [address, setAddress] = useState(operatorProfile.address);
  const [city, setCity] = useState(operatorProfile.city);
  const [totalPorts, setTotalPorts] = useState(operatorProfile.totalPorts);
  const [maxPowerKw, setMaxPowerKw] = useState(operatorProfile.maxPowerKw);
  const [tariffRate, setTariffRate] = useState(operatorProfile.tariffRatePerKwh);

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = driverName.trim() || 'EV Driver';
    loginAsDriver({
      name: finalName,
      email: driverEmail,
      phone: driverPhone,
      vehicleMakeModel,
      batteryCapacityKwh: Number(batteryCapacity),
      connectorType,
      targetSocPercent: Number(targetSoc),
    });
    setSuccessMsg(`Welcome, ${finalName}! Your Vehicle Profile has been saved.`);
    setTimeout(() => {
      navigate('/driver');
    }, 1000);
  };

  const handleOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsOperator({
      operatorName,
      stationName,
      email: operatorEmail,
      phone: operatorPhone,
      address,
      city,
      totalPorts: Number(totalPorts),
      maxPowerKw: Number(maxPowerKw),
      tariffRatePerKwh: Number(tariffRate),
      supportedConnectors: ['CCS', 'NACS', 'Type 2'],
    });
    setSuccessMsg(`Welcome, ${operatorName}! Station profile saved.`);
    setTimeout(() => {
      navigate('/operator');
    }, 1000);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 -z-10 h-[350px] w-[350px] rounded-full bg-cyan/10 blur-[100px]" />

      <div className="w-full max-w-xl">
        {/* Header Branding */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-subtle bg-elevated/60 px-4 py-1.5 backdrop-blur-md">
            <Zap className="h-4 w-4 text-accent" />
            <span className="type-technical text-primary">GreenVoltz Orchestration</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Account Registration & Login
          </h1>
          <p className="type-body mt-1 text-secondary">
            Select your account profile to access smart EV charging orchestration.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-primary animate-fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Card Container */}
        <div className="rounded-2xl border border-subtle bg-surface/90 p-6 shadow-glow-green backdrop-blur-xl sm:p-8">
          {/* Role Selection Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-elevated p-1.5 border border-subtle/50">
            <button
              type="button"
              onClick={() => setRole('driver')}
              className={`flex items-center justify-center gap-2.5 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                role === 'driver'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface/50'
              }`}
            >
              <Car className="h-4 w-4" />
              <span>EV Driver Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('operator')}
              className={`flex items-center justify-center gap-2.5 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                role === 'operator'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface/50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Station Operator</span>
            </button>
          </div>

          {/* Form Content */}
          {role === 'driver' ? (
            <form onSubmit={handleDriverSubmit} className="space-y-5">
              {/* Vehicle Section */}
              <div>
                <div className="flex items-center gap-2 border-b border-subtle/60 pb-2 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                  <Car className="h-4 w-4" />
                  <span>1. Vehicle Specifications</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="type-small mb-1 block font-medium text-primary">
                      Vehicle Make & Model
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleMakeModel}
                      onChange={(e) => setVehicleMakeModel(e.target.value)}
                      placeholder="e.g. Tesla Model Y, Hyundai Ioniq 5, Tata Nexon EV"
                      className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary placeholder-muted focus-ring focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="type-small mb-1 block font-medium text-primary">
                        Battery (kWh)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={250}
                        required
                        value={batteryCapacity}
                        onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                        className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary focus-ring focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="type-small mb-1 block font-medium text-primary">
                        Connector Type
                      </label>
                      <select
                        value={connectorType}
                        onChange={(e) => setConnectorType(e.target.value as any)}
                        className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary focus-ring focus:border-accent"
                      >
                        <option value="NACS">NACS (Tesla)</option>
                        <option value="CCS">CCS Combo</option>
                        <option value="Type 2">Type 2 (IEC)</option>
                        <option value="CHAdeMO">CHAdeMO</option>
                      </select>
                    </div>

                    <div>
                      <label className="type-small mb-1 block font-medium text-primary">
                        Target SOC ({targetSoc}%)
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        required
                        value={targetSoc}
                        onChange={(e) => setTargetSoc(Number(e.target.value))}
                        className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary focus-ring focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details (Optional) */}
              <div>
                <div className="flex items-center gap-2 border-b border-subtle/60 pb-2 text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                  <ShieldCheck className="h-4 w-4 text-cyan" />
                  <span>2. Personal Information <span className="text-[10px] text-muted font-normal lowercase">(optional)</span></span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="type-small mb-1 block font-medium text-primary">
                      Driver Name <span className="text-muted text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary placeholder-muted focus-ring"
                    />
                  </div>

                  <div>
                    <label className="type-small mb-1 block font-medium text-primary">
                      Email <span className="text-muted text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary placeholder-muted focus-ring"
                    />
                  </div>

                  <div>
                    <label className="type-small mb-1 block font-medium text-primary">
                      Phone <span className="text-muted text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary placeholder-muted focus-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-background transition-all hover:bg-accent-hover focus-ring shadow-glow-green"
                >
                  <BatteryCharging className="h-4 w-4" />
                  <span>Save Profile & Open Driver Portal</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOperatorSubmit} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-subtle/60 pb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                <Building2 className="h-4 w-4 text-accent" />
                <span>Station Operator & Location Details</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Operator / Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. GreenVoltz Energy Networks"
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary placeholder-muted focus-ring focus:border-accent"
                  />
                </div>

                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Station Name
                  </label>
                  <input
                    type="text"
                    required
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    placeholder="e.g. Downtown Hub #4"
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary placeholder-muted focus-ring focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={operatorEmail}
                    onChange={(e) => setOperatorEmail(e.target.value)}
                    placeholder="ops@example.com"
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary placeholder-muted focus-ring focus:border-accent"
                  />
                </div>

                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={operatorPhone}
                    onChange={(e) => setOperatorPhone(e.target.value)}
                    placeholder="+1 (555) 890-1234"
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary placeholder-muted focus-ring focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Station Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="450 Innovation Blvd"
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary placeholder-muted focus-ring focus:border-accent"
                  />
                </div>

                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    City / Region
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary placeholder-muted focus-ring focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Charging Ports
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={totalPorts}
                    onChange={(e) => setTotalPorts(Number(e.target.value))}
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary focus-ring focus:border-accent"
                  />
                </div>

                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Max Power (kW)
                  </label>
                  <input
                    type="number"
                    min={7}
                    max={500}
                    required
                    value={maxPowerKw}
                    onChange={(e) => setMaxPowerKw(Number(e.target.value))}
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary focus-ring focus:border-accent"
                  />
                </div>

                <div>
                  <label className="type-small mb-1.5 block font-medium text-primary">
                    Tariff ($/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.05}
                    max={2.0}
                    required
                    value={tariffRate}
                    onChange={(e) => setTariffRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-subtle bg-elevated px-3.5 py-2 text-sm text-primary focus-ring focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-background transition-all hover:bg-accent-hover focus-ring"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Save Station & Access Operator Console</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-secondary">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>Local persistent session & encrypted state management</span>
        </div>
      </div>
    </div>
  );
}
