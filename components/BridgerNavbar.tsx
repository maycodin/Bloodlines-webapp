"use client";

import { Home, Droplets, BarChart3, User } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

interface BridgerNavbarProps {
  onPageChange: (page: string) => void;
  activePage: string;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
  { id: "blood-requests", label: "Blood Requests", icon: <Droplets className="w-5 h-5" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
];

export default function BridgerNavbar({ onPageChange, activePage }: BridgerNavbarProps) {
  return <DashboardNavbar navItems={NAV_ITEMS} activePage={activePage} onPageChange={onPageChange} />;
}
