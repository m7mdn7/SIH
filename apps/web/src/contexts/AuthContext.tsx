import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { loginUser } from '../services/api';
import { apiClient } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Port-based default auto-wire
    const port = typeof window !== 'undefined' ? window.location.port : '3000';
    let defaultEmail = 'citizen@siip.org';

    if (port === '3001') {
      defaultEmail = 'admin@agritech.edu';
    } else if (port === '3002') {
      defaultEmail = 'admin@gov.siip.gov';
    } else if (port === '3003') {
      defaultEmail = 'industry@siip.org';
    }

    const savedUser = apiClient.auth.getCurrentUser();
    if (savedUser) {
      setUser({
        id: savedUser.id || 'USR-01',
        name: savedUser.username || savedUser.email || 'SIIP User',
        role: savedUser.role === 'university_admin' ? 'University' : savedUser.role === 'government_admin' ? 'Government' : savedUser.role === 'industry' ? 'Industry' : 'Citizen',
        username: savedUser.email || savedUser.username,
        district: 'Ranchi',
      });
    } else {
      // Auto-login to portal's default role
      login(defaultEmail).catch(() => {
        // Fallback default role object
        const defaultRole: Role = port === '3001' ? 'University' : port === '3002' ? 'Government' : port === '3003' ? 'Industry' : 'Citizen';
        setUser({
          id: 'USR-PORT-AUTO',
          name: `${defaultRole} User`,
          role: defaultRole,
          username: defaultEmail,
          district: 'Ranchi',
        });
      });
    }
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const u = await loginUser(email);
      setUser(u);
    } catch (err) {
      console.warn('Backend login fallback:', err);
      // Fallback state mapping
      const isGov = email.includes('gov');
      const isUni = email.includes('agri') || email.includes('edu') || email.includes('uni');
      const isInd = email.includes('industry') || email.includes('funder');
      const role: Role = isGov ? 'Government' : isUni ? 'University' : isInd ? 'Industry' : 'Citizen';
      setUser({
        id: 'USR-01',
        name: email.split('@')[0],
        role,
        username: email,
        district: 'Ranchi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
