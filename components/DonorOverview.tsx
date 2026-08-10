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

// Props interface for API integration
interface DonorOverviewProps {
  totalDonations?: number;
  livesSaved?: number;
  badgesEarned?: number;
  bloodType?: string;
  availability?: Availability;
  nextEligibility?: string;
  achievements?: Achievement[];
  donorName?: string;
}

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

// Get level title
const getLevelTitle = (level: number): string => {
  const titles: Record<number, string> = {
    1: "Bronze Donor",
    2: "Silver Donor", 
    3: "Gold Donor",
    4: "Platinum Donor",
    5: "Diamond Donor"
  };
  return titles[level] || "Bronze Donor";
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
  Busy: "bg-[#FBB13D] text-white",
};

// Default achievements (fallback if none from API)
const defaultAchievements: Achievement[] = [
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

const DonorOverview: React.FC<DonorOverviewProps> = ({ 
  totalDonations = 0,
  livesSaved: livesSavedProp,
  badgesEarned = 0,
  bloodType = "Not set",
  availability = "Available",
  nextEligibility = "Not scheduled",
  achievements: achievementsProp,
  donorName = "Donor"
}) => {
  const level = getLevelFromDonations(totalDonations);
  const levelTitle = getLevelTitle(level);
  const livesSaved = livesSavedProp !== undefined ? livesSavedProp : getLivesSaved(totalDonations);
  const achievements = achievementsProp || defaultAchievements;

  return (
    <div className="flex justify-center gap-4 mt-6 flex-wrap">
      {/* Donor Status Card */}
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
                availabilityStyles[availability]
              }`}
            >
              {availability}
            </span>
          </div>

          <div className="flex justify-between">
            <p className="text-gray-600">Blood Type</p>
            <span className="border border-[#C91E1E] text-[#C91E1E] px-2 py-1 rounded-md text-sm font-medium">
              {bloodType}
            </span>
          </div>

          <div className="flex justify-between">
            <p className="text-gray-600">Next Eligibility</p>
            <span className="text-sm">{nextEligibility}</span>
          </div>
        </div>
      </div>

      {/* Impact Card */}
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-md border border-[#D8D6D6]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C91E1E]" />
            <p className="font-medium">Impact</p>
          </div>

          <div className="flex flex-col items-end">
            <span className="bg-green-100 text-[#1C7C3A] text-sm px-3 py-1 rounded-md">
              Level {level}
            </span>
            <span className="text-xs text-gray-500 mt-1">{levelTitle}</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-4">
          <Image
            src={`/badges/level-${level}.png`}
            alt={`Level ${level} badge`}
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
            onError={(e) => {
              // Fallback to default badge if level-specific badge doesn't exist
              (e.target as HTMLImageElement).src = "/Impact Badge.png";
            }}
          />
          <p className="text-sm text-gray-500 mt-2">
            Way to go {donorName}! 🎉
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 border rounded-md p-3 text-center">
            <p className="text-sm text-gray-500">Total Donations</p>
            <p className="text-lg font-semibold text-[#C91E1E]">
              {totalDonations}
            </p>
          </div>

          <div className="flex-1 border rounded-md p-3 text-center">
            <p className="text-sm text-gray-500">Lives Potentially Saved</p>
            <p className="text-lg font-semibold text-[#1C7C3A]">
              {livesSaved}
            </p>
          </div>
        </div>

        {/* Badge progress - next level indicator */}
        {level < 5 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Next Level</span>
              <span>{getLevelTitle(level + 1)}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1C7C3A] rounded-full transition-all duration-300"
                style={{ 
                  width: `${((totalDonations - getDonationsForLevel(level)) / 
                    (getDonationsForLevel(level + 1) - getDonationsForLevel(level))) * 100}% 
                `}}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getDonationsForLevel(level + 1) - totalDonations} more donations to reach {getLevelTitle(level + 1)}
            </p>
          </div>
        )}
      </div>

      {/* Achievements Card */}
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-md border border-[#D8D6D6]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <p className="font-medium">Achievements</p>
          </div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            {badgesEarned} earned
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {achievements.length > 0 ? (
            achievements.slice(0, 4).map((item, index) => (
              <div key={index} className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                {achievementIcons[item.type] || <Medal className="w-4 h-4 text-gray-400 mt-1" />}
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No achievements yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Complete donations to earn badges!
              </p>
            </div>
          )}
        </div>

        {/* Call to action for more achievements */}
        {badgesEarned < 5 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              🎯 {5 - badgesEarned} more achievements to unlock next tier
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get donation thresholds for each level
const getDonationsForLevel = (level: number): number => {
  switch (level) {
    case 1: return 0;
    case 2: return 4;
    case 3: return 7;
    case 4: return 11;
    case 5: return 16;
    default: return 0;
  }
};

export default DonorOverview;