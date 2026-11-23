"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Copy, Hospital, Loader2, MapPin, Navigation, Phone, TriangleAlert, X } from "lucide-react";
import type { Journey } from "@/lib/journey";
import { distanceKm, estimatedTravelMinutes, mapsUrl } from "@/lib/journey";
import { formatDateTime } from "@/lib/requests";
import { useToast } from "@/components/ui/Toast";
import Switch from "@/components/ui/Switch";

type Tab = "details" | "directions" | "progress";

const REMINDER_MINUTES = 30;

const INSTRUCTIONS = [
  "Bring a valid photo ID",
  "Eat a proper meal within the last 3 hours",
  "Drink plenty of water before you go",
  "Tell the staff you're responding to a Bloodlines request",
];

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-[#C91E1E] text-white",
  URGENT: "bg-amber-500 text-white",
  SCHEDULED: "bg-[#1E7B3A] text-white",
};

type DonationJourneyProps = {
  journey: Journey;
  donationConfirmed: boolean;
  feedbackGiven: boolean;
  onUpdate: (changes: Partial<Journey>) => void;
  onArrived: () => Promise<void>;
  onGiveFeedback: () => void;
  onClose: () => void;
};

export default function DonationJourney({ journey, donationConfirmed, feedbackGiven, onUpdate, onArrived, onGiveFeedback, onClose }: DonationJourneyProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("details");
  const [sendingArrival, setSendingArrival] = useState(false);
  const { request } = journey;
  const priority = String(request.priorityLevel || request.priority || "").toUpperCase();
  const facility = request.facilityName || request.hospitalName || "Hospital";
  const address = request.facilityAddress || request.address || "";
  const notes = request.patientCondition || request.instructions || request.additionalNotes;
  const km = distanceKm(request.distance);
  const minutes = estimatedTravelMinutes(km);

  const openMaps = () => window.open(mapsUrl(request), "_blank", "noopener");

  const startNavigation = () => {
    openMaps();
    if (!journey.onTheWay) {
      onUpdate({ onTheWay: true });
      showToast("You're on your way. Be safe!");
    }
  };

  const markArrived = async () => {
    setSendingArrival(true);
    try {
      await onArrived();
      onUpdate({ onTheWay: true, arrived: true });
      showToast("The hospital knows you've arrived. Please check in at reception.");
    } catch {
      showToast("Could not tell the hospital you've arrived. Please call them directly.", "error");
    } finally {
      setSendingArrival(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText([facility, address].filter(Boolean).join(", "));
      showToast("Address copied");
    } catch {
      showToast("Could not copy the address.", "error");
    }
  };

  const toggleReminder = (on: boolean) => {
    onUpdate({ reminderAt: on ? new Date(Date.now() + REMINDER_MINUTES * 60000).toISOString() : undefined });
    if (on) showToast(`Reminder set for ${REMINDER_MINUTES} minutes`);
  };

  const steps = [
    { title: "Request Accepted", detail: "You've committed to donate", done: true },
    { title: "On Your Way", detail: "Travelling to the hospital", done: !!journey.onTheWay || !!journey.arrived },
    { title: "Arrived at Hospital", detail: "Check in at reception", done: !!journey.arrived },
    { title: "Donation Complete", detail: "Confirmed by the hospital", done: donationConfirmed },
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="journey-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="journey-title" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <CheckCircle2 className="w-6 h-6 text-[#1E7B3A]" /> Request Accepted
            </h2>
            <p className="text-sm text-gray-500 mt-1">Thank you for responding. Track your journey below.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 mt-5 rounded-xl bg-gray-100 text-sm font-medium">
          {(
            [
              ["details", "Details"],
              ["directions", "Directions"],
              ["progress", "Track Progress"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`py-2 rounded-lg ${tab === id ? "bg-white shadow-sm text-gray-900" : "text-gray-600"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {tab === "details" && (
            <>
              <section className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">Request Information</h3>
                  {priority && <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${PRIORITY_STYLES[priority] || "bg-gray-200 text-gray-700"}`}>{priority.charAt(0) + priority.slice(1).toLowerCase()}</span>}
                </div>
                <dl className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Blood type</dt>
                    <dd className="font-semibold text-[#C91E1E]">{request.bloodType}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Units needed</dt>
                    <dd className="font-semibold text-gray-900">{request.unitsNeeded}</dd>
                  </div>
                  {request.requiredByDate && (
                    <div className="col-span-2">
                      <dt className="text-gray-500">Needed by</dt>
                      <dd className="text-gray-900">{formatDateTime(request.requiredByDate)}</dd>
                    </div>
                  )}
                  {notes && (
                    <div className="col-span-2">
                      <dt className="text-gray-500">Notes</dt>
                      <dd className="text-gray-900">{notes}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Hospital Information</h3>
                <p className="flex items-start gap-2 text-sm text-gray-900">
                  <Hospital className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                  <span>
                    <span className="font-medium">{facility}</span>
                    {address && <span className="block text-gray-600">{address}</span>}
                  </span>
                </p>
                {request.contactPhone && (
                  <a href={`tel:${request.contactPhone}`} className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                    <Phone className="w-4 h-4" /> {request.contactPhone}
                  </a>
                )}
                {km && (
                  <p className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700">{km.toFixed(1)} km away</span>
                    {minutes && <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700">About {minutes} min drive</span>}
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
                  <TriangleAlert className="w-4 h-4 text-amber-600" /> Important Instructions
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {INSTRUCTIONS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                  {priority === "CRITICAL" && <li className="text-[#C91E1E] font-medium">This is a critical request. Please go as soon as you can.</li>}
                </ul>
              </section>

              <section className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between gap-4">
                <span className="flex items-start gap-2">
                  <Bell className="w-4 h-4 mt-1 text-blue-600" />
                  <span>
                    <span className="block font-semibold text-gray-900">Reminder</span>
                    <span className="block text-sm text-gray-600">Remind me in {REMINDER_MINUTES} minutes while Bloodlines is open</span>
                  </span>
                </span>
                <Switch label="Remind me" checked={!!journey.reminderAt} onChange={toggleReminder} />
              </section>
            </>
          )}

          {tab === "directions" && (
            <>
              <section className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-semibold text-gray-900">Navigation</h3>
                <p className="text-sm text-gray-600 mt-1">Open the route in your preferred maps app.</p>
                <button onClick={startNavigation} className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold">
                  <Navigation className="w-4 h-4" /> Open in Maps
                </button>
              </section>
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${request.contactPhone}`} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-900">
                  <Phone className="w-4 h-4" /> Call Hospital
                </a>
                <button onClick={copyAddress} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-900">
                  <Copy className="w-4 h-4" /> Copy Address
                </button>
              </div>
              <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
                {minutes && (
                  <p>
                    <span className="font-semibold text-gray-900">Estimated travel time:</span> about {minutes} minutes
                  </p>
                )}
                {km && (
                  <p>
                    <span className="font-semibold text-gray-900">Distance:</span> {km.toFixed(1)} km
                  </p>
                )}
                <p>Please plan to arrive at least 15 minutes early for check-in.</p>
              </section>
            </>
          )}

          {tab === "progress" && (
            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Donation Progress</h3>
              <ol className="space-y-5">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-3">
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.done ? "bg-[#1E7B3A] text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-gray-900">{step.title}</span>
                      <span className="block text-sm text-gray-600">{step.detail}</span>
                      {index === 1 && !journey.arrived && (
                        <button onClick={startNavigation} className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900">
                          <MapPin className="w-4 h-4" /> Start navigation
                        </button>
                      )}
                      {index === 2 && !journey.arrived && (
                        <button
                          onClick={markArrived}
                          disabled={sendingArrival}
                          className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E7B3A] text-white text-sm font-medium disabled:opacity-50"
                        >
                          {sendingArrival && <Loader2 className="w-4 h-4 animate-spin" />}
                          I&apos;ve arrived
                        </button>
                      )}
                      {index === 3 && journey.arrived && !donationConfirmed && (
                        <span className="block mt-2 text-sm text-amber-700">Waiting for the hospital to confirm. This usually takes 1 to 3 hours.</span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              {donationConfirmed && (
                <button
                  onClick={onGiveFeedback}
                  disabled={feedbackGiven}
                  className="mt-6 w-full py-3 rounded-xl bg-[#1E7B3A] text-white font-semibold disabled:opacity-60"
                >
                  {feedbackGiven ? "Thanks for your feedback" : "Give Feedback"}
                </button>
              )}
            </section>
          )}
        </div>

        <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl border border-gray-300 text-gray-900 font-medium">
          Close
        </button>
      </div>
    </div>
  );
}
