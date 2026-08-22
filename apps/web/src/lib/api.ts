import axios from 'axios';
import { Challenge, ChallengeAIAnalysis, InnovationGap, ChallengeAssignment, Project, ProjectMilestone } from '@siip/types';

const API_BASE_URL = 'http://localhost:4000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('siip_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    login: async (credentials: any) => {
      const res = await client.post('/auth/login', credentials);
      if (res.data.token) {
        localStorage.setItem('siip_token', res.data.token);
        localStorage.setItem('siip_user', JSON.stringify(res.data.user));
      }
      return res.data;
    },
    register: async (data: any) => {
      const res = await client.post('/auth/register', data);
      if (res.data.token) {
        localStorage.setItem('siip_token', res.data.token);
        localStorage.setItem('siip_user', JSON.stringify(res.data.user));
      }
      return res.data;
    },
    logout: () => {
      localStorage.removeItem('siip_token');
      localStorage.removeItem('siip_user');
    },
    getCurrentUser: () => {
      const u = localStorage.getItem('siip_user');
      return u ? JSON.parse(u) : null;
    }
  },
  challenges: {
    list: async (): Promise<Challenge[]> => {
      const res = await client.get('/challenges');
      return res.data;
    },
    get: async (id: string): Promise<Challenge> => {
      const res = await client.get(`/challenges/${id}`);
      return res.data;
    },
    create: async (data: Partial<Challenge>): Promise<Challenge> => {
      const res = await client.post('/challenges', data);
      return res.data;
    },
    analyze: async (id: string): Promise<ChallengeAIAnalysis> => {
      const res = await client.post(`/challenges/${id}/analyze`);
      return res.data;
    },
    getSimilar: async (id: string): Promise<Challenge[]> => {
      const res = await client.get(`/challenges/${id}/similar`);
      return res.data;
    },
    gapAnalysis: async (id: string): Promise<InnovationGap> => {
      const res = await client.post(`/challenges/${id}/gap-analysis`);
      return res.data;
    },
    matches: async (id: string): Promise<ChallengeAssignment[]> => {
      const res = await client.get(`/challenges/${id}/matches`);
      return res.data;
    }
  },
  assignments: {
    accept: async (id: string): Promise<any> => {
      const res = await client.post(`/assignments/${id}/accept`);
      return res.data;
    }
  },
  projects: {
    list: async (): Promise<Project[]> => {
      const res = await client.get('/projects');
      return res.data;
    },
    milestones: async (projectId: string): Promise<ProjectMilestone[]> => {
      const res = await client.get(`/projects/${projectId}/milestones`);
      return res.data;
    },
    completeMilestone: async (milestoneId: string, evidence: string): Promise<ProjectMilestone> => {
      const res = await client.post(`/project-milestones/${milestoneId}/complete`, { evidence });
      return res.data;
    }
  },
  analytics: {
    overview: async () => {
      const res = await client.get('/analytics/overview');
      return res.data;
    }
  }
};
export default api;
