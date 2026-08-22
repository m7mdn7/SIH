import React from 'react';
import { mockProjects } from '../data/mock';
import { Card, CardContent, Badge, Progress } from '../components/ui';
import { Building, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProjectsList() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Active Innovation Projects</h2>
        <p className="text-slate-600">Track ongoing multi-disciplinary projects solving community challenges.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockProjects.map(proj => (
          <Card key={proj.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="info">{proj.currentPhase}</Badge>
                <span className="text-xs font-medium text-slate-400">ID: {proj.id}</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{proj.title}</h3>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{proj.universityName}</span>
                </div>
                {proj.industryPartners.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Partner: <span className="font-medium text-emerald-700">{proj.industryPartners[0].name}</span></span>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-emerald-600">{proj.progress}%</span>
                </div>
                <Progress value={proj.progress} className="h-2 mb-4" />
                
                <Link 
                  to={`/dashboard/projects/${proj.id}`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-slate-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 border border-slate-200 transition-colors group"
                >
                  Track Milestones <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
