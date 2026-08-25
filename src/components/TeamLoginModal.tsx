import React, { useState } from 'react';
import { Ticket, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="comic-card p-6 sm:p-8 max-w-md w-full bg-[#0D0E12] border-3 border-white shadow-[8px_8px_0px_#FF5F00] relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-[#FF5F00] text-xs font-mono font-bold uppercase cursor-pointer"
        >
          ✕ Close
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white bg-black mx-auto flex items-center justify-center text-[#FF5F00] mb-4 shadow-[2px_2px_0px_#FF5F00]">
            <Ticket className="w-6 h-6" />
          </div>
          <h3
            className="text-2xl font-bold text-white font-subheading uppercase"
          >
            Access Team Workspace
          </h3>
          <p className="text-[13px] text-neutral-400 mt-2 font-body font-medium">
            Retrieve your Digital ID Pass, check verification status, or submit 24h project deliverables.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border-2 border-black text-red-300 text-xs flex items-center gap-2 font-mono font-bold shadow-[2px_2px_0px_#000]">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Team ID or Leader Email <span className="text-[#FF5F00]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ORIGIN-101 or aarav.sharma2023@vitbhopal.ac.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full comic-input font-bold font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Team Access PIN (Optional)</span>
              <span className="text-[9px] text-neutral-500 font-bold">4-digit PIN</span>
            </label>
            <input
              type="password"
              placeholder="e.g. 7821"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full comic-input font-bold font-mono text-xs tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-comic-primary justify-center text-xs mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Open Team Pass</span>
              </>
            )}
          </button>
        </form>

        {/* Footer actions */}
        <div className="pt-4 border-t border-neutral-800 text-center text-xs font-mono font-bold">
          <span className="text-neutral-400">Haven't registered yet? </span>
          <button
            onClick={() => {
              onClose();
              onNavigateToRegister();
            }}
            className="text-[#FF5F00] hover:underline cursor-pointer"
          >
            Register Now &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
