import React, { useState } from 'react';
import { Ticket, Lock, ArrowRight, AlertCircle, Sparkles, CheckCircle2, User } from 'lucide-react';
import { Team } from '../types';

interface TeamLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (team: Team) => void;
  onNavigateToRegister: () => void;
}

export const TeamLoginModal: React.FC<TeamLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Team ID (e.g. ORIGIN-101) or Leader Email.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if the entered identifier is an Admin / Jury Email
      const adminRes = await fetch('/api/admin/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim() }),
      });
      let adminData: any = {};
      const adminContentType = adminRes.headers.get('content-type') || '';
      if (adminContentType.includes('application/json')) {
        adminData = await adminRes.json();
      }

      if (adminRes.ok && adminData.success) {
        // Automatically transition to Admin Console!
        onClose();
        if ((window as any).setActiveTabGlobal) {
          (window as any).setActiveTabGlobal('admin');
        }
        return;
      }

      // 2. Otherwise proceed with regular Team Login
      const res = await fetch('/api/auth/team-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          accessCode: accessCode.trim() || undefined,
        }),
      });

      let data: any;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server error during login (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'No registered team or authorized admin found with this email or ID.');
      }

      onLoginSuccess(data.team);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111114] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white text-xs cursor-pointer"
        >
          ✕ Close
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400 mb-3">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">Access Your Team Workspace</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Retrieve your Digital ID Pass, check verification status, or submit 24h project deliverables.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Team ID or Leader Email <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ORIGIN-101 or aarav.sharma2023@vitbhopal.ac.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
              <span>Team Access Code / PIN (Optional)</span>
              <span className="text-[10px] text-zinc-500">4-digit PIN</span>
            </label>
            <input
              type="password"
              placeholder="e.g. 7821"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Open Team Pass & Submission</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 text-center">
          <span className="text-xs text-zinc-400">Haven't registered your team yet? </span>
          <button
            onClick={() => {
              onClose();
              onNavigateToRegister();
            }}
            className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
          >
            Register Now &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
