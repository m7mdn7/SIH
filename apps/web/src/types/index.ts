export type Role = 'Citizen' | 'Government' | 'University' | 'Industry';
export type GovLevel = 'State' | 'District';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  department?: string;
  level?: GovLevel;
  district?: string;
}

export type ProblemStatus = 'Reported' | 'Analyzing' | 'Validated' | 'Matched' | 'In Progress' | 'Resolved';

export type ProblemCategory = 'Disaster Management' | 'Agriculture' | 'Healthcare' | 'Education' | 'Infrastructure' | 'Water Management';

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedPopulation: number;
  location: { lat: number; lng: number; address: string };
  photoUrl?: string;
  reporterId: string;
  reporterName: string;
  status: ProblemStatus;
  createdAt: string;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  classification: string;
  severityScore: number;
  priorityScore: number;
  requiredExpertise: string[];
  suggestedSolutions: string[];
  duplicateRisk: number; // 0-100%
  summary: string;
}

export interface UniversityMatch {
  universityId: string;
  name: string;
  matchPercentage: number;
  relevantExpertise: string[];
  pastProjectsSuccessRate: number;
}

export interface Milestone {
  id: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface Project {
  id: string;
  problemId: string;
  title: string;
  universityId: string;
  universityName: string;
  industryPartners: { id: string; name: string; contributionType: string }[];
  milestones: Milestone[];
  currentPhase: 'Analysis' | 'Design' | 'Prototype' | 'Field Testing' | 'Deployment';
  progress: number; // 0-100
  teamMembers: { name: string; role: string }[];
}

export interface GovStats {
  totalChallenges: number;
  criticalChallenges: number;
  activeProjects: number;
  solvedChallenges: number;
  participation: {
    universities: number;
    industries: number;
    citizens: number;
  }
}
