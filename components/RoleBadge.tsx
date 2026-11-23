"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Droplet, SquarePlus, Users } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

export type Role = "donor" | "bridger" | "pulse-leader" | "admin";

export const ROLE_DETAILS: Record<Role, { name: string; letter: string; Icon: typeof Droplet }> = {
  donor: { name: "Donor", letter: "D", Icon: Droplet },
  bridger: { name: "Bridger", letter: "B", Icon: SquarePlus },
  "pulse-leader": { name: "Pulse Leader", letter: "P", Icon: Users },
  admin: { name: "Admin", letter: "A", Icon: Users },
};

// The admin area has no page in this app yet
export const useSwitchableRoles = () => {
  const { user } = useAuth();
  const current = (user?.role || "donor") as Role;
  const approved = (user?.approvedRoles || [current]).filter((role): role is Role => role in ROLE_DETAILS && role !== "admin");
  return { current, approved: approved.includes(current) ? approved : [current, ...approved] };
};

export const useRoleSwitch = () => {
  const { switchRole } = useAuth();
  const { showToast } = useToast();
  const [switchingTo, setSwitchingTo] = useState<Role | null>(null);

  const switchTo = async (role: Role) => {
    setSwitchingTo(role);
    try {
      await switchRole(role);
    } catch (err: any) {
      showToast(err?.message || "Could not switch dashboards. Please try again.", "error");
      setSwitchingTo(null);
    }
  };

  return { switchTo, switchingTo };
};

export default function RoleBadge() {
  const { current, approved } = useSwitchableRoles();
  const { switchTo, switchingTo } = useRoleSwitch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const canSwitch = approved.length > 1;
  const { Icon, letter, name } = ROLE_DETAILS[current];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => canSwitch && setOpen((o) => !o)}
        aria-label={`Current role: ${name}${canSwitch ? ". Switch role" : ""}`}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[#1E7B3A] dark:text-[#34C759] font-bold ${canSwitch ? "hover:bg-green-50 dark:hover:bg-white/10" : "cursor-default"}`}
      >
        <Icon className="w-5 h-5" fill="currentColor" stroke={current === "donor" ? "white" : "currentColor"} />
        <span className="text-lg leading-none">{letter}</span>
        {canSwitch && <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
          <p className="px-4 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Switch role</p>
          {approved.map((role) => {
            const details = ROLE_DETAILS[role];
            const isCurrent = role === current;
            return (
              <button
                key={role}
                type="button"
                disabled={isCurrent || switchingTo !== null}
                onClick={() => switchTo(role)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 disabled:cursor-default"
              >
                <details.Icon className="w-4 h-4 text-[#C91E1E]" />
                <span className="flex-1">{switchingTo === role ? "Switching..." : details.name}</span>
                {isCurrent && <Check className="w-4 h-4 text-[#1E7B3A]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
