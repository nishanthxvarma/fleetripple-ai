import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Bus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';

export function ManifestReconciliationTable({ incidentId }) {
  const {
    bookings,
    incidents,
    respondToRecoveryOffer,
    simulateAllRecoveryOffers,
    reconcileManifest,
    arrangeBackupForWaiting,
    closeIncident,
    setSelectedPassengerBookingId,
    setActiveTab,
  } = useFleetRipple();

  const incident = incidents.find((i) => i.id === incidentId);
  const relevantBookings = bookings.filter((b) => b.tripId === 'TRIP-101');

  // Counts
  const totalAffected = 35;
  const offersSent = relevantBookings.filter((b) => b.status !== 'unassigned').reduce((sum, b) => sum + b.passengerCount, 0);
  const acceptedCount = relevantBookings.filter((b) => b.status === 'accepted').reduce((sum, b) => sum + b.passengerCount, 0);
  const waitingCount = relevantBookings.filter((b) => b.status === 'waiting_alternative').reduce((sum, b) => sum + b.passengerCount, 0);
  const refundCount = relevantBookings.filter((b) => b.status === 'refund_requested').reduce((sum, b) => sum + b.passengerCount, 0);
  const unassignedCount = relevantBookings.filter((b) => b.status === 'unassigned').reduce((sum, b) => sum + b.passengerCount, 0);

  // Status breakdown
  const isReconciled = incident?.status === 'reconciled' || incident?.status === 'resolved';
  const isResolved = incident?.status === 'resolved';
  const canClose = (waitingCount === 0 && unassignedCount === 0 && (acceptedCount + refundCount === totalAffected));

  const [closeError, setCloseError] = useState(null);

  const handleClose = () => {
    if (!canClose) {
      setCloseError(
        `Operational Block: Cannot close incident while ${waitingCount} passenger(s) are awaiting alternatives or ${unassignedCount} are unassigned.`
      );
      setTimeout(() => setCloseError(null), 5000);
      return;
    }
    closeIncident(incidentId);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-0">
      {/* Header & Quick Simulator */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-[#0B132B]">
              Passenger Manifest Reconciliation & Consent Audit
            </h3>
            <Badge variant={isResolved ? 'emerald' : isReconciled ? 'teal' : 'amber'} size="sm">
              {incident?.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time synchronization between operator control desk and passenger mobile responses
          </p>
        </div>

        {/* Quick Batch Simulator for Judges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Simulate Responses:</span>
          </span>

          <button
            onClick={() => simulateAllRecoveryOffers('all_accept')}
            className="px-3 py-1.5 text-xs rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold transition-colors"
            title="Mark all 35 passengers as accepted"
          >
            All Accept (35)
          </button>

          <button
            onClick={() => simulateAllRecoveryOffers('mixed_realistic')}
            className="px-3 py-1.5 text-xs rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold transition-colors"
            title="33 Accept, 1 Wait, 1 Refund"
          >
            Realistic Mixed (33/1/1)
          </button>

          <button
            onClick={() => simulateAllRecoveryOffers('mostly_refund')}
            className="px-3 py-1.5 text-xs rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold transition-colors"
            title="Demonstrate refund processing"
          >
            Refund Edge-Case
          </button>
        </div>
      </div>

      {/* Manifest Counter Badges */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 p-5 bg-slate-50/40 border-b border-slate-100 text-sm">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
          <span className="text-slate-400 font-semibold text-xs uppercase font-mono">Affected</span>
          <div className="text-xl md:text-2xl font-black text-[#0B132B] mt-1">{totalAffected}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
          <span className="text-slate-400 font-semibold text-xs uppercase font-mono">Offers Sent</span>
          <div className="text-xl md:text-2xl font-black text-blue-600 mt-1">{offersSent}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
          <span className="text-slate-400 font-semibold text-xs uppercase font-mono">Accepted</span>
          <div className="text-xl md:text-2xl font-black text-teal-700 mt-1">{acceptedCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
          <span className="text-slate-400 font-semibold text-xs uppercase font-mono">Waiting Alt.</span>
          <div className="text-xl md:text-2xl font-black text-amber-600 mt-1">{waitingCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
          <span className="text-slate-400 font-semibold text-xs uppercase font-mono">Refunds Req.</span>
          <div className="text-xl md:text-2xl font-black text-rose-600 mt-1">{refundCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center">
          <span className="text-slate-400 font-semibold text-xs uppercase font-mono">Unassigned</span>
          <div className="text-xl md:text-2xl font-black text-slate-700 mt-1">{unassignedCount}</div>
        </div>
      </div>

      {/* Interactive Manifest Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Booking ID</th>
              <th className="px-5 py-3">Passenger Name</th>
              <th className="px-5 py-3">Seats / Destination</th>
              <th className="px-5 py-3">Assigned Coach</th>
              <th className="px-5 py-3">Current Consent Status</th>
              <th className="px-5 py-3 text-right">Simulate Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {relevantBookings.map((b) => {
              const statusVariant =
                b.status === 'accepted'
                  ? 'teal'
                  : b.status === 'waiting_alternative'
                  ? 'amber'
                  : b.status === 'refund_requested'
                  ? 'rose'
                  : b.status === 'offered'
                  ? 'blue'
                  : 'slate';

              return (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                    <button
                      onClick={() => {
                        setSelectedPassengerBookingId(b.id);
                        setActiveTab('passenger');
                      }}
                      className="text-teal-700 hover:underline flex items-center gap-1 font-mono text-sm"
                      title="Inspect in Passenger Portal"
                    >
                      <span>{b.id}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[#0B132B] text-sm">{b.leadPassenger}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{b.phone}</div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-800 text-sm">{b.passengerCount} seat(s)</span>
                    <span className="text-slate-400 ml-1.5 text-xs">({b.seatNumbers.join(', ')})</span>
                    <div className="text-xs text-slate-500 mt-0.5">To {b.destination}</div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                      {b.assignedBusId || 'Pending'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant={statusVariant} size="sm">
                      {b.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => respondToRecoveryOffer(b.id, 'accept')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          b.status === 'accepted'
                            ? 'bg-teal-700 text-white'
                            : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                        }`}
                        title="Accept Replacement Bus"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => respondToRecoveryOffer(b.id, 'wait')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          b.status === 'waiting_alternative'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title="Wait for another arrangement"
                      >
                        Wait
                      </button>

                      <button
                        onClick={() => respondToRecoveryOffer(b.id, 'refund')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          b.status === 'refund_requested'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                        }`}
                        title="Request Refund"
                      >
                        Refund
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Warning message if close is blocked */}
      {closeError && (
        <div className="p-3 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{closeError}</span>
        </div>
      )}

      {/* Manifest Reconciliation & Incident Resolution Bar */}
      <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-600 space-y-1">
          <div>
            <strong className="text-[#0B132B]">Audit Rule: </strong>
            An incident cannot be marked resolved while passengers still require assistance.
          </div>
          {waitingCount > 0 && (
            <div className="text-amber-800 font-semibold text-xs md:text-sm">
              ⚠ {waitingCount} passenger(s) currently waiting for an alternative arrangement.
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {waitingCount > 0 && (
            <button
              onClick={() => arrangeBackupForWaiting(incidentId)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center gap-2 shadow-2xs transition-colors"
            >
              <Bus className="w-4 h-4" />
              <span>Arrange Apex Standby Shuttle (BUS-STBY-01)</span>
            </button>
          )}

          <button
            onClick={() => reconcileManifest(incidentId)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <FileCheck className="w-4 h-4 text-teal-600" />
            <span>Reconcile Manifest</span>
          </button>

          <button
            onClick={handleClose}
            disabled={isResolved}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              isResolved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                : canClose
                ? 'bg-[#0B132B] hover:bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{isResolved ? 'Incident Closed & Archived' : 'Close Incident'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
