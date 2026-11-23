"use client";

import React, { useEffect, useState } from "react";
import { History, Loader2, Plus, Siren } from "lucide-react";
import BridgerNavbar from "@/components/BridgerNavbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CriticalBloodRequestCard, { BloodRequestType } from "@/components/CriticalBloodRequestCard";
import EditBloodRequestModal from "@/components/EditBloodRequestModal";
import ConfirmDonationModal from "@/components/ConfirmDonationModal";
import PostRequestModal from "@/components/bridger/PostRequestModal";
import EmergencyBroadcast from "@/components/bridger/EmergencyBroadcast";
import BridgerAnalytics, { fulfilledPerMonth, latestResponseTime } from "@/components/bridger/BridgerAnalytics";
import { BloodTypeDistribution, FulfilmentDonut, MonthlyBars, StatCard } from "@/components/bridger/FulfilmentCharts";
import type { BridgerDashboardData } from "@/components/bridger/types";
import AccountProfile from "@/components/profile/AccountProfile";
import AddRoleSection from "@/components/profile/AddRoleSection";
import { DashboardTheme } from "@/app/contexts/ThemeContext";
import { useToast } from "@/components/ui/Toast";
import { bloodRequests, bridger } from "@/lib/api";
import { toRequestCard, isClosedRequest, fulfilmentByBloodType } from "@/lib/requests";

type Page = "home" | "blood-requests" | "analytics" | "profile";

const RECENT_ON_HOME = 3;

