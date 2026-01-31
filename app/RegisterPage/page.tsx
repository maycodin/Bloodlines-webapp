import AuthNavbar from "@/components/AuthNavbar";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      
      <Image
        src="/Background.png"
        alt="Background"
        fill
        priority
        className="object-cover z-0"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        <AuthNavbar />

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="text-white">

            <h1 className="max-w-md text-3xl sm:text-4xl md:text-5xl font-bold">
              Saving Lives,
            </h1>
            <h1 className="max-w-md text-3xl sm:text-4xl md:text-5xl font-bold">
              One Beat at a Time
            </h1>

            <p className="max-w-125 mt-4 text-sm sm:text-base">
              A living network of donors, hospitals, and communities — all pulsing
              with shared purpose.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link
                href="/RegisterPage/Signup"
                className="w-full sm:min-w-50 text-center bg-white text-gray-900 py-3 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Sign up
              </Link>

              <Link
                href="/RegisterPage/Login"
                className="w-full sm:min-w-50 text-center bg-red-600 text-white py-3 rounded-md font-medium hover:bg-red-700 transition"
              >
                Log in
              </Link>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
