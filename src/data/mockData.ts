import { Team, Announcement, TrackType } from '../types';

export const EXTERNAL_REGISTRATION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdE-ru_d41tfCA_KMdyWwsH95k0InD9TCLpGVJ8CYt5RE14xg/viewform';

export const HACKATHON_TRACKS: { name: TrackType; icon: string; description: string; color: string }[] = [
  {
    name: 'AI & Machine Learning',
    icon: 'BrainCircuit',
    description: 'Generative AI, Agentic Workflows, Computer Vision, predictive models & automated data intelligence.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Web3 & Blockchain',
    icon: 'Blocks',
    description: 'Decentralized Finance, Zero-Knowledge verification, smart contracts & verifiable data governance.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    name: 'FinTech & Cybersecurity',
    icon: 'ShieldCheck',
    description: 'Fraud detection algorithms, threat mitigation, secure payment gateways & algorithmic trading.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'HealthTech & BioInformatics',
    icon: 'Activity',
    description: 'AI medical diagnostics, genetic sequencing analysis, patient tracking & remote healthcare.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    name: 'Smart City & IoT',
    icon: 'Cpu',
    description: 'Urban mobility sensors, grid optimization, disaster response networks & smart agriculture.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Open Innovation & Social Impact',
    icon: 'Sparkles',
    description: 'Disruptive solutions for environmental sustainability, accessibility, and high-impact human problems.',
    color: 'from-violet-500 to-fuchsia-600',
  },
];

export const HACKATHON_RULES = [
  {
    title: 'Team Composition',
    detail: 'Teams can have between 2 to 5 members. Cross-specialization (Data Science + Fullstack + Design) is encouraged.',
  },
  {
    title: 'Original Code & Verification',
    detail: 'All project code must be authored during the 18-hour hackathon window (4 Sep 6:00 PM – 5 Sep 12:00 PM). Open-source libraries and APIs are permitted with proper attribution.',
  },
  {
    title: 'Mandatory Deliverables',
    detail: 'Teams must submit: Public GitHub repository with README, Live working demo / deployment URL, and a 3-minute pitch deck (PDF/PPT).',
  },
  {
    title: 'On-Site Attendance',
    detail: 'All team members must carry their verified Digital ID Badge and college ID card for venue entry at AB02 Auditorium 1 & Auditorium 2.',
  },
  {
    title: 'Mentoring & Evaluation',
    detail: 'Live pitch presentations and evaluation will take place between 9:00 AM – 11:00 AM on 5 September by Shreyians Coding Academy judges.',
  },
  {
    title: 'Code of Conduct & Ethics',
    detail: 'Zero tolerance for plagiarism, harassment, or unethical AI scraping. Respect fellow hackers, mentors, and venue infrastructure.',
  },
];

export const HACKATHON_SCHEDULE = [
  { time: '6:00 – 6:30 PM', title: 'Inauguration', desc: 'Opening ceremony, keynotes, and welcoming all participants at AB02 Auditorium 1 & 2.', phase: 'past' },
  { time: '6:30 PM', title: 'Problem Statement Reveal', desc: 'Official release of innovation track problem statements and hacking kick-off.', phase: 'active' },
  { time: '7:30 – 8:30 PM', title: 'Dinner Break', desc: 'Dinner break for all registered hackers and mentors.', phase: 'upcoming' },
  { time: '8:30 PM – 9:00 AM', title: 'Development & Hacking', desc: 'Overnight 12.5-hour continuous hacking sprint. Mentors, coffee, and energy stations active.', phase: 'upcoming' },
  { time: '9:00 – 11:00 AM', title: 'Evaluation', desc: 'Live team demos and evaluation by Sheryians Coding Academy judges.', phase: 'upcoming' },
  { time: '11:00 AM – 12:00 PM', title: 'Prize Distribution & Closing', desc: 'Grand awards ceremony, trophy distribution (₹15,000 cash pool + ₹50,000+ goodies), and wrap-up.', phase: 'upcoming' },
];

export const DEFAULT_SUBMISSION_DEADLINE = '2026-08-26T11:00:00+05:30';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_TEAMS: Team[] = [];

