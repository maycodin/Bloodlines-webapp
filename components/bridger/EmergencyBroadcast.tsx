"use client";

import { useState } from "react";
import { ChevronDown, Siren } from "lucide-react";
import { bridger } from "@/lib/api";
import type { BloodRequestType } from "@/components/CriticalBloodRequestCard";
import { useToast } from "@/components/ui/Toast";

const inputClass = "w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900";

export default function EmergencyBroadcast({ openRequests }: { openRequests: BloodRequestType[] }) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const selected = openRequests.find((r) => String(r.id) === requestId);

  const send = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const result = await bridger.sendEmergencyAlert({
        targetBloodGroups: [selected.bloodType],
        message: message.trim() || "Emergency: Patient in critical condition",
      });
      showToast(
        typeof result?.recipientCount === "number" ? `Emergency alert sent to ${result.recipientCount} donors` : "Emergency alert sent to eligible donors"
      );
      setRequestId("");
      setMessage("");
      setExpanded(false);
    } catch (err: any) {
      showToast(err?.message || "Could not send the emergency alert. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-white border border-red-300 dark:border-[#6b2a2a] rounded-2xl p-5">
      <button type="button" onClick={() => setExpanded((e) => !e)} className="w-full flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <Siren className="w-6 h-6 text-[#C91E1E] dark:text-[#FF6B6B]" />
          <span className="text-left">
            <span className="block text-lg font-bold text-[#C91E1E] dark:text-[#FF6B6B]">Emergency Broadcast</span>
            <span className="block text-sm text-gray-600">Alert every eligible donor about a critical request. Use only for genuine emergencies.</span>
          </span>
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-900 mb-1.5">Request</span>
            <select value={requestId} onChange={(e) => setRequestId(e.target.value)} className={inputClass}>
              <option value="">Select a request</option>
              {openRequests.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.bloodType}, {r.unitsNeeded} unit{r.unitsNeeded === 1 ? "" : "s"}
                  {r.facilityName ? ` at ${r.facilityName}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-900 mb-1.5">Message (optional)</span>
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Emergency: Patient in critical condition" className={inputClass} />
          </label>
          <button onClick={send} disabled={!selected || sending} className="w-full py-3 rounded-xl bg-[#C91E1E] dark:bg-[#F44336] text-white font-semibold disabled:opacity-50">
            {sending ? "Sending..." : `Send alert${selected ? ` to ${selected.bloodType} donors` : ""}`}
          </button>
        </div>
      )}
    </section>
  );
}
