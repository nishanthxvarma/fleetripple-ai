import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFleetRipple } from '../../context/FleetRippleContext';

export function ReportBreakdownModal({ isOpen, onClose }) {
  const { buses, trips, reportBreakdown } = useFleetRipple();

  const [selectedBusId, setSelectedBusId] = useState('BUS-101');
  const [selectedTripId, setSelectedTripId] = useState('TRIP-101');
  const [stage, setStage] = useState('En Route');
  const [location, setLocation] = useState('Anakapalle Toll Plaza (NH-16, Km 34)');
  const [affectedPassengers, setAffectedPassengers] = useState(35);
  const [description, setDescription] = useState(
    'Coolant line rupture and transmission overheating. Vehicle parked safely at toll plaza emergency bay.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    reportBreakdown({
      busId: selectedBusId,
      tripId: selectedTripId,
      stage,
      location,
      affectedPassengers,
      description,
    });
    onClose();
  };

  const handleBusChange = (busId) => {
    setSelectedBusId(busId);
    const bus = buses.find((b) => b.id === busId);
    if (bus && bus.currentTripId) {
      setSelectedTripId(bus.currentTripId);
      setAffectedPassengers(bus.confirmedBookings || 35);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Fleet Breakdown Incident"
      subtitle="Initiate RippleOps AI constraint analysis & passenger redistribution"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Affected Bus Vehicle</label>
            <select
              value={selectedBusId}
              onChange={(e) => handleBusChange(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.operatorName}) - {b.route}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Affected Scheduled Trip</label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.departureTime} ({t.origin} ➔ {t.destination})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Breakdown Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
            >
              <option value="En Route">En Route (Journey in progress)</option>
              <option value="Before Departure">Before Departure (Terminal stage)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Affected Passenger Count</label>
            <input
              type="number"
              min="1"
              max="55"
              value={affectedPassengers}
              onChange={(e) => setAffectedPassengers(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Incident Location (Simulated GPS Landmark)</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
          >
            <option value="Anakapalle Toll Plaza (NH-16, Km 34)">
              Anakapalle Toll Plaza (NH-16, Km 34) - En Route
            </option>
            <option value="Visakhapatnam Dwaraka RTC Complex (Bay 14)">
              Visakhapatnam Dwaraka RTC Complex (Bay 14) - Before Departure
            </option>
            <option value="Sankaram Bypass Highway (Km 42)">
              Sankaram Bypass Highway (Km 42) - En Route
            </option>
            <option value="Payakaraopeta Rest Area">
              Payakaraopeta Rest Area (NH-16) - En Route
            </option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Mechanical Failure Notes</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
            placeholder="Describe the failure, safety status and towing status..."
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
          >
            Confirm & Trigger RippleOps
          </button>
        </div>
      </form>
    </Modal>
  );
}
