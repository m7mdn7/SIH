import { Problem, GovStats, User } from '../types';
import { apiClient } from '../lib/apiClient';

export async function loginUser(email: string): Promise<User> {
  const res = await apiClient.auth.login({ username: email, password: 'password' });
  const user = res.user || res.data?.user || res.data;
  return {
    id: user.id || 'USR-GOV-01',
    name: user.username || user.fullName || 'Rajesh Kumar',
    role: (user.role === 'government_admin' ? 'Government' : user.role === 'citizen' ? 'Citizen' : 'Government') as any,
    username: user.email || email,
    district: user.district || 'Ranchi',
  };
}

export async function fetchProblems(): Promise<Problem[]> {
  const list = await apiClient.challenges.list();
  return (list || []).map((item: any) => ({
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
    reporterId: item.createdBy || 'USR-01',
    reporterName: item.creatorName || 'Ramesh Jharkhand',
    status: item.status === 'SUBMITTED' ? 'Reported' : item.status || 'Reported',
    createdAt: item.createdAt || new Date().toISOString(),
  }));
}

export async function fetchGovStats(): Promise<GovStats> {
  const overview = await apiClient.analytics.overview();
  return {
    totalChallenges: overview.totalChallenges || 0,
    criticalChallenges: overview.statusBreakdown?.CRITICAL || 0,
    activeProjects: overview.totalProjects || 0,
    solvedChallenges: overview.statusBreakdown?.CLOSED || 0,
    participation: {
      universities: 5,
      industries: 3,
      citizens: overview.totalUsers || 0,
    },
  };
}

export async function createProblem(payload: {
  title: string;
  description: string;
  category: string;
  severity: string;
  location: { lat: number; lng: number; address: string };
}) {
  return await apiClient.challenges.create({
    title: payload.title,
    description: payload.description,
    locationName: payload.location.address,
    latitude: payload.location.lat,
    longitude: payload.location.lng,
  });
}
