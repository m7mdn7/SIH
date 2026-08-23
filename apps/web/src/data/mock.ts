import { Problem, Project, GovStats, UniversityMatch, User } from '../types';

export const mockUsers: User[] = [
  { id: 'USR-GOV-01', username: 'state_admin', name: 'Rajesh Kumar', role: 'Government', department: 'IT Department', level: 'State' },
  { id: 'USR-GOV-02', username: 'district_ranchi', name: 'Sanjay Sinha', role: 'Government', department: 'District Administration', level: 'District', district: 'Ranchi' },
  { id: 'USR-UNI-01', username: 'iit_ism_admin', name: 'Dr. A. Sharma', role: 'University', department: 'Innovation Cell' },
  { id: 'USR-IND-01', username: 'tata_csr', name: 'Priya Patel', role: 'Industry', department: 'CSR Division' },
  { id: 'USR-CIT-01', username: 'citizen_demo', name: 'Anil Kumar', role: 'Citizen' },
];

export const mockProblems: Problem[] = [
  {
    id: 'PRB-001',
    title: 'Heavy rainfall has flooded village and damaged connecting bridge',
    description: 'Continuous downpour for the last 48 hours has caused the local river to overflow. The main bridge connecting Ramgarh to the nearby highway is structurally damaged and impassable.',
    category: 'Disaster Management',
    severity: 'Critical',
    affectedPopulation: 4500,
    location: { lat: 23.6331, lng: 85.5149, address: 'Ramgarh District, Jharkhand' },
    photoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=800',
    reporterId: 'USR-01',
    reporterName: 'Anil Kumar',
    status: 'Reported',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PRB-002',
    title: 'Contaminated drinking water causing localized illness',
    description: 'The primary well in the eastern block is showing signs of arsenic contamination. Several residents have reported stomach issues.',
    category: 'Water Management',
    severity: 'High',
    affectedPopulation: 1200,
    location: { lat: 23.3441, lng: 85.3096, address: 'Ranchi Outskirts, Jharkhand' },
    reporterId: 'USR-02',
    reporterName: 'Sunita Devi',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    aiAnalysis: {
      classification: 'Water Management -> Contamination',
      severityScore: 85,
      priorityScore: 90,
      requiredExpertise: ['Environmental Engineering', 'Public Health', 'Water Testing'],
      suggestedSolutions: ['Deploy portable water filtration units', 'Conduct extensive groundwater survey'],
      duplicateRisk: 15,
      summary: 'High risk of waterborne disease spread. Immediate alternative water source needed.'
    }
  },
  {
    id: 'PRB-003',
    title: 'Elephants destroying crops near forest border',
    description: 'A herd of wild elephants is frequently entering agricultural lands, destroying months of crops.',
    category: 'Agriculture',
    severity: 'Medium',
    affectedPopulation: 300,
    location: { lat: 23.8998, lng: 86.4420, address: 'Dhanbad District, Jharkhand' },
    reporterId: 'USR-03',
    reporterName: 'Ramesh Singh',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  }
];

export const mockAiAnalysisForPrb001 = {
  classification: 'Disaster Management -> Flood & Infrastructure',
  severityScore: 95,
  priorityScore: 98,
  requiredExpertise: ['Civil Engineering', 'GIS', 'IoT', 'AI/ML', 'Hydrology'],
  suggestedSolutions: [
    'AI-powered flood early-warning system using IoT water level sensors',
    'Rapid deployable pontoon bridge for temporary access',
    'Drone-based structural integrity assessment'
  ],
  duplicateRisk: 8,
  summary: 'Critical infrastructure failure isolating a significant population. Requires immediate multidisciplinary intervention for temporary relief and long-term structural repair.'
};

export const mockUniversityMatches: UniversityMatch[] = [
  {
    universityId: 'UNI-01',
    name: 'IIT (ISM) Dhanbad',
    matchPercentage: 94,
    relevantExpertise: ['Civil Engineering', 'AI/ML', 'Hydrology'],
    pastProjectsSuccessRate: 92
  },
  {
    universityId: 'UNI-02',
    name: 'BIT Mesra, Ranchi',
    matchPercentage: 88,
    relevantExpertise: ['IoT', 'GIS', 'Remote Sensing'],
    pastProjectsSuccessRate: 85
  },
  {
    universityId: 'UNI-03',
    name: 'NIT Jamshedpur',
    matchPercentage: 81,
    relevantExpertise: ['Structural Engineering', 'Material Science'],
    pastProjectsSuccessRate: 78
  }
];

export const mockProjects: Project[] = [
  {
    id: 'PROJ-001',
    problemId: 'PRB-002',
    title: 'Arsenic Remediation and Safe Water Supply',
    universityId: 'UNI-02',
    universityName: 'BIT Mesra, Ranchi',
    industryPartners: [
      { id: 'IND-01', name: 'Tata Steel Foundation', contributionType: 'Funding & Materials' }
    ],
    currentPhase: 'Prototype',
    progress: 60,
    teamMembers: [
      { name: 'Dr. A. Sharma', role: 'Faculty Lead' },
      { name: 'Priya K.', role: 'Env. Eng. Student' },
      { name: 'Rahul M.', role: 'IoT Specialist' }
    ],
    milestones: [
      { id: 'M1', title: 'Site Analysis & Testing', status: 'Completed', dueDate: '2023-10-01' },
      { id: 'M2', title: 'Filtration System Design', status: 'Completed', dueDate: '2023-10-15' },
      { id: 'M3', title: 'Prototype Development', status: 'In Progress', dueDate: '2023-11-10' },
      { id: 'M4', title: 'Field Testing', status: 'Pending', dueDate: '2023-12-01' },
      { id: 'M5', title: 'Deployment', status: 'Pending', dueDate: '2024-01-15' }
    ]
  }
];

export const mockGovStats: GovStats = {
  totalChallenges: 1245,
  criticalChallenges: 18,
  activeProjects: 342,
  solvedChallenges: 856,
  participation: {
    universities: 12,
    industries: 45,
    citizens: 15400
  }
};
