import type { BloodRequestType } from '@/components/CriticalBloodRequestCard';

// "19 Nov 2026, 2:13 pm". Returns '' for a missing or invalid date.
export const formatDateTime = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Turn a blood request from the backend into the shape the request cards use
export const toRequestCard = (req: any): BloodRequestType => ({
  id: req._id || req.id,
  status: req.priorityLevel === 'CRITICAL' ? 'Critical' : req.priorityLevel === 'URGENT' ? 'Urgent' : 'Scheduled',
  bloodType: req.bloodType,
  unitsNeeded: req.unitsNeeded,
  postedTime: formatDateTime(req.createdAt) || 'Date not available',
  createdAt: req.createdAt,
  requiredByDate: req.requiredByDate,
  contactNumber: req.contactPhone || 'Not provided',
  patientCondition: req.patientCondition || req.additionalNotes || 'No details provided',
  showActions: true,
  priorityLevel: req.priorityLevel,
  requestStatus: req.status,
  facilityName: req.facilityName,
  facilityAddress: req.facilityAddress,
  additionalNotes: req.additionalNotes,
  assignedDonors: Array.isArray(req.assignedDonors) ? req.assignedDonors : [],
  unitsConfirmed: req.unitsConfirmed,
});

// Requests in these states are finished: no more edits, confirmations or broadcasts
export const CLOSED_REQUEST_STATUSES = ['FULFILLED', 'CANCELLED', 'EXPIRED'];

export const isClosedRequest = (request: BloodRequestType): boolean =>
  !!request.requestStatus && CLOSED_REQUEST_STATUSES.includes(request.requestStatus);
