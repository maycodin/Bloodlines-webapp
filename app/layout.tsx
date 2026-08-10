import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope', 
});

export const metadata: Metadata = {
  title: "BloodLines - Save Lives Through Blood Donation",
  description: "Connect blood donors with recipients instantly. Post requests, find donors, and manage blood inventory.",
  keywords: "blood donation, blood bank, donor matching, emergency blood request",
  authors: [{ name: "BloodLines Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}