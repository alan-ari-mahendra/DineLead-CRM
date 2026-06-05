"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/register", {
        name,
        email,
        password,
      });
      toast.success("Account created! Please sign in.");

      const plan = searchParams.get("plan");
      if (plan) {
        router.push(`/login?redirect=/settings/billing`);
      } else {
        router.push("/login");
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
          Full name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pr-10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`h-11 bg-white text-gray-900 placeholder:text-gray-300 rounded-xl pr-10 transition-all focus:ring-2
              ${passwordMismatch
                ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                : passwordMatch
                ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {passwordMatch && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {passwordMismatch && (
          <p className="text-xs text-red-500 font-medium mt-1">Passwords don&apos;t match</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading || passwordMismatch}
        className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-sm shadow-emerald-900/20 transition-all duration-150 mt-2"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create Free Account"
        )}
      </Button>

      {/* Terms note */}
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        By creating an account, you agree to our{" "}
        <span className="text-emerald-700 font-medium cursor-pointer hover:underline">Terms of Service</span>
        {" & "}
        <span className="text-emerald-700 font-medium cursor-pointer hover:underline">Privacy Policy</span>
      </p>

      {/* Login link */}
      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-sm text-gray-400 text-center">
        Already have an account?{" "}
        <Link
          href={searchParams.get("plan") ? `/login?redirect=/settings/billing` : "/login"}
          className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
