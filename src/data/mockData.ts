import { Team, Announcement, TrackType } from '../types';

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
    detail: 'Teams can have between 1 to 4 members. Cross-specialization (Data Science + Fullstack + Design) is encouraged.',
  },
  {
    title: 'Original Code & Verification',
    detail: 'All project code must be authored during the 24-hour hackathon window. Open-source libraries and APIs are permitted with proper attribution.',
  },
  {
    title: 'Mandatory Deliverables',
    detail: 'Teams must submit: Public GitHub repository with README, Live working demo / deployment URL, and a 3-minute pitch deck (PDF/PPT).',
  },
  {
    title: 'On-Site / Overnight Attendance',
    detail: 'All team members must carry their verified Digital ID Badge and government/college ID card for physical gate pass and food token distribution.',
  },
  {
    title: 'Mentoring Checkpoints',
    detail: 'Attendance at Mentoring Round 1 (Hour 06) and Mentoring Round 2 (Hour 14) is mandatory for jury evaluation bonus points.',
  },
  {
    title: 'Code of Conduct & Ethics',
    detail: 'Zero tolerance for plagiarism, harassment, or unethical AI scraping. Respect fellow hackers, mentors, and lab infrastructure.',
  },
];

export const HACKATHON_SCHEDULE = [
  { time: '09:00 AM', title: 'Check-in & Digital Badge Scan', desc: 'Arrive at Tech Block Auditorium, collect hacker kits & verify passes.', phase: 'past' },
  { time: '10:30 AM', title: 'Opening Ceremony & Track Briefing', desc: 'Keynote by DSC Lead, Problem statements reveal & Mentor introductions.', phase: 'past' },
  { time: '11:00 AM', title: 'HACKING COMMENCES (Hour 0)', desc: '24-hour sprint begins! Cloud credits activated.', phase: 'active' },
  { time: '02:00 PM', title: 'Lunch & Quick Sync', desc: 'Fuel up at cafeteria. DSC Helpdesk available.', phase: 'upcoming' },
  { time: '05:30 PM', title: 'Mentoring Round 1 (Idea & Arch)', desc: 'Industry mentors review system architectures & data pipelines.', phase: 'upcoming' },
  { time: '09:00 PM', title: 'Dinner & Midnight Energy Snacks', desc: 'Dinner served followed by RedBull & coffee station open all night.', phase: 'upcoming' },
  { time: '01:30 AM', title: 'Midnight Gaming & Mini-Challenges', desc: 'Relax with quick CS:GO / Mario Kart mini-tournaments.', phase: 'upcoming' },
  { time: '06:00 AM', title: 'Mentoring Round 2 (Code & MVP)', desc: 'Mock jury trial run and deployment assistance.', phase: 'upcoming' },
  { time: '08:30 AM', title: 'Breakfast & Final Sprint', desc: 'Morning coffee & final bug squash sprint.', phase: 'upcoming' },
  { time: '11:00 AM', title: 'CODE FREEZE & SUBMISSION DEADLINE', desc: 'Portal submissions lock strictly at 11:00 AM.', phase: 'upcoming' },
  { time: '12:00 PM', title: 'Live Pitching to Jury Panel', desc: 'Top shortlisted teams pitch live in front of the judging panel.', phase: 'upcoming' },
  { time: '03:30 PM', title: 'Grand Awards & Closing Ceremony', desc: 'Trophies, cash prize pool of ₹1,50,000, internship offers & swag distribution.', phase: 'upcoming' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_TEAMS: Team[] = [];
