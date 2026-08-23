import React, { useEffect, useState } from 'react';
import { Card, CardContent, Badge, Progress, Button } from '../components/ui';
import { Building, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { apiClient } from '../lib/apiClient';

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await apiClient.projects.list();
      setProjects(data || []);
    } catch (err) {
      console.warn('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Innovation Projects</h2>
          <p className="text-xs text-slate-600 font-bold">Track ongoing multi-disciplinary projects solving community challenges — Live API Synced.</p>
        </div>
        <Button onClick={loadProjects} disabled={loading} variant="outline" className="text-xs font-bold uppercase tracking-wider">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Sync Projects
        </Button>
      </div>

      {loading ? (
        <div className="bg-white p-8 text-center border-2 border-slate-300 font-bold text-slate-700">
          Loading live projects from backend...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-8 text-center border-2 border-slate-300 font-bold text-slate-700">
          No active projects found in database. Accept a challenge assignment to launch a project.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map(proj => (
            <Card key={proj.id} className="flex flex-col hover:shadow-md transition-shadow border-2 border-slate-300 rounded-none bg-white">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="info" className="font-bold text-[10px] uppercase bg-blue-50 border-blue-200 text-blue-900">{proj.currentPhase || 'Phase 1'}</Badge>
                  <span className="text-[10px] font-mono font-bold text-slate-500">ID: {proj.id}</span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{proj.title}</h3>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                    <Building className="w-4 h-4 text-blue-800" />
                    <span>{proj.universityName || 'BIT Mesra / NIT Jamshedpur Roster'}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-slate-700 uppercase">Completion Progress</span>
                    <span className="text-blue-900">{proj.progress || 35}%</span>
                  </div>
                  <Progress value={proj.progress || 35} className="h-2 mb-4 bg-slate-100 [&>div]:bg-blue-900" />
                  
                  <Link 
                    to={`/dashboard/projects/${proj.id}`}
                    className="flex items-center justify-center w-full px-4 py-2 bg-blue-900 text-white font-black text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow"
                  >
                    Track Milestones <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
