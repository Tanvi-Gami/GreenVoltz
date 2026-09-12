import { useState } from 'react';
import {
  Building2,
  Car,
  CheckCircle2,
  LogOut,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfileModal() {
  const {
    isProfileModalOpen,
    closeProfileModal,
    activeRole,
    driverProfile,
    operatorProfile,
    activeVehicle,
    updateDriverProfile,
    updateOperatorProfile,
    addVehicle,
    removeVehicle,
    selectActiveVehicle,
    logout,
  } = useAuth();

  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // New Vehicle form state
  const [newMakeModel, setNewMakeModel] = useState('');
  const [newBatteryKwh, setNewBatteryKwh] = useState(60);
  const [newPlugType, setNewPlugType] = useState<'CCS' | 'NACS' | 'Type 2' | 'CHAdeMO'>('CCS');

  // Driver personal fields
  const [driverName, setDriverName] = useState(driverProfile.name);
  const [driverEmail, setDriverEmail] = useState(driverProfile.email);
  const [driverPhone, setDriverPhone] = useState(driverProfile.phone);

  // Operator fields
  const [operatorName, setOperatorName] = useState(operatorProfile.operatorName);
  const [stationName, setStationName] = useState(operatorProfile.stationName);
  const [opEmail, setOpEmail] = useState(operatorProfile.email);
  const [opPhone, setOpPhone] = useState(operatorProfile.phone);
  const [address, setAddress] = useState(operatorProfile.address);
  const [city, setCity] = useState(operatorProfile.city);
  const [totalPorts, setTotalPorts] = useState(operatorProfile.totalPorts);
  const [maxPowerKw, setMaxPowerKw] = useState(operatorProfile.maxPowerKw);
  const [tariffRate, setTariffRate] = useState(operatorProfile.tariffRatePerKwh);

  if (!isProfileModalOpen) return null;

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    updateDriverProfile({
      name: driverName,
      email: driverEmail,
      phone: driverPhone,
    });
    setSavedNotice('Driver personal information updated!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMakeModel.trim()) return;
    addVehicle({
      makeModel: newMakeModel.trim(),
      batteryCapacityKwh: Number(newBatteryKwh),
      connectorType: newPlugType,
    });
    setNewMakeModel('');
    setShowAddVehicle(false);
    setSavedNotice('New vehicle added to your garage!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleSaveOperator = (e: React.FormEvent) => {
    e.preventDefault();
    updateOperatorProfile({
      operatorName,
      stationName,
      email: opEmail,
      phone: opPhone,
      address,
      city,
      totalPorts: Number(totalPorts),
      maxPowerKw: Number(maxPowerKw),
      tariffRatePerKwh: Number(tariffRate),
    });
    setSavedNotice('Station Operator profile saved!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={closeProfileModal}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-subtle bg-surface p-6 shadow-2xl backdrop-blur-xl sm:p-8 animate-fade-in z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeProfileModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-secondary hover:bg-elevated hover:text-primary focus-ring"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent border border-accent/30">
            {activeRole === 'driver' ? <Car className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Account & Profile Settings</h2>
            <p className="text-xs text-secondary">
              Role:{' '}
              <span className="font-semibold text-accent uppercase tracking-wider">
                {activeRole === 'driver' ? 'EV Driver Account' : 'Station Operator Account'}
              </span>
            </p>
          </div>
        </div>

        {savedNotice && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs text-primary animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Content based on Role */}
        {activeRole === 'driver' ? (
          <div className="space-y-6">
            {/* Registered Vehicles Section */}
            <div>
              <div className="flex items-center justify-between border-b border-subtle/60 pb-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <Car className="h-4 w-4" /> Registered Vehicles Garage
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddVehicle((prev) => !prev)}
                  className="flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/20 focus-ring"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              {/* Vehicle List */}
              <div className="space-y-2.5">
                {driverProfile.vehicles.map((veh) => {
                  const isActive = veh.id === activeVehicle.id;
                  return (
                    <div
                      key={veh.id}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                        isActive
                          ? 'border-accent/60 bg-accent/10 shadow-sm'
                          : 'border-subtle bg-elevated/50 hover:bg-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isActive ? 'bg-accent text-background' : 'bg-surface text-muted'
                          }`}
                        >
                          <Car className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            {veh.makeModel}
                            {isActive && (
                              <span className="ml-2 text-[10px] uppercase font-bold text-accent bg-accent/20 px-2 py-0.5 rounded-full border border-accent/40">
                                Active
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted">
                            {veh.batteryCapacityKwh} kWh Pack • Plug: {veh.connectorType}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => selectActiveVehicle(veh.id)}
                            className="rounded px-2.5 py-1 text-xs font-medium border border-subtle bg-surface text-primary hover:bg-elevated"
                          >
                            Set Active
                          </button>
                        )}
                        {driverProfile.vehicles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVehicle(veh.id)}
                            title="Remove vehicle"
                            className="rounded p-1.5 text-secondary hover:bg-danger/20 hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Vehicle Form Dropdown */}
              {showAddVehicle && (
                <form onSubmit={handleAddVehicleSubmit} className="mt-3 rounded-xl border border-accent/30 bg-elevated/80 p-4 space-y-3 animate-fade-in">
                  <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Register New EV to Account
                  </p>
                  <div>
                    <label className="type-small mb-1 block font-medium text-primary">Make & Model</label>
                    <input
                      type="text"
                      required
                      value={newMakeModel}
                      onChange={(e) => setNewMakeModel(e.target.value)}
                      placeholder="e.g. Tata Nexon EV Max, MG ZS EV"
                      className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="type-small mb-1 block font-medium text-primary">Battery (kWh)</label>
                      <input
                        type="number"
                        min={10}
                        max={250}
                        required
                        value={newBatteryKwh}
                        onChange={(e) => setNewBatteryKwh(Number(e.target.value))}
                        className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
                      />
                    </div>
                    <div>
                      <label className="type-small mb-1 block font-medium text-primary">Plug Type</label>
                      <select
                        value={newPlugType}
                        onChange={(e) => setNewPlugType(e.target.value as 'CCS' | 'NACS' | 'Type 2' | 'CHAdeMO')}
                        className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
                      >
                        <option value="CCS">CCS Combo</option>
                        <option value="NACS">NACS (Tesla)</option>
                        <option value="Type 2">Type 2</option>
                        <option value="CHAdeMO">CHAdeMO</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(false)}
                      className="rounded-lg border border-subtle bg-surface px-3 py-1.5 text-xs text-secondary hover:text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-background hover:bg-accent-hover"
                    >
                      Save Vehicle
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Personal Profile Details */}
            <form onSubmit={handleSaveDriver} className="space-y-3.5 border-t border-subtle/60 pt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                Driver Personal Info (Optional)
              </div>
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="type-small mb-1 block font-medium text-primary">Email</label>
                  <input
                    type="email"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                  />
                </div>
                <div>
                  <label className="type-small mb-1 block font-medium text-primary">Phone</label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeProfileModal();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-background hover:bg-accent-hover focus-ring"
                >
                  Save Personal Profile
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Operator Profile Form */
          <form onSubmit={handleSaveOperator} className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5 border-b border-subtle/60 pb-2">
              <Building2 className="h-4 w-4" /> Station & Operator Profile
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Operator Name</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Station Name</label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Email</label>
                <input
                  type="email"
                  value={opEmail}
                  onChange={(e) => setOpEmail(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Phone</label>
                <input
                  type="tel"
                  value={opPhone}
                  onChange={(e) => setOpPhone(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
              <div>
                <label className="type-small mb-1 block font-medium text-primary">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Ports</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={totalPorts}
                  onChange={(e) => setTotalPorts(Number(e.target.value))}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Max Power (kW)</label>
                <input
                  type="number"
                  min={7}
                  max={500}
                  value={maxPowerKw}
                  onChange={(e) => setMaxPowerKw(Number(e.target.value))}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
              <div>
                <label className="type-small mb-1 block font-medium text-primary">Tariff ($/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tariffRate}
                  onChange={(e) => setTariffRate(Number(e.target.value))}
                  className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-sm text-primary focus-ring"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeProfileModal();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>

              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-background hover:bg-accent-hover focus-ring"
              >
                Save Station Info
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
