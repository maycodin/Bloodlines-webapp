import { ChevronRight } from "lucide-react";

type CompleteProfileProps = {
  percentage: number;
  remainingFields?: string[];
  onUpdate: () => void;
};

const FIELD_HINTS: Record<string, string> = {
  fullName: "your name",
  phoneNumber: "your phone number",
  bloodGroup: "your blood group",
  genotype: "your genotype",
  gender: "your gender",
  location: "your area",
  geoLocation: "verify your location",
  address: "your street address",
  city: "your city",
  state: "your state",
  country: "your country",
  lastDonationDate: "your last donation date",
  isAvailable: "your availability",
  emergencyContact: "an emergency contact",
  emergencyContactPhone: "an emergency contact",
};

const joinWithAnd = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const buildHint = (remainingFields: string[]) => {
  const hints = Array.from(new Set(remainingFields.map((field) => FIELD_HINTS[field] || field.replace(/([A-Z])/g, " $1").toLowerCase())));
  if (hints.length === 0) return "Finish your profile to help us match you with nearby requests.";
  const verify = hints.filter((h) => h.startsWith("verify"));
  const add = hints.filter((h) => !h.startsWith("verify")).slice(0, 2);
  const parts = [add.length ? `add ${joinWithAnd(add)}` : "", ...verify].filter(Boolean);
  const sentence = joinWithAnd(parts);
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)} to help us match you with nearby requests.`;
};

const CompleteProfile = ({ percentage, remainingFields = [], onUpdate }: CompleteProfileProps) => (
  <button
    type="button"
    onClick={onUpdate}
    className="w-full mt-6 text-left bg-white border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-colors flex items-center gap-4"
  >
    <span className="flex-1 min-w-0">
      <span className="flex items-center justify-between gap-3">
        <span className="font-semibold text-gray-900">Complete your profile</span>
        <span className="text-sm font-semibold text-[#1E7B3A]">{percentage}%</span>
      </span>
      <span className="block h-2 rounded-full bg-gray-200 mt-3 overflow-hidden">
        <span className="block h-full rounded-full bg-[#1E7B3A] dark:bg-[#34C759]" style={{ width: `${percentage}%` }} />
      </span>
      <span className="block text-sm text-gray-600 mt-3">{buildHint(remainingFields)}</span>
    </span>
    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
  </button>
);

export default CompleteProfile;
