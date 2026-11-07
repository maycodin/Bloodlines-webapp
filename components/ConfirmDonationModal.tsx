// components/ConfirmDonationModal.tsx
// Shows the donors who accepted a request, so the Bridger can confirm each donation
// (POST /bridger/confirm-donation/{requestId}/{donorId}) and then mark the request fulfilled
// (POST /bridger/fulfill-request/{requestId}).
"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, Phone, Loader2 } from "lucide-react";
import { bridger } from "@/lib/api";
import InlineMessage, { Message } from "@/components/InlineMessage";
import type { BloodRequestType } from "@/components/CriticalBloodRequestCard";

type ConfirmDonationModalProps = {
  request: BloodRequestType;
  onClose: () => void;
  // Called after a donation is confirmed or the request is fulfilled, so the page can reload requests
  onChanged: (message?: string) => void;
};

type DonorRow = { id: string; name: string; bloodGroup?: string; phoneNumber?: string; nameKnown: boolean };

const ConfirmDonationModal = ({ request, onClose, onChanged }: ConfirmDonationModalProps) => {
  const assigned = request.assignedDonors || [];
  const requestId = String(request.id);

  // The live backend sends donor ids instead of donor details, so look names up from /bridger/donors.
  // That list only covers donors who are currently available, so some may stay unnamed.
  const [donorLookup, setDonorLookup] = useState<Record<string, { name: string; bloodGroup?: string }>>({});
  const hasBareIds = assigned.some((donor) => typeof donor === "string");
  useEffect(() => {
    if (!hasBareIds) return;
    bridger
      .getDonors(100)
      .then((list) => setDonorLookup(Object.fromEntries(list.map((d) => [d.id, { name: d.name, bloodGroup: d.bloodGroup }]))))
      .catch((err) => console.error("Could not load donor names:", err));
  }, [hasBareIds]);

  const donors: DonorRow[] = assigned.map((donor) =>
    typeof donor === "string"
      ? {
          id: donor,
          name: donorLookup[donor]?.name || `Donor ID …${donor.slice(-6)}`,
          bloodGroup: donorLookup[donor]?.bloodGroup,
          nameKnown: !!donorLookup[donor],
        }
      : { id: donor._id, name: donor.fullName, bloodGroup: donor.bloodGroup, phoneNumber: donor.phoneNumber, nameKnown: true }
  );
  const someUnnamed = donors.some((donor) => !donor.nameKnown);
  // The backend doesn't say which donors were already confirmed, so this tracks confirmations made in this session
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<Message | null>(null);

  const unitsConfirmed = (request.unitsConfirmed ?? 0) + confirmedIds.length;

  const handleConfirmDonor = async (donorId: string, donorName: string) => {
    setBusyId(donorId);
    setMessage(null);
    try {
      await bridger.confirmDonation(requestId, donorId);
      setConfirmedIds((prev) => [...prev, donorId]);
      setMessage({ type: "success", text: `Donation from ${donorName} confirmed.` });
      onChanged();
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Could not confirm this donation. Please try again." });
    } finally {
      setBusyId(null);
    }
  };

  const handleFulfill = async () => {
    setBusyId("fulfill");
    setMessage(null);
    try {
      await bridger.fulfillRequest(requestId, note.trim() || undefined);
      onChanged("Request marked as fulfilled.");
      onClose();
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Could not mark the request as fulfilled. Please try again." });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900">Confirm Donations</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {request.bloodType} request · {unitsConfirmed} of {request.unitsNeeded} unit{request.unitsNeeded !== 1 ? "s" : ""} confirmed
        </p>

        <InlineMessage message={message} onClose={() => setMessage(null)} />

        <h3 className="text-sm font-semibold text-gray-800 mb-2">Donors who accepted</h3>
        {donors.length === 0 ? (
          <div className="p-4 rounded-lg bg-gray-50 text-sm text-gray-600 mb-4">
            No donors have accepted this request yet. When a donor accepts, they'll appear here so you can confirm their donation once they've donated.
          </div>
        ) : (
          <ul className="space-y-2 mb-4">
            {donors.map((donor) => {
              const isConfirmed = confirmedIds.includes(donor.id);
              return (
                <li key={donor.id} className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className={`font-medium ${donor.nameKnown ? "text-gray-900" : "text-gray-500"}`}>{donor.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      {donor.bloodGroup && <span>{donor.bloodGroup}</span>}
                      {donor.phoneNumber && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{donor.phoneNumber}</span>
                      )}
                    </p>
                  </div>
                  {isConfirmed ? (
                    <span className="flex items-center gap-1 text-sm text-green-700"><CheckCircle className="w-4 h-4" /> Confirmed</span>
                  ) : (
                    <button
                      onClick={() => handleConfirmDonor(donor.id, donor.name)}
                      disabled={busyId !== null}
                      className="text-sm rounded-lg font-semibold text-white py-1.5 px-3 bg-[#C91E1E] hover:bg-[#A01818] disabled:opacity-50 flex items-center gap-1"
                    >
                      {busyId === donor.id && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirm donation
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {someUnnamed && (
          <p className="text-xs text-gray-500 -mt-2 mb-4">
            Some donor names aren't available yet, so they're shown by ID. Contact details come from the donor once they arrive.
          </p>
        )}

        {/* Close out the whole request */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Mark request as fulfilled</h3>
          <p className="text-xs text-gray-500 mb-2">Use this when the patient has all the blood they need. The request will stop showing to donors.</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note, e.g. remaining units sourced from blood bank"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} disabled={busyId !== null} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Close
            </button>
            <button
              onClick={handleFulfill}
              disabled={busyId !== null}
              className="px-4 py-2 text-sm bg-[#1C7C3A] text-white rounded-lg hover:bg-[#166430] disabled:opacity-50 flex items-center gap-2"
            >
              {busyId === "fulfill" && <Loader2 className="w-4 h-4 animate-spin" />}
              Mark as fulfilled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDonationModal;
