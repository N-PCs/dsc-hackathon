export type TrackType =
  | 'AI & Machine Learning'
  | 'Web3 & Blockchain'
  | 'FinTech & Cybersecurity'
  | 'HealthTech & BioInformatics'
  | 'Smart City & IoT'
  | 'Open Innovation & Social Impact';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  role?: string;
  college?: string;
}

export interface ProjectSubmission {
  title: string;
  tagline: string;
  problemStatement: string;
  solutionDescription: string;
  track: TrackType;
  techStack: string[];
  githubUrl: string;
  deploymentUrl?: string;
  presentationUrl?: string;
  videoUrl?: string;
  architectureDiagramUrl?: string;
  submittedAt: string;
  score?: {
    innovation: number;
    technicalComplexity: number;
    uiUx: number;
    presentation: number;
    impact: number;
    feedback?: string;
    total: number;
  };
}

export interface Team {
  id: string; // e.g. "ORIGIN-1042"
  teamName: string;
  accessCode: string; // 4-6 digit pin for team login & project submission
  track: TrackType;
  leader: TeamMember;
  member2?: TeamMember;
  member3?: TeamMember;
  member4?: TeamMember;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string; // base64 or receipt image URL
  transactionRef: string;
  registeredAt: string;
  checkedInVenue: boolean;
  ticketIssued: boolean;
  project?: ProjectSubmission;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'urgent' | 'schedule' | 'food' | 'mentorship' | 'general';
  timestamp: string;
  sender: string;
}

export interface HackathonStats {
  totalTeams: number;
  verifiedTeams: number;
  pendingTeams: number;
  totalParticipants: number;
  submittedProjects: number;
  checkedInTeams: number;
  trackCounts: Record<TrackType, number>;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'Superadmin' | 'Lead Organizer' | 'Jury Chair' | 'Operations Lead' | 'Faculty Advisor';
  addedAt?: string;
  department?: string;
}
