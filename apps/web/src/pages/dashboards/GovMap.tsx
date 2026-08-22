import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Filter, Layers, RefreshCw, Compass } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchProblems } from '../../services/api';
import { Problem } from '../../types';

// Custom Leaflet pin markers colored by PostGIS severity attribute
const createMarkerIcon = (severity: string) => {
  const color = severity === 'Critical' ? '#dc2626' : severity === 'High' ? '#ea580c' : '#d97706';
  const pulse = severity === 'Critical' ? 'animation: pulse 1.5s infinite;' : '';

  return L.divIcon({
    className: 'custom-gov-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        ${pulse}
      ">
        <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 11, { duration: 1.2 });
  }, [center, map]);
  return null;
}

export const GovMap: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [geojsonCount, setGeojsonCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.3441, 85.3096]);

  const loadGeoJSONAndProblems = async () => {
    setLoading(true);
    try {
      // 1. Dynamic fetch from PostGIS GeoJSON API
      const geojsonRes = await fetch('http://localhost:4000/api/v1/challenges/geojson');
      if (geojsonRes.ok) {
        const geojson = await geojsonRes.json();
        setGeojsonCount(geojson.features?.length || 0);
      }

      // 2. Dynamic fetch from Core Backend Challenges API
      const liveProblems = await fetchProblems();
      if (liveProblems && liveProblems.length > 0) {
        setProblems(liveProblems);
        setSelectedProblem(liveProblems[0]);
        setMapCenter([liveProblems[0].location.lat, liveProblems[0].location.lng]);
      }
    } catch (err) {
      console.warn('PostGIS connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGeoJSONAndProblems();
  }, []);

  const selectPin = (p: Problem) => {
    setSelectedProblem(p);
    setMapCenter([p.location.lat, p.location.lng]);
  };

  const filteredProblems = problems.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.severity === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-[1400px] mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gov-slate-200 pb-3 gap-4">
        <div>
          <h1 className="text-xl font-black text-gov-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Layers className="w-5 h-5 text-gov-blue-800" />
            Live State GIS Map (PostGIS Dynamic Rendering)
          </h1>
          <p className="text-xs text-gov-slate-700 mt-1 font-bold uppercase tracking-wider">
            Geospatial Distribution of Challenges across Jharkhand
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gov-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by District or Title..."
              className="pl-9 pr-4 py-1.5 border border-gov-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-gov-blue-800 rounded-none w-64"
            />
          </div>
          <button
            onClick={loadGeoJSONAndProblems}
            className="flex items-center gap-2 px-3 py-1.5 border border-gov-slate-300 bg-white text-xs font-bold text-gov-slate-800 uppercase tracking-wider hover:bg-gov-slate-100 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh PostGIS
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left Side: Real OpenStreetMap Leaflet Component */}
        <div className="flex-[2] bg-gov-slate-200 border border-gov-slate-200 relative overflow-hidden flex flex-col min-h-[450px]">
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 border border-gov-slate-300 shadow-md text-[11px] font-bold text-gov-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>PostGIS GIS Layer: {geojsonCount} GeoJSON Features Dynamically Rendered</span>
          </div>

          <div className="w-full h-full relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={10}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapRecenter center={mapCenter} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredProblems.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.location.lat, p.location.lng]}
                  icon={createMarkerIcon(p.severity)}
                  eventHandlers={{
                    click: () => selectPin(p),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 font-sans">
                      <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                      <div className="text-xs text-slate-600">{p.location.address}</div>
                      <div className="text-xs font-mono text-emerald-700 mt-1">
                        GPS: {p.location.lat.toFixed(4)}, {p.location.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Side: Active Filter & Selected Region Data */}
        <div className="flex-1 flex flex-col bg-white border border-gov-slate-200 min-w-[340px]">
          <div className="p-3 border-b border-gov-slate-200 bg-gov-slate-50 flex gap-2">
            {['All', 'Critical', 'High', 'Medium'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-colors',
                  activeFilter === filter
                    ? 'bg-gov-slate-800 text-white border-gov-slate-900'
                    : 'bg-white text-gov-slate-600 border-gov-slate-300 hover:bg-gov-slate-100'
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredProblems.map((point) => {
              const isSelected = selectedProblem?.id === point.id;
              return (
                <div
                  key={point.id}
                  onClick={() => selectPin(point)}
                  className={cn(
                    'border p-3 transition-colors cursor-pointer group',
                    isSelected
                      ? 'border-gov-blue-800 bg-gov-blue-50/50 shadow-sm'
                      : 'border-gov-slate-200 hover:border-gov-blue-400'
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gov-slate-400 group-hover:text-gov-blue-600 transition-colors">
                      ID: {point.id}
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border',
                        point.severity === 'Critical'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : point.severity === 'High'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      {point.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gov-slate-900 uppercase tracking-tight leading-tight mb-1">
                    {point.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gov-slate-500 uppercase tracking-wider mt-2">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-emerald-600" /> {point.location.address}
                    </span>
                    <span className="font-mono text-emerald-700">
                      {point.location.lat.toFixed(2)}, {point.location.lng.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
