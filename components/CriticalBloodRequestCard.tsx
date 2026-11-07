"use client"
import React from 'react';
import { Clock, Phone, Users } from 'lucide-react';
import type { AssignedDonor } from '@/lib/api';

export type BloodRequestType = {
  id: string | number;
  status: 'Critical' | 'Urgent' | 'Scheduled';
  bloodType: string;
  unitsNeeded: number;
  postedTime: string;
  contactNumber: string;
  patientCondition: string;
  showActions?: boolean;
  customStatusColor?: string;
  customBloodTypeColor?: string;
  timestamp?: Date; // For sorting or time calculations
  // Extra details from the backend, used by the Edit and Confirm donation panels
  priorityLevel?: 'CRITICAL' | 'URGENT' | 'SCHEDULED';
  requestStatus?: string; // PENDING, ACCEPTED, FULFILLED, CANCELLED, ...
  facilityName?: string;
  facilityAddress?: string;
  additionalNotes?: string;
  assignedDonors?: (AssignedDonor | string)[]; // live backend sends donor ids
  unitsConfirmed?: number;
};

// Requests in these states can no longer be edited or confirmed
const CLOSED_STATUSES = ['FULFILLED', 'CANCELLED', 'EXPIRED'];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Waiting for donors',
  ACCEPTED: 'Donor accepted',
  CONFIRMED: 'Donation confirmed',
  IN_PROGRESS: 'In progress',
  COMPLETED_PENDING_REVIEW: 'Awaiting review',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

// Props for the component
type CriticalBloodRequestCardProps = {
  request: BloodRequestType;
  // Leave both out to show the card without action buttons (e.g. for Pulse Leaders)
  onConfirm?: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  className?: string;
};

const CriticalBloodRequestCard: React.FC<CriticalBloodRequestCardProps> = ({
  request,
  onConfirm,
  onEdit,
  className = ''
}) => {

  const getStatusStyles = () => {
    switch (request.status) {
      case 'Critical':
        return 'bg-[#C91E1E] text-white';
      case 'Urgent':
        return 'bg-[#F97316] text-white';
      case 'Scheduled':
        return 'bg-[#10B981] text-white';
      default:
        return 'bg-[#C91E1E] text-white';
    }
  };

  const getBloodTypeStyles = () => {
    return 'text-[#C91E1E] border border-[#C91E1E]';
  };

  const isClosed = !!request.requestStatus && CLOSED_STATUSES.includes(request.requestStatus);
  const showActions = request.showActions !== false && !isClosed && (!!onConfirm || !!onEdit);
  const donorCount = request.assignedDonors?.length ?? 0;
  const statusLabel = request.requestStatus ? STATUS_LABELS[request.requestStatus] || request.requestStatus : null;

  return (
    <div className={`border border-[#D8D6D6] mb-4 rounded-lg p-5 ${isClosed ? 'opacity-70' : ''} ${className}`}>
      {/* Header Section */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Status Badge */}
        <div className={`text-sm text-center py-1 px-3 rounded-lg ${getStatusStyles()}`}>
          {request.status}
        </div>

        {/* Blood Type Badge */}
        <div className={`text-sm text-center py-1 px-3 rounded-lg ${getBloodTypeStyles()}`}>
          {request.bloodType}
        </div>

        {/* Units Needed */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span>{request.unitsNeeded} unit{request.unitsNeeded !== 1 ? 's' : ''} needed</span>
        </div>

        {/* Backend status, e.g. "Waiting for donors" or "Fulfilled" */}
        {statusLabel && (
          <div className="text-xs text-center py-1 px-2 rounded-full bg-gray-100 text-gray-700 self-center">
            {statusLabel}
          </div>
        )}
      </div>

      {/* Info and Actions Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Contact and Time Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm">{request.postedTime}</span>
          </div>

          <div className="hidden sm:block text-gray-300">|</div>

          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <div className="text-sm font-light text-gray-900">{request.contactNumber}</div>
          </div>

          {request.assignedDonors && (
            <>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">
                  {donorCount === 0 ? 'No donors yet' : `${donorCount} donor${donorCount !== 1 ? 's' : ''} accepted`}
                </span>
              </div>
            </>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 self-start sm:self-auto">
            {onConfirm && (
              <button
                onClick={() => onConfirm(request.id)}
                className="text-sm rounded-lg font-semibold text-white py-1 px-3 bg-[#C91E1E] hover:bg-[#A01818] transition-colors"
              >
                Confirm donation
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(request.id)}
                className="text-sm rounded-lg font-semibold text-[#C91E1E] py-1 px-3 border border-[#C91E1E] hover:bg-red-50 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Patient Condition */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className={`w-2 h-2 rounded-full ${
            request.status === 'Critical' ? 'bg-red-500' :
            request.status === 'Urgent' ? 'bg-orange-500' :
            'bg-green-500'
          } ${isClosed ? '' : 'animate-pulse'}`}></div>
          <span>{request.patientCondition}</span>
        </div>
      </div>
    </div>
  );
};

export default CriticalBloodRequestCard;
