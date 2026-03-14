import { useState, useEffect } from "react";
import { Bell, MapPin, Clock } from "lucide-react";
import RequestAcceptedModal from "./RequestAcceptedModal";

type Urgency = "Critical" | "Urgent" | "Scheduled";

type Request = {
  id: number;
  urgency: Urgency;
  bloodType: string;
  unitsNeeded: number;
  hospital: {
    name: string;
    address: string;
    phone: string;
    distance: string;
    travelTime: string;
  };
  timePosted: string;
  message: string;
};

// Style maps (urgency-driven)

const urgencyBadge: Record<Urgency, string> = {
  Critical: "bg-[#C91E1E] text-white",
  Urgent: "bg-[#EA580C] text-white",
  Scheduled: "bg-gray-200 text-gray-700",
};

const messageBox: Record<Urgency, string> = {
  Critical: "bg-red-50 border-red-300 text-[#C91E1E]",
  Urgent: "bg-yellow-50 border-yellow-300 text-yellow-800",
  Scheduled: "bg-gray-100 border-gray-300 text-gray-700",
};

const cardBorder: Record<Urgency, string> = {
  Critical: "border-red-300",
  Urgent: "border-gray-300",
  Scheduled: "border-gray-300",
};

// Mock data

const REQUESTS: Request[] = [
  {
    id: 1,
    urgency: "Critical",
    bloodType: "O-",
    unitsNeeded: 2,
    hospital: {
      name: "City General Hospital",
      address: "789 Hospital Drive, Lagos State, Nigeria",
      phone: "234-703-289-1651",
      distance: "2.5 km",
      travelTime: "8 minutes",
    },
    timePosted: "Posted 5 min ago",
    message: "ICU patient - Car accident victim needs immediate transfusion",
  },
  {
    id: 2,
    urgency: "Urgent",
    bloodType: "A+",
    unitsNeeded: 2,
    hospital: {
      name: "City General Hospital",
      address: "789 Hospital Drive, Lagos State, Nigeria",
      phone: "234-703-289-1651",
      distance: "2.5 km",
      travelTime: "8 minutes",
    },
    timePosted: "Posted 5 min ago",
    message: "Maternity emergency - Expecting mother with twins",
  },
  {
    id: 3,
    urgency: "Scheduled",
    bloodType: "AB+",
    unitsNeeded: 2,
    hospital: {
      name: "City General Hospital",
      address: "789 Hospital Drive, Lagos State, Nigeria",
      phone: "234-703-289-1651",
      distance: "2.5 km",
      travelTime: "8 minutes",
    },
    timePosted: "Posted 5 min ago",
    message: "Chemotherapy patient - Scheduled treatment next week",
  },
  {
    id: 4,
    urgency: "Critical",
    bloodType: "B-",
    unitsNeeded: 2,
    hospital: {
      name: "City General Hospital",
      address: "789 Hospital Drive, Lagos State, Nigeria",
      phone: "234-703-289-1651",
      distance: "2.5 km",
      travelTime: "8 minutes",
    },
    timePosted: "Posted 5 min ago",
    message: "CRITICAL - Multiple trauma patients from construction accident",
  },
];

const NearbyRequests = () => {
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = selectedRequest ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedRequest]);

  const visibleRequests = REQUESTS.filter((r) => !hiddenIds.includes(r.id));

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
          These patients need your help. Click &quot;Accept Request&quot; to see
          full details and navigate to the hospital.
        </p>

        {/* Request list */}
        <div className="flex flex-col gap-4">
          {visibleRequests.map((req) => (
            <div
              key={req.id}
              className={`border rounded-lg p-4 flex flex-col md:flex-row md:justify-between gap-4 ${
                cardBorder[req.urgency]
              }`}
            >
              {/* Left content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`text-sm px-3 py-1 rounded-md font-medium ${
                      urgencyBadge[req.urgency]
                    }`}
                  >
                    {req.urgency}
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
                    {req.hospital.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {req.timePosted}
                  </div>
                </div>

                <div
                  className={`border rounded-md p-3 text-sm leading-relaxed ${
                    messageBox[req.urgency]
                  }`}
                >
                  {req.urgency === "Critical" && "🚨 "}
                  {req.message}
                </div>
              </div>

              {/* Right action buttons */}
              <div className="flex flex-row md:flex-col gap-2 md:justify-center w-full md:w-auto">
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="flex-1 md:flex-none bg-[#C91E1E] hover:bg-[#A01818] text-white px-5 py-2 rounded-md text-sm transition"
                >
                  Accept
                </button>

                <button
                  onClick={() => setHiddenIds((prev) => [...prev, req.id])}
                  className="flex-1 md:flex-none border border-gray-300 hover:bg-gray-100 px-5 py-2 rounded-md text-sm transition"
                >
                  Not now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - rendered when a request is selected */}
      {selectedRequest && (
        <RequestAcceptedModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
};

export default NearbyRequests;
