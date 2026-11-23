"use client";

import { Home, BookOpen, User } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

interface DonorNavbarProps {
  onPageChange: (page: string) => void;
  activePage: string;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
  { id: "resources", label: "Resources", icon: <BookOpen className="w-5 h-5" /> },
  { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
];

export default function DonorNavbar({ onPageChange, activePage }: DonorNavbarProps) {
  return <DashboardNavbar navItems={NAV_ITEMS} activePage={activePage} onPageChange={onPageChange} />;
}
