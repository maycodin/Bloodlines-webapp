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
  facilityCoordinates: Array.isArray(req.facilityLocation?.coordinates) ? req.facilityLocation.coordinates : undefined,
});

// Requests in these states are finished: no more edits, confirmations or broadcasts
export const CLOSED_REQUEST_STATUSES = ['FULFILLED', 'CANCELLED', 'EXPIRED'];

export const isClosedRequest = (request: BloodRequestType): boolean =>
  !!request.requestStatus && CLOSED_REQUEST_STATUSES.includes(request.requestStatus);

// Find map coordinates [longitude, latitude] for a facility address using OpenStreetMap's
// free geocoder (Nominatim). Tries the full address, then the address with the facility name.
// Returns null if nothing is found or the service can't be reached.
export const geocodeAddress = async (address: string, facilityName?: string): Promise<[number, number] | null> => {
  const queries = [address, facilityName ? `${facilityName}, ${address}` : ''].filter(Boolean);
  for (const query of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ng&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) continue;
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        const lon = parseFloat(results[0].lon);
        const lat = parseFloat(results[0].lat);
        if (!isNaN(lon) && !isNaN(lat)) return [lon, lat];
      }
    } catch {
      // Network or service error: try the next query, then give up
    }
  }
  return null;
};
