"use client";

import React, { useState, useEffect } from "react";
import { TriangleAlert, History, Users, Loader2 } from "lucide-react";
import DonorNavbar from "@/components/DonorNavbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SuccessModal from "@/components/SuccessModal";
import CompleteProfile from "@/components/CompleteProfile";
import DonorOverview from "@/components/DonorOverview";
import NearbyRequests from "@/components/NearbyRequests";
import InlineMessage, { Message } from "@/components/InlineMessage";
import RoleUpgradeForm from "@/components/RoleUpgradeForm";
import DonorProfileForm from "@/components/DonorProfileForm";
import { donor, UserProfile, BloodRequest, users, bloodRequests, roleUpgrades } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

type Page = "home" | "resources" | "profile";

type DonationStatus = "Donated" | "Deferred";

type DonationRecord = {
  id: string;
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
  
  // Role upgrade history
  const [upgradeHistory, setUpgradeHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchUpgradeHistory = async () => {
  setIsLoadingHistory(true);
  try {
    const history: any = await roleUpgrades.getMyHistory();
    // The backend returns a plain list; also accept a { data: [...] } wrapper
    setUpgradeHistory(Array.isArray(history) ? history : history?.data || []);
  } catch (error) {
    console.error('Failed to fetch upgrade history:', error);
  } finally {
    setIsLoadingHistory(false);
  }
};

 
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
    if (activePage === 'profile') {
      fetchUpgradeHistory();
    }
  }, [activePage]);

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

  const profileCompletion = profile?.profileCompletion || 85;
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
            <div className="bg-[#398C53] border border-[#D8D6D6] h-32 rounded-xl p-3 md:p-8">
              <h2 className="text-xl md:text-2xl text-white font-bold">
                {dashboardSummary?.welcomeMessage || `Welcome back, ${donorName}! 👋`}
              </h2>
              <p className="text-white mt-3">
                {nearbyRequests.length} blood request
                {nearbyRequests.length !== 1 ? "s" : ""} near you need your help
              </p>
            </div>

          <CompleteProfile 
  percentage={profile?.profileCompletion || 0}
  completedFields={completionDetails.completedFields}
  remainingFields={completionDetails.remainingFields}
  onUpdate={() => setActivePage('profile')}
/>
            
            <DonorOverview 
              totalDonations={dashboardSummary?.totalDonations || 0}
              livesSaved={dashboardSummary?.livesImpacted || 0}
              badgesEarned={dashboardSummary?.badges?.length || achievements.length}
              bloodType={profile?.bloodGroup || "Not set"}
              availability={availability}
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
              onAccept={async (requestId) => {
                try {
                  // Call the accept endpoint
                  // Throws if the backend rejects it, so reaching the next line means it worked
                  await bloodRequests.accept(requestId);
                  setNearbyRequests(prev => prev.filter(req => req.id !== requestId));
                  setAcceptMessage({ type: 'success', text: 'Request accepted successfully! The hospital will be notified.' });
                  return true;
                } catch (error: any) {
                  console.error('Failed to accept request:', error);
                  setAcceptMessage({ type: 'error', text: error?.message || 'Failed to accept request. Please try again.' });
                  return false;
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
                        <span className={`text-xs px-4 py-1 rounded-md ${donationStatusStyles[record.status]}`}>
                          {record.status}
                        </span>
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
    <div className="mx-auto max-w-2xl">
      {/* Profile Information Section */}
      <DonorProfileForm onSaved={() => fetchDashboardData({ silent: true })} />

      {/* Role Upgrade Request Section */}
      <RoleUpgradeForm onSubmitted={fetchUpgradeHistory} />

      {/* Upgrade History Section */}
      <div className="mt-6 bg-white rounded-lg border border-[#D8D6D6] p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upgrade Request History</h3>
        
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          </div>
        ) : upgradeHistory.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No upgrade requests yet. Submit your first request above.
          </p>
        ) : (
          <div className="space-y-3">
            {upgradeHistory.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">
                    {request.requestedRole === 'PULSE_LEADER' ? 'Pulse Leader' : 
                    request.requestedRole === 'BRIDGER' ? 'Bridger' : 
                    request.requestedRole === 'ADMIN' ? 'Admin' : request.requestedRole}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  {request.reason && (
                    <p className="text-xs text-gray-600 mt-1 truncate max-w-xs">
                      {request.reason.length > 60 ? request.reason.substring(0, 60) + '...' : request.reason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {request.status || 'PENDING'}
                  </span>
                  {request.approvedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {request.status === 'APPROVED' ? 'Approved: ' : 'Rejected: '}
                      {new Date(request.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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

// Wrap the component with ProtectedRoute for role-based access
export default function DonorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['donor', 'bridger', 'pulse-leader', 'admin']}>
      <DonorDashboard />
    </ProtectedRoute>
    
  );
}