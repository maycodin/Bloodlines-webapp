"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TriangleAlert, History, Users } from "lucide-react";
import DonorNavbar from "@/components/DonorNavbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SuccessModal from "@/components/SuccessModal";
import CompleteProfile from "@/components/CompleteProfile";
import DonorOverview from "@/components/DonorOverview";
import NearbyRequests from "@/components/NearbyRequests";
import InlineMessage, { Message } from "@/components/InlineMessage";
import AccountProfile from "@/components/profile/AccountProfile";
import AddRoleSection from "@/components/profile/AddRoleSection";
import { DashboardTheme } from "@/app/contexts/ThemeContext";
import { donor, UserProfile, BloodRequest, users, bloodRequests } from "@/lib/api";
import { Journey, loadJourneys, saveJourneys } from "@/lib/journey";
import DonationJourney from "@/components/donor/DonationJourney";
import GiveFeedbackModal from "@/components/donor/GiveFeedbackModal";
import MyAcceptedRequests from "@/components/donor/MyAcceptedRequests";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/app/contexts/AuthContext";

type Page = "home" | "resources" | "profile";

type DonationStatus = "Donated" | "Deferred";

type DonationRecord = {
  id: string;
  feedbackGiven: boolean;
  hospital: string;
  date: string;
  type: string;
  status: DonationStatus;
};

type ActivityRecord = {
  id: string;
  name: string;
  action: string;
  location: string;
  date: string;
};

type Achievement = {
  type: "lifesaver" | "responder" | "hero";
  title: string;
  description: string;
};

const HOW_IT_WORKS_STEPS = [
  "View full details & instructions",
  "Get directions to hospital",
  "Track your progress",
  "Complete & share feedback",
];

const donationStatusStyles: Record<DonationStatus, string> = {
  Donated: "bg-blue-700 text-white",
  Deferred: "bg-[#C91E1E] text-white",
};

