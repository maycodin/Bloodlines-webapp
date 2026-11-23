"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, CircleCheck } from "lucide-react";
import { ROLE_DETAILS, useRoleSwitch, useSwitchableRoles } from "@/components/RoleBadge";

export default function CurrentRoleCard() {
  const { current, approved } = useSwitchableRoles();
  const { switchTo, switchingTo } = useRoleSwitch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { Icon, name } = ROLE_DETAILS[current];
  const canSwitch = approved.length > 1;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
      <Icon className="w-7 h-7 text-gray-900" />
      <div className="flex-1">
        <p className="text-sm text-gray-500">Current Role</p>
        <p className="text-lg font-bold text-gray-900">{name}</p>
      </div>
      <button
        type="button"
        onClick={() => canSwitch && setOpen((o) => !o)}
        className={`flex items-center gap-2 text-[#C91E1E] dark:text-[#F44336] font-bold text-lg ${canSwitch ? "" : "cursor-default"}`}
        aria-label={canSwitch ? "Switch role" : `Role: ${name}`}
      >
        <Icon className="w-5 h-5" />
        {name}
        <CircleCheck className="w-5 h-5" />
        {canSwitch && <ChevronDown className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute right-4 top-full mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-30">
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
                <span className="flex-1">
                  {switchingTo === role ? "Switching..." : isCurrent ? details.name : `Switch to ${details.name}`}
                </span>
                {isCurrent && <Check className="w-4 h-4 text-[#1E7B3A]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
