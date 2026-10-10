import React from "react";
import { CheckCircle, AlertCircle, UserPlus, MapPin, Phone, Droplets } from "lucide-react";

type CompleteProfileProps = {
  percentage: number;
  completedFields?: string[];
  remainingFields?: string[];
  onUpdate?: () => void;
};

const CompleteProfile = ({ 
  percentage, 
  completedFields = [], 
  remainingFields = [],
  onUpdate 
}: CompleteProfileProps) => {
  // Map field names to display names and icons
  const fieldMap: Record<string, { label: string; icon: React.ReactNode }> = {
    fullName: { label: "Full Name", icon: <UserPlus className="w-4 h-4" /> },
    email: { label: "Email Address", icon: <UserPlus className="w-4 h-4" /> },
    phoneNumber: { label: "Phone Number", icon: <Phone className="w-4 h-4" /> },
    bloodGroup: { label: "Blood Group", icon: <Droplets className="w-4 h-4" /> },
    genotype: { label: "Genotype", icon: <Droplets className="w-4 h-4" /> },
    gender: { label: "Gender", icon: <UserPlus className="w-4 h-4" /> },
    // "location" is the area typed in; "geoLocation" is the map position from "Use my current location"
    location: { label: "Location (area)", icon: <MapPin className="w-4 h-4" /> },
    geoLocation: { label: "Map Location", icon: <MapPin className="w-4 h-4" /> },
    address: { label: "Street Address", icon: <MapPin className="w-4 h-4" /> },
    city: { label: "City", icon: <MapPin className="w-4 h-4" /> },
    state: { label: "State", icon: <MapPin className="w-4 h-4" /> },
    country: { label: "Country", icon: <MapPin className="w-4 h-4" /> },
    lastDonationDate: { label: "Last Donation Date", icon: <Droplets className="w-4 h-4" /> },
    isAvailable: { label: "Availability", icon: <CheckCircle className="w-4 h-4" /> },
    emergencyContact: { label: "Emergency Contact Name", icon: <Phone className="w-4 h-4" /> },
    emergencyContactPhone: { label: "Emergency Contact Phone", icon: <Phone className="w-4 h-4" /> },
  };

  const getFieldDisplay = (field: string) => {
    if (fieldMap[field]) return fieldMap[field].label;
    // Fallback: turn camelCase into words, e.g. "bloodBank" -> "Blood bank"
    const words = field.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  const getFieldIcon = (field: string) => {
    return fieldMap[field]?.icon || <CheckCircle className="w-4 h-4" />;
  };

  const isComplete = percentage === 100;

  return (
    <div className="w-full border border-gray-200 bg-gray-50 rounded-sm mt-4 p-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-900">
          {isComplete ? "✅ Profile Complete!" : "Complete Your Profile"}
        </h3>

        <span className={`text-base font-semibold ${
          isComplete ? "text-[#1C7C3A]" : "text-gray-700"
        }`}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-300 rounded-sm overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isComplete ? "bg-[#1C7C3A]" : "bg-[#1C7C3A]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Completion Status */}
      <div className="mt-3 flex items-center gap-2">
        {isComplete ? (
          <>
            <CheckCircle className="w-5 h-5 text-[#1C7C3A]" />
            <p className="text-sm text-[#1C7C3A] font-medium">
              Your profile is fully complete!
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-gray-600">
              Complete your profile to get better donor matches
            </p>
          </>
        )}
      </div>

      {/* Completed and Remaining Fields */}
      {(completedFields.length > 0 || remainingFields.length > 0) && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Completed Fields */}
          {completedFields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#1C7C3A] mb-2">
                ✅ Completed ({completedFields.length})
              </p>
              <ul className="space-y-1">
                {completedFields.map((field) => (
                  <li key={field} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-3 h-3 text-[#1C7C3A] shrink-0" />
                    <span>{getFieldDisplay(field)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Remaining Fields */}
          {remainingFields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-yellow-600 mb-2">
                ⚠️ Remaining ({remainingFields.length})
              </p>
              <ul className="space-y-1">
                {remainingFields.map((field) => (
                  <li key={field} className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-3 h-3 text-yellow-500 shrink-0" />
                    <span>{getFieldDisplay(field)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {!isComplete && onUpdate && (
        <button
          onClick={onUpdate}
          className="mt-4 px-4 py-2 bg-[#C91E1E] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Update Profile
        </button>
      )}

      {/* Help Text */}
      {!isComplete && (
        <p className="text-sm text-gray-500 mt-3">
          {remainingFields.length > 0 
            ? `Add your ${remainingFields.map((field) => getFieldDisplay(field).toLowerCase()).join(', ')} to reach 100%`
            : "Add your emergency contact and verify your location to help us match you with nearby requests."}
        </p>
      )}
    </div>
  );
};

export default CompleteProfile;