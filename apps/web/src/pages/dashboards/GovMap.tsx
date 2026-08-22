import React, { useState } from 'react';
import { MapPin, Search, Filter, AlertTriangle, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock map points
const mapPoints = [
  { id: 1, lat: 23.3441, lng: 85.3096, severity: 'Critical', category: 'Infrastructure', title: 'Bridge Structural Damage' },
  { id: 2, lat: 23.7957, lng: 86.4304, severity: 'High', category: 'Agriculture', title: 'Crop Failure due to Unknown Pest' },
  { id: 3, lat: 22.8046, lng: 86.2029, severity: 'Medium', category: 'Healthcare', title: 'Local Clinic Shortage' },
  { id: 4, lat: 24.2585, lng: 86.6346, severity: 'Low', category: 'Education', title: 'Primary School Roof Leak' },
  { id: 5, lat: 23.9925, lng: 85.3644, severity: 'Critical', category: 'Water Management', title: 'Contaminated Water Supply' },
];

export const GovMap: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-[1400px] mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gov-slate-200 pb-3 gap-4">
        <div>
          <h1 className="text-xl font-black text-gov-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Layers className="w-5 h-5 text-gov-blue-800" />
            Live State GIS Map
          </h1>
          <p className="text-xs text-gov-slate-700 mt-1 font-bold uppercase tracking-wider">Geospatial Distribution of Challenges</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gov-slate-400" />
            <input 
              type="text" 
              placeholder="Search by District or ID..." 
              className="pl-9 pr-4 py-1.5 border border-gov-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-gov-blue-800 rounded-none w-64"
            />
          </div>
          <button 
            onClick={() => alert('Filter options would appear here')}
            className="flex items-center gap-2 px-3 py-1.5 border border-gov-slate-300 bg-white text-xs font-bold text-gov-slate-800 uppercase tracking-wider hover:bg-gov-slate-100 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left Side: Mock Map Container */}
        <div className="flex-[2] bg-gov-slate-200 border border-gov-slate-200 relative overflow-hidden flex items-center justify-center min-h-[400px]">
          {/* This is a placeholder for a real Mapbox / Leaflet component */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gov-slate-900 to-transparent background-size-4"></div>
          
          <div className="text-center z-10 p-6 bg-white/80 backdrop-blur border border-gov-slate-400 shadow-xl max-w-sm">
            <MapPin className="w-12 h-12 text-gov-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-gov-slate-900 uppercase tracking-tight mb-2">Map Interface Placeholder</h3>
            <p className="text-xs font-bold text-gov-slate-700 uppercase tracking-wider leading-relaxed">
              Integrate Mapbox GL JS or React-Leaflet here in the next phase. The backend will serve GeoJSON endpoints for dynamic rendering.
            </p>
          </div>

          {/* Fake Map Markers just for visual aesthetic of the placeholder */}
          {mapPoints.map((point) => (
            <div 
              key={point.id} 
              className={cn(
                "absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-150",
                point.severity === 'Critical' ? "bg-red-600" : 
                point.severity === 'High' ? "bg-orange-500" : 
                point.severity === 'Medium' ? "bg-amber-400" : "bg-gov-blue-500"
              )}
              style={{ 
                // Totally arbitrary positions just to look like a map cluster
                top: `${40 + (point.id * 10)}%`, 
                left: `${30 + (point.id * 8)}%` 
              }}
            />
          ))}
        </div>

        {/* Right Side: Active Region Data */}
        <div className="flex-1 flex flex-col bg-white border border-gov-slate-200 min-w-[320px]">
          <div className="p-3 border-b border-gov-slate-200 bg-gov-slate-50 flex gap-2">
            {['All', 'Critical', 'High', 'Medium'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-colors",
                  activeFilter === filter 
                    ? "bg-gov-slate-800 text-white border-gov-slate-900" 
                    : "bg-white text-gov-slate-600 border-gov-slate-300 hover:bg-gov-slate-100"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {mapPoints
              .filter(p => activeFilter === 'All' || p.severity === activeFilter)
              .map((point) => (
              <div key={point.id} className="border border-gov-slate-200 p-3 hover:border-gov-blue-400 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gov-slate-400 group-hover:text-gov-blue-600 transition-colors">ID: {point.id * 1028}</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border",
                    point.severity === 'Critical' ? "bg-red-50 text-red-700 border-red-200" :
                    point.severity === 'High' ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {point.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gov-slate-900 uppercase tracking-tight leading-tight mb-1">{point.title}</h4>
                <div className="flex items-center text-[10px] font-bold text-gov-slate-500 uppercase tracking-wider">
                  <MapPin className="w-3 h-3 mr-1" /> {point.lat}, {point.lng}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
