import React from "react";

type CompleteProfileProps = {
  percentage: number;
};

const CompleteProfile = ({ percentage }: CompleteProfileProps) => {
  return (
    <div className="w-full border border-gray-200 bg-gray-50 rounded-sm mt-4 p-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-900">
          Complete Your Profile
        </h3>

        <span className="text-base text-gray-700">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-300 rounded-sm overflow-hidden">
        <div
          className="h-full bg-[#1C7C3A] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-base text-gray-600 mt-2">
        Add your emergency contact and verify your location to help us match you
        with nearby requests.
      </p>
    </div>
  );
};

export default CompleteProfile;