const DonorDashboard = () => {
  const { user: authUser, refreshUser } = useAuth();
  const [activePage, setActivePage] = useState<Page>("home");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // API State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [nearbyRequests, setNearbyRequests] = useState<BloodRequest[]>([]);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  const [communityActivity, setCommunityActivity] = useState<ActivityRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<"Available" | "Busy">("Available");
  const [nextEligibility, setNextEligibility] = useState<string>("");
  const [completionDetails, setCompletionDetails] = useState<{
  completedFields: string[];
  remainingFields: string[];
}>({
  completedFields: [],
  remainingFields: []
});
  
  const [acceptMessage, setAcceptMessage] = useState<Message | null>(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const { showToast } = useToast();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [openJourneyId, setOpenJourneyId] = useState<string | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<{ requestId: string; hospital?: string } | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<string[]>([]);

  useEffect(() => {
    if (authUser?.id) setJourneys(loadJourneys(authUser.id));
  }, [authUser?.id]);

  const updateJourneys = useCallback(
    (update: (current: Journey[]) => Journey[]) =>
      setJourneys((current) => {
        const next = update(current);
        saveJourneys(authUser?.id, next);
        return next;
      }),
    [authUser?.id]
  );

  const updateJourney = (requestId: string, changes: Partial<Journey>) =>
    updateJourneys((current) => current.map((j) => (j.request.id === requestId ? { ...j, ...changes } : j)));

  useEffect(() => {
    const timer = setInterval(() => {
      const due = journeys.filter((j) => j.reminderAt && new Date(j.reminderAt).getTime() <= Date.now());
      if (due.length === 0) return;
      due.forEach((j) => showToast(`Reminder: you're donating at ${j.request.facilityName || j.request.hospitalName || "the hospital"}`, "info"));
      updateJourneys((current) => current.map((j) => (due.some((d) => d.request.id === j.request.id) ? { ...j, reminderAt: undefined } : j)));
    }, 30000);
    return () => clearInterval(timer);
  }, [journeys, showToast, updateJourneys]);
  
  // Loads everything on the Home tab. Pass { silent: true } to refresh without the loading spinner.
  const fetchDashboardData = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    
    try {
      // ✅ Single API call for all dashboard data
      const dashboardData = await donor.getDashboard().catch(() => null);
      
      if (!dashboardData) {
        setError("Failed to load dashboard data");
        setLoading(false);
        return;
      }
      
      
      // 1. Set profile data
      if (dashboardData.profileCompletion) {
        // Store completion details
        setCompletionDetails({
          completedFields: dashboardData.profileCompletion.completedFields || [],
          remainingFields: dashboardData.profileCompletion.remainingFields || []
        });
        
        // Use profile data from the dashboard response
        const profileData = {
          fullName: dashboardData.welcomeMessage?.replace('Welcome back, ', '').replace('! 👋', '') || 'Donor',
          email: '',
          phoneNumber: '',
          bloodGroup: dashboardData.donorStatus?.bloodGroup || '',
          role: 'donor' as const,
          profileCompletion: dashboardData.profileCompletion?.percentComplete || 0,
          lastDonationDate: dashboardData.donorStatus?.lastDonationDate || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: '',
          gender: 'Male' as 'Male' | 'Female',
          location: '',
        };
        setProfile(profileData);
        
        // Set next eligibility date
        if (dashboardData.donorStatus?.nextEligibleDate) {
          setNextEligibility(new Date(dashboardData.donorStatus.nextEligibleDate).toLocaleDateString());
        } else {
          setNextEligibility("Eligible now");
        }
        
        // Set availability
        if (dashboardData.donorStatus?.isAvailable !== undefined) {
          setAvailability(dashboardData.donorStatus.isAvailable ? "Available" : "Busy");
        }
      }
      
      // 1b. Fill in the real account details (email, phone, location, join date) from /users/me
      const me = await users.getMyProfile().catch(() => null);
      if (me) {
        setProfile((prev) => ({
          ...(prev || {}),
          ...me,
          // Keep dashboard-only values when /users/me doesn't have them
          bloodGroup: me.bloodGroup || prev?.bloodGroup || '',
          profileCompletion: prev?.profileCompletion ?? me.profileCompletion,
        }) as UserProfile);
      }
      
      // 2. Set impact data
      if (dashboardData.impact) {
        setDashboardSummary({
          totalDonations: dashboardData.impact.totalDonations || 0,
          livesImpacted: dashboardData.impact.livesImpacted || 0,
          emergenciesHandled: dashboardData.impact.emergenciesHandled || 0,
          newDonorsRecruited: dashboardData.impact.newDonorsRecruited || 0,
          badges: dashboardData.achievements?.earned || [],
          welcomeMessage: dashboardData.welcomeMessage || `Welcome back, Donor! 👋`,
        });
      }
      
      // 3. Set achievements
      if (dashboardData.achievements) {
        const earnedAchievements = dashboardData.achievements.earned || [];
        const mappedAchievements = earnedAchievements.map((badge: any) => ({
          type: badge.level <= 2 ? 'lifesaver' : badge.level <= 3 ? 'responder' : 'hero',
          title: badge.name || 'Achievement',
          description: badge.description || '',
        }));
        setAchievements(mappedAchievements);
      }
      
      // 4. Set nearby blood requests
      if (dashboardData.nearbyBloodRequests) {
        setNearbyRequests(dashboardData.nearbyBloodRequests);
      }
      
      // 5. Set donation history
      if (dashboardData.donationHistory) {
        const formattedHistory = dashboardData.donationHistory.map((item: any, index: number) => ({
          // Ids are MongoDB strings; fall back to the position so React keys stay unique
          id: String(item.id || item._id || `donation-${index}`),
          feedbackGiven: !!item.donorFeedback,
          hospital: item.hospitalName || item.facilityName || 'Hospital',
          date: new Date(item.donatedAt).toLocaleDateString(),
          type: item.bloodType || 'Blood',
          status: item.status === 'FULFILLED' ? 'Donated' : 'Deferred',
        }));
        setDonationHistory(formattedHistory);
      }
      
      // 6. Set community activity
      if (dashboardData.communityActivity) {
        const formattedActivity = dashboardData.communityActivity.map((item: any, index: number) => ({
          id: String(item.id || item._id || `activity-${index}`),
          name: item.actorName || 'Someone',
          action: item.message?.replace(item.actorName || '', '').trim() || 'made a donation',
          location: 'Your Community',
          date: new Date(item.timestamp).toLocaleDateString(),
        }));
        setCommunityActivity(formattedActivity);
      }
      
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
  if (!authUser) return;
  
  const userRole = authUser.role?.toLowerCase() || 'donor';
  
  // If user is not a donor, redirect to their correct dashboard
  if (userRole !== 'donor') {
    const redirectMap: Record<string, string> = {
      bridger: '/BridgerDashboard',
      'pulse-leader': '/PulseLeader',
      admin: '/admin/dashboard',
    };
    const redirectPath = redirectMap[userRole] || '/DonorDashboard';
    
    if (redirectPath !== '/DonorDashboard') {
      // Use window.location for a hard redirect to ensure clean state
      window.location.href = redirectPath;
      return;
    }
  }
}, [authUser]);

  const handleGoHome = () => {
    setShowSuccessModal(false);
    setActivePage("home");
  };

  const isConfirmed = (requestId: string) => donationHistory.some((record) => record.id === requestId && record.status === 'Donated');
  const hasFeedback = (requestId: string) =>
    feedbackSent.includes(requestId) || donationHistory.some((record) => record.id === requestId && record.feedbackGiven);
  const openJourney = journeys.find((j) => j.request.id === openJourneyId);

  const changeAvailability = async (next: "Available" | "Busy") => {
    try {
      await donor.setAvailability(next === "Available");
      setAvailability(next);
      showToast(next === "Available" ? "You're now available to donate" : "You're set as busy. You won't be matched for now.");
    } catch (err: any) {
      showToast(err?.message || "Could not update your availability.", "error");
    }
  };
  const donorName = profile?.fullName?.split(" ")[0] || "Donor";
  const donorBloodType = profile?.bloodGroup || "Not set";
  const nearbyRequestsCount = nearbyRequests.length;

  const renderPageContent = () => {
    switch (activePage) {
      case "home":
        if (loading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          );
        }
        
        if (error) {
          return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <TriangleAlert className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Dashboard</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          );
        }
        
        return (
          <>
            <div className="bg-[#1E7B3A] rounded-2xl p-5 md:p-8">
              <h2 className="text-xl md:text-2xl text-white font-bold">
                {dashboardSummary?.welcomeMessage || `Welcome back, ${donorName}! 👋`}
              </h2>
              <p className="text-white mt-3">
                {nearbyRequests.length} blood request
                {nearbyRequests.length !== 1 ? "s" : ""} near you need your help
              </p>
            </div>

            <MyAcceptedRequests
              journeys={journeys}
              isConfirmed={isConfirmed}
              onView={setOpenJourneyId}
              onRemove={(requestId) => updateJourneys((current) => current.filter((j) => j.request.id !== requestId))}
            />

            {(profile?.profileCompletion ?? 0) < 100 && (
              <CompleteProfile
                percentage={profile?.profileCompletion || 0}
                remainingFields={completionDetails.remainingFields}
                onUpdate={() => {
                  setOpenEditProfile(true);
                  setActivePage('profile');
                }}
              />
            )}
            
            <DonorOverview 
              totalDonations={dashboardSummary?.totalDonations || 0}
              livesSaved={dashboardSummary?.livesImpacted || 0}
              badgesEarned={dashboardSummary?.badges?.length || achievements.length}
              bloodType={profile?.bloodGroup || "Not set"}
              availability={availability}
              onAvailabilityChange={changeAvailability}
              nextEligibility={nextEligibility}
              achievements={achievements}
              donorName={donorName}
              emergenciesHandled={dashboardSummary?.emergenciesHandled || 0}
              newDonorsRecruited={dashboardSummary?.newDonorsRecruited || 0}
            />
            
            
            <InlineMessage message={acceptMessage} onClose={() => setAcceptMessage(null)} className="mt-8" />

            <NearbyRequests 
              requests={nearbyRequests} 
              loading={loading}
              onAccept={async (request) => {
                try {
                  await bloodRequests.accept(request.id);
                  setNearbyRequests((prev) => prev.filter((req) => req.id !== request.id));
                  updateJourneys((current) => [
                    { request, acceptedAt: new Date().toISOString() },
                    ...current.filter((j) => j.request.id !== request.id),
                  ]);
                  setOpenJourneyId(request.id);
                } catch (error: any) {
                  setAcceptMessage({ type: 'error', text: error?.message || 'Failed to accept request. Please try again.' });
                }
              }}
            />

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6] mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-700 p-2 rounded-full">
                    <TriangleAlert className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-medium text-gray-800">What happens when you accept?</p>
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
                  <h2 className="font-semibold text-gray-800">Donation History</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {donationHistory.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No donation history yet</p>
                  ) : (
                    donationHistory.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{record.hospital}</p>
                          <p className="text-xs text-gray-500">{record.date} · {record.type}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs px-4 py-1 rounded-md ${donationStatusStyles[record.status]}`}>
                            {record.status}
                          </span>
                          {record.status === 'Donated' &&
                            (record.feedbackGiven || feedbackSent.includes(record.id) ? (
                              <span className="text-xs text-gray-500">Feedback sent</span>
                            ) : (
                              <button
                                onClick={() => setFeedbackFor({ requestId: record.id, hospital: record.hospital })}
                                className="text-xs font-medium text-[#C91E1E] hover:underline"
                              >
                                Give feedback
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-[#D8D6D6]">
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-4 h-4 text-[#C91E1E]" />
                  <h2 className="font-semibold text-gray-800">Community Activity</h2>
                </div>
                <div className="flex flex-col gap-4 text-sm text-gray-700">
                  {communityActivity.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No recent activity</p>
                  ) : (
                    communityActivity.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <span className="w-2 h-2 mt-2 rounded-full bg-[#C91E1E] shrink-0" />
                        <p>
                          <span className="font-medium">{item.name}</span> {item.action}
                          <br />
                          <span className="text-xs text-gray-500">{item.location} · {item.date}</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case "resources":
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Resources</h1>
              <p className="text-gray-600">Resources will be displayed here.</p>
            </div>
          </div>
        );

      case "profile":
        return (
          <AccountProfile
            startEditing={openEditProfile}
            onEditingChange={(editing) => !editing && setOpenEditProfile(false)}
            onProfileChanged={() => fetchDashboardData({ silent: true })}
          >
            <AddRoleSection />
          </AccountProfile>
        );

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
        onPageChange={(page) => {
          setOpenEditProfile(false);
          setActivePage(page as Page);
        }}
        activePage={activePage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-10">{renderPageContent()}</main>

      {openJourney && (
        <DonationJourney
          journey={openJourney}
          donationConfirmed={isConfirmed(openJourney.request.id)}
          feedbackGiven={hasFeedback(openJourney.request.id)}
          onUpdate={(changes) => updateJourney(openJourney.request.id, changes)}
          onArrived={async () => {
            await bloodRequests.arrivalAlert(openJourney.request.id);
          }}
          onGiveFeedback={() =>
            setFeedbackFor({ requestId: openJourney.request.id, hospital: openJourney.request.facilityName || openJourney.request.hospitalName })
          }
          onClose={() => setOpenJourneyId(null)}
        />
      )}
      {feedbackFor && (
        <GiveFeedbackModal
          requestId={feedbackFor.requestId}
          hospitalName={feedbackFor.hospital}
          onClose={() => setFeedbackFor(null)}
          onSubmitted={() => {
            setFeedbackSent((sent) => [...sent, feedbackFor.requestId]);
            setFeedbackFor(null);
          }}
        />
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onGoHome={handleGoHome}
      />
    </>
  );
};

// Wrap the component with ProtectedRoute for role-based access
export default function DonorDashboardPage() {
  return (
    <DashboardTheme>
      <ProtectedRoute allowedRoles={['donor', 'bridger', 'pulse-leader', 'admin']}>
        <DonorDashboard />
      </ProtectedRoute>
    </DashboardTheme>
    
  );
}