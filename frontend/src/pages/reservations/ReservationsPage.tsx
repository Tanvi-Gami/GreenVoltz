import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  FileText,
  MapPin,
  QrCode,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import { cancelReservation, getReservations } from '@/services/reservationService';
import { Reservation } from '@/types/reservation';

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations());
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [cancelModalRes, setCancelModalRes] = useState<Reservation | null>(null);
  const [receiptModalRes, setReceiptModalRes] = useState<Reservation | null>(null);

  const handleCancelReservation = (id: string) => {
    cancelReservation(id);
    setReservations(getReservations());
    setCancelModalRes(null);
  };

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  const activeCount = reservations.filter((r) => r.status === 'ACTIVE').length;
  const completedCount = reservations.filter((r) => r.status === 'COMPLETED').length;
  const cancelledCount = reservations.filter((r) => r.status === 'CANCELLED').length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 animate-fade-in">
      {/* Header & Back Action */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button
            type="button"
            onClick={() => navigate('/driver')}
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Driver Dashboard
          </button>
          <h1 className="type-h1">My Charger Reservations</h1>
          <p className="mt-1 text-sm text-secondary">
            Manage your active charging slot locks, unlock pass codes, and view reservation prepayment receipts.
          </p>
        </div>
        <Button leftIcon={<Zap className="h-4 w-4" />} onClick={() => navigate('/driver')}>
          Book New Charger
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-accent/30 bg-accent/5">
          <p className="text-xs text-muted">Active Slot Holds</p>
          <p className="mt-1 font-mono text-2xl font-bold text-accent">{activeCount}</p>
          <p className="mt-0.5 text-[11px] text-success">Pass keys ready to scan</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Completed Sessions</p>
          <p className="mt-1 font-mono text-2xl font-bold text-primary">{completedCount}</p>
          <p className="mt-0.5 text-[11px] text-muted">Past charging runs</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Cancelled Holds</p>
          <p className="mt-1 font-mono text-2xl font-bold text-secondary">{cancelledCount}</p>
          <p className="mt-0.5 text-[11px] text-muted">Deposits refunded</p>
        </Card>
        <Card className="border-cyan/30 bg-cyan/5">
          <p className="text-xs text-muted">Total Deposit Held</p>
          <p className="mt-1 font-mono text-2xl font-bold text-cyan">₹{activeCount * 50}</p>
          <p className="mt-0.5 text-[11px] text-cyan font-medium">Refundable on arrival</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-subtle">
        {[
          { key: 'ALL', label: `All Bookings (${reservations.length})` },
          { key: 'ACTIVE', label: `Active Holds (${activeCount})` },
          { key: 'COMPLETED', label: `Completed (${completedCount})` },
          { key: 'CANCELLED', label: `Cancelled (${cancelledCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reservation List */}
      {filteredReservations.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted mb-2" />
          <h3 className="text-base font-semibold text-primary">No reservations found</h3>
          <p className="mt-1 text-xs text-muted">
            You don't have any reservations matching the selected filter category.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => {
            const isActive = res.status === 'ACTIVE';
            const isCompleted = res.status === 'COMPLETED';

            return (
              <Card
                key={res.id}
                className={
                  isActive
                    ? 'border-accent/40 bg-gradient-to-r from-bg-surface via-bg-surface to-accent/5'
                    : 'bg-elevated/40 opacity-90'
                }
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Column: Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={isActive ? 'green' : isCompleted ? 'cyan' : 'neutral'}
                        dot={isActive}
                      >
                        {res.status}
                      </Badge>
                      <span className="text-xs text-muted">• Booked: {res.date}</span>
                      <span className="text-xs font-semibold text-secondary">• {res.vehicleName}</span>
                    </div>

                    <h2 className="text-lg font-semibold text-primary">{res.stationName}</h2>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-accent" />
                        {res.chargerType} ({res.chargingSpeedKw} kW)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-cyan" />
                        Window: {res.window}
                      </span>
                      <span className="flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-muted" />
                        Distance: {res.distanceKm} km
                      </span>
                    </div>

                    {/* Prepayment Deposit Info */}
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-elevated px-3 py-1.5 text-xs text-muted border border-subtle">
                      <ShieldCheck className="h-4 w-4 text-success" />
                      <span>Prepayment Deposit: <strong className="text-primary">₹{res.depositPaid} Held</strong></span>
                      <span className="text-[10px] text-success">
                        ({isActive ? 'Refundable on arrival' : isCompleted ? 'Credited to bill' : 'Refunded'})
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Pass Code & Actions */}
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                    {isActive ? (
                      <div className="rounded-xl border border-accent/40 bg-accent/15 px-4 py-2.5 text-center sm:text-right">
                        <p className="text-[10px] font-semibold text-accent uppercase tracking-wider">Charger Unlock Pass</p>
                        <p className="mt-0.5 font-mono text-2xl font-bold tracking-widest text-primary flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-accent" />
                          {res.passCode}
                        </p>
                        <p className="text-[10px] text-muted">Present code at station charger terminal</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-xs text-muted">Est. Charge Fee</p>
                        <p className="font-mono text-xl font-bold text-primary">₹{res.totalCost}</p>
                        <p className="text-[10px] text-secondary">{res.energyKwh} kWh requested</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {isActive && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<MapPin className="h-3.5 w-3.5" />}
                            onClick={() => alert(`Starting navigation to ${res.stationName}...`)}
                          >
                            Navigate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger/10"
                            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setCancelModalRes(res)}
                          >
                            Cancel Hold
                          </Button>
                        </>
                      )}

                      {!isActive && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<FileText className="h-3.5 w-3.5" />}
                          onClick={() => setReceiptModalRes(res)}
                        >
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md border-danger/40" padding="lg">
            <div className="flex items-center gap-3 text-danger">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
                <AlertCircle className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary">Cancel Charger Reservation?</h2>
                <p className="text-xs text-danger font-medium">{cancelModalRes.stationName}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-secondary">
              Are you sure you want to release your reserved charging slot ({cancelModalRes.window})?
            </p>

            <div className="mt-3 rounded-lg border border-subtle bg-elevated/60 p-3 text-xs text-muted space-y-1">
              <p>✔️ Your ₹50 prepayment deposit will be immediately refunded to your wallet.</p>
              <p>✔️ The charger slot will be released for other EV drivers.</p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCancelModalRes(null)}>
                Keep Reservation
              </Button>
              <Button
                variant="primary"
                className="bg-danger text-white hover:bg-danger/90"
                onClick={() => handleCancelReservation(cancelModalRes.id)}
              >
                Confirm Cancel & Refund ₹50
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={receiptModalRes.status === 'COMPLETED' ? 'cyan' : 'neutral'}>
                  RECEIPT • {receiptModalRes.status}
                </Badge>
                <h2 className="mt-1 text-xl font-semibold text-primary">{receiptModalRes.stationName}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setReceiptModalRes(null)}>✕</Button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs bg-elevated/40 p-4 rounded-xl border border-subtle">
              <div className="flex justify-between"><span className="text-muted">Transaction ID:</span><span className="font-mono text-primary">{receiptModalRes.id}</span></div>
              <div className="flex justify-between"><span className="text-muted">Pass Code:</span><span className="font-mono text-accent font-semibold">{receiptModalRes.passCode}</span></div>
              <div className="flex justify-between"><span className="text-muted">Vehicle:</span><span className="text-primary">{receiptModalRes.vehicleName}</span></div>
              <div className="flex justify-between"><span className="text-muted">Energy Delivered:</span><span className="text-primary">{receiptModalRes.energyKwh} kWh</span></div>
              <div className="flex justify-between"><span className="text-muted">Prepayment Deposit:</span><span className="text-success font-medium">₹{receiptModalRes.depositPaid} (Credited)</span></div>
              <Divider />
              <div className="flex justify-between text-sm font-semibold"><span className="text-primary">Total Paid:</span><span className="text-accent">₹{receiptModalRes.totalCost}</span></div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setReceiptModalRes(null)}>
                Close Receipt
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
