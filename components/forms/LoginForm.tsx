"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // Dummy Credentials
  const DUMMY_ACCOUNTS = [
    {
      email: "admin@rahisa.com",
      password: "admin",
      role: "admin",
      name: "Administrator",
      label: "Admin",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      email: "kasir@rahisa.com",
      password: "kasir",
      role: "kasir",
      name: "Kasir Rahisa",
      label: "Kasir",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate Credentials
    const matchedUser = DUMMY_ACCOUNTS.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (matchedUser) {
      // Set session (LocalStorage for Client UI)
      localStorage.setItem(
        "user_session",
        JSON.stringify({
          email: matchedUser.email,
          role: matchedUser.role,
          name: matchedUser.name,
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        }),
      );

      // Set Cookie (For Middleware Protection)
      const oneDay = 24 * 60 * 60 * 1000;
      const expirationDate = new Date(Date.now() + oneDay).toUTCString();
      document.cookie = `auth_token=valid_token; expires=${expirationDate}; path=/; SameSite=Lax`;

      toast.success(`Selamat Datang, ${matchedUser.name}!`);
      router.push("/dashboard");
    } else {
      toast.error("Email atau Password salah!");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-muted" />
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className="pl-12"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-muted" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="pl-12 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-primary-700 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-end text-sm">
        <label className="flex items-center gap-2 cursor-pointer group">
          <Checkbox />
          <span className="text-muted group-hover:text-primary-700 transition-colors">
            Ingat saya
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        disabled={isLoading}
        className="w-full text-white cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </Button>

      {/* Demo Credentials Helper */}
      <div className="pt-4 border-t border-primary-100/60">
        <p className="text-xs text-center font-medium text-muted mb-3">
          Akun Demo (Klik untuk mengisi):
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DUMMY_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword(acc.password);
                toast.info(`Kredensial ${acc.label} diisi`);
              }}
              className="p-2.5 rounded-xl border border-primary-100 bg-primary-50/50 hover:bg-primary-100/70 hover:border-primary-200 transition-all text-left flex flex-col gap-1 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary-900 group-hover:text-primary-950">
                  {acc.label}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${acc.badge}`}
                >
                  {acc.role}
                </span>
              </div>
              <span className="text-[11px] text-muted truncate">
                {acc.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
