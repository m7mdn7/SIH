import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { AlertTriangle, Briefcase, CheckCircle2, Users, Building, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

// Mock Data
const trendData = [
  { name: 'Jan', challenges: 120, resolved: 80 },
  { name: 'Feb', challenges: 150, resolved: 90 },
  { name: 'Mar', challenges: 180, resolved: 140 },
  { name: 'Apr', challenges: 220, resolved: 180 },
  { name: 'May', challenges: 260, resolved: 230 },
  { name: 'Jun', challenges: 210, resolved: 240 },
];

const participationData = [
  { name: 'Universities', value: 45 },
  { name: 'Industry Partners', value: 32 },
  { name: 'Active Student Teams', value: 128 },
];

const highRiskChallenges = [
  { id: 'CHL-092', title: 'Contaminated Water Supply in Block B', location: 'Ranchi', severity: 'Critical', reported: '2 hours ago' },
  { id: 'CHL-087', title: 'Bridge Structural Damage', location: 'Dhanbad', severity: 'Critical', reported: '5 hours ago' },
  { id: 'CHL-081', title: 'Crop Failure due to Unknown Pest', location: 'Bokaro', severity: 'High', reported: '1 day ago' },
];

export const GovDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isDistrict = user?.level === 'District';
  const districtName = user?.district || 'Unknown District';
  
  const displayedChallenges = isDistrict 
    ? highRiskChallenges.filter(c => c.location === districtName)
    : highRiskChallenges;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-gov-slate-200 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-gov-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Activity className="w-5 h-5 text-gov-blue-800" />
            {isDistrict ? `${districtName} District Overview` : 'State Overview Dashboard'}
          </h1>
          <p className="text-xs text-gov-slate-700 mt-1 font-bold uppercase tracking-wider">
            {isDistrict ? `Real-time Metrics for ${districtName}` : 'Real-time Metrics & Challenge Analysis'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-widest font-black text-gov-slate-500">Last Updated</div>
          <div className="text-xs font-bold text-gov-blue-900">{new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={isDistrict ? `Active Challenges (${districtName})` : "Total Active Challenges"} value={isDistrict ? "142" : "1,248"} icon={AlertTriangle} trend={isDistrict ? "+4% this month" : "+12% this month"} color="text-amber-700" bg="bg-amber-50" border="border-amber-200" />
        <StatCard title="Critical / High Risk" value={isDistrict ? "6" : "42"} icon={AlertTriangle} trend="-5% this month" color="text-red-700" bg="bg-red-50" border="border-red-200" />
        <StatCard title="Active Projects" value="315" icon={Briefcase} trend="+24% this month" color="text-gov-blue-800" bg="bg-gov-blue-50" border="border-gov-blue-200" />
        <StatCard title="Resolved (YTD)" value="8,492" icon={CheckCircle2} trend="+18% this year" color="text-green-800" bg="bg-green-50" border="border-green-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-gov-slate-200 rounded-none p-4 shadow-sm">
          <h3 className="text-sm font-black text-gov-slate-900 mb-4 uppercase tracking-tight border-b border-gov-slate-100 pb-2">Challenge Submission vs Resolution Trends</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="challenges" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#1e3a8a' }} activeDot={{ r: 6 }} name="Reported Challenges" />
                <Line type="monotone" dataKey="resolved" stroke="#166534" strokeWidth={3} dot={{ r: 4, fill: '#166534' }} activeDot={{ r: 6 }} name="Resolved Projects" />
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold', fill: '#475569' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '0', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Participation Stats */}
        <div className="bg-white border border-gov-slate-200 rounded-none p-4 shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-gov-slate-900 mb-4 uppercase tracking-tight border-b border-gov-slate-100 pb-2">Institutional Participation</h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {participationData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-l-4 border-gov-blue-800 pl-3">
                <div className="flex items-center">
                  {idx === 0 ? <Building className="w-4 h-4 text-gov-slate-500 mr-2" /> : 
                   idx === 1 ? <Briefcase className="w-4 h-4 text-gov-slate-500 mr-2" /> : 
                   <Users className="w-4 h-4 text-gov-slate-500 mr-2" />}
                  <span className="text-xs font-bold text-gov-slate-700 uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-lg font-black text-gov-blue-900">{item.value}</span>
              </div>
            ))}
            
            <div className="mt-6 p-3 bg-gov-slate-50 border border-gov-slate-200">
              <div className="text-[10px] font-black uppercase tracking-widest text-gov-slate-500 mb-1">Total Active Participants</div>
              <div className="text-2xl font-black text-gov-slate-900">4,821</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable List */}
      <div className="bg-white border border-gov-slate-200 rounded-none p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-gov-slate-100 pb-2">
          <h3 className="text-sm font-black text-gov-slate-900 uppercase tracking-tight">
            {isDistrict ? `${districtName} High-Risk Challenges` : 'High-Risk / Unresolved Challenges'}
          </h3>
          <button 
            onClick={() => navigate('/dashboard/challenges')}
            className="text-[10px] font-bold uppercase tracking-widest text-gov-blue-800 hover:text-gov-blue-900 transition-colors">
            View All &rarr;
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gov-slate-50 border-b border-gov-slate-200 uppercase tracking-wider font-black text-gov-slate-600 text-[10px]">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Severity</th>
                <th className="px-4 py-2">Reported</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-slate-200 font-medium text-gov-slate-800">
              {displayedChallenges.length > 0 ? displayedChallenges.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-gov-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold">{challenge.id}</td>
                  <td className="px-4 py-3">{challenge.title}</td>
                  <td className="px-4 py-3">{challenge.location}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-none",
                      challenge.severity === 'Critical' ? "bg-red-50 border-red-300 text-red-800" : "bg-amber-50 border-amber-300 text-amber-800"
                    )}>
                      {challenge.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gov-slate-500">{challenge.reported}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => navigate(`/dashboard/challenges/${challenge.id}`)}
                      className="text-[10px] font-bold uppercase tracking-wider text-white bg-gov-blue-900 hover:bg-gov-blue-800 px-3 py-1 border border-gov-blue-950 transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gov-slate-500 font-bold uppercase tracking-wider">
                    No high-risk challenges reported for this jurisdiction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon: Icon, trend, color, bg, border }: { title: string, value: string, icon: any, trend: string, color: string, bg: string, border: string }) {
  return (
    <div className={cn("p-4 border shadow-sm rounded-none flex flex-col justify-between", bg, border)}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gov-slate-600">{title}</h4>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <div className={cn("text-3xl font-black tracking-tight", color)}>{value}</div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-gov-slate-500 mt-1">{trend}</div>
      </div>
    </div>
  );
}
