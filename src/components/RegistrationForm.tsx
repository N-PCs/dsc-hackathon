import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { TrackType, Team, TeamMember } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
import { isVITBhopalEmail } from '../lib/clerk';
import { uploadDirectToImagekit } from '../lib/imagekitClient';

export type MemberCategory = 'hosteller' | 'day_scholar';

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

  // Per-member category: hosteller (₹100) vs day_scholar (₹219 - Food Included)
  const [memberCategories, setMemberCategories] = useState<Record<number, MemberCategory>>({
    1: 'hosteller',
    2: 'hosteller',
    3: 'hosteller',
    4: 'hosteller',
    5: 'hosteller',
  });

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

  const [member5, setMember5] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    college: 'VIT Bhopal University',
    role: 'AI / System Engineer',
  });

  // Calculate total registration fee
  const calculateTotalFee = () => {
    let total = 0;
    for (let i = 1; i <= memberCount; i++) {
      const category = memberCategories[i] || 'hosteller';
      total += category === 'hosteller' ? 100 : 219;
    }
    return total;
  };

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
    const activeMembers = [
  { label: 'Member 02', data: member2, active: memberCount >= 2 },
  { label: 'Member 03', data: member3, active: memberCount >= 3 },
  { label: 'Member 04', data: member4, active: memberCount >= 4 },
  { label: 'Member 05', data: member5, active: memberCount >= 5 },
];

