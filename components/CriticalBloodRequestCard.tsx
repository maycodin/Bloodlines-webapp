"use client";

import React, { useState } from "react";
import { MapPin, Pencil, Trash2, Users, Phone, CalendarClock } from "lucide-react";
import { formatDateTime, timeAgo, CLOSED_REQUEST_STATUSES } from "@/lib/requests";
import type { AssignedDonor } from "@/lib/api";

export type BloodRequestType = {
  id: string | number;
  status: "Critical" | "Urgent" | "Scheduled";
  bloodType: string;
  unitsNeeded: number;
  postedTime: string;
  contactNumber: string;
  patientCondition: string;
  showActions?: boolean;
  timestamp?: Date;
  createdAt?: string;
  requiredByDate?: string;
  priorityLevel?: "CRITICAL" | "URGENT" | "SCHEDULED";
  requestStatus?: string;
  facilityName?: string;
  facilityAddress?: string;
  additionalNotes?: string;
  assignedDonors?: (AssignedDonor | string)[];
  unitsConfirmed?: number;
  facilityCoordinates?: [number, number];
};

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Donor accepted",
  CONFIRMED: "Donation confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED_PENDING_REVIEW: "Awaiting review",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const URGENCY_STYLES: Record<BloodRequestType["status"], string> = {
  Critical: "bg-red-100 text-[#C91E1E] dark:bg-[#4a1d1d] dark:text-[#FF6B6B]",
  Urgent: "bg-amber-100 text-amber-700 dark:bg-[#4a3a12] dark:text-[#FBBF24]",
  Scheduled: "bg-green-100 text-[#1E7B3A] dark:bg-[#173a22] dark:text-[#34C759]",
};

type CriticalBloodRequestCardProps = {
  request: BloodRequestType;
  onConfirm?: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  onCancel?: (id: string | number) => Promise<void>;
  className?: string;
};

const CriticalBloodRequestCard: React.FC<CriticalBloodRequestCardProps> = ({ request, onConfirm, onEdit, onCancel, className = "" }) => {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isClosed = !!request.requestStatus && CLOSED_REQUEST_STATUSES.includes(request.requestStatus);
  const showActions = request.showActions !== false && !isClosed && (!!onConfirm || !!onEdit || !!onCancel);
  const donorCount = request.assignedDonors?.length ?? 0;
  const statusLabel = request.requestStatus ? STATUS_LABELS[request.requestStatus] : null;
  const requiredBy = formatDateTime(request.requiredByDate);
  const isOverdue = !isClosed && !!request.requiredByDate && new Date(request.requiredByDate).getTime() < Date.now();

  const handleCancel = async () => {
    if (!onCancel) return;
    setCancelling(true);
    try {
      await onCancel(request.id);
      setConfirmingCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className={`bg-white border border-gray-200 rounded-2xl p-5 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-lg bg-red-100 text-[#C91E1E] dark:bg-[#4a1d1d] dark:text-[#FF6B6B] font-bold text-lg">{request.bloodType}</span>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${URGENCY_STYLES[request.status]}`}>{request.status}</span>
        {statusLabel && <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">{statusLabel}</span>}
        <span className="ml-auto text-sm text-gray-500" title={formatDateTime(request.createdAt)}>
          {timeAgo(request.createdAt) || request.postedTime}
        </span>
      </div>

      <div className="flex items-start gap-3 mt-4">
        <MapPin className="w-5 h-5 text-gray-500 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg text-gray-900">{request.facilityName || "Facility not given"}</p>
          {request.facilityAddress && <p className="text-sm text-gray-500">{request.facilityAddress}</p>}
        </div>
        <p className="font-bold text-lg text-gray-900 shrink-0">
          {request.unitsNeeded} unit{request.unitsNeeded === 1 ? "" : "s"}
        </p>
      </div>

      <p className="mt-3 text-gray-700">
        <span className="text-gray-500">Condition: </span>
        {request.patientCondition}
      </p>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
        {requiredBy && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4" />
            Needed by {requiredBy}
            {isOverdue && <span className="text-[#C91E1E] dark:text-[#FF6B6B] font-medium">(date passed)</span>}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Phone className="w-4 h-4" />
          {request.contactNumber}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {donorCount > 0 ? `${donorCount} donor${donorCount === 1 ? "" : "s"} accepted` : "No donors yet"}
        </span>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {confirmingCancel ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-sm text-gray-700 mr-auto">Cancel this request? Donors will stop seeing it.</span>
              <button onClick={() => setConfirmingCancel(false)} disabled={cancelling} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700">
                Keep it
              </button>
              <button onClick={handleCancel} disabled={cancelling} className="px-4 py-2 rounded-lg bg-[#C91E1E] text-white text-sm font-semibold disabled:opacity-50">
                {cancelling ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {onConfirm && (
                <button onClick={() => onConfirm(request.id)} className="px-4 py-2 rounded-lg bg-[#C91E1E] dark:bg-[#F44336] text-white text-sm font-semibold">
                  Confirm donation
                </button>
              )}
              {onEdit && (
                <button onClick={() => onEdit(request.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-900">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              )}
              {onCancel && (
                <button onClick={() => setConfirmingCancel(true)} aria-label="Cancel request" className="p-2 rounded-lg text-[#C91E1E] dark:text-[#FF6B6B] hover:bg-red-50">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default CriticalBloodRequestCard;
