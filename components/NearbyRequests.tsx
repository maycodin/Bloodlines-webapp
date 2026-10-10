// components/NearbyRequests.tsx
"use client";

import { useState, useEffect } from "react";
import { Bell, MapPin, Clock } from "lucide-react";
import RequestAcceptedModal from "./RequestAcceptedModal";
import { BloodRequest, bloodRequests } from "@/lib/api";

type Urgency = "Critical" | "Urgent" | "Scheduled";

interface NearbyRequestsProps {
  requests?: BloodRequest[];
  loading?: boolean;
  // Return false if accepting failed, so the details panel doesn't open
  onAccept?: (requestId: string) => Promise<boolean> | boolean | void;
}

// Style maps (urgency-driven)
const urgencyBadge: Record<string, string> = {
  critical: "bg-[#C91E1E] text-white",
  high: "bg-[#EA580C] text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-gray-200 text-gray-700",
};

const messageBox: Record<string, string> = {
  critical: "bg-red-50 border-red-300 text-[#C91E1E]",
  high: "bg-yellow-50 border-yellow-300 text-yellow-800",
  medium: "bg-blue-50 border-blue-300 text-blue-800",
  low: "bg-gray-100 border-gray-300 text-gray-700",
};

const cardBorder: Record<string, string> = {
  critical: "border-red-300",
  high: "border-orange-300",
  medium: "border-blue-300",
  low: "border-gray-300",
};

// Map urgency levels to display labels
const urgencyLabels: Record<string, string> = {
  critical: "Critical",
  high: "Urgent",
  medium: "Moderate",
  low: "Scheduled",
};

// The backend sends priority as CRITICAL | URGENT | SCHEDULED.
// Convert it to the keys used by the style maps above.
const priorityToUrgency: Record<string, string> = {
  CRITICAL: "critical",
  URGENT: "high",
  HIGH: "high",
  MEDIUM: "medium",
  SCHEDULED: "low",
  LOW: "low",
};

const NearbyRequests: React.FC<NearbyRequestsProps> = ({ 
  requests = [], 
  loading = false,
  onAccept 
}) => {
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = selectedRequest ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedRequest]);

  const visibleRequests = requests.filter((r) => !hiddenIds.includes(r.id));

  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleAccept = async (request: BloodRequest) => {
    if (!onAccept) {
      setSelectedRequest(request);
      return;
    }
    setAcceptingId(request.id);
    const accepted = await onAccept(request.id);
    setAcceptingId(null);
    if (accepted !== false) {
      setSelectedRequest(request);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6] mt-8">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-red-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 text-sm">Loading nearby requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6] mt-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C91E1E]" />
            <h2 className="font-semibold">Nearby Blood Requests</h2>
          </div>

          <span className="border border-[#C91E1E] text-[#C91E1E] text-sm px-3 py-1 rounded-full">
            {visibleRequests.length} Active
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          These patients need your help. Click "Accept Request" to see
          full details and navigate to the hospital.
        </p>

        {/* Request list */}
        {visibleRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active blood requests at the moment.</p>
            <p className="text-sm text-gray-400 mt-1">Check back later!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleRequests.map((req) => {
              const priority = (req.priorityLevel || req.priority || '').toUpperCase();
              const urgency = priorityToUrgency[priority] || 'low';
              const displayUrgency = urgencyLabels[urgency] || 'Scheduled';
              
              return (
                <div
                  key={req.id}
                  className={`border rounded-lg p-4 flex flex-col md:flex-row md:justify-between gap-4 ${
                    cardBorder[urgency] || 'border-gray-300'
                  }`}
                >
                  {/* Left content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`text-sm px-3 py-1 rounded-md font-medium ${
                          urgencyBadge[urgency] || 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {displayUrgency}
                      </span>

                      <span className="border border-[#C91E1E] text-[#C91E1E] text-sm px-2 py-1 rounded-md">
                        {req.bloodType}
                      </span>

                      <span className="text-sm text-gray-500">
                        {req.unitsNeeded} units needed
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.hospitalName || 'Hospital'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div
                      className={`border rounded-md p-3 text-sm leading-relaxed ${
                        messageBox[urgency] || 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                    >
                      {urgency === 'critical' && "🚨 "}
                      {req.patientCondition || req.instructions || 'No additional details provided.'}
                    </div>
                  </div>

                  {/* Right action buttons */}
                  <div className="flex flex-row md:flex-col gap-2 md:justify-center w-full md:w-auto">
                    <button
                      onClick={() => handleAccept(req)}
                      disabled={acceptingId !== null}
                      className="flex-1 md:flex-none bg-[#C91E1E] hover:bg-[#A01818] text-white px-5 py-2 rounded-md text-sm transition disabled:opacity-50"
                    >
                      {acceptingId === req.id ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      onClick={() => setHiddenIds((prev) => [...prev, req.id])}
                      className="flex-1 md:flex-none border border-gray-300 hover:bg-gray-100 px-5 py-2 rounded-md text-sm transition"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - rendered when a request is selected */}
      {selectedRequest && (
        <RequestAcceptedModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onArrivalAlert={async (requestId) => {
            await bloodRequests.arrivalAlert(requestId);
          }}
        />
      )}
    </>
  );
};

export default NearbyRequests;