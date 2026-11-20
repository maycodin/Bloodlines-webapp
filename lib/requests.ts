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

// Address versions to look up, from most to least precise. Street numbers and some street names
// aren't on the map for many Nigerian addresses, so later tries drop the first part of the
// address until only the area and city are left (close enough to match nearby donors), and
// finally try the city or town on its own.
// "12 Admiralty Way, Lekki Phase 1, Lagos" -> "Admiralty Way, Lekki Phase 1, Lagos" -> "Lekki Phase 1, Lagos"
export const addressSearchQueries = (address: string, facilityName?: string): string[] => {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  const queries: string[] = [];
  const add = (query: string) => {
    const clean = query.trim();
    if (clean && !queries.includes(clean)) queries.push(clean);
  };
  add(parts.join(', '));
  if (parts.length > 0) add([parts[0].replace(/^(no\.?\s*)?\d+[a-z]?\s*,?\s*/i, ''), ...parts.slice(1)].join(', '));
  for (let i = 1; parts.length - i >= 2; i++) add(parts.slice(i).join(', '));
  if (facilityName && parts.length > 0) add(`${facilityName}, ${parts[parts.length - 1]}`);
  // Last resort: the city or town alone
  if (parts.length > 1) add(parts[parts.length - 1]);
  return queries.slice(0, 5);
};

// Find map coordinates [longitude, latitude] for a facility address using OpenStreetMap's
// free geocoder (Nominatim), trying the versions above one at a time (its limit is one
// lookup per second). Returns null if nothing is found or the service can't be reached.
export const geocodeAddress = async (address: string, facilityName?: string): Promise<[number, number] | null> => {
  const queries = addressSearchQueries(address, facilityName);
  for (let i = 0; i < queries.length; i++) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ng&q=${encodeURIComponent(queries[i])}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) continue;
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        const lon = parseFloat(results[0].lon);
        const lat = parseFloat(results[0].lat);
        if (!isNaN(lon) && !isNaN(lat)) return [lon, lat];
      }
    } catch {
      // Network or service error: try the next version
    }
  }
  return null;
};
