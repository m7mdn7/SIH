import React from 'react';
import { Role } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { mockGovStats, mockProblems, mockProjects } from '../data/mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, FileText, CheckCircle, Activity, Building, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard({ role }: { role: Role }) {
  if (role === 'Government') return <GovDashboard />;
  if (role === 'Citizen') return <CitizenDashboard />;
  if (role === 'University') return <UniversityDashboard />;
  if (role === 'Industry') return <IndustryDashboard />;
  return null;
}

function GovDashboard() {
  const chartData = [
    { name: 'Disaster', value: 450 },
    { name: 'Water', value: 320 },
    { name: 'Agriculture', value: 210 },
    { name: 'Health', value: 180 },
    { name: 'Infrastructure', value: 85 }
  ];

  const trendData = [
    { name: 'Jan', solved: 40, reported: 65 },
    { name: 'Feb', solved: 55, reported: 70 },
    { name: 'Mar', solved: 80, reported: 90 },
    { name: 'Apr', solved: 120, reported: 110 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">State Impact Dashboard</h2>
        <Badge variant="info" className="px-3 py-1 text-sm">Last Updated: Just Now</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Challenges" value={mockGovStats.totalChallenges} icon={FileText} trend="+12% this month" />
        <StatCard title="Critical Priority" value={mockGovStats.criticalChallenges} icon={Activity} trend="Requires Attention" variant="danger" />
        <StatCard title="Active Projects" value={mockGovStats.activeProjects} icon={Briefcase} trend="Across 12 Universities" />
        <StatCard title="Solved & Deployed" value={mockGovStats.solvedChallenges} icon={CheckCircle} trend="+8% vs last year" variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Challenges by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Velocity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="reported" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-lg"><Building className="w-6 h-6 text-white" /></div>
              <h3 className="text-lg font-medium">Universities</h3>
            </div>
            <p className="text-4xl font-bold mb-1">{mockGovStats.participation.universities}</p>
            <p className="text-emerald-100 text-sm">Active institutions innovating</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-lg"><Briefcase className="w-6 h-6 text-white" /></div>
              <h3 className="text-lg font-medium">Industry Partners</h3>
            </div>
            <p className="text-4xl font-bold mb-1">{mockGovStats.participation.industries}</p>
            <p className="text-blue-100 text-sm">Providing mentorship & tech</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-lg"><Users className="w-6 h-6 text-white" /></div>
              <h3 className="text-lg font-medium">Citizen Reporters</h3>
            </div>
            <p className="text-4xl font-bold mb-1">{mockGovStats.participation.citizens.toLocaleString()}</p>
            <p className="text-orange-100 text-sm">Engaged community members</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: any) {
  const iconColors = {
    default: "text-emerald-600 bg-emerald-50",
    success: "text-blue-600 bg-blue-50",
    danger: "text-red-600 bg-red-50"
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h4 className="text-3xl font-bold text-slate-800">{value}</h4>
          </div>
          <div className={`p-3 rounded-xl ${iconColors[variant as keyof typeof iconColors]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className={`text-sm mt-4 ${variant === 'danger' ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{trend}</p>
      </CardContent>
    </Card>
  );
}

function CitizenDashboard() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">See something? Report it.</h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Help improve our community by reporting issues. Your reports are automatically routed to the right university and government teams for rapid action.
        </p>
        <Link 
          to="/report" 
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
        >
          Report a Problem
        </Link>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mt-12 mb-4">Recent Community Reports</h3>
      <div className="space-y-4">
        {mockProblems.slice(0, 2).map(p => (
          <Card key={p.id}>
            <CardContent className="flex items-center p-6">
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-semibold text-slate-800">{p.title}</h4>
                  <Badge variant={p.severity === 'Critical' ? 'danger' : p.severity === 'High' ? 'warning' : 'default'}>
                    {p.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{p.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-400">ID: {p.id}</span>
                  <span className="text-xs font-medium text-emerald-600">{p.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UniversityDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">University Innovation Hub</h2>
      <p className="text-slate-600">Review AI-matched challenges for your institution's expertise and manage active projects.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-emerald-200 shadow-emerald-100/50">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
            <CardTitle className="text-emerald-900">Recommended Challenges (AI Matched)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              <div className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900 text-lg">Flood Damaged Bridge</h4>
                    <p className="text-sm text-slate-500">Disaster Management • Ramgarh District</p>
                  </div>
                  <Badge variant="success" className="text-sm py-1 bg-emerald-100 text-emerald-800 border border-emerald-200">94% Match</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="default" className="text-xs bg-slate-100 text-slate-600">Civil Eng.</Badge>
                  <Badge variant="default" className="text-xs bg-slate-100 text-slate-600">AI/ML</Badge>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link to="/challenges/PRB-001" className="text-emerald-600 text-sm font-medium hover:text-emerald-800 flex items-center">
                    Review Challenge &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {mockProjects.map(proj => (
                <div key={proj.id} className="p-4">
                  <h4 className="font-medium text-slate-800">{proj.title}</h4>
                  <div className="flex items-center justify-between mt-2 mb-1">
                    <span className="text-xs text-slate-500">Phase: {proj.currentPhase}</span>
                    <span className="text-xs font-medium text-slate-700">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link to={`/projects/${proj.id}`} className="text-emerald-600 text-sm font-medium hover:text-emerald-800">
                      Manage Project
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IndustryDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Industry Partner Portal</h2>
      <p className="text-slate-600">Discover active university projects to sponsor, mentor, or provide technology for real-world impact.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card>
          <CardContent className="p-6">
            <h3 className="text-4xl font-bold text-slate-800 mb-2">12</h3>
            <p className="text-sm font-medium text-slate-500">Projects Funded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-4xl font-bold text-slate-800 mb-2">4</h3>
            <p className="text-sm font-medium text-slate-500">Active Mentorships</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-4xl font-bold text-slate-800 mb-2">85%</h3>
            <p className="text-sm font-medium text-slate-500">CSR Impact Score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunities for Collaboration</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
             {mockProjects.map(proj => (
                <div key={proj.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div>
                    <h4 className="font-medium text-slate-800 text-lg">{proj.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">Lead: {proj.universityName} • Phase: {proj.currentPhase}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="info">Seeking Hardware</Badge>
                      <Badge variant="info">Seeking Mentorship</Badge>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                      Offer Support
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
