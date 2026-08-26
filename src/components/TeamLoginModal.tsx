import React, { useState } from 'react';
import { Ticket, AlertCircle, Sparkles, Shield, ArrowRight } from 'lucide-react';
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
      const res = await fetch('/api/auth/team-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
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
      <div className="bg-black border border-neutral-800 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-white text-xs font-mono uppercase cursor-pointer"
        >
          ✕ Close
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-orange-500 mb-3">
            <Ticket className="w-6 h-6" />
          </div>
          <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
            TEAM ACCESS PORTAL
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Team Login
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Retrieve your Digital ID Pass, check verification status, or submit 24h project deliverables.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Team ID or Leader Email <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ORIGIN-101 or leader@vitbhopal.ac.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold border border-orange-500 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Sign In to Team Pass & Submissions</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

