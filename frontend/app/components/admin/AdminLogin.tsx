"use client";

import React from "react";
import { Shield, ShieldCheck, ShieldAlert, LogOut } from "lucide-react";
import { User } from "firebase/auth";

interface AdminLoginProps {
  firebaseUser: User | null | undefined;
  authError: string;
  setAuthError: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  otpInput: string;
  setOtpInput: (val: string) => void;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>; 
  handleSignOut: () => Promise<void>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  firebaseUser,
  authError,
  setAuthError,
  emailInput,
  setEmailInput,
  otpInput,
  setOtpInput,
  signInWithGoogle,
  signInWithEmail,
  handleSignOut,
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16">
      <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        <div className="w-14 h-14 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-orange-500 mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-400 font-mono text-[11px] font-bold border border-orange-500/30 uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />
          <span>AUTHENTICATED ORGANIZER CONSOLE</span>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Origin '26 Executive Admin Console
        </h3>

        {firebaseUser?.email ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>ACCESS DENIED — NOT AN AUTHORIZED ADMIN</span>
              </div>
              <p>
                You are currently signed in as <strong className="text-white">{firebaseUser.email}</strong>, but this email address is not in the Authorized Admin Whitelist.
              </p>
              <p className="text-[11px] text-neutral-400">
                If you are an organizer or convener, please request access from the Lead Convener or Superadmin.
              </p>
            </div>

            <button
              onClick={() => handleSignOut()}
              className="w-full py-3 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out of Firebase to Switch Account</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5 pt-2 text-left">
            <p className="text-xs text-neutral-400 text-center max-w-md mx-auto leading-relaxed">
              Please sign in using your authorized executive or jury email address to access administrative management tools.
            </p>

            {authError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                setAuthError("");
                try {
                  await signInWithGoogle();
                } catch (err: any) {
                  if (err.code !== "auth/popup-closed-by-user") {
                    setAuthError(err.message || "Google sign in failed.");
                  }
                }
              }}
              className="w-full py-3 px-4 bg-[#171717] hover:bg-[#222222] border border-[#262626] hover:border-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-3 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span className="group-hover:text-orange-400 transition-colors">Sign In with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-800"></div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">OR ADMIN EMAIL / PASSWORD</span>
              <div className="flex-1 h-px bg-neutral-800"></div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAuthError("");
                if (!emailInput.trim() || !otpInput.trim()) {
                  setAuthError("Please enter both your admin email and password.");
                  return;
                }
                try {
                  await signInWithEmail(emailInput.trim(), otpInput.trim());
                } catch (err: any) {
                  setAuthError(err.message || "Failed to authenticate.");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase text-neutral-300 mb-1 tracking-wider">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="neelpandeyofficial@gmail.com"
                  className="w-full bg-[#171717] border border-neutral-800 focus:border-orange-500 px-3 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase text-neutral-300 mb-1 tracking-wider">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#171717] border border-neutral-800 focus:border-orange-500 px-3 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-orange-500 shadow-lg shadow-orange-500/20 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authenticate Admin</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};