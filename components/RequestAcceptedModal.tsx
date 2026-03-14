import { useState } from "react";
import {
  CircleCheckBig,
  MapPin,
  Phone,
  Clock,
  MousePointer2,
  TriangleAlert,
  Bell,
  Copy,
  CircleAlert,
  Smile,
} from "lucide-react";
import TrackProgress from "./TrackProgress";

type Hospital = {
  name: string;
  address: string;
  phone: string;
  distance: string;
  travelTime: string;
};

type Request = {
  id: number;
  urgency: string;
  bloodType: string;
  unitsNeeded: number;
  hospital: Hospital;
  timePosted: string;
  message: string;
};

type Step = "details" | "directions" | "progress";

export default function RequestAcceptedModal({
  request,
  onClose,
}: {
  request: Request;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("details");
  const [reminderOn, setReminderOn] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [showReminderAlert, setShowReminderAlert] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(request.hospital.address);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 3000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleToggleReminder = () => {
    const next = !reminderOn;
    setReminderOn(next);

    if (next) {
      setShowReminderAlert(true);
      setTimeout(() => setShowReminderAlert(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-base flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row items-center gap-2 mb-1">
          <CircleCheckBig className="w-4 h-4 text-[#1C7C3A]" />
          <h3 className="font-bold">Request Accepted</h3>
        </div>

        <p className="text-base text-gray-500 mb-4">
          Thank you for responding. Track your journey below.
        </p>

        {/* Tab navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4 text-base">
          {(["details", "directions", "progress"] as Step[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setStep(tab)}
              className={`flex-1 py-2 rounded-md capitalize transition ${
                step === tab ? "bg-white shadow" : ""
              }`}
            >
              {tab === "progress"
                ? "Track Progress"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {step === "details" && (
          <div className="space-y-5">
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium text-base text-gray-800">
                  Request Information
                </p>
                <span className="bg-[#C91E1E] text-white text-base px-3 py-1 rounded-md">
                  {request.urgency}
                </span>
              </div>

              <div className="flex justify-between text-base text-gray-700 mb-2">
                <p>
                  Blood Type:{" "}
                  <span className="text-[#C91E1E] font-medium">
                    {request.bloodType}
                  </span>
                </p>
                <p>Units Needed: {request.unitsNeeded}</p>
              </div>

              <p className="text-base text-gray-700">
                Facility:{" "}
                <span className="font-medium">{request.hospital.name}</span>
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-base text-gray-800">
                Hospital Information
              </p>

              <div className="text-base text-gray-700 space-y-2">
                <div className="flex flex-row items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  <div>
                    <p>{request.hospital.name}</p>
                    <p className="text-gray-500 text-base">
                      {request.hospital.address}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Phone className="w-6 h-6" />
                  <p className="text-blue-600">{request.hospital.phone}</p>
                </div>

                <div className="flex gap-3 text-base text-gray-600">
                  <div className="bg-gray-100 px-3 py-1 flex flex-row items-center gap-2 rounded-full">
                    <MousePointer2 className="w-4 h-4" />
                    <span>{request.hospital.distance}</span>
                  </div>

                  <div className="bg-gray-100 px-3 py-1 flex flex-row items-center gap-2 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{request.hospital.travelTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div className="flex flex-row items-center gap-2 mb-4">
                <TriangleAlert className="w-6 h-6 text-orange-400" />
                <p className="font-medium text-base text-gray-800">
                  Important Instructions
                </p>
              </div>

              <ul className="text-base text-gray-700 space-y-1 list-disc pl-4">
                <li>Please bring a valid photo ID</li>
                <li>Ensure you have eaten in the last 3 hours</li>
                <li>Stay hydrated before donation</li>
                <li>
                  Inform staff that you are responding to emergency request
                  #req-001
                </li>
                {request.urgency === "Critical" && (
                  <li className="font-medium text-yellow-700">
                    ⚠️ This is a CRITICAL request — please proceed immediately
                  </li>
                )}
              </ul>
            </div>

            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 flex justify-between items-center">
              <div className="flex flex-row items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-base font-medium text-gray-800">
                    Reminder Notification
                  </p>
                  <p className="text-base text-gray-500">
                    Get reminded in 30 minutes
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleReminder}
                className={`w-11 h-6 rounded-full relative transition ${
                  reminderOn ? "bg-black" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    reminderOn ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Directions tab */}
        {step === "directions" && (
          <div className="space-y-5">
            <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
              <p className="font-medium text-base mb-1">Navigation</p>
              <p className="text-sm text-gray-600 mb-3">
                Click below to open navigation in your preferred maps
                application
              </p>
              <button className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-md text-base flex items-center justify-center gap-2">
                <MousePointer2 className="w-4 h-4" />
                Open in Maps
              </button>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 border rounded-md py-2 text-base flex items-center justify-center gap-2 hover:bg-gray-50">
                <Phone className="w-4 h-4" />
                Call Hospital
              </button>
              <button
                onClick={handleCopyAddress}
                className="flex-1 border rounded-md py-2 text-base flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
            </div>

            <div className="text-base text-gray-700 space-y-2">
              <p>
                <span className="font-medium">Estimated Travel Time:</span>{" "}
                {request.hospital.travelTime}
              </p>
              <p>
                <span className="font-medium">Distance:</span>{" "}
                {request.hospital.distance}
              </p>
              <p className="text-base text-gray-500">
                Please plan to arrive at least 15 minutes early to complete
                check-in procedures
              </p>
            </div>
          </div>
        )}

        {/* Track progress tab */}
        {step === "progress" && <TrackProgress selectedRequest={request} />}

        {/* Toasts */}
        {showCopyAlert && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border shadow-lg px-4 py-2 rounded-md text-base flex items-center gap-2 whitespace-nowrap">
            <CircleAlert className="w-4 h-4 text-[#1C7C3A]" />
            Hospital address has been copied to your clipboard.
          </div>
        )}

        {showReminderAlert && (
          <div className="absolute -bottom-55 left-1/2 -translate-x-1/2 bg-white border shadow-lg px-4 py-2 rounded-md text-base flex items-center gap-2 whitespace-nowrap">
            <Smile className="w-4 h-4 text-[#1C7C3A]" />
            Reminder has been set for 30 minutes.
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full border px-4 py-2 rounded-md hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