const Dashboard = () => {
  const { showToast } = useToast();
  const [activePage, setActivePage] = useState<Page>("home");
  const [requests, setRequests] = useState<BloodRequestType[]>([]);
  const [dashboardData, setDashboardData] = useState<BridgerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showPastRequests, setShowPastRequests] = useState(false);
  const [editingRequest, setEditingRequest] = useState<BloodRequestType | null>(null);
  const [confirmingRequest, setConfirmingRequest] = useState<BloodRequestType | null>(null);

  const openRequests = requests.filter((r) => !isClosedRequest(r));
  const pastRequests = requests.filter(isClosedRequest);
  const totalRequests = dashboardData?.requestOverview?.totalRequests ?? requests.length;
  const fulfilledRequests = dashboardData?.requestOverview?.fulfilledRequests ?? requests.filter((r) => r.requestStatus === "FULFILLED").length;

  const loadRequests = async () => {
    const mine = await bloodRequests.getMyRequests();
    setRequests(mine.map(toRequestCard));
  };

  const refresh = () =>
    Promise.all([
      loadRequests().catch((err) => console.error("Failed to refresh blood requests:", err)),
      bridger
        .getDashboard()
        .then(setDashboardData)
        .catch((err) => console.error("Failed to refresh dashboard figures:", err)),
    ]);

  useEffect(() => {
    const load = async () => {
      try {
        setDashboardData(await bridger.getDashboard());
        await loadRequests().catch((err) => console.error("Failed to load blood requests:", err));
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const findRequest = (id: string | number) => requests.find((r) => r.id === id) || null;

  const cancelRequest = async (id: string | number) => {
    try {
      await bloodRequests.cancel(String(id));
      showToast("Request cancelled");
      await refresh();
    } catch (err: any) {
      showToast(err?.message || "Could not cancel the request. Please try again.", "error");
    }
  };

  const renderCard = (request: BloodRequestType) => (
    <CriticalBloodRequestCard
      key={request.id}
      request={request}
      onConfirm={(id) => setConfirmingRequest(findRequest(id))}
      onEdit={(id) => setEditingRequest(findRequest(id))}
      onCancel={cancelRequest}
    />
  );

  const postButton = (
    <button onClick={() => setShowPostForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C91E1E] dark:bg-[#F44336] text-white font-semibold">
      <Plus className="w-5 h-5" /> Post Blood Request
    </button>
  );

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 text-[#C91E1E] animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#C91E1E] text-white rounded-lg">
            Try Again
          </button>
        </div>
      );
    }

    switch (activePage) {
      case "home":
        return (
          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-2xl px-6 py-12 text-center">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Need Blood Urgently?</h1>
              <p className="text-gray-700 mt-2 mb-6">Post a request and get connected with nearby donors instantly.</p>
              <div className="flex justify-center">{postButton}</div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Active Requests" value={dashboardData?.activeRequests ?? 0} />
              <StatCard label="Average Response Time" value={latestResponseTime(dashboardData)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FulfilmentDonut total={totalRequests} fulfilled={fulfilledRequests} />
              <MonthlyBars
                title={`Total Coordinated Donations: ${dashboardData?.donationActivity?.totalUnitsFulfilled ?? 0} units`}
                subtitle="Requests fulfilled each month"
                values={fulfilledPerMonth(dashboardData)}
              />
            </div>

            <BloodTypeDistribution rows={fulfilmentByBloodType(requests)} />

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Blood Requests</h2>
                {openRequests.length > RECENT_ON_HOME && (
                  <button onClick={() => setActivePage("blood-requests")} className="text-sm font-semibold text-[#C91E1E] dark:text-[#F44336]">
                    View all {openRequests.length}
                  </button>
                )}
              </div>
              {openRequests.length > 0 ? (
                <div className="space-y-4">{openRequests.slice(0, RECENT_ON_HOME).map(renderCard)}</div>
              ) : (
                <p className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-600">No open requests. All current needs are being met.</p>
              )}
            </section>
          </div>
        );

      case "blood-requests":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
              {postButton}
            </div>

            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Siren className="w-6 h-6 text-[#D32F2F] dark:text-[#F44336]" /> Recent Blood Requests
                </h2>
                <span className="px-3 py-1 rounded-full bg-green-100 text-[#1E7B3A] dark:bg-[#173a22] dark:text-[#34C759] text-sm font-semibold">
                  {openRequests.length} Active
                </span>
              </div>
              <p className="text-gray-600 mb-5">Manage active requests: edit details, confirm donations, or cancel requests you no longer need.</p>
              {openRequests.length > 0 ? (
                <div className="space-y-4">{openRequests.map(renderCard)}</div>
              ) : (
                <p className="text-center text-gray-600 py-8">No open requests. Post one with the button above.</p>
              )}
            </section>

            <EmergencyBroadcast openRequests={openRequests} />

            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <button type="button" onClick={() => setShowPastRequests((s) => !s)} className="w-full flex items-center justify-between">
                <span className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <History className="w-5 h-5 text-gray-500" /> Past Requests
                </span>
                <span className="text-sm text-gray-500">
                  {pastRequests.length} · {showPastRequests ? "Hide" : "Show"}
                </span>
              </button>
              {showPastRequests && (
                <div className="space-y-4 mt-5">
                  {pastRequests.length > 0 ? (
                    pastRequests.map((request) => <CriticalBloodRequestCard key={request.id} request={request} />)
                  ) : (
                    <p className="text-sm text-gray-500">Fulfilled, cancelled and expired requests will show here.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        );

      case "analytics":
        return <BridgerAnalytics requests={requests} dashboardData={dashboardData} />;

      case "profile":
        return (
          <AccountProfile>
            <AddRoleSection />
          </AccountProfile>
        );
    }
  };

  return (
    <>
      <BridgerNavbar activePage={activePage} onPageChange={(page) => setActivePage(page as Page)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-10">{renderPage()}</main>

      {showPostForm && (
        <PostRequestModal
          existingRequests={requests}
          onClose={() => setShowPostForm(false)}
          onCreated={() => {
            setShowPostForm(false);
            showToast("Blood request posted. Nearby donors are being notified.");
            refresh();
          }}
        />
      )}
      {editingRequest && (
        <EditBloodRequestModal
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSaved={(text) => {
            setEditingRequest(null);
            showToast(text);
            refresh();
          }}
        />
      )}
      {confirmingRequest && (
        <ConfirmDonationModal
          request={confirmingRequest}
          onClose={() => setConfirmingRequest(null)}
          onChanged={(text) => {
            if (text) showToast(text);
            refresh();
          }}
        />
      )}
    </>
  );
};

export default function BridgerDashboardPage() {
  return (
    <DashboardTheme>
      <ProtectedRoute allowedRoles={["bridger", "admin"]}>
        <Dashboard />
      </ProtectedRoute>
    </DashboardTheme>
  );
}
