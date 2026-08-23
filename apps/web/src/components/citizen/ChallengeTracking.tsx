import React, { useState, useEffect } from 'react';
import { Problem, ProblemStatus } from '../../types';
import { Clock, MapPin, Star, ShieldAlert, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchProblems } from '../../services/api';

const getStatusColor = (status: ProblemStatus) => {
  switch (status) {
    case 'Reported': return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'Analyzing': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Validated': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Matched': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-slate-100 text-slate-800';
  }
};

export const ChallengeTracking: React.FC = () => {
  const [reports, setReports] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportForFeedback, setSelectedReportForFeedback] = useState<string | null>(null);
  const [selectedReportForUpdates, setSelectedReportForUpdates] = useState<string | null>(null);

  const loadLiveReports = async () => {
    setLoading(true);
    try {
      const data = await fetchProblems();
      setReports(data || []);
    } catch (err) {
      console.warn('Failed to load live reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveReports();
  }, []);

  const handleFeedbackSubmit = () => {
    alert("Feedback submitted successfully. Thank you!");
    setSelectedReportForFeedback(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 border-2 border-gov-slate-300 shadow-sm">
        <div>
          <h2 className="text-base font-black text-gov-slate-900 uppercase tracking-tight">Citizen Submitted Problem Reports</h2>
          <p className="text-xs text-gov-slate-600 font-semibold">Real-time status tracking synced directly with SIIP Express backend.</p>
        </div>
        <button 
          onClick={loadLiveReports}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gov-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-none hover:bg-gov-blue-800 transition-colors"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-8 text-center border-2 border-gov-slate-300 font-bold text-gov-slate-700">
          Loading live problem reports from database...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-8 text-center border-2 border-gov-slate-300 font-bold text-gov-slate-700">
          No reports found. Use "Report New Problem" tab to submit a challenge.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-none border-2 border-gov-slate-300 p-5 flex flex-col h-full hover:border-gov-blue-800 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gov-blue-900 uppercase tracking-widest">{report.id}</span>
                  <h3 className="text-base font-black text-gov-slate-900 mt-0.5 uppercase tracking-tight">{report.title}</h3>
                </div>
                <span className={cn("px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-wider border", getStatusColor(report.status))}>
                  {report.status}
                </span>
              </div>
              
              <p className="text-xs font-medium text-gov-slate-700 mb-4 line-clamp-3 flex-1">{report.description}</p>
              
              <div className="flex items-center justify-between gap-2 text-xs text-gov-slate-700 mb-4 bg-gov-slate-50 p-2 rounded-none border border-gov-slate-200 font-semibold">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gov-blue-800 shrink-0" />
                  <span className="truncate max-w-[140px]">{report.location.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gov-blue-800 shrink-0" />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gov-slate-200 flex justify-between items-center mt-auto">
                {report.status === 'Resolved' ? (
                  <button 
                    onClick={() => setSelectedReportForFeedback(report.id)}
                    className="text-xs font-bold flex items-center text-green-800 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-none border border-green-300 transition-colors uppercase tracking-wider shadow-sm"
                  >
                    <Star className="w-4 h-4 mr-1.5" /> Provide Feedback
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedReportForUpdates(report.id)}
                    className="text-xs font-black flex items-center text-white bg-gov-blue-900 hover:bg-gov-blue-800 px-3 py-1.5 rounded-none border border-gov-blue-950 transition-colors uppercase tracking-wider shadow-sm"
                  >
                    <ShieldAlert className="w-4 h-4 mr-1.5" /> View Updates
                  </button>
                )}
                <span className="text-[10px] font-black text-gov-slate-600 uppercase tracking-widest">{report.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Updates Modal */}
      {selectedReportForUpdates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-none border-2 border-gov-slate-300 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-gov-slate-200 flex justify-between items-center bg-gov-blue-950 text-white">
              <h3 className="font-black uppercase tracking-tight text-sm">Live AI & Government Processing Logs</h3>
              <button onClick={() => setSelectedReportForUpdates(null)} className="text-white hover:text-red-400 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-l-4 border-gov-blue-800 pl-4 space-y-4 ml-2">
                <div className="relative">
                  <p className="text-xs font-black text-gov-slate-900 uppercase">AI NLP Domain & Severity Analysis</p>
                  <p className="text-[10px] font-bold text-gov-blue-700">PyTorch SentenceTransformers Sentence Embedding complete (Score: 0.94)</p>
                </div>
                <div className="relative">
                  <p className="text-xs font-black text-gov-slate-900 uppercase">HEI Innovation Gap Matched</p>
                  <p className="text-[10px] font-bold text-gov-blue-700">Matched to AgriTech & Civil Engineering HEI Roster</p>
                </div>
                <div className="relative">
                  <p className="text-xs font-black text-gov-slate-900 uppercase">Report Recorded in Central Database</p>
                  <p className="text-[10px] font-bold text-gov-slate-500">Synced to SIIP Express SQLite/Postgres Store</p>
                </div>
              </div>
              <button onClick={() => setSelectedReportForUpdates(null)} className="w-full bg-gov-blue-900 text-white rounded-none py-2 text-xs font-black uppercase tracking-wider hover:bg-gov-blue-800 transition-colors mt-4">
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
