import React from "react";
import { Droplets, Heart, Trophy, Medal, Zap, Users } from "lucide-react";
import Image from "next/image";

type Availability = "Available" | "Busy";

type AchievementType = "lifesaver" | "responder" | "hero";

type Achievement = {
  type: AchievementType;
  title: string;
  description: string;
};

type DonorData = {
  availability: Availability;
  bloodType: string;
  nextEligibility: string;
};

type ImpactData = {
  totalDonations: number;
};

/* Each blood donation can help up to 3 people. Multiply total donations accordingly. */
const getLivesSaved = (totalDonations: number): number => totalDonations * 3;

/**
 * Donor level tiers based on total donations:
 *   Level 1 → 1–3 donations
 *   Level 2 → 4–6 donations
 *   Level 3 → 7–10 donations
 *   Level 4 → 11–15 donations
 *   Level 5 → 16+ donations
 */
const getLevelFromDonations = (totalDonations: number): number => {
  if (totalDonations >= 16) return 5;
  if (totalDonations >= 11) return 4;
  if (totalDonations >= 7) return 3;
  if (totalDonations >= 4) return 2;
  return 1;
};

// Achievement icon map

const achievementIcons: Record<AchievementType, React.ReactNode> = {
  lifesaver: <Medal className="w-4 h-4 text-yellow-500 mt-1" />,
  responder: <Zap className="w-4 h-4 text-orange-400 mt-1" />,
  hero: <Users className="w-4 h-4 text-blue-500 mt-1" />,
};

// Availability badge styles

const availabilityStyles: Record<Availability, string> = {
  Available: "bg-[#1C7C3A] text-white",
  Busy: "bg-[#FBB13D]",
};

// Mock data

const donorData: DonorData = {
  availability: "Available",
  bloodType: "B+",
  nextEligibility: "Sep 10, 2025",
};

const impactData: ImpactData = {
  totalDonations: 8,
};

const achievements: Achievement[] = [
  {
    type: "lifesaver",
    title: "Bronze Lifesaver",
    description: "5 donations completed",
  },
  {
    type: "responder",
    title: "Quick Responder",
    description: "Average response time under 10 minutes",
  },
  {
    type: "hero",
    title: "Community Hero",
    description: "Helped during emergency shortage",
  },
];

const DonorOverview = () => {
  const level = getLevelFromDonations(impactData.totalDonations);
  const livesSaved = getLivesSaved(impactData.totalDonations);

  return (
    <div className="flex justify-center gap-4 mt-6 flex-wrap">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-md border border-[#D8D6D6]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-4 h-4 text-[#C91E1E]" />
            <p className="font-medium">Donor Status</p>
          </div>

          <div className="flex justify-between">
            <p className="text-gray-600">Availability</p>
            <span
              className={`text-sm px-3 py-1 rounded-md ${
                availabilityStyles[donorData.availability]
              }`}
            >
              {donorData.availability}
            </span>
          </div>

          <div className="flex justify-between">
            <p className="text-gray-600">Blood Type</p>
            <span className="border border-[#C91E1E] text-[#C91E1E] px-2 py-1 rounded-md text-sm">
              {donorData.bloodType}
            </span>
          </div>

          <div className="flex justify-between">
            <p className="text-gray-600">Next Eligibility</p>
            <span>{donorData.nextEligibility}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-md border border-[#D8D6D6]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C91E1E]" />
            <p className="font-medium">Impact</p>
          </div>

          <span className="bg-green-100 text-[#1C7C3A] text-sm px-3 py-1 rounded-md">
            Level {level}
          </span>
        </div>

        <div className="flex flex-col items-center text-center mb-4">
          <Image
            src="/Impact Badge.png"
            alt="Impact badge"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
          <p className="text-sm text-gray-500 mt-2">Way to go life saver!</p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 border rounded-md p-3 text-center">
            <p className="text-sm text-gray-500">Total Donations</p>
            <p className="text-lg font-semibold text-[#C91E1E]">
              {impactData.totalDonations}
            </p>
          </div>

          <div className="flex-1 border rounded-md p-3 text-center">
            <p className="text-sm text-gray-500">Lives Potentially Saved</p>
            <p className="text-lg font-semibold text-[#1C7C3A]">
              {livesSaved}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-md border border-[#D8D6D6]">
        <div className="flex items-center gap-2 mb-10">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <p className="font-medium">Achievements</p>
        </div>

        <div className="flex flex-col gap-4">
          {achievements.map((item) => (
            <div key={item.type} className="flex gap-3">
              {achievementIcons[item.type]}
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonorOverview;
