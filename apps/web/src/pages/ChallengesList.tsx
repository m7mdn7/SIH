import React from 'react';
import { mockProblems } from '../data/mock';
import { Card, CardContent, Badge, Button } from '../components/ui';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Role } from '../types';

export function ChallengesList({ role }: { role: Role }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {role === 'University' ? 'AI Matched Challenges' : 'Community Challenges'}
          </h2>
          <p className="text-slate-600">Review reported issues and AI analysis.</p>
        </div>
        {role === 'Citizen' && (
          <Link to="/report">
            <Button>Report New Problem</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {mockProblems.map(p => (
          <Card key={p.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge variant={p.severity === 'Critical' ? 'danger' : p.severity === 'High' ? 'warning' : 'default'} className="shadow-sm">
                      {p.severity}
                    </Badge>
                    <Badge variant="info" className="shadow-sm text-blue-700">
                      {p.status}
                    </Badge>
                  </div>
                  {p.aiAnalysis && (
                     <Badge variant="success" className="shrink-0 ml-2 bg-emerald-100 text-emerald-700 border border-emerald-200">AI Analyzed</Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{p.title}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{p.description}</p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {p.location.address}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{p.category}</span>
                  </div>
                  <Link to={`/dashboard/challenges/${p.id}`} className="text-emerald-600 font-medium text-sm flex items-center hover:text-emerald-800">
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
