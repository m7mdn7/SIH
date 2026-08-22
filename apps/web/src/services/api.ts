import { Problem, GovStats, User } from '../types';

const API_BASE_URL = 'http://localhost:4000/api/v1';

export async function loginUser(email: string): Promise<User> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' }),
    });

    if (!res.ok) throw new Error('Login failed');
    const json = await res.json();
    const user = json.data?.user || json.data;
    
    return {
      id: user.id || 'USR-GOV-01',
      name: user.fullName || 'Rajesh Kumar',
      role: (user.role === 'GOVERNMENT_ADMIN' ? 'Government' : user.role === 'CITIZEN' ? 'Citizen' : 'Government') as any,
      username: user.email || email,
      district: user.district || 'Ranchi',
    };
  } catch (error) {
    console.warn('[API Client] Backend offline or using dev mock user fallback');
    return {
      id: 'USR-GOV-01',
      name: 'Rajesh Kumar',
      role: 'Government',
      username: email,
      district: 'Ranchi',
    };
  }
}

export async function fetchProblems(): Promise<Problem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/challenges`);
    if (!res.ok) throw new Error('Failed to fetch challenges');
    const json = await res.json();
    
    return (json.data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.domain === 'WATER_SANITATION' ? 'Water Management' : item.domain || 'Infrastructure',
      severity: item.priority === 'CRITICAL' ? 'Critical' : item.priority === 'HIGH' ? 'High' : 'Medium',
      affectedPopulation: 1200,
      location: {
        lat: item.latitude || 23.3441,
        lng: item.longitude || 85.3096,
        address: item.locationName || item.district || 'Ranchi, Jharkhand',
      },
      reporterId: 'USR-01',
      reporterName: item.creatorName || 'Ramesh Jharkhand',
      status: item.status === 'SUBMITTED' ? 'Reported' : item.status || 'Reported',
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn('[API Client] Backend offline or fallback to live mock problems');
    return [];
  }
}

export async function fetchGovStats(): Promise<GovStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const json = await res.json();
    const data = json.data;

    return {
      totalChallenges: data.totalChallenges || 10,
      criticalChallenges: data.statusBreakdown?.CRITICAL || 2,
      activeProjects: 4,
      solvedChallenges: data.statusBreakdown?.CLOSED || 1,
      participation: {
        universities: 5,
        industries: 3,
        citizens: data.totalUsers || 10,
      },
    };
  } catch (error) {
    return {
      totalChallenges: 10,
      criticalChallenges: 2,
      activeProjects: 4,
      solvedChallenges: 1,
      participation: {
        universities: 5,
        industries: 3,
        citizens: 10,
      },
    };
  }
}

export async function createProblem(payload: {
  title: string;
  description: string;
  category: string;
  severity: string;
  location: { lat: number; lng: number; address: string };
}) {
  const token = localStorage.getItem('token') || '';
  const domainMap: Record<string, string> = {
    'Water Management': 'WATER_SANITATION',
    'Disaster Management': 'INFRASTRUCTURE',
    'Agriculture': 'AGRICULTURE',
    'Healthcare': 'HEALTHCARE',
  };

  const res = await fetch(`${API_BASE_URL}/challenges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      domain: domainMap[payload.category] || 'WATER_SANITATION',
      priority: payload.severity.toUpperCase(),
      district: payload.location.address.split(',')[0] || 'Ranchi',
      locationName: payload.location.address,
      latitude: payload.location.lat,
      longitude: payload.location.lng,
    }),
  });

  return await res.json();
}
