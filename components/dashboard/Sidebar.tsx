"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingBag, label: "Penjualan", href: "/sales" },
  { icon: TrendingUp, label: "Prediksi", href: "/predictions" },
  { icon: BarChart3, label: "Laporan", href: "/report" },
];

interface UserSession {
  name?: string;
  email?: string;
  role?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const session = localStorage.getItem("user_session");
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch (e) {
        console.error("Failed to load user session", e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    // Clear the auth cookie so middleware knows we are out
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    toast.success("Berhasil keluar");
    router.replace("/login");
  };

  return (
    <aside className="w-72 hidden lg:flex flex-col bg-white/70 backdrop-blur-xl border-r border-white/60 m-6 rounded-[2.5rem] shadow-2xl p-8 h-[calc(100vh-3rem)] sticky top-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-1 mb-10">
        <Image
          src="/logo/rahisa-logo.png"
          alt="Rahisa Bakery Logo"
          width={40}
          height={40}
        />
        <div>
          <h1 className="text-lg font-semibold text-primary-900 leading-tight">
            Rahisa
          </h1>
          <p className="text-xs text-primary-600 font-semibold tracking-wider uppercase">
            Bakery
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between p-3 rounded-2xl transition-all duration-300",
                isActive
                  ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20"
                  : "text-muted hover:bg-primary-50 hover:text-primary-700",
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                    isActive
                      ? "text-white"
                      : "text-muted group-hover:text-primary-600",
                  )}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="pt-6 border-t border-primary-50 space-y-3">
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50/60 border border-primary-100/60 shadow-sm transition-all">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm text-white flex-shrink-0",
                user.role === "kasir" ? "bg-emerald-600" : "bg-primary-900",
              )}
            >
              {user.name?.[0]?.toUpperCase() ||
                user.role?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm font-bold text-primary-900 truncate">
                  {user.name || "Administrator"}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border flex-shrink-0",
                    user.role === "kasir"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-amber-100 text-amber-800 border-amber-200",
                  )}
                >
                  {user.role || "admin"}
                </span>
              </div>
              <p className="text-xs text-muted truncate mt-0.5">
                {user.email || "admin@rahisa.com"}
              </p>
            </div>
          </div>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-3 w-full p-3 text-muted hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 group cursor-pointer">
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium text-sm">Keluar</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Apakah anda yakin ingin keluar?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Anda harus login kembali untuk mengakses halaman dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
