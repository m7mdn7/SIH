export type UserRole = 'citizen' | 'university_admin' | 'government_admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  universityId?: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  status: string; // 'open' | 'analyzing' | 'analyzed' | 'assigned' | 'in_progress' | 'completed'
  createdBy: string;
  createdAt: string;
}

export interface ChallengeAIAnalysis {
  id: string;
  challengeId: string;
  domain: string;
  subdomain: string;
  problemType: string;
  severity: string;
  affectedPopulation: string;
  scale: string;
  keyFactors: string[];
  missingInformation: string[];
  confidence: number;
}

export interface InnovationGap {
  id: string;
  challengeId: string;
  gapType: 'research' | 'technology' | 'adaptation' | 'data' | 'expertise';
  description: string;
  rationale: string;
  recommendedAction: string;
  requiredExpertise: string[];
  confidence: number;
}

export interface University {
  id: string;
  name: string;
  district: string;
  description: string;
  expertiseTags?: string[];
}

export interface ChallengeAssignment {
  id: string;
  challengeId: string;
  universityId: string;
  universityName?: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress';
}

export interface Project {
  id: string;
  challengeId: string;
  universityId: string;
  title: string;
  description: string;
  status: string; // 'in_progress' | 'completed'
  facultyLead: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'complete';
  evidence?: string;
}
