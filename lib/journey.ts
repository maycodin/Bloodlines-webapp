import type { BloodRequest } from '@/lib/api';

// The backend has no list of the requests a donor has accepted yet, so the donor's journey
// (accepted, on the way, arrived) is kept in this browser until the donation is confirmed.
export type Journey = {
  request: BloodRequest;
  acceptedAt: string;
  onTheWay?: boolean;
  arrived?: boolean;
  reminderAt?: string;
};

const storageKey = (userId?: string) => `bloodlines-journeys-${userId || 'me'}`;

export const loadJourneys = (userId?: string): Journey[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const saveJourneys = (userId: string | undefined, journeys: Journey[]) => {
  localStorage.setItem(storageKey(userId), JSON.stringify(journeys));
};

export const mapsUrl = (request: BloodRequest) => {
  const place = [request.facilityName || request.hospitalName, request.facilityAddress || request.address].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
};

// The API doesn't say whether "distance" is in km or metres; anything over 500 is taken as metres
export const distanceKm = (distance?: number) =>
  typeof distance === 'number' && distance > 0 ? (distance > 500 ? distance / 1000 : distance) : undefined;

// Rough city driving speed, for an estimate only
const AVERAGE_SPEED_KMH = 25;

export const estimatedTravelMinutes = (distanceKm?: number) =>
  typeof distanceKm === 'number' && distanceKm > 0 ? Math.max(5, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60)) : null;
