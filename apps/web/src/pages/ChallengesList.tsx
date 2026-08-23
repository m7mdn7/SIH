import React, { useEffect, useState } from 'react';
import { Card, CardContent, Badge, Button } from '../components/ui';
import { MapPin, Calendar, ArrowRight, RefreshCw, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Role, Problem } from '../types';
import { fetchProblems } from '../services/api';

export function ChallengesList({ role }: { role: Role }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProblems();
      setProblems(data || []);
    } catch (err) {
      console.warn('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {role === 'University' ? 'AI Matched University Challenges' : 'Community & Government Challenges'}
          </h2>
          <p className="text-xs text-slate-600 font-bold">Real-time challenge dataset synced across Citizen, Government, University & Funder portals.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} disabled={loading} variant="outline" className="text-xs font-bold uppercase tracking-wider">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
          {role === 'Citizen' && (
            <Link to="/report">
              <Button className="bg-blue-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800">Report New Problem</Button>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-8 text-center border-2 border-slate-300 font-bold text-slate-700">
          Loading live challenge repository from backend...
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-white p-8 text-center border-2 border-slate-300 font-bold text-slate-700">
          No challenges found in backend database.
        </div>
      ) : (
        <div className="grid gap-4">
          {problems.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow group border-2 border-slate-300 rounded-none bg-white">
              <CardContent className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 items-center">
                      <Badge variant={p.severity === 'Critical' ? 'danger' : p.severity === 'High' ? 'warning' : 'default'} className="shadow-sm font-bold uppercase text-[10px]">
                        {p.severity}
                      </Badge>
                      <Badge variant="info" className="shadow-sm text-blue-900 font-bold uppercase text-[10px] bg-blue-50 border-blue-200">
                        {p.status}
                      </Badge>
                    </div>
                    <Badge variant="success" className="shrink-0 ml-2 bg-emerald-900 text-white border border-emerald-950 font-bold text-[10px] uppercase flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> AI Analyzed
                    </Badge>
                  </div>
                  
                  <div className="text-[10px] font-mono font-bold text-blue-900 mb-1">ID: {p.id}</div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-900 transition-colors uppercase tracking-tight">{p.title}</h3>
                  <p className="text-slate-700 text-xs font-medium mb-4 line-clamp-2">{p.description}</p>
                    
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 border border-slate-200 font-semibold">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-800" /> {p.location.address}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-800" /> {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-auto">
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-200 text-slate-900 px-2 py-1 font-bold uppercase tracking-wider">{p.category}</span>
                  </div>
                  <Link to={`/dashboard/challenges/${p.id}`} className="text-white bg-blue-900 hover:bg-blue-800 px-4 py-1.5 text-xs font-black uppercase tracking-wider flex items-center shadow">
                    Review Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
