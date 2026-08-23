import React, { useState } from 'react';
import { Problem, ProblemStatus } from '../../types';
import { Clock, MapPin, MessageSquare, Star, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock Data
const MOCK_REPORTS: Problem[] = [
  {
    id: 'PRB-001',
    title: 'Severe Waterlogging in Lower Bazaar',
    description: 'Main road completely flooded after heavy rain, blocking traffic and entering shops.',
    category: 'Disaster Management',
    severity: 'High',
    affectedPopulation: 500,
    location: { lat: 23.3441, lng: 85.3096, address: 'Lower Bazaar, Ranchi' },
    reporterId: 'usr_1',
    reporterName: 'John Doe',
    status: 'In Progress',
    createdAt: '2026-08-20T10:30:00Z',
  },
  {
    id: 'PRB-002',
    title: 'Broken Drinking Water Pipeline',
    description: 'Fresh water is leaking continuously since yesterday morning.',
    category: 'Water Management',
    severity: 'Medium',
    affectedPopulation: 200,
    location: { lat: 23.3500, lng: 85.3200, address: 'Harmu Housing Colony, Ranchi' },
    reporterId: 'usr_1',
    reporterName: 'John Doe',
    status: 'Resolved',
    createdAt: '2026-08-15T09:15:00Z',
  }
];

const getStatusColor = (status: ProblemStatus) => {
  switch (status) {
    case 'Reported': return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'Analyzing': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Validated': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Matched': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ChallengeTracking: React.FC = () => {
  const [selectedReportForFeedback, setSelectedReportForFeedback] = useState<string | null>(null);
  const [selectedReportForUpdates, setSelectedReportForUpdates] = useState<string | null>(null);

  const handleFeedbackSubmit = () => {
    alert("Feedback submitted successfully. Thank you!");
    setSelectedReportForFeedback(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_REPORTS.map((report) => (
          <div key={report.id} className="bg-white rounded-none border border-gov-slate-300 p-5 flex flex-col h-full hover:border-gov-blue-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-black text-gov-slate-500 uppercase tracking-widest">{report.id}</span>
                <h3 className="text-base font-bold text-gov-slate-900 mt-0.5 uppercase tracking-tight">{report.title}</h3>
              </div>
              <span className={cn("px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider border", getStatusColor(report.status))}>
                {report.status}
              </span>
            </div>
            
            <p className="text-sm text-gov-slate-700 mb-4 line-clamp-2 flex-1">{report.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-gov-slate-500 mb-4 bg-gov-slate-50 p-2 rounded-none border border-gov-slate-200">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px] font-medium">{report.location.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gov-slate-200 flex justify-between items-center mt-auto">
              {report.status === 'Resolved' ? (
                <button 
                  onClick={() => setSelectedReportForFeedback(report.id)}
                  className="text-xs font-bold flex items-center text-green-800 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-none border border-green-200 transition-colors uppercase tracking-wider"
                >
                  <Star className="w-4 h-4 mr-1.5" /> Provide Feedback
                </button>
              ) : (
                <button 
                  onClick={() => setSelectedReportForUpdates(report.id)}
                  className="text-xs font-bold flex items-center text-gov-blue-800 hover:text-gov-blue-900 bg-gov-slate-50 hover:bg-gov-slate-100 px-3 py-1.5 rounded-none border border-gov-slate-200 transition-colors uppercase tracking-wider"
                >
                  <ShieldAlert className="w-4 h-4 mr-1.5" /> View Updates
                </button>
              )}
              <span className="text-[10px] font-bold text-gov-slate-400 uppercase tracking-widest">{report.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Modal Mock */}
      {selectedReportForFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gov-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-none border border-gov-slate-300 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b-2 border-gov-slate-200 flex justify-between items-center bg-gov-slate-100">
              <h3 className="font-bold text-gov-slate-900 uppercase tracking-tight">Post-Solution Feedback</h3>
              <button onClick={() => setSelectedReportForFeedback(null)} className="text-gov-slate-400 hover:text-gov-slate-700">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gov-slate-700 font-medium">How satisfied are you with the resolution of this issue?</p>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-8 h-8 text-gov-slate-200 hover:text-yellow-400 cursor-pointer transition-colors" />
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-gov-slate-900 mb-1 uppercase tracking-wider">Additional Comments</label>
                <textarea rows={3} className="w-full border border-gov-slate-300 rounded-none p-2 text-sm focus:ring-gov-blue-800 focus:border-gov-blue-800 bg-gov-slate-50" placeholder="Did the solution fully address the problem?"></textarea>
              </div>
              <button onClick={handleFeedbackSubmit} className="w-full bg-gov-blue-900 text-white rounded-none border border-gov-blue-950 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gov-blue-800 transition-colors mt-2">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Updates Modal Mock */}
      {selectedReportForUpdates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gov-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-none border border-gov-slate-300 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b-2 border-gov-slate-200 flex justify-between items-center bg-gov-slate-100">
              <h3 className="font-bold text-gov-slate-900 uppercase tracking-tight">Report Updates</h3>
              <button onClick={() => setSelectedReportForUpdates(null)} className="text-gov-slate-400 hover:text-gov-slate-700">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-l-2 border-gov-blue-300 pl-4 space-y-4 ml-2">
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-none bg-gov-blue-800"></div>
                  <p className="text-sm font-bold text-gov-slate-900">Issue assigned to local municipality</p>
                  <p className="text-xs font-semibold text-gov-slate-500">Today at 10:45 AM</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-none bg-gov-blue-200"></div>
                  <p className="text-sm font-bold text-gov-slate-700">AI verified and prioritized</p>
                  <p className="text-xs font-semibold text-gov-slate-500">Yesterday at 4:30 PM</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-none bg-gov-blue-200"></div>
                  <p className="text-sm font-bold text-gov-slate-700">Report Submitted</p>
                  <p className="text-xs font-semibold text-gov-slate-500">Yesterday at 4:15 PM</p>
                </div>
              </div>
              <button onClick={() => setSelectedReportForUpdates(null)} className="w-full bg-gov-slate-100 border border-gov-slate-300 text-gov-slate-900 rounded-none py-2 text-sm font-bold uppercase tracking-wider hover:bg-gov-slate-200 transition-colors mt-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
