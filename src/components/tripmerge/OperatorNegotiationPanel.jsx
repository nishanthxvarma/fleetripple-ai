import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';

export function OperatorNegotiationPanel({ proposal, onSendOffers }) {
  const {
    operatorNegotiate,
    reviseProposalTerms,
    cancelConsolidationProposal,
  } = useFleetRipple();

  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [transferAmount, setTransferAmount] = useState(
    proposal?.financials?.apexTransferPayment || 6000
  );

  const agreements = proposal?.operatorAgreements || proposal?.operator_agreements || {};
  const op1Agreement = agreements['OP-1'] || { status: 'pending' };
  const op2Agreement = agreements['OP-2'] || { status: 'pending' };

  const bothAccepted = op1Agreement.status === 'accepted' && op2Agreement.status === 'accepted';
  const hasRejection = op1Agreement.status === 'rejected' || op2Agreement.status === 'rejected';
  const isRevisionRequested =
    op1Agreement.status === 'revision_requested' || op2Agreement.status === 'revision_requested';

  const handleApplyRevision = () => {
    reviseProposalTerms(proposal.id, transferAmount);
    setIsEditingTerms(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-5 md:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="card-title text-slate-900">
              Operator-to-Operator Commercial Negotiation Desk
            </h3>
            <Badge
              variant={
                bothAccepted ? 'emerald' : hasRejection ? 'rose' : isRevisionRequested ? 'amber' : 'blue'
              }
              size="sm"
            >
              {bothAccepted
                ? 'COMMERCIAL AGREEMENT REACHED'
                : hasRejection
                ? 'TERMS REJECTED'
                : isRevisionRequested
                ? 'REVISION REQUESTED'
                : 'NEGOTIATION IN PROGRESS'}
            </Badge>
          </div>
          <p className="secondary-text text-slate-500 mt-1">
            Simulated B2B brokerage workflow between independent private bus operators
          </p>
        </div>

        <button
          onClick={() => setIsEditingTerms(!isEditingTerms)}
          className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-white text-sm font-semibold text-slate-700 flex items-center gap-2 transition-colors shadow-2xs"
        >
          <Sliders className="w-4 h-4 text-teal-600" />
          <span>{isEditingTerms ? 'Close Terms Editor' : 'Adjust Commercial Terms'}</span>
        </button>
      </div>

      {/* Terms Revision Drawer / Inline Form */}
      {isEditingTerms && (
        <div className="p-5 bg-teal-50/60 border-b border-teal-100 text-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-teal-900 text-sm">
              Revise Apex Transfer Settlement Compensation
            </span>
            <span className="text-xs text-teal-700 italic">
              *Adjusting terms resets prior operator signatures to require re-approval
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-slate-600 font-medium text-sm">Transfer Amount:</span>
              <input
                type="range"
                min="4000"
                max="9000"
                step="500"
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="flex-1 accent-teal-600"
              />
              <span className="font-mono font-bold text-teal-800 text-base">₹{transferAmount}</span>
            </div>

            <button
              onClick={handleApplyRevision}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-2xs transition-colors"
            >
              Submit Revised Terms
            </button>
          </div>
        </div>
      )}

      {/* Two Operator Stances Side-by-Side */}
      <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operator A: Apex Express */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Apex Express (Operator A)</h4>
                <p className="text-xs text-slate-500">Originating Trip: TRIP-201 (12 passengers)</p>
              </div>
            </div>
            <Badge
              variant={
                op1Agreement.status === 'accepted'
                  ? 'emerald'
                  : op1Agreement.status === 'rejected'
                  ? 'rose'
                  : op1Agreement.status === 'revision_requested'
                  ? 'amber'
                  : 'slate'
              }
              size="sm"
            >
              {op1Agreement.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 text-slate-600 text-xs md:text-sm space-y-1.5">
            <div className="flex justify-between">
              <span>Proposal Role:</span>
              <span className="font-semibold text-slate-800">Cancels empty run, transfers 12 pax</span>
            </div>
            <div className="flex justify-between">
              <span>Transfer Compensation Paid:</span>
              <span className="font-semibold text-rose-600">
                ₹{proposal.financials.apexTransferPayment}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Net Operating Savings:</span>
              <span className="font-semibold text-emerald-600">
                +₹{proposal.financials.apexNetSavings}
              </span>
            </div>
          </div>

          {op1Agreement.notes && (
            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{op1Agreement.notes}"
            </p>
          )}

          {/* Interactive Simulation Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Simulate Apex Stance:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => operatorNegotiate(proposal.id, 'OP-1', 'accepted', 'Commercial settlement acceptable.')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                  op1Agreement.status === 'accepted'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Accept
              </button>

              <button
                onClick={() =>
                  operatorNegotiate(
                    proposal.id,
                    'OP-1',
                    'revision_requested',
                    'Requesting transfer fee reduction to ₹5,500.'
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                  op1Agreement.status === 'revision_requested'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Revise
              </button>

              <button
                onClick={() => operatorNegotiate(proposal.id, 'OP-1', 'rejected', 'Brand terms unacceptable.')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                  op1Agreement.status === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>

        {/* Operator B: Coastal Cruiser */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-sm">
                B
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Coastal Cruiser (Operator B)</h4>
                <p className="text-xs text-slate-500">Supplying Bus: BUS-202 (15 passengers + 12 apex)</p>
              </div>
            </div>
            <Badge
              variant={
                op2Agreement.status === 'accepted'
                  ? 'emerald'
                  : op2Agreement.status === 'rejected'
                  ? 'rose'
                  : op2Agreement.status === 'revision_requested'
                  ? 'amber'
                  : 'slate'
              }
              size="sm"
            >
              {op2Agreement.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 text-slate-600 text-xs md:text-sm space-y-1.5">
            <div className="flex justify-between">
              <span>Proposal Role:</span>
              <span className="font-semibold text-slate-800">Hosts consolidated run on BUS-202</span>
            </div>
            <div className="flex justify-between">
              <span>Transfer Revenue Received:</span>
              <span className="font-semibold text-emerald-600">
                +₹{proposal.financials.apexTransferPayment}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Net Revenue Contribution:</span>
              <span className="font-semibold text-teal-700">
                +₹{proposal.financials.coastalNetBenefit} margin
              </span>
            </div>
          </div>

          {op2Agreement.notes && (
            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{op2Agreement.notes}"
            </p>
          )}

          {/* Interactive Simulation Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Simulate Coastal Stance:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => operatorNegotiate(proposal.id, 'OP-2', 'accepted', 'Agreed to accommodate 12 Apex passengers.')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                  op2Agreement.status === 'accepted'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Accept
              </button>

              <button
                onClick={() =>
                  operatorNegotiate(
                    proposal.id,
                    'OP-2',
                    'revision_requested',
                    'Requesting transfer fee increase to ₹7,000 for luxury coach amenities.'
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                  op2Agreement.status === 'revision_requested'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Revise
              </button>

              <button
                onClick={() => operatorNegotiate(proposal.id, 'OP-2', 'rejected', 'Capacity needed for walk-in bookings.')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                  op2Agreement.status === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if rejected */}
      {hasRejection && (
        <div className="mx-5 md:mx-6 mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              Negotiation Deadlock: An operator rejected commercial terms. Proposal cannot be finalized.
            </span>
          </div>
          <button
            onClick={() => cancelConsolidationProposal(proposal.id, 'Operator rejected commercial terms')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm transition-colors shrink-0"
          >
            Cancel Proposal
          </button>
        </div>
      )}

      {/* Footer Dispatcher */}
      <div className="p-5 md:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-600 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            {bothAccepted
              ? 'Both operators have accepted commercial terms. Ready to solicit passenger consent.'
              : 'Rule: Cross-company consolidation requires affirmative acceptance from both operators.'}
          </span>
        </div>

        <button
          onClick={onSendOffers}
          disabled={!bothAccepted || proposal.passengerConsent?.status === 'offers_sent'}
          className={`px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            !bothAccepted
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : proposal.passengerConsent?.status === 'offers_sent'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
          }`}
        >
          {proposal.passengerConsent?.status === 'offers_sent' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Consolidation Offers Sent (27 Passengers)</span>
            </>
          ) : (
            <span>Send Consolidation Offers to Passengers</span>
          )}
        </button>
      </div>
    </div>
  );
}
