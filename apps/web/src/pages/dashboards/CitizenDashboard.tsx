import React, { useState } from 'react';
import { ReportProblemForm } from '../../components/citizen/ReportProblemForm';
import { ChallengeTracking } from '../../components/citizen/ChallengeTracking';
import { PlusCircle, List, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CitizenDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'tracking'>('report');

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      
      {/* Header */}
      <div className="border-b-2 border-gov-slate-300 pb-4">
        <h1 className="text-2xl font-black text-gov-slate-900 flex items-center gap-2 uppercase tracking-tight">
          <ShieldAlert className="w-6 h-6 text-gov-blue-800" />
          Citizen Services
        </h1>
        <p className="text-gov-slate-700 mt-1 font-medium">Submit reports to local authorities and track resolution progress.</p>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-gov-slate-200">
        <nav className="-mb-0.5 flex space-x-8">
          <button
            onClick={() => setActiveTab('report')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-xs uppercase tracking-widest flex items-center transition-colors",
              activeTab === 'report'
                ? "border-gov-blue-800 text-gov-blue-900"
                : "border-transparent text-gov-slate-500 hover:text-gov-slate-700 hover:border-gov-slate-300"
            )}
          >
            <PlusCircle className={cn("w-4 h-4 mr-2", activeTab === 'report' ? "text-gov-blue-800" : "text-gov-slate-400")} />
            Report New Problem
          </button>
          
          <button
            onClick={() => setActiveTab('tracking')}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-xs uppercase tracking-widest flex items-center transition-colors",
              activeTab === 'tracking'
                ? "border-gov-blue-800 text-gov-blue-900"
                : "border-transparent text-gov-slate-500 hover:text-gov-slate-700 hover:border-gov-slate-300"
            )}
          >
            <List className={cn("w-4 h-4 mr-2", activeTab === 'tracking' ? "text-gov-blue-800" : "text-gov-slate-400")} />
            My Reports & Tracking
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'report' ? (
          <ReportProblemForm />
        ) : (
          <ChallengeTracking />
        )}
      </div>

    </div>
  );
};
