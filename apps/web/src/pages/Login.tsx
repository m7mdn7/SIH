import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { Building2, GraduationCap, Users, Factory, Shield, ArrowRight } from 'lucide-react';

const ROLES: { id: Role; label: string; icon: React.FC<any>; description: string }[] = [
  { id: 'Citizen', label: 'Citizen Portal', icon: Users, description: 'Report problems & track challenges' },
  { id: 'Government', label: 'Government Portal', icon: Building2, description: 'Monitor states, districts & AI insights' },
  { id: 'University', label: 'University Portal', icon: GraduationCap, description: 'Discover challenges & form teams' },
  { id: 'Industry', label: 'Industry Portal', icon: Factory, description: 'Provide mentorship, funding & support' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    if (password !== '12345') {
      alert('Login failed: Invalid credentials (test password is 12345)');
      return;
    }
    
    try {
      await login(username);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Login failed: Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gov-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-gov-blue-700 rounded-none flex items-center justify-center shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gov-slate-900 tracking-tight">
          SIIP Platform
        </h2>
        <p className="mt-2 text-center text-sm text-gov-slate-700">
          Social Innovation & Integration Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gov-slate-200/50 sm:rounded-none sm:px-10 border border-gov-slate-200">
          <div>
            <h3 className="text-xl font-black text-gov-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-gov-blue-700" />
              Secure Login
            </h3>
            <p className="text-xs font-bold text-gov-slate-600 mb-6 uppercase tracking-widest border-b border-gov-slate-200 pb-2">
              Enter official credentials
            </p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gov-slate-900">Official Username</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="Enter your username"
                    className="appearance-none block w-full px-3 py-2 border border-gov-slate-200 rounded-none shadow-sm placeholder-gov-slate-400 focus:outline-none focus:ring-1 focus:ring-gov-blue-900 focus:border-gov-blue-900 sm:text-sm bg-white font-medium text-gov-slate-900 transition-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gov-slate-900">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="appearance-none block w-full px-3 py-2 border border-gov-slate-200 rounded-none shadow-sm placeholder-gov-slate-400 focus:outline-none focus:ring-1 focus:ring-gov-blue-900 focus:border-gov-blue-900 sm:text-sm bg-white font-medium text-gov-slate-900 transition-none"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-none shadow-sm text-xs font-black uppercase tracking-widest text-white bg-gov-blue-900 hover:bg-gov-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue-900 disabled:opacity-50 transition-none"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gov-slate-700">
          <p>This is a secure government portal. Unauthorized access is strictly prohibited.</p>
          <p className="mt-1">© {new Date().getFullYear()} SIIP. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
