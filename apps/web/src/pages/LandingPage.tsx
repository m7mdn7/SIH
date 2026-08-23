import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, Factory, Shield, Activity, FileText, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePortalSelect = (role: string) => {
    navigate('/login', { state: { role } });
  };

  const portals = [
    {
      id: 'Government',
      title: 'Government Portal',
      description: 'Access administrative controls, state-wide metrics, and challenge moderation.',
      icon: Building2,
      color: 'bg-gov-blue-900',
      textColor: 'text-gov-blue-900',
      borderColor: 'border-gov-blue-900'
    },
    {
      id: 'Citizen',
      title: 'Public Portal',
      description: 'Report civic issues, track problem status, and view community updates.',
      icon: Users,
      color: 'bg-emerald-800',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-800'
    },
    {
      id: 'University',
      title: 'University Portal',
      description: 'Manage institutional teams, submit research artifacts, and track project milestones.',
      icon: GraduationCap,
      color: 'bg-indigo-900',
      textColor: 'text-indigo-900',
      borderColor: 'border-indigo-900'
    },
    {
      id: 'Industry',
      title: 'Industry Portal',
      description: 'Fund challenges, provide CSR resources, and monitor social impact KPIs.',
      icon: Factory,
      color: 'bg-purple-900',
      textColor: 'text-purple-900',
      borderColor: 'border-purple-900'
    }
  ];

  return (
    <div className="min-h-screen bg-gov-slate-50 flex flex-col font-sans selection:bg-gov-blue-900 selection:text-white">
      {/* Top Navigation */}
      <header className="bg-white border-b-2 border-gov-blue-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gov-blue-900 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gov-slate-900 uppercase tracking-widest">JH-SETU</span>
                <span className="text-[10px] font-bold text-gov-slate-500 uppercase tracking-widest">State Innovation & Impact Portal</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-xs font-bold text-gov-slate-700 hover:text-gov-blue-900 uppercase tracking-widest transition-none">About</a>
              <a href="#impact" className="text-xs font-bold text-gov-slate-700 hover:text-gov-blue-900 uppercase tracking-widest transition-none">Impact</a>
              <a href="#contact" className="text-xs font-bold text-gov-slate-700 hover:text-gov-blue-900 uppercase tracking-widest transition-none">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gov-blue-900 text-white pt-12 pb-24 px-4 border-b-8 border-gov-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gov-blue-800 border border-gov-blue-700 text-[10px] font-black uppercase tracking-widest">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Official Government Infrastructure</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
              Bridging Society,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gov-blue-100 to-white">Engineering Impact.</span>
            </h1>
            
            <p className="text-base text-gov-blue-100 font-medium max-w-2xl border-l-4 border-emerald-500 pl-4">
              A unified platform connecting civic problems with institutional expertise. Report challenges, assign academic research teams, and track resolution through verifiable milestones.
            </p>
          </div>
          
          <div className="flex-1 w-full max-w-md bg-white text-gov-slate-900 p-6 shadow-2xl border-2 border-transparent">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-gov-slate-100 pb-2">System Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gov-slate-600 uppercase">Active Challenges</span>
                <span className="text-lg font-black text-gov-blue-900">1,245</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gov-slate-600 uppercase">Deployed Projects</span>
                <span className="text-lg font-black text-gov-blue-900">342</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gov-slate-600 uppercase">Participating Entities</span>
                <span className="text-lg font-black text-gov-blue-900">57</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gov-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gov-slate-400" />
              <span className="text-[10px] font-bold text-gov-slate-500 uppercase">Last Sync: Today, 08:00 AM IST</span>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Selection */}
      <section className="flex-1 px-4 bg-gov-slate-50 pb-16 relative z-10 md:-mt-12 pt-8 md:pt-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center flex justify-center">
            <h2 className="text-xl font-black text-white bg-gov-slate-900 px-6 py-2 uppercase tracking-widest shadow-md inline-block rounded-none border-2 border-transparent">Select Access Portal</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <button
                  key={portal.id}
                  onClick={() => handlePortalSelect(portal.id)}
                  className={cn(
                    "flex flex-col text-left bg-white border-2 hover:-translate-y-1 transition-transform duration-200 shadow-sm",
                    "border-gov-slate-200 hover:border-gov-slate-400 hover:shadow-md"
                  )}
                >
                  <div className={cn("h-2 w-full", portal.color)} />
                  <div className="p-6 flex-1 flex flex-col">
                    <Icon className={cn("w-8 h-8 mb-4", portal.textColor)} />
                    <h3 className="text-lg font-black text-gov-slate-900 uppercase tracking-tight mb-2">{portal.title}</h3>
                    <p className="text-sm font-medium text-gov-slate-600 flex-1">{portal.description}</p>
                    
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gov-slate-900 group-hover:text-gov-blue-900">
                      Access Portal
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gov-slate-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gov-slate-400" />
            <span className="text-[10px] font-bold text-gov-slate-500 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Government of Jharkhand. All rights reserved.
            </span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-[10px] font-bold text-gov-slate-500 hover:text-gov-slate-900 uppercase tracking-widest">Privacy Policy</a>
            <a href="#" className="text-[10px] font-bold text-gov-slate-500 hover:text-gov-slate-900 uppercase tracking-widest">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
