"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { roleUpgrades } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import RoleUpgradeForm from "@/components/RoleUpgradeForm";

const ROLE_NAMES: Record<string, string> = { PULSE_LEADER: "Pulse Leader", BRIDGER: "Bridger", ADMIN: "Admin" };

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
};

export default function AddRoleSection() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = () =>
    roleUpgrades
      .getMyHistory()
      .then((result: any) => setHistory(Array.isArray(result) ? result : result?.data || []))
      .catch(() => setHistory([]));

  useEffect(() => {
    loadHistory();
  }, []);

  const held = [user?.role, ...(user?.approvedRoles || [])];
  const canApply = !held.includes("bridger") || !held.includes("pulse-leader");

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-3">
        <Info className="w-6 h-6 text-sky-500" />
        Add to Your Role
      </h2>

      {canApply ? (
        <>
          <p className="text-gray-700">
            Want to contribute more to the Bloodlines community? You can request to become a Pulse Leader (Community Coordinator) or a Bridger (Hospital Staff).
          </p>
          {showForm ? (
            <RoleUpgradeForm
              className="mt-6"
              onSubmitted={() => {
                setShowForm(false);
                loadHistory();
              }}
            />
          ) : (
            <button onClick={() => setShowForm(true)} className="mt-5 w-full py-3 rounded-xl bg-sky-400 hover:bg-sky-500 text-white font-semibold">
              Add Role
            </button>
          )}
        </>
      ) : (
        <p className="text-gray-700">You already have every role you can apply for. Use the role menu at the top to switch dashboards.</p>
      )}

      {history.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Your requests</h3>
          <ul className="space-y-2">
            {history.map((request) => {
              const status = request.status || "PENDING";
              return (
                <li key={request.id || request._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{ROLE_NAMES[request.requestedRole] || request.requestedRole}</p>
                    <p className="text-xs text-gray-500">Submitted {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[status] || STATUS_STYLES.PENDING}`}>{status}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
