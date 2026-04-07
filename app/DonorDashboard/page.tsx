"use client";

import React, { useState } from "react";
import { TriangleAlert, History, Users } from "lucide-react";
import DonorNavbar from "@/components/DonorNavbar";
import SuccessModal from "@/components/SuccessModal";
import CompleteProfile from "@/components/CompleteProfile";
import DonorOverview from "@/components/DonorOverview";
import NearbyRequests from "@/components/NearbyRequests";
import ProfilePage from "@/components/ProfilePage";


type Page = "home" | "resources" | "profile";

type DonationStatus = "Donated" | "Deferred";

type DonationRecord = {
  id: number;
  hospital: string;
  date: string;
  type: string;
  status: DonationStatus;
};

type ActivityRecord = {
  id: number;
  name: string;
  action: string;
  location: string;
  date: string;
};

// Page-level data

const DONOR_NAME = "Abdul";
const NEARBY_REQUEST_COUNT = 4 as number;
const PROFILE_COMPLETION = 85;

const HOW_IT_WORKS_STEPS = [
  "View full details & instructions",
  "Get directions to hospital",
  "Track your progress",
  "Complete & share feedback",
];

const DONATION_HISTORY: DonationRecord[] = [
  {
    id: 1,
    hospital: "City General Hospital",
    date: "12/11/2024",
    type: "Emergency",
    status: "Donated",
  },
  {
    id: 2,
    hospital: "City General Hospital",
    date: "12/11/2024",
    type: "Emergency",
    status: "Donated",
  },
  {
    id: 3,
    hospital: "City General Hospital",
    date: "12/11/2024",
    type: "Emergency",
    status: "Deferred",
  },
];

const COMMUNITY_ACTIVITY: ActivityRecord[] = [
  {
    id: 1,
    name: "John A.",
    action: "donated O+ blood at City General Hospital",
    location: "Lagos State",
    date: "12/15/2024",
  },
  {
    id: 2,
    name: "Sarah M.",
    action: "earned the Bronze Lifesaver badge",
    location: "Brooklyn, NY",
    date: "12/15/2024",
  },
  {
    id: 3,
    name: "Mike R.",
    action: "joined the BloodLines community",
    location: "Queens, NY",
    date: "12/15/2024",
  },
];

const donationStatusStyles: Record<DonationStatus, string> = {
  Donated: "bg-blue-700 text-white",
  Deferred: "bg-[#C91E1E] text-white",
};

const DonorDashboard = () => {
  const [activePage, setActivePage] = useState<Page>("home");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleGoHome = () => {
    setShowSuccessModal(false);
    setActivePage("home");
  };

  const renderPageContent = () => {
    switch (activePage) {
      case "home":
        return (
          <>
            <div className="bg-[#398C53] border border-[#D8D6D6] h-32 rounded-xl p-3 md:p-8">
              <h2 className="text-xl md:text-2xl text-white font-bold">
                Welcome back, {DONOR_NAME}! 👋
              </h2>
              <p className="text-white mt-3">
                {NEARBY_REQUEST_COUNT} blood request
                {NEARBY_REQUEST_COUNT !== 1 ? "s" : ""} near you need your help
              </p>
            </div>

            <CompleteProfile percentage={PROFILE_COMPLETION} />
            <DonorOverview />
            <NearbyRequests />

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6] mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-700 p-2 rounded-full">
                    <TriangleAlert className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-medium text-gray-800">
                    What happens when you accept?
                  </p>
                </div>

                <button className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-2 rounded-md transition w-fit">
                  How it works
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between md:p-4 gap-4">
                {HOW_IT_WORKS_STEPS.map((label, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-300 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6]">
                <div className="flex items-center gap-2 mb-5">
                  <History className="w-4 h-4 text-[#C91E1E]" />
                  <h2 className="font-semibold text-gray-800">
                    Donation History
                  </h2>
                </div>

                <div className="flex flex-col gap-3">
                  {DONATION_HISTORY.map((record) => (
                    <div
                      key={record.id}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {record.hospital}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.date} · {record.type}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-4 py-1 rounded-md ${
                          donationStatusStyles[record.status]
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6]">
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-4 h-4 text-[#C91E1E]" />
                  <h2 className="font-semibold text-gray-800">
                    Community Activity
                  </h2>
                </div>

                <div className="flex flex-col gap-4 text-sm text-gray-700">
                  {COMMUNITY_ACTIVITY.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <span className="w-2 h-2 mt-2 rounded-full bg-[#C91E1E] shrink-0" />
                      <p>
                        <span className="font-medium">{item.name}</span>{" "}
                        {item.action}
                        <br />
                        <span className="text-xs text-gray-500">
                          {item.location} · {item.date}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "resources":
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Resources
              </h1>
              <p className="text-gray-600">Resources will be displayed here.</p>
            </div>
          </div>
        );

      case "profile":
        return <ProfilePage />;
 
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The requested page could not be found.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <DonorNavbar
        onPageChange={(page) => setActivePage(page as Page)}
        activePage={activePage}
      />

      <div className="m-8">{renderPageContent()}</div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onGoHome={handleGoHome}
      />
    </>
  );
};

export default DonorDashboard;
