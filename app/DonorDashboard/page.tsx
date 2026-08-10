"use client";

import React, { useState, useEffect } from "react";
import { TriangleAlert, History, Users, CircleArrowUp, Mail, Phone, MapPin, Droplets, Calendar, Loader2, Edit2, Save, X } from "lucide-react";
import DonorNavbar from "@/components/DonorNavbar";
import { ProtectedRoute } from "@/components/ ProtectedRoute";
import SuccessModal from "@/components/SuccessModal";
import CompleteProfile from "@/components/CompleteProfile";
import DonorOverview from "@/components/DonorOverview";
import NearbyRequests from "@/components/NearbyRequests";
import { donor, UserProfile, BloodRequest, users } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

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
  const { user: authUser, requestRoleUpgrade, refreshUser } = useAuth();
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
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    bloodGroup: "",
    location: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Role upgrade state
  const [selectedRole, setSelectedRole] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch profile and dashboard summary in parallel
        const [profileData, summaryData, nearbyData] = await Promise.all([
          donor.getProfile().catch(() => null),
          donor.getDashboardSummary().catch(() => null),
          donor.getNearbyRequests({ radius: 10 }).catch(() => ({ data: [] })),
        ]);
        
        if (profileData) {
          setProfile(profileData);
          setEditForm({
            fullName: profileData.fullName || "",
            phoneNumber: profileData.phoneNumber || "",
            bloodGroup: profileData.bloodGroup || "",
            location: profileData.location || "",
          });
          
          // Calculate next eligibility date (3 months from last donation)
          if (profileData.lastDonationDate) {
            const lastDonation = new Date(profileData.lastDonationDate);
            const nextDate = new Date(lastDonation);
            nextDate.setMonth(nextDate.getMonth() + 3);
            setNextEligibility(nextDate.toLocaleDateString());
          } else {
            setNextEligibility("Eligible now");
          }
        }
        
        if (summaryData) {
          setDashboardSummary(summaryData);
          
          // Map achievements from API if available
          if (summaryData.badges && summaryData.badges.length > 0) {
            const mappedAchievements: Achievement[] = summaryData.badges.map((badge: any, index: number) => {
              if (badge.type === 'lifesaver' || index === 0) {
                return {
                  type: "lifesaver",
                  title: badge.name || "Bronze Lifesaver",
                  description: badge.description || `${summaryData.totalDonations || 0} donations completed`
                };
              } else if (badge.type === 'responder' || index === 1) {
                return {
                  type: "responder",
                  title: badge.name || "Quick Responder",
                  description: badge.description || "Average response time under 10 minutes"
                };
              } else {
                return {
                  type: "hero",
                  title: badge.name || "Community Hero",
                  description: badge.description || "Helped during emergency shortage"
                };
              }
            });
            setAchievements(mappedAchievements);
          } else {
            // Default achievements based on donation count
            const defaultAchievements: Achievement[] = [];
            if ((summaryData.totalDonations || 0) >= 5) {
              defaultAchievements.push({
                type: "lifesaver",
                title: "Bronze Lifesaver",
                description: "5 donations completed"
              });
            }
            if ((summaryData.totalDonations || 0) >= 10) {
              defaultAchievements.push({
                type: "lifesaver",
                title: "Silver Lifesaver",
                description: "10 donations completed"
              });
            }
            defaultAchievements.push({
              type: "responder",
              title: "Quick Responder",
              description: "Average response time under 10 minutes"
            });
            defaultAchievements.push({
              type: "hero",
              title: "Community Hero",
              description: "Helped during emergency shortage"
            });
            setAchievements(defaultAchievements);
          }
        }
        
        if (nearbyData?.data) setNearbyRequests(nearbyData.data);
        
        // TODO: Replace with actual API calls when available
        setDonationHistory([
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
        ]);
        
        setCommunityActivity([
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
        ]);
        
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Handle profile edit
  const handleEditProfile = async () => {
    if (isEditing) {
      // Save changes
      setIsSaving(true);
      setSaveMessage(null);
      
      try {
        const updatedProfile = await users.updateMyProfile(editForm);
        setProfile(updatedProfile);
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (err: any) {
        setSaveMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        setTimeout(() => setSaveMessage(null), 3000);
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup || "",
        location: profile.location || "",
      });
    }
  };

  const handleRoleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      alert('Please select a role to upgrade to');
      return;
    }
    
    if (!reason) {
      alert('Please provide a reason for the role upgrade request');
      return;
    }
    
    if (selectedRole === 'pulse-leader' && !communityName) {
      alert('Please enter your community name');
      return;
    }
    
    if (selectedRole === 'bridger' && (!facilityName || !facilityAddress)) {
      alert('Please enter both facility name and address');
      return;
    }
    
    setIsSubmittingUpgrade(true);
    setUpgradeMessage(null);
    
    try {
      const details: any = { reason };
      
      if (selectedRole === 'pulse-leader') {
        details.communityName = communityName;
      } else if (selectedRole === 'bridger') {
        details.facilityName = facilityName;
        details.facilityAddress = facilityAddress;
      }
      
      await requestRoleUpgrade(selectedRole, details);
      
      setUpgradeMessage({ 
        type: 'success', 
        text: `Your request to become a ${selectedRole === 'pulse-leader' ? 'Pulse Leader' : selectedRole === 'bridger' ? 'Bridger' : 'Admin'} has been submitted successfully!` 
      });
      
      // Reset form
      setSelectedRole('');
      setCommunityName('');
      setFacilityName('');
      setFacilityAddress('');
      setReason('');
      
      setTimeout(() => setUpgradeMessage(null), 5000);
      
    } catch (error: any) {
      setUpgradeMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit role upgrade request. Please try again.' 
      });
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

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
                Welcome back, {donorName}! 👋
              </h2>
              <p className="text-white mt-3">
                {nearbyRequestsCount} blood request
                {nearbyRequestsCount !== 1 ? "s" : ""} near you need your help
              </p>
            </div>

            <CompleteProfile percentage={profileCompletion} />
            
            <DonorOverview 
              totalDonations={dashboardSummary?.totalDonations || 0}
              livesSaved={dashboardSummary?.livesImpacted || 0}
              badgesEarned={dashboardSummary?.badges?.length || achievements.length}
              bloodType={donorBloodType}
              availability={availability}
              nextEligibility={nextEligibility}
              achievements={achievements}
              donorName={donorName}
            />
            
            <NearbyRequests requests={nearbyRequests} />

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
            <div className="bg-white rounded-lg border border-[#D8D6D6] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Mail className="w-4 h-4" /> Email
                    </p>
                    <p className="text-gray-900">{profile?.email || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Phone className="w-4 h-4" /> Phone
                    </p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.phoneNumber || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Droplets className="w-4 h-4" /> Blood Group
                    </p>
                    {isEditing ? (
                      <select
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select blood group</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile?.bloodGroup || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Location
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="e.g., Lagos, Nigeria"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.location || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Member Since
                  </p>
                  <p className="text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Loading...'}</p>
                </div>
              </div>
            </div>

            {/* Role Upgrade Request Section */}
            <div className="mt-6 bg-white rounded-lg border border-[#D8D6D6] p-6">
              <div className="flex items-start gap-3 mb-4">
                <CircleArrowUp className="w-6 h-6 text-[#1B59F8] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Upgrade Your Role</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Apply to become a Pulse Leader, Bridger, or Admin
                  </p>
                </div>
              </div>

              {upgradeMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  upgradeMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {upgradeMessage.text}
                </div>
              )}

              <form onSubmit={handleRoleUpgrade} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested Role <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setCommunityName('');
                      setFacilityName('');
                      setFacilityAddress('');
                    }}
                    className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={isSubmittingUpgrade}
                  >
                    <option value="" disabled>Select role type</option>
                    <option value="pulse-leader">Pulse Leader</option>
                    <option value="bridger">Bridger (Hospital Staff)</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedRole === 'pulse-leader' && 'Lead and manage blood donation campaigns in your community'}
                    {selectedRole === 'bridger' && 'Create and manage blood requests at your hospital'}
                    {selectedRole === 'admin' && 'Full platform access and user management'}
                  </p>
                </div>

                {selectedRole === 'pulse-leader' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Community Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      placeholder="e.g., Lagos Central Community"
                      className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required={selectedRole === 'pulse-leader'}
                      disabled={isSubmittingUpgrade}
                    />
                  </div>
                )}

                {selectedRole === 'bridger' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facility Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        placeholder="e.g., Lagos University Teaching Hospital"
                        className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required={selectedRole === 'bridger'}
                        disabled={isSubmittingUpgrade}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facility Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={facilityAddress}
                        onChange={(e) => setFacilityAddress(e.target.value)}
                        placeholder="e.g., Idi-Araba, Lagos"
                        className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required={selectedRole === 'bridger'}
                        disabled={isSubmittingUpgrade}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Request <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-gray-50 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Please explain why you want to upgrade to this role and how you plan to contribute..."
                    required
                    disabled={isSubmittingUpgrade}
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 text-lg">🔑</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">About Role Upgrades</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Role upgrade requests are reviewed by administrators. You will receive a notification once your request is processed. This may take 1-3 business days.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmittingUpgrade || !selectedRole || !reason}
                    className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmittingUpgrade ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
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