import type { Metadata, Viewport } from "next";
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
};

// Next.js expects viewport settings in their own export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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