for (const m of activeMembers) {
  if (m.active && m.data.name.trim()) {
    if (!m.data.email.trim()) {
      setErrorMsg(`Please provide an email for ${m.label}.`);
      return;
    }
    if (!isVITBhopalEmail(m.data.email)) {
      setErrorMsg(`${m.label} must use an official @vitbhopal.ac.in email address.`);
      return;
    }
  }
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
        member5: memberCount >= 5 && member5.name.trim() ? member5 : undefined,
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

  const inputClass =
    'input-underline';

  const memberInputClass =
    'w-full bg-transparent border-b border-neutral-800 py-3 text-[14px] text-white placeholder:text-neutral-600 focus:border-orange-600 focus:outline-none transition-colors';

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
      {/* Header */}
      <div className="mb-12">
        {/* Deadline Notice Tag */}
        <div className="flex items-center gap-2 mb-3 text-[12px] font-mono uppercase tracking-wider text-orange-500 font-semibold">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
          <span>Last Date to Register: 2 September 2026</span>
          <span className="text-neutral-600 font-normal">|</span>
          <span className="text-neutral-400 font-normal normal-case tracking-normal">
            Registrations close strictly after deadline
          </span>
        </div>

        <span className="text-[13px] font-mono text-neutral-500 uppercase tracking-wider block mb-3">
          Team Registration
        </span>
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Register for ORIGIN '26
        </h1>
        <p className="text-[14px] text-neutral-400 leading-relaxed max-w-lg">
          Team Leader must use an <span className="text-white font-semibold">@vitbhopal.ac.in</span> email. 
          Register your team and be part of an exciting AI-driven hackathon experience!
        </p>
        <div className="mt-4 text-[13px] text-neutral-500">
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-orange-500 font-semibold hover:text-orange-400 cursor-pointer transition-colors"
          >
            Sign in to your team →
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-8 py-4 px-5 border border-red-900 bg-red-950/50 text-red-300 text-[13px] flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-16">
        {/* Step 1: Team & Track */}
        <div>
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-neutral-800">
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Team Profile
            </h3>
            <span className="text-[12px] font-mono text-neutral-600">Step 1 of 4</span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                Team Name <span className="text-orange-500">*</span>
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
              <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                Innovation Track <span className="text-orange-500">*</span>
              </label>
              <select
                id="reg-select-track"
                value={track}
                onChange={(e) => setTrack(e.target.value as TrackType)}
                className="w-full bg-transparent border-b border-neutral-700 py-3 text-[14px] text-white focus:border-orange-600 focus:outline-none transition-colors cursor-pointer"
              >
                {HACKATHON_TRACKS.map((t, idx) => (
                  <option key={idx} value={t.name} className="bg-black text-white">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-3">
                Team Size (2-5 Members)
              </label>
              <div className="grid grid-cols-4 gap-px bg-neutral-800">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMemberCount(num)}
                    className={`py-3 text-[13px] font-semibold transition-colors cursor-pointer ${
                      memberCount === num
                        ? 'bg-orange-600 text-white'
                        : 'bg-black text-neutral-400 hover:bg-neutral-950 hover:text-white'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {num === 2 ? '2 Duo' : num === 3 ? '3 Trio' : num === 4 ? '4 Squad' : '5 Team'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Leader Details */}
        <div>
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-neutral-800">
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Team Leader
            </h3>
            <span className="text-[12px] font-mono text-neutral-600">Step 2 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                Full Name <span className="text-orange-500">*</span>
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
              <label className="flex items-center justify-between text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                <span>Email <span className="text-orange-500">*</span></span>
                {domainNotice && (
                  <span className="text-[10px] text-orange-500 flex items-center gap-1 normal-case">
                    <CheckCircle className="w-3 h-3" /> Verified domain
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
              <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                Phone <span className="text-orange-500">*</span>
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
              <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
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
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-neutral-800">
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Teammates ({memberCount - 1})
              </h3>
              <span className="text-[12px] font-mono text-neutral-600">Step 3 of 4</span>
            </div>

            <div className="space-y-8">
              {memberCount >= 2 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-4">Member 02</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <input type="text" placeholder="Full Name" value={member2.name} onChange={(e) => setMember2({ ...member2, name: e.target.value })} className={memberInputClass} />
                    <input type="email" placeholder="Email" value={member2.email} onChange={(e) => setMember2({ ...member2, email: e.target.value })} className={memberInputClass} />
                    <input type="tel" placeholder="Phone" value={member2.phone} onChange={(e) => setMember2({ ...member2, phone: e.target.value })} className={`${memberInputClass} font-mono`} />
                  </div>
                </div>
              )}

              {memberCount >= 3 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-4">Member 03</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <input type="text" placeholder="Full Name" value={member3.name} onChange={(e) => setMember3({ ...member3, name: e.target.value })} className={memberInputClass} />
                    <input type="email" placeholder="Email" value={member3.email} onChange={(e) => setMember3({ ...member3, email: e.target.value })} className={memberInputClass} />
                    <input type="tel" placeholder="Phone" value={member3.phone} onChange={(e) => setMember3({ ...member3, phone: e.target.value })} className={`${memberInputClass} font-mono`} />
                  </div>
                </div>
              )}

              {memberCount >= 4 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-4">Member 04</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <input type="text" placeholder="Full Name" value={member4.name} onChange={(e) => setMember4({ ...member4, name: e.target.value })} className={memberInputClass} />
                    <input type="email" placeholder="Email" value={member4.email} onChange={(e) => setMember4({ ...member4, email: e.target.value })} className={memberInputClass} />
                    <input type="tel" placeholder="Phone" value={member4.phone} onChange={(e) => setMember4({ ...member4, phone: e.target.value })} className={`${memberInputClass} font-mono`} />
                  </div>
                </div>
              )}

              {memberCount >= 5 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-4">Member 05</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <input type="text" placeholder="Full Name" value={member5.name} onChange={(e) => setMember5({ ...member5, name: e.target.value })} className={memberInputClass} />
                    <input type="email" placeholder="Email" value={member5.email} onChange={(e) => setMember5({ ...member5, email: e.target.value })} className={memberInputClass} />
                    <input type="tel" placeholder="Phone" value={member5.phone} onChange={(e) => setMember5({ ...member5, phone: e.target.value })} className={`${memberInputClass} font-mono`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-neutral-800 gap-2">
            <div>
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Payment — Total ₹{calculateTotalFee()}
              </h3>
              <span className="text-[12px] font-mono text-neutral-400 block mt-1">
                Hosteller: ₹100 / member · Day Scholar: ₹219 / member (Food Included)
              </span>
            </div>
            <span className="text-[12px] font-mono text-neutral-600">Step 4 of 4</span>
          </div>

          {/* Member Fee Category Selector — Site theme matched */}
          <div className="mb-8 border-t border-b border-neutral-800 py-6 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[12px] font-mono text-neutral-500 uppercase tracking-wider">
                Registration Fee Breakdown ({memberCount} Members)
              </span>
              <span className="text-[13px] font-bold text-orange-500 font-mono">
                Total Payable: ₹{calculateTotalFee()}
              </span>
            </div>
            <div className="space-y-3">
              {Array.from({ length: memberCount }).map((_, idx) => {
                const mNum = idx + 1;
                const cat = memberCategories[mNum] || 'hosteller';
                const nameLabel =
                  mNum === 1
                    ? `Leader (${leader.name || 'Member 01'})`
                    : mNum === 2
                    ? `Member 02 (${member2.name || 'Member 02'})`
                    : mNum === 3
                    ? `Member 03 (${member3.name || 'Member 03'})`
                    : mNum === 4
                    ? `Member 04 (${member4.name || 'Member 04'})`
                    : `Member 05 (${member5.name || 'Member 05'})`;

                return (
                  <div key={mNum} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] border-b border-neutral-900 last:border-b-0 pb-2.5">
                    <span className="text-neutral-300 font-mono text-xs truncate max-w-xs">{nameLabel}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMemberCategories((prev) => ({ ...prev, [mNum]: 'hosteller' }))}
                        className={`px-3 py-1.5 text-[11px] font-mono tracking-wider uppercase transition-colors cursor-pointer border ${
                          cat === 'hosteller'
                            ? 'bg-orange-600 text-white font-semibold border-orange-500'
                            : 'bg-black text-neutral-500 border-neutral-800 hover:text-neutral-300'
                        }`}
                      >
                        Hosteller (₹100)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemberCategories((prev) => ({ ...prev, [mNum]: 'day_scholar' }))}
                        className={`px-3 py-1.5 text-[11px] font-mono tracking-wider uppercase transition-colors cursor-pointer border ${
                          cat === 'day_scholar'
                            ? 'bg-orange-600 text-white font-semibold border-orange-500'
                            : 'bg-black text-neutral-500 border-neutral-800 hover:text-neutral-300'
                        }`}
                      >
                        Day Scholar (₹219 - Food Included)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* QR Code */}
            <div className="space-y-4">
              <div className="bg-white p-6 flex flex-col items-center">
                <QrCode className="w-32 h-32 text-black" />
                <span className="text-[11px] font-mono text-neutral-600 mt-3">dsc.origin26@upi</span>
              </div>
              <div className="text-[12px] text-neutral-500 font-mono space-y-1">
                <p>• UPI ID: <span className="text-white">dsc.origin26@upi</span></p>
                <p>• Amount to Pay: <span className="text-orange-400 font-bold">₹{calculateTotalFee()}</span></p>
                <p>• Covers: Hackathon entry (4-5 Sep), cloud credits, swag kit, food (for Day Scholars)</p>
              </div>
            </div>

            {/* UTR + Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  Transaction Ref (UTR) <span className="text-orange-500">*</span>
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
                <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-3">
                  Payment Screenshot
                </label>
                <div className="relative border border-dashed border-neutral-700 hover:border-neutral-500 p-8 text-center cursor-pointer transition-colors">
                  <input
                    id="reg-input-payment-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 mx-auto text-neutral-500 mb-2" />
                  <span className="text-[13px] text-neutral-400 block">
                    {isUploadingImage
                      ? 'Uploading...'
                      : paymentImageName
                      ? paymentImageName
                      : 'Drop or click to upload (max 10MB)'}
                  </span>
                </div>

                {paymentProofUrl && (
                  <div className="mt-3 flex items-center gap-3 py-3 border-b border-neutral-800">
                    <img
                      src={paymentProofUrl}
                      alt="Payment Preview"
                      className="w-10 h-10 object-cover"
                    />
                    <div className="text-[13px]">
                      <span className="text-orange-500 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Uploaded successfully
                      </span>
                      <span className="text-neutral-500 text-[11px]">Admin will verify for pass release</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification notice */}
        <div className="py-4 px-5 border border-neutral-800 text-[13px] text-neutral-400">
          <span className="text-white font-semibold">Note: </span>
          Your status will be set to <span className="font-mono text-orange-500">pending</span> until 
          DSC Admins verify your payment. Your Digital ID Pass unlocks after approval.
        </div>

        {/* Agreement */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="reg-checkbox-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 w-4 h-4 accent-orange-600 bg-transparent border-neutral-600"
          />
          <span className="text-[13px] text-neutral-400 leading-relaxed">
            I agree to the <span className="text-white font-semibold">Origin Hackathon Rules</span> & Code of Conduct. 
            I confirm the leader uses @vitbhopal.ac.in and acknowledge that passes unlock upon admin verification.
          </span>
        </label>

        {/* Submit */}
        <button
          id="reg-btn-submit-team"
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[15px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : (
            <>
              <span>Submit Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
