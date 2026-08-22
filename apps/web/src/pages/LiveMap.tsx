import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { MapPin, Info, RefreshCw, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchProblems } from '../services/api';
import { Problem } from '../types';

// Custom Leaflet Pin Markers colored by PostGIS severity attribute
const createMarkerIcon = (severity: string) => {
  const color = severity === 'Critical' ? '#dc2626' : severity === 'High' ? '#f59e0b' : '#059669';
  const pulse = severity === 'Critical' ? 'animation: pulse 1.5s infinite;' : '';

  return L.divIcon({
    className: 'custom-postgis-marker',
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

// Helper component to center map on marker selection
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 1.2 });
  }, [center, map]);
  return null;
}

export function LiveMap() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [geojsonCount, setGeojsonCount] = useState<number>(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.3441, 85.3096]); // Default Ranchi coordinates

  const loadLiveData = async () => {
    setLoading(true);
    try {
      // 1. Query PostGIS GeoJSON API
      const geojsonRes = await fetch('http://localhost:4000/api/v1/challenges/geojson');
      if (geojsonRes.ok) {
        const geojson = await geojsonRes.json();
        setGeojsonCount(geojson.features?.length || 0);
      }

      // 2. Query Live Challenge Coordinates
      const liveProblems = await fetchProblems();
      if (liveProblems && liveProblems.length > 0) {
        setProblems(liveProblems);
        setActiveProblem(liveProblems[0]);
        setMapCenter([liveProblems[0].location.lat, liveProblems[0].location.lng]);
      }
    } catch (err) {
      console.warn('PostGIS query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
  }, []);

  const selectProblem = (p: Problem) => {
    setActiveProblem(p);
    setMapCenter([p.location.lat, p.location.lng]);
  };

  const criticalCount = problems.filter((p) => p.severity === 'Critical').length;
  const highCount = problems.filter((p) => p.severity === 'High').length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Live State GIS Map</h2>
          <p className="text-slate-600 text-sm">
            OpenStreetMap Leaflet Engine integrated with Backend PostGIS Spatial Querying (`ST_AsGeoJSON`).
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="danger">Critical ({criticalCount})</Badge>
          <Badge variant="warning">High ({highCount})</Badge>
          <button
            onClick={loadLiveData}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
            title="Refresh PostGIS Map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Real Interactive OpenStreetMap Leaflet Map */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col relative bg-slate-100">
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>PostGIS GIS Layer: {geojsonCount} GeoJSON Features Pinpointed</span>
          </div>

          <div className="w-full h-full min-h-[500px] relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={10}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
            >
              <MapRecenter center={mapCenter} />

              {/* Standard OpenStreetMap Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Pinpointing Location Coordinates via PostGIS */}
              {problems.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.location.lat, p.location.lng]}
                  icon={createMarkerIcon(p.severity)}
                  eventHandlers={{
                    click: () => selectProblem(p),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                      <div className="text-xs text-slate-600">{p.location.address}</div>
                      <div className="text-xs font-mono text-emerald-600 mt-1">
                        GPS: {p.location.lat.toFixed(4)}, {p.location.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>

        {/* Selected Issue Details Side Panel */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 shrink-0">
            <CardTitle className="text-lg flex justify-between items-center">
              Selected Pin Details
              {activeProblem && (
                <Badge
                  variant={
                    activeProblem.severity === 'Critical'
                      ? 'danger'
                      : activeProblem.severity === 'High'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {activeProblem.severity}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6">
            {activeProblem ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-1">{activeProblem.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{activeProblem.description}</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">{activeProblem.location.address}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                    <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Lat: {activeProblem.location.lat.toFixed(4)}° | Lng: {activeProblem.location.lng.toFixed(4)}°
                    </span>
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
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm mt-4"
                >
                  View Detailed Analysis
                </Link>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">Click a pin on the Leaflet map to inspect coordinates.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
