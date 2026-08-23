import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  ShieldCheck,
  Upload,
  QrCode,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  User,
  Clock,
  Lock,
} from 'lucide-react';
import { TrackType, Team, TeamMember } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
import { isVITBhopalEmail } from '../lib/clerk';

interface RegistrationFormProps {
  selectedTrack?: TrackType;
  onRegisteredSuccess: (team: Team) => void;
  onSwitchToLogin: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedTrack = 'AI & Machine Learning',
  onRegisteredSuccess,
  onSwitchToLogin,
}) => {
  const [teamName, setTeamName] = useState('');
  const [track, setTrack] = useState<TrackType>(selectedTrack);
  const [memberCount, setMemberCount] = useState<number>(3);

  // Team Leader
  const [leader, setLeader] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    college: 'VIT Bhopal University',
    role: 'Team Leader / Fullstack',
  });

  // Additional members
  const [member2, setMember2] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    college: 'VIT Bhopal University',
    role: 'ML / Data Scientist',
  });

  const [member3, setMember3] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    college: 'VIT Bhopal University',
    role: 'Frontend / UI/UX',
  });

  const [member4, setMember4] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    college: 'VIT Bhopal University',
    role: 'Backend / Cloud',
  });

  // Payment details
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentImageName, setPaymentImageName] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [domainNotice, setDomainNotice] = useState(false);

  // Handle Leader Email changes to highlight VIT Bhopal domain
  const handleLeaderEmailChange = (val: string) => {
    setLeader((prev) => ({ ...prev, email: val }));
    setDomainNotice(isVITBhopalEmail(val));
  };

  // Handle Payment Screenshot Upload via Imagekit API endpoint
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Receipt file size is too large (max 10MB limit).');
      return;
    }

    setPaymentImageName(file.name);
    setIsUploadingImage(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image upload to Imagekit failed.');
      }

      setPaymentProofUrl(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload screenshot. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamName.trim()) {
      setErrorMsg('Please enter your Team Name.');
      return;
    }
    if (!leader.name.trim() || !leader.email.trim() || !leader.phone.trim()) {
      setErrorMsg('Please provide complete Team Leader details (Name, Email, Phone).');
      return;
    }

    if (!isVITBhopalEmail(leader.email)) {
      setErrorMsg('Team Leader must register with an official @vitbhopal.ac.in email address.');
      return;
    }

    if (!transactionRef.trim()) {
      setErrorMsg('Please enter your UPI / Payment Transaction Reference (UTR Number).');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the Origin Hackathon Rules and Code of Conduct.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        teamName: teamName.trim(),
        track,
        leader,
        member2: memberCount >= 2 && member2.name.trim() ? member2 : undefined,
        member3: memberCount >= 3 && member3.name.trim() ? member3 : undefined,
        member4: memberCount >= 4 && member4.name.trim() ? member4 : undefined,
        transactionRef: transactionRef.trim(),
        paymentProofUrl: paymentProofUrl || '',
      };

      const res = await fetch('/api/teams/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete registration.');
      }

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // silent
      }

      onRegisteredSuccess(data.team);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL REGISTRATION • NEON DB & CLOUDINARY CONNECTED</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Register Your Team for ORIGIN '26
        </h2>
        <p className="text-zinc-400 text-sm mt-2 max-w-xl mx-auto">
          Sign up with your <span className="text-emerald-400 font-semibold">@vitbhopal.ac.in</span> email. All submissions require payment screenshot verification. Upon admin approval, your official Team Pass & Project Submission portal will unlock.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <span>Already registered?</span>
          <button
            onClick={onSwitchToLogin}
            className="text-emerald-400 font-semibold hover:underline"
          >
            Check Status / Sign In to Team Workspace &rarr;
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Team & Track info */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/10 text-white font-bold text-base">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif">1. Team Profile & Track Category</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Team Name <span className="text-emerald-400">*</span>
              </label>
              <input
                id="reg-input-team-name"
                type="text"
                required
                placeholder="e.g. DataTitans, NeuralKnights"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Target Innovation Track <span className="text-emerald-400">*</span>
              </label>
              <select
                id="reg-select-track"
                value={track}
                onChange={(e) => setTrack(e.target.value as TrackType)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
              >
                {HACKATHON_TRACKS.map((t, idx) => (
                  <option key={idx} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member Count selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Team Size (Including Leader)
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMemberCount(num)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    memberCount === num
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-[#18181b] text-zinc-300 border-white/10 hover:bg-[#202024]'
                  }`}
                >
                  {num === 1
                    ? '1 (Solo)'
                    : num === 2
                    ? '2 (Duo)'
                    : num === 3
                    ? '3 (Trio)'
                    : '4 (Squad)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Team Leader Details */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <User className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif">2. Team Leader Details (Primary Contact)</h3>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              @vitbhopal.ac.in Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Leader Full Name <span className="text-emerald-400">*</span>
              </label>
              <input
                id="reg-input-leader-name"
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={leader.name}
                onChange={(e) => setLeader({ ...leader, name: e.target.value })}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Leader Official Email <span className="text-emerald-400">*</span></span>
                {domainNotice && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Domain Verified
                  </span>
                )}
              </label>
              <input
                id="reg-input-leader-email"
                type="email"
                required
                placeholder="name.2023@vitbhopal.ac.in"
                value={leader.email}
                onChange={(e) => handleLeaderEmailChange(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                WhatsApp / Phone Number <span className="text-emerald-400">*</span>
              </label>
              <input
                id="reg-input-leader-phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={leader.phone}
                onChange={(e) => setLeader({ ...leader, phone: e.target.value })}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                College / Institution
              </label>
              <input
                id="reg-input-leader-college"
                type="text"
                placeholder="VIT Bhopal University"
                value={leader.college}
                onChange={(e) => setLeader({ ...leader, college: e.target.value })}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Additional Members */}
        {memberCount > 1 && (
          <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-white font-bold text-base">
              <Users className="w-5 h-5 text-teal-400" />
              <h3 className="font-serif">3. Teammates Details ({memberCount - 1} Members)</h3>
            </div>

            {memberCount >= 2 && (
              <div className="p-4 bg-[#18181b] border border-white/10 rounded-xl">
                <div className="text-xs font-mono font-bold text-emerald-400 mb-3">MEMBER 2</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Member 2 Full Name"
                    value={member2.name}
                    onChange={(e) => setMember2({ ...member2, name: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="email"
                    placeholder="Member 2 Email (@vitbhopal.ac.in)"
                    value={member2.email}
                    onChange={(e) => setMember2({ ...member2, email: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="tel"
                    placeholder="Member 2 Phone"
                    value={member2.phone}
                    onChange={(e) => setMember2({ ...member2, phone: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>
            )}

            {memberCount >= 3 && (
              <div className="p-4 bg-[#18181b] border border-white/10 rounded-xl">
                <div className="text-xs font-mono font-bold text-emerald-400 mb-3">MEMBER 3</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Member 3 Full Name"
                    value={member3.name}
                    onChange={(e) => setMember3({ ...member3, name: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="email"
                    placeholder="Member 3 Email"
                    value={member3.email}
                    onChange={(e) => setMember3({ ...member3, email: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="tel"
                    placeholder="Member 3 Phone"
                    value={member3.phone}
                    onChange={(e) => setMember3({ ...member3, phone: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>
            )}

            {memberCount >= 4 && (
              <div className="p-4 bg-[#18181b] border border-white/10 rounded-xl">
                <div className="text-xs font-mono font-bold text-emerald-400 mb-3">MEMBER 4</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Member 4 Full Name"
                    value={member4.name}
                    onChange={(e) => setMember4({ ...member4, name: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="email"
                    placeholder="Member 4 Email"
                    value={member4.email}
                    onChange={(e) => setMember4({ ...member4, email: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="tel"
                    placeholder="Member 4 Phone"
                    value={member4.phone}
                    onChange={(e) => setMember4({ ...member4, phone: e.target.value })}
                    className="bg-[#1f1f23] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Payment & Screenshot Upload (Imagekit) */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/10 text-white font-bold text-base">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif">4. Registration Fee & Payment Proof Upload</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="bg-[#18181b] p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  SCAN & PAY (UPI)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  ₹200 / Team
                </span>
              </div>

              <div className="flex items-center justify-center p-3 bg-white rounded-lg mb-3 shadow-inner">
                <div className="text-center">
                  <div className="w-36 h-36 mx-auto bg-zinc-950 rounded p-1.5 flex flex-col items-center justify-center border-2 border-emerald-500">
                    <QrCode className="w-24 h-24 text-emerald-400" />
                    <span className="text-[9px] font-mono text-emerald-300 mt-1 font-bold">
                      origin26@dscupi
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-900 font-semibold block mt-1.5">
                    Data Science Club • VIT Bhopal
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 space-y-1 font-mono">
                <p>• UPI ID: <span className="text-white font-bold">dsc.origin26@upi</span></p>
                <p>• Covers: 24H Hackathon Entry, Cloud Credits & Swag Kits</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  UPI / Bank Transaction Ref (UTR Number) <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="reg-input-txn-ref"
                  type="text"
                  required
                  placeholder="e.g. UTR-998241038"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Upload Payment Screenshot (Uploaded to Imagekit)
                </label>
                <div className="relative border border-dashed border-white/20 hover:border-emerald-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#18181b]/60">
                  <input
                    id="reg-input-payment-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 mx-auto text-emerald-400 mb-1.5" />
                  <span className="text-xs text-zinc-300 font-medium block">
                    {isUploadingImage
                      ? 'Uploading to Imagekit...'
                      : paymentImageName
                      ? paymentImageName
                      : 'Click or Drag Payment Screenshot (Images up to 10MB)'}
                  </span>
                </div>

                {paymentProofUrl && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-[#1f1f23] rounded-lg border border-emerald-500/30">
                    <img
                      src={paymentProofUrl}
                      alt="Payment Preview"
                      className="w-12 h-12 object-cover rounded border border-white/10"
                    />
                    <div className="text-xs">
                      <span className="text-emerald-400 font-semibold block flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Screenshot Saved to Imagekit
                      </span>
                      <span className="text-zinc-400 text-[10px]">Admin will verify for pass lock release</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gatekeeping Information box */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 text-amber-200 text-xs">
          <Lock className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-300 text-sm mb-0.5">Admin Verification Lock Notice</span>
            Upon completing registration, your status will be set to <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">pending_verification</span>.
            Your Digital ID Pass and Project Submission Portal will remain locked until authorized DSC Admins review and verify your payment proof.
          </div>
        </div>

        {/* Section 5: Agreement & Submit */}
        <div className="bg-[#111114] border border-white/10 p-5 rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              id="reg-checkbox-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/20 text-emerald-500 focus:ring-emerald-500 bg-[#18181b]"
            />
            <span className="text-xs text-zinc-300 leading-relaxed">
              We agree to the <span className="text-emerald-400 font-semibold">Origin Hackathon Rules</span> & Code of Conduct. We confirm that our leader is registered with @vitbhopal.ac.in and acknowledge that team passes are unlocked only upon Admin verification.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            id="reg-btn-submit-team"
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Team Data...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Submit Registration & Request Admin Lock Release</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
