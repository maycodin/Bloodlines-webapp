"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const AuthNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Products", href: "/BridgerDashboard" },
    { label: "Resources", href: "/resources" },
    { label: "Contact us", href: "/contact" },
  ];

  return (
    <nav className="relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          <div className="flex items-center gap-2">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={28.37}
              height={41.71}
            />
            <span className="flex text-white text-2xl">
              <h1 className="font-bold">Blood</h1>Lines
            </span>
          </div>

          <div className="hidden md:flex items-center gap-20 text-white">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white px-1 py-2 text-sm font-medium relative group"
              >
                {item.label}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/signup"
              className="bg-white px-4 py-2 rounded-md text-gray-900 font-medium"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="bg-red-600 px-4 py-2 rounded-md text-white font-medium"
            >
              Log in
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
            >
              <span className="sr-only">Open menu</span>
              {!isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-4 pt-4 pb-6 space-y-4 bg-black/80 backdrop-blur-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block text-white text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/signup"
              className="w-full text-center bg-white text-gray-900 py-2 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="w-full text-center bg-red-600 text-white py-2 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
