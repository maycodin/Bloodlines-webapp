"use client";

import { CheckCircle2, MapPin, Navigation } from "lucide-react";
import type { Journey } from "@/lib/journey";
import { mapsUrl } from "@/lib/journey";
import { timeAgo } from "@/lib/requests";

type MyAcceptedRequestsProps = {
  journeys: Journey[];
  isConfirmed: (requestId: string) => boolean;
  onView: (requestId: string) => void;
  onRemove: (requestId: string) => void;
};

const statusText = (journey: Journey, confirmed: boolean) =>
  confirmed ? "Donation confirmed" : journey.arrived ? "Arrived, waiting for the hospital to confirm" : journey.onTheWay ? "On your way" : "Accepted";

export default function MyAcceptedRequests({ journeys, isConfirmed, onView, onRemove }: MyAcceptedRequestsProps) {
  if (journeys.length === 0) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 mt-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <CheckCircle2 className="w-5 h-5 text-[#1E7B3A]" /> My Accepted Requests
      </h2>
      <div className="space-y-3">
        {journeys.map((journey) => {
          const { request } = journey;
          const confirmed = isConfirmed(request.id);
          return (
            <div key={request.id} className="rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-[#C91E1E] font-bold text-sm">{request.bloodType}</span>
                  <span className={`text-sm font-medium ${confirmed ? "text-[#1E7B3A]" : "text-gray-700"}`}>{statusText(journey, confirmed)}</span>
                </p>
                <p className="flex items-center gap-1.5 mt-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 shrink-0" /> {request.facilityName || request.hospitalName}
                </p>
                <p className="text-xs text-gray-500 mt-1">Accepted {timeAgo(journey.acceptedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onView(request.id)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-900">
                  View details
                </button>
                {confirmed ? (
                  <button onClick={() => onRemove(request.id)} className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium text-gray-700">
                    Done
                  </button>
                ) : (
                  <a
                    href={mapsUrl(request)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
                  >
                    <Navigation className="w-4 h-4" /> Navigate
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
