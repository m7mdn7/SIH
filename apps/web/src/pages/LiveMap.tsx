import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { MapPin, Info } from 'lucide-react';
import { mockProblems } from '../data/mock';
import { Link } from 'react-router-dom';

export function LiveMap() {
  const [activeProblem, setActiveProblem] = useState(mockProblems[0]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Live Impact Map</h2>
          <p className="text-slate-600 text-sm">Real-time view of reported challenges across Jharkhand.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="danger">Critical (18)</Badge>
          <Badge variant="warning">High (45)</Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <Card className="lg:col-span-2 overflow-hidden flex flex-col relative bg-slate-100/50">
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-600 font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-500" />
            Mock coordinate grid representing state area
          </div>
          
          <div className="flex-1 relative border border-slate-200 m-4 rounded-xl bg-white overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             {/* Mock map visualization using absolute positioning based on lat/lng ranges */}
             {mockProblems.map(p => {
               // Normalizing coordinates for demo (assuming Jharkhand bounds roughly lat: 22-25, lng: 83-88)
               const top = `${(25 - p.location.lat) / (25 - 22) * 100}%`;
               const left = `${(p.location.lng - 83) / (88 - 83) * 100}%`;
               const isCritical = p.severity === 'Critical';
               const isActive = activeProblem.id === p.id;
               
               return (
                 <button 
                  key={p.id}
                  onClick={() => setActiveProblem(p)}
                  className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center transition-all ${isActive ? 'scale-150 z-20 ring-4 ring-emerald-200' : 'hover:scale-125 z-10'}`}
                  style={{ top, left }}
                 >
                   <div className={`w-4 h-4 rounded-full shadow-md ${isCritical ? 'bg-red-500 animate-pulse' : p.severity === 'High' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                 </button>
               )
             })}
          </div>
        </Card>

        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 shrink-0">
            <CardTitle className="text-lg flex justify-between items-center">
              Selected Issue
              <Badge variant={activeProblem.severity === 'Critical' ? 'danger' : activeProblem.severity === 'High' ? 'warning' : 'default'}>
                {activeProblem.severity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{activeProblem.title}</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">{activeProblem.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{activeProblem.location.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-xs mb-0.5">Category</span>
                    <span className="font-medium text-slate-800">{activeProblem.category}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-xs mb-0.5">Status</span>
                    <span className="font-medium text-emerald-600">{activeProblem.status}</span>
                  </div>
                </div>
              </div>

              <Link 
                to={`/challenges/${activeProblem.id}`} 
                className="flex items-center justify-center w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                View Detailed Analysis
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
