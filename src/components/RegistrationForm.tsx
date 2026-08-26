import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  QrCode,
  User,
} from 'lucide-react';
import { TrackType, Team, TeamMember } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
import { isVITBhopalEmail } from '../lib/clerk';
import { uploadDirectToImagekit } from '../lib/imagekitClient';

export const MESS_OPTIONS = [
  'Anchor (Boys)',
  'RPL (Boys)',
  'Safal (Boys)',
  'JMB (Boys)',
  'Mayuri (Boys)',
  'AB Catering (Girls-Block 1)',
  'Mayuri (Girls-Block 2)',
  'Mayuri (Special Block-Girls)',
  'NA (for day scholars)',
];

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
  const [memberCount, setMemberCount] = useState<number>(2);

  const [leader, setLeader] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
    college: 'VIT Bhopal University',
    role: 'Team Lead',
  });

  const [member2, setMember2] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
    college: 'VIT Bhopal University',
    role: 'Member',
  });

  const [member3, setMember3] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
    college: 'VIT Bhopal University',
    role: 'Member',
  });

  const [member4, setMember4] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
    college: 'VIT Bhopal University',
    role: 'Member',
  });

  const [member5, setMember5] = useState<TeamMember>({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
    college: 'VIT Bhopal University',
    role: 'Member',
  });

  const updateMember = (
    setter: React.Dispatch<React.SetStateAction<TeamMember>>,
    field: keyof TeamMember,
    val: string
  ) => {
    setter((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'residentialStatus') {
        if (val === 'Day Scholar') {
          updated.messName = 'NA (for day scholars)';
        } else if (val === 'Hosteller' && updated.messName === 'NA (for day scholars)') {
          updated.messName = 'Anchor (Boys)';
        }
      }
      return updated;
    });
  };

  // Fee calculation: ₹100 for Hosteller, ₹219 for Day Scholar (food included)
  const calculateTotalFee = () => {
    let total = 0;
    const members = [leader, member2, member3, member4, member5];
    for (let i = 0; i < memberCount; i++) {
      const status = members[i]?.residentialStatus || 'Hosteller';
      total += status === 'Hosteller' ? 100 : 219;
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

  const [isRegistrationsOpen, setIsRegistrationsOpen] = useState(true);

  React.useEffect(() => {
    fetch('/api/admin/registrations-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.registrationsOpen === 'boolean') {
          setIsRegistrationsOpen(data.registrationsOpen);
        }
      })
      .catch(() => {});
  }, []);

  const handleLeaderEmailChange = (val: string) => {
    updateMember(setLeader, 'email', val);
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

    if (!isRegistrationsOpen) {
      setErrorMsg('Registrations are currently closed by the organizers.');
      return;
    }

    if (!teamName.trim()) {
      setErrorMsg('Please enter your Team Name.');
      return;
    }

    if (
      !leader.name.trim() ||
      !leader.email.trim() ||
      !leader.phone.trim() ||
      !leader.registrationNumber?.trim()
    ) {
      setErrorMsg('Please provide complete Team Leader details (Name, Email, Phone, Registration Number).');
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
      if (m.active) {
        if (!m.data.name.trim() || !m.data.email.trim() || !m.data.registrationNumber?.trim()) {
          setErrorMsg(`Please fill in all details for ${m.label} (Name, Email, Registration Number).`);
          return;
        }
        if (!isVITBhopalEmail(m.data.email)) {
          setErrorMsg(`${m.label} must use an official @vitbhopal.ac.in email address.`);
          return;
        }
        if (!m.data.residentialStatus || !m.data.messName) {
          setErrorMsg(`Please select ${m.label} Residential Status and Mess Name.`);
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
        member2: memberCount >= 2 ? member2 : undefined,
        member3: memberCount >= 3 ? member3 : undefined,
        member4: memberCount >= 4 ? member4 : undefined,
        member5: memberCount >= 5 ? member5 : undefined,
        transactionRef: transactionRef.trim(),
        paymentProofUrl: paymentProofUrl || '',
        amountPaid: calculateTotalFee(),
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

  const inputClass = 'input-underline';
  const selectClass =
    'w-full bg-black border-b border-neutral-800 py-3 text-[14px] text-white focus:border-orange-500 focus:outline-none transition-colors cursor-pointer font-mono';

  const renderMemberFormFields = (
    member: TeamMember,
    setter: React.Dispatch<React.SetStateAction<TeamMember>>,
    isLeader: boolean = false,
    memberLabel: string = 'Team Lead'
  ) => {
    return (
      <div className="bg-black/60 border border-neutral-800 p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            <h4
              className="text-base font-bold text-white uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {memberLabel}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 uppercase">
            {member.residentialStatus === 'Day Scholar'
              ? 'Day Scholar (₹219 - Food Included)'
              : 'Hosteller (₹100)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
              Full Name <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={member.name}
              onChange={(e) => updateMember(setter, 'name', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Email ID */}
          <div>
            <label className="flex items-center justify-between text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
              <span>Email ID <span className="text-orange-500">*</span></span>
              {isLeader && domainNotice && (
                <span className="text-[10px] text-orange-500 flex items-center gap-1 normal-case">
                  <CheckCircle className="w-3 h-3" /> Verified domain
                </span>
              )}
            </label>
            <input
              type="email"
              required
              placeholder="name.2024@vitbhopal.ac.in"
              value={member.email}
              onChange={(e) =>
                isLeader ? handleLeaderEmailChange(e.target.value) : updateMember(setter, 'email', e.target.value)
              }
              className={inputClass}
            />
          </div>

          {/* Contact Phone (Required for Leader) */}
          {isLeader && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
                Contact Number (Phone) <span className="text-orange-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={member.phone}
                onChange={(e) => updateMember(setter, 'phone', e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
          )}

          {/* Registration Number */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
              Registration Number <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 24BCE10001"
              value={member.registrationNumber || ''}
              onChange={(e) => updateMember(setter, 'registrationNumber', e.target.value.toUpperCase())}
              className={`${inputClass} font-mono uppercase`}
            />
          </div>

          {/* Residential Status */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Residential Status <span className="text-orange-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateMember(setter, 'residentialStatus', 'Hosteller')}
                className={`py-2 px-3 text-xs font-mono tracking-wider uppercase transition-colors border cursor-pointer ${
                  member.residentialStatus === 'Hosteller'
                    ? 'bg-orange-600 text-white font-bold border-orange-500'
                    : 'bg-black text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Hosteller (₹100)
              </button>
              <button
                type="button"
                onClick={() => updateMember(setter, 'residentialStatus', 'Day Scholar')}
                className={`py-2 px-3 text-xs font-mono tracking-wider uppercase transition-colors border cursor-pointer ${
                  member.residentialStatus === 'Day Scholar'
                    ? 'bg-orange-600 text-white font-bold border-orange-500'
                    : 'bg-black text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Day Scholar (₹219)
              </button>
            </div>
          </div>

          {/* Mess Name */}
          <div className={isLeader ? '' : 'sm:col-span-2'}>
            <label className="block text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
              Enter your mess name <span className="text-orange-500">*</span>
            </label>
            <select
              value={member.messName || 'Anchor (Boys)'}
              disabled={member.residentialStatus === 'Day Scholar'}
              onChange={(e) => updateMember(setter, 'messName', e.target.value)}
              className={selectClass}
            >
              {MESS_OPTIONS.map((opt, idx) => (
                <option key={idx} value={opt} className="bg-black text-white">
                  {opt}
                </option>
              ))}
            </select>
            {member.residentialStatus === 'Day Scholar' && (
              <span className="text-[11px] font-mono text-neutral-500 mt-1 block">
                Auto-selected NA for Day Scholars.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
      {/* Header */}
      <div className="mb-12">
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
          Team Lead and Teammates must use an official <span className="text-white font-semibold">@vitbhopal.ac.in</span> email. 
          Fill out complete details for all members to unlock team credentials.
        </p>
        <div className="mt-4 text-[13px] text-neutral-500 font-mono">
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-orange-500 font-semibold hover:text-orange-400 cursor-pointer transition-colors"
          >
            Sign in to your team →
          </button>
        </div>
      </div>

      {/* Closed Registration Warning */}
      {!isRegistrationsOpen && (
        <div className="mb-8 p-5 border border-rose-800 bg-rose-950/60 text-rose-200 space-y-1 font-mono text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>REGISTRATIONS PAUSED / CLOSED</span>
          </div>
          <p className="text-neutral-300 font-sans text-[13px]">
            The event organizers have temporarily stopped taking new team registrations. Please check back later or contact the Data Science Club.
          </p>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="mb-8 py-4 px-5 border border-red-900 bg-red-950/50 text-red-300 text-[13px] flex items-center gap-3 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
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
                Team Size (2-5 Members) <span className="text-orange-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-px bg-neutral-800 border border-neutral-800">
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
                    {num} Members
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Team Lead */}
        <div>
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-neutral-800">
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Team Lead Details
            </h3>
            <span className="text-[12px] font-mono text-neutral-600">Step 2 of 4</span>
          </div>

          {renderMemberFormFields(leader, setLeader, true, 'Team Lead')}
        </div>

        {/* Step 3: Teammates */}
        {memberCount > 1 && (
          <div>
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-neutral-800">
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Teammates Details ({memberCount - 1})
              </h3>
              <span className="text-[12px] font-mono text-neutral-600">Step 3 of 4</span>
            </div>

            <div className="space-y-6">
              {memberCount >= 2 && renderMemberFormFields(member2, setMember2, false, 'Member 2')}
              {memberCount >= 3 && renderMemberFormFields(member3, setMember3, false, 'Member 3')}
              {memberCount >= 4 && renderMemberFormFields(member4, setMember4, false, 'Member 4')}
              {memberCount >= 5 && renderMemberFormFields(member5, setMember5, false, 'Member 5')}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* QR Code */}
            <div className="space-y-4">
              <div className="bg-white p-4 flex flex-col items-center border border-neutral-800">
                <img
                  src="/qr.png"
                  alt="Origin '26 Payment QR Code"
                  className="w-56 h-auto object-contain"
                />
                <span className="text-[12px] font-mono text-black font-bold mt-2">datascienceclub1@indianbnk</span>
              </div>
              <div className="text-[12px] text-neutral-400 font-mono space-y-1.5 bg-neutral-950 p-4 border border-neutral-800">
                <p>• UPI ID: <span className="text-orange-400 font-bold select-all">datascienceclub1@indianbnk</span></p>
                <p>• Total Payable: <span className="text-white font-bold">₹{calculateTotalFee()}</span></p>
                <p className="text-[11px] text-neutral-500">• Covers: Hackathon entry (4-5 Sep), cloud credits, swag kit, food (for Day Scholars)</p>
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
                  <span className="text-[13px] text-neutral-400 block font-mono">
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
                      <span className="text-orange-500 font-medium flex items-center gap-1 font-mono">
                        <CheckCircle className="w-3.5 h-3.5" /> Uploaded successfully
                      </span>
                      <span className="text-neutral-500 text-[11px] font-mono">Admin will verify for pass release</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification notice */}
        <div className="py-4 px-5 border border-neutral-800 text-[13px] text-neutral-400 font-mono">
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
            I confirm all member emails use @vitbhopal.ac.in and acknowledge that passes unlock upon admin verification.
          </span>
        </label>

        {/* Submit */}
        <button
          id="reg-btn-submit-team"
          type="submit"
          disabled={isSubmitting || isUploadingImage || !isRegistrationsOpen}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[15px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : !isRegistrationsOpen ? (
            <span>Registrations Closed</span>
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
