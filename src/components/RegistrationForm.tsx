import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import { TrackType, Team, TeamMember } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
import { isVITBhopalEmail } from '../lib/clerk';
import { uploadDirectToImagekit } from '../lib/imagekitClient';

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

  const [leader, setLeader] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    college: 'VIT Bhopal University',
    role: 'Team Leader / Fullstack',
  });

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

  const [transactionRef, setTransactionRef] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentImageName, setPaymentImageName] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [domainNotice, setDomainNotice] = useState(false);

  const handleLeaderEmailChange = (val: string) => {
    setLeader((prev) => ({ ...prev, email: val }));
    setDomainNotice(isVITBhopalEmail(val));
  };

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
      const result = await uploadDirectToImagekit(file, 'payment-proofs');
      setPaymentProofUrl(result.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload payment proof image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const inputClass = 'w-full comic-input font-bold';
  const memberInputClass = 'w-full comic-input font-mono font-bold';

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

      let data: any;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server error during registration (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete registration.');
      }

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_err) {
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
    <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
      {/* Header Panel */}
      <div className="comic-card p-8 border-3 border-[#FF5F00] mb-10 shadow-[6px_6px_0px_#000]">
        <span className="text-[12px] font-mono text-[#FF5F00] uppercase tracking-wider block mb-2 font-bold">
          Team Registration
        </span>
        <h1
          className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#FF5F00] comic-title"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Register for ORIGIN '26
        </h1>
        <p className="text-[14px] text-[#FFC599] leading-relaxed font-body font-bold">
          Team Leader must register using an official <span className="text-[#FF5F00] font-bold">@vitbhopal.ac.in</span> email. 
          Upon admin verification, your Digital ID Pass unlocks.
        </p>
        <div className="mt-5 text-[13px] font-mono font-bold text-neutral-400">
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#FF5F00] hover:underline cursor-pointer transition-colors"
          >
            Sign in to your team →
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="mb-8 py-4 px-5 border-3 border-black bg-red-950/80 text-red-300 text-[13px] flex items-center gap-3 shadow-[4px_4px_0px_#000]">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Form Card (borders in orange) */}
      <form onSubmit={handleSubmit} className="comic-card p-8 md:p-10 border-3 border-[#FF5F00] space-y-12 bg-[#0D0E12] shadow-[8px_8px_0px_#000]">
        
        {/* Step 1: Team & Track */}
        <div>
          <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-dashed border-neutral-850">
            <h3
              className="text-xl font-bold text-[#FF5F00]"
              style={{ fontFamily: 'var(--font-subheading)' }}
            >
              Team Profile
            </h3>
            <span className="text-[12px] font-mono text-neutral-500 font-bold">Step 1 of 4</span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Team Name <span className="text-[#FF5F00]">*</span>
              </label>
              <input
                id="reg-input-team-name"
                type="text"
                required
                placeholder="e.g. DataTitans, NeuralKnights"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Innovation Track <span className="text-[#FF5F00]">*</span>
              </label>
              <select
                id="reg-select-track"
                value={track}
                onChange={(e) => setTrack(e.target.value as TrackType)}
                className="w-full comic-input font-bold cursor-pointer bg-black text-[#FFC599]"
              >
                {HACKATHON_TRACKS.map((t, idx) => (
                  <option key={idx} value={t.name} className="bg-black text-[#FFC599]">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Team Size
              </label>
              <div className="grid grid-cols-4 border-3 border-[#FF5F00] bg-black">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMemberCount(num)}
                    className={`py-3 text-[12px] font-bold uppercase transition-colors cursor-pointer font-mono border-r-3 border-[#FF5F00] last:border-r-0 ${
                      memberCount === num
                        ? 'bg-[#FF5F00] text-black font-extrabold'
                        : 'bg-black text-neutral-450 hover:bg-neutral-900 hover:text-[#FF5F00]'
                    }`}
                  >
                    {num === 1 ? '1 Solo' : num === 2 ? '2 Duo' : num === 3 ? '3 Trio' : '4 Squad'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Leader Details */}
        <div>
          <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-dashed border-neutral-855">
            <h3
              className="text-xl font-bold text-[#FF5F00]"
              style={{ fontFamily: 'var(--font-subheading)' }}
            >
              Team Leader
            </h3>
            <span className="text-[12px] font-mono text-neutral-500 font-bold">Step 2 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Full Name <span className="text-[#FF5F00]">*</span>
              </label>
              <input
                id="reg-input-leader-name"
                type="text"
                required
                placeholder="Aarav Sharma"
                value={leader.name}
                onChange={(e) => setLeader({ ...leader, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                <span>Email <span className="text-[#FF5F00]">*</span></span>
                {domainNotice && (
                  <span className="text-[10px] text-[#FF5F00] flex items-center gap-1 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Domain
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
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Phone <span className="text-[#FF5F00]">*</span>
              </label>
              <input
                id="reg-input-leader-phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={leader.phone}
                onChange={(e) => setLeader({ ...leader, phone: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                College
              </label>
              <input
                id="reg-input-leader-college"
                type="text"
                placeholder="VIT Bhopal University"
                value={leader.college}
                onChange={(e) => setLeader({ ...leader, college: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Teammates */}
        {memberCount > 1 && (
          <div>
            <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-dashed border-neutral-855">
              <h3
                className="text-xl font-bold text-[#FF5F00]"
                style={{ fontFamily: 'var(--font-subheading)' }}
              >
                Teammates ({memberCount - 1})
              </h3>
              <span className="text-[12px] font-mono text-neutral-500 font-bold">Step 3 of 4</span>
            </div>

            <div className="space-y-8">
              {memberCount >= 2 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-3 font-bold border-b border-neutral-850 pb-1">
                    Member 02 Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" placeholder="Full Name" value={member2.name} onChange={(e) => setMember2({ ...member2, name: e.target.value })} className={memberInputClass} />
                    <input type="email" placeholder="Email" value={member2.email} onChange={(e) => setMember2({ ...member2, email: e.target.value })} className={memberInputClass} />
                    <input type="tel" placeholder="Phone" value={member2.phone} onChange={(e) => setMember2({ ...member2, phone: e.target.value })} className={`${memberInputClass} font-mono`} />
                  </div>
                </div>
              )}

              {memberCount >= 3 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-3 font-bold border-b border-neutral-850 pb-1">
                    Member 03 Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" placeholder="Full Name" value={member3.name} onChange={(e) => setMember3({ ...member3, name: e.target.value })} className={memberInputClass} />
                    <input type="email" placeholder="Email" value={member3.email} onChange={(e) => setMember3({ ...member3, email: e.target.value })} className={memberInputClass} />
                    <input type="tel" placeholder="Phone" value={member3.phone} onChange={(e) => setMember3({ ...member3, phone: e.target.value })} className={`${memberInputClass} font-mono`} />
                  </div>
                </div>
              )}

              {memberCount >= 4 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-3 font-bold border-b border-neutral-850 pb-1">
                    Member 04 Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" placeholder="Full Name" value={member4.name} onChange={(e) => setMember4({ ...member4, name: e.target.value })} className={memberInputClass} />
                    <input type="email" placeholder="Email" value={member4.email} onChange={(e) => setMember4({ ...member4, email: e.target.value })} className={memberInputClass} />
                    <input type="tel" placeholder="Phone" value={member4.phone} onChange={(e) => setMember4({ ...member4, phone: e.target.value })} className={`${memberInputClass} font-mono`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        <div>
          <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-dashed border-neutral-850">
            <h3
              className="text-xl font-bold text-[#FF5F00]"
              style={{ fontFamily: 'var(--font-subheading)' }}
            >
              Payment — ₹200
            </h3>
            <span className="text-[12px] font-mono text-neutral-500 font-bold">Step 4 of 4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* QR Code box (peach background instead of white) */}
            <div className="space-y-4">
              <div className="bg-[#FFC599] p-6 border-3 border-[#FF5F00] shadow-[6px_6px_0px_#000] flex flex-col items-center">
                <QrCode className="w-32 h-32 text-black" />
                <span className="text-[12px] font-mono text-black font-bold mt-3">dsc.origin26@upi</span>
              </div>
              <div className="text-[12px] text-neutral-400 font-mono space-y-1.5 font-bold">
                <p>• UPI ID: <span className="text-[#FF5F00]">dsc.origin26@upi</span></p>
                <p>• Includes: 24H entry pass, compute, swag kit</p>
              </div>
            </div>

            {/* UTR + Screenshot Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Transaction Ref (UTR) <span className="text-[#FF5F00]">*</span>
                </label>
                <input
                  id="reg-input-txn-ref"
                  type="text"
                  required
                  placeholder="e.g. UTR-998241038"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Payment Screenshot
                </label>
                <div className="relative border-3 border-dashed border-[#FF5F00] bg-black hover:border-[#FF8700] p-8 text-center cursor-pointer transition-colors shadow-[4px_4px_0px_#000]">
                  <input
                    id="reg-input-payment-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 mx-auto text-[#FF5F00] mb-2" />
                  <span className="text-xs text-neutral-300 block font-bold">
                    {isUploadingImage
                      ? 'Uploading screenshot...'
                      : paymentImageName
                      ? paymentImageName
                      : 'Drop or click to upload receipt (max 10MB)'}
                  </span>
                </div>

                {paymentProofUrl && (
                  <div className="mt-4 flex items-center gap-3 py-3 border-t-2 border-dashed border-neutral-850">
                    <img
                      src={paymentProofUrl}
                      alt="Payment Preview"
                      className="w-12 h-12 object-cover border-2 border-[#FF5F00]"
                    />
                    <div className="text-[12px]">
                      <span className="text-[#FF5F00] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Uploaded successfully
                      </span>
                      <span className="text-neutral-500 font-bold block">Pass releases after admin review</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification notice */}
        <div className="py-4 px-5 border-3 border-[#FF5F00] bg-neutral-900 text-[13px] text-[#FFC599] font-bold">
          <span className="text-white font-extrabold">Note: </span>
          Your status will be set to <span className="font-mono text-[#FF5F00] font-bold">pending</span> until 
          DSC Admins verify your transaction. Your digital ID pass will unlock automatically.
        </div>

        {/* Agreement */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="reg-checkbox-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 w-4.5 h-4.5 accent-[#FF5F00] bg-black border-2 border-[#FF5F00] rounded-none cursor-pointer"
          />
          <span className="text-[13px] text-[#FFC599] leading-relaxed font-body font-bold">
            I agree to the <span className="text-white font-extrabold">Origin Hackathon Rules</span> & Code of Conduct. 
            I confirm the leader uses @vitbhopal.ac.in and acknowledge that passes unlock upon admin verification.
          </span>
        </label>

        {/* Submit Button */}
        <button
          id="reg-btn-submit-team"
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="w-full btn-comic-primary justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : (
            <>
              <span>Submit Registration</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
