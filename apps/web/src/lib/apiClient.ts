import axios from 'axios';
import { Challenge, ChallengeAIAnalysis, InnovationGap, ChallengeAssignment, Project, ProjectMilestone } from '@siip/types';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:4000/api/v1';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach Bearer token to protected requests
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('siip_token') || localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  auth: {
    login: async (credentials: any) => {
      const res = await httpClient.post('/auth/login', credentials);
      const data = res.data.data || res.data;
      if (data.token || res.data.token) {
        const token = data.token || res.data.token;
        const user = data.user || res.data.user;
        localStorage.setItem('siip_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('siip_user', JSON.stringify(user));
      }
      return res.data;
    },
    register: async (data: any) => {
      const res = await httpClient.post('/auth/register', data);
      const resData = res.data.data || res.data;
      if (resData.token || res.data.token) {
        const token = resData.token || res.data.token;
        const user = resData.user || res.data.user;
        localStorage.setItem('siip_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('siip_user', JSON.stringify(user));
      }
      return res.data;
    },
    logout: () => {
      localStorage.removeItem('siip_token');
      localStorage.removeItem('token');
      localStorage.removeItem('siip_user');
    },
    getCurrentUser: () => {
      const u = localStorage.getItem('siip_user');
      return u ? JSON.parse(u) : null;
    }
  },
  challenges: {
    list: async (): Promise<Challenge[]> => {
      const res = await httpClient.get('/challenges');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    },
    get: async (id: string): Promise<Challenge> => {
      const res = await httpClient.get(`/challenges/${id}`);
      return res.data.data || res.data;
    },
    create: async (data: Partial<Challenge>): Promise<Challenge> => {
      const res = await httpClient.post('/challenges', data);
      return res.data.data || res.data;
    },
    analyze: async (id: string): Promise<ChallengeAIAnalysis> => {
      const res = await httpClient.post(`/challenges/${id}/analyze`);
      return res.data.data || res.data;
    },
    getSimilar: async (id: string): Promise<Challenge[]> => {
      const res = await httpClient.get(`/challenges/${id}/similar`);
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    },
    gapAnalysis: async (id: string): Promise<InnovationGap> => {
      const res = await httpClient.post(`/challenges/${id}/gap-analysis`);
      return res.data.data || res.data;
    },
    matches: async (id: string): Promise<ChallengeAssignment[]> => {
      const res = await httpClient.get(`/challenges/${id}/matches`);
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    }
  },
  assignments: {
    accept: async (id: string): Promise<any> => {
      const res = await httpClient.post(`/assignments/${id}/accept`);
      return res.data.data || res.data;
    }
  },
  projects: {
    list: async (): Promise<Project[]> => {
      const res = await httpClient.get('/projects');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    },
    milestones: async (projectId: string): Promise<ProjectMilestone[]> => {
      const res = await httpClient.get(`/projects/${projectId}/milestones`);
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    },
    completeMilestone: async (milestoneId: string, evidence: string): Promise<ProjectMilestone> => {
      const res = await httpClient.post(`/project-milestones/${milestoneId}/complete`, { evidence });
      return res.data.data || res.data;
    }
  },
  analytics: {
    overview: async () => {
      const res = await httpClient.get('/analytics/overview');
      return res.data.data || res.data;
    },
    districts: async () => {
      const res = await httpClient.get('/analytics/districts');
      return res.data.data || res.data;
    }
  }
};

export default apiClient;
