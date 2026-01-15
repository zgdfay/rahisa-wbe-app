"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Package,
  BookOpen,
  Layers,
  ShoppingCart,
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
  { icon: Package, label: "Produk", href: "/product" },
  { icon: BookOpen, label: "Resep", href: "/recipe" },
  { icon: Layers, label: "Stok Bahan", href: "/inventory" },
  {
    icon: ShoppingCart,
    label: "Rekomendasi Belanja",
    href: "/shopping-list",
  },
  { icon: BarChart3, label: "Laporan", href: "/report" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("admin"); // Default to admin while loading

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const { role } = JSON.parse(session);
      setRole(role || "admin");
    }
  }, []);

  const filteredMenuItems = menuItems.filter((item) => {
    if (role === "cashier") {
      return ["/sales", "/product"].includes(item.href);
    }
    return true; // Admin sees all
  });

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
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between p-3 rounded-2xl transition-all duration-300",
                isActive
                  ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20"
                  : "text-muted hover:bg-primary-50 hover:text-primary-700"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                    isActive
                      ? "text-white"
                      : "text-muted group-hover:text-primary-600"
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
      <div className="pt-6 border-t border-primary-50">
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
