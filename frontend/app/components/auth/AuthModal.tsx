"use client";

import React, { useState } from "react";
import { X, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Sparkles, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "signin",
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, error, clearError } = useAuth();
  
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    clearError();
    setLocalError("");
    setSuccessMsg("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleGoogleAuth = async () => {
    setLocalError("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setLocalError(err.message || "Google sign in failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMsg("");

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (mode === "forgot") {
      setIsLoading(true);
      try {
        await sendPasswordReset(email.trim());
        setSuccessMsg("Password reset email sent! Check your inbox.");
      } catch (err: any) {
        setLocalError(err.message || "Failed to send reset email.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
      setIsLoading(true);
      try {
        await signUpWithEmail(email.trim(), password);
        setSuccessMsg("Account created successfully!");
        setTimeout(() => handleClose(), 1000);
      } catch (err: any) {
        setLocalError(err.message || "Failed to create account.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        await signInWithEmail(email.trim(), password);
        handleClose();
      } catch (err: any) {
        setLocalError(err.message || "Failed to sign in.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#0D0D0D] border border-[#262626] shadow-2xl p-6 sm:p-8 text-white space-y-6"
        style={{
          boxShadow: "0 25px 50px -12px rgba(255, 59, 0, 0.15), 0 0 30px rgba(0,0,0,0.8)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF3B00]/10 text-[#FF3B00] font-mono text-[11px] font-bold border border-[#FF3B00]/30 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORIGIN '26 AUTHENTICATION</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
            {mode === "signin" && "WELCOME BACK"}
            {mode === "signup" && "CREATE YOUR ACCOUNT"}
            {mode === "forgot" && "RESET PASSWORD"}
          </h3>
          <p className="text-xs text-neutral-400">
            {mode === "signin" && "Sign in with your Google account or email credentials"}
            {mode === "signup" && "Join Origin '26 Hackathon platform"}
            {mode === "forgot" && "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Google OAuth Button */}
        {mode !== "forgot" && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#171717] hover:bg-[#222222] border border-[#262626] hover:border-[#FF3B00] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-3 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span className="group-hover:text-[#FF3B00] transition-colors">
                {mode === "signin" ? "Sign In with Google" : "Sign Up with Google"}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#262626]"></div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">OR EMAIL</span>
              <div className="flex-1 h-px bg-[#262626]"></div>
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {(localError || error) && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{localError || error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase text-neutral-300 mb-1.5 tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@vitbhopal.ac.in"
                className="w-full bg-[#171717] border border-[#262626] focus:border-[#FF3B00] pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono font-semibold uppercase text-neutral-300 tracking-wider">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setLocalError("");
                      setSuccessMsg("");
                    }}
                    className="text-[10px] font-mono text-[#FF3B00] hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#171717] border border-[#262626] focus:border-[#FF3B00] pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase text-neutral-300 mb-1.5 tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#171717] border border-[#262626] focus:border-[#FF3B00] pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FF3B00] hover:bg-[#FF5511] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#FF3B00]/20 mt-2 disabled:opacity-50"
          >
            <span>
              {isLoading
                ? "Processing..."
                : mode === "signin"
                ? "Sign In with Email"
                : mode === "signup"
                ? "Create Account"
                : "Send Reset Link"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="pt-2 text-center text-xs font-mono text-neutral-400">
          {mode === "signin" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setLocalError("");
                  setSuccessMsg("");
                }}
                className="text-[#FF3B00] hover:underline font-bold cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setLocalError("");
                  setSuccessMsg("");
                }}
                className="text-[#FF3B00] hover:underline font-bold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
