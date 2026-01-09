import { Sidebar } from "@/components/dashboard/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard - Rahisa Bakery",
  description: "Dashboard management system for Rahisa",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
        <Toaster position="top-right" richColors />
      </main>
    </div>
  );
}
