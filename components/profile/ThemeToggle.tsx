"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-32 h-14 rounded-full border border-gray-300 bg-gray-100 dark:bg-[#2a2a2a] dark:border-[#444] shadow-inner"
    >
      <Sun className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 ${dark ? "text-gray-400" : "text-transparent"}`} />
      <Moon className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 ${dark ? "text-transparent" : "text-gray-700"}`} />
      <span
        className={`absolute top-1.5 left-1.5 w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform ${
          dark ? "translate-x-[4.5rem] bg-[#111]" : "bg-white"
        }`}
      >
        {dark ? <Moon className="w-6 h-6 text-white" fill="white" /> : <Sun className="w-6 h-6 text-amber-400" />}
      </span>
    </button>
  );
}
