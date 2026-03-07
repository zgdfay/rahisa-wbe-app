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
  const ADMIN_CREDENTIALS = {
    email: "admin@rahisa.com",
    password: "admin",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate Credentials
    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Set session (LocalStorage for Client UI)
      localStorage.setItem(
        "user_session",
        JSON.stringify({
          email: email,
          role: "admin",
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        }),
      );

      // Set Cookie (For Middleware Protection)
      const oneDay = 24 * 60 * 60 * 1000;
      const expirationDate = new Date(Date.now() + oneDay).toUTCString();
      document.cookie = `auth_token=valid_token; expires=${expirationDate}; path=/; SameSite=Lax`;

      toast.success("Login Berhasil!");
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
    </form>
  );
}
