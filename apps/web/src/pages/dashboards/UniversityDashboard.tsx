import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Briefcase, CheckCircle2, Target, PlusCircle, GraduationCap, RefreshCw, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from '../../components/ui';
import { fetchProblems } from '../../services/api';
import { Problem } from '../../types';

export const UniversityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await fetchProblems();
      setChallenges(data || []);
    } catch (err) {
      console.warn('Failed to fetch university challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b-2 border-slate-300 pb-3 flex justify-between items-end bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <GraduationCap className="w-6 h-6 text-indigo-900" />
            University Academic Command Center
          </h1>
          <p className="text-xs text-slate-700 mt-1 font-bold uppercase tracking-wider">NEP 2020 Compliance & Student Innovation Tracking — Live API Synced</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadChallenges} disabled={loading} variant="outline" className="text-xs font-bold uppercase tracking-wider">
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loading && "animate-spin")} /> Sync Challenges
          </Button>
          <Button onClick={() => navigate('/dashboard/challenges')} className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider">
            Discover Gov Challenges
          </Button>
        </div>
      </div>

      {/* NEP 2020 KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Experiential Learning" value="12,450" icon={BookOpen} trend="Hours Logged (NEP 2020)" color="text-indigo-900" bg="bg-indigo-50" border="border-indigo-300" />
        <StatCard title="Internship Credits" value="840" icon={CheckCircle2} trend="Credits Earned via SIIP" color="text-emerald-900" bg="bg-emerald-50" border="border-emerald-300" />
        <StatCard title="Multidisciplinary Teams" value="28" icon={Users} trend="Cross-Department Collabs" color="text-blue-900" bg="bg-blue-50" border="border-blue-300" />
        <StatCard title="Matched Challenges" value={challenges.length.toString()} icon={Cpu} trend="AI HEI Matching Engine" color="text-purple-900" bg="bg-purple-50" border="border-purple-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Challenge Discovery & Triage */}
          <Card className="border-2 border-slate-300 border-l-8 border-l-amber-600 rounded-none bg-white shadow-sm">
            <CardHeader className="py-3 bg-amber-50 border-b border-slate-200">
              <CardTitle className="uppercase tracking-tight text-xs font-black flex justify-between items-center text-amber-900">
                <span>Live Challenges Awaiting Academic Triage</span>
                <Badge variant="warning" className="text-[10px] font-black uppercase">{challenges.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center text-xs font-bold text-slate-600">Loading incoming live challenges...</div>
              ) : challenges.length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-600">No active challenges in database.</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {challenges.map((c) => (
                    <div key={c.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-black text-sm text-slate-900 uppercase tracking-tight">{c.title}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest mt-1">
                          ID: {c.id} | Location: {c.location.address} | Category: {c.category}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" className="text-[10px] font-bold py-1 h-auto uppercase tracking-wider" onClick={() => setShowTriageModal(true)}>Triage to Dept</Button>
                        <Button className="text-[10px] font-black py-1 h-auto bg-amber-700 hover:bg-amber-800 text-white uppercase tracking-wider" onClick={() => alert(`Accepted challenge "${c.title}"! Project initiated.`)}>Accept Match</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposal Pipeline & Team Formation */}
          <Card className="border-2 border-slate-300 border-l-8 border-l-blue-600 rounded-none bg-white shadow-sm">
            <CardHeader className="py-3 bg-blue-50 border-b border-slate-200">
              <CardTitle className="uppercase tracking-tight text-xs font-black text-blue-900">Proposal & Team Formation Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-200">
              <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <div className="font-black text-sm text-slate-900">Smart Water Filtration Optimization</div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Civil & Environmental | Status: Team Forming</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-[10px] font-bold py-1 h-auto uppercase" onClick={() => setShowTeamModal(true)}>
                    <Users className="w-3 h-3 mr-1" /> Assign Team
                  </Button>
                  <Button className="text-[10px] font-black py-1 h-auto bg-blue-900 hover:bg-blue-800 text-white uppercase" onClick={() => setShowProposalModal(true)}>
                    Submit Proposal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestone Tracking */}
          <Card className="border-2 border-slate-300 border-l-8 border-l-emerald-600 rounded-none bg-white shadow-sm">
            <CardHeader className="py-3 bg-emerald-50 border-b border-slate-200 flex justify-between items-center flex-row">
              <CardTitle className="uppercase tracking-tight text-xs font-black text-emerald-900">Active R&D Milestones</CardTitle>
              <Button variant="outline" className="text-[10px] font-bold py-1 h-auto uppercase" onClick={() => navigate('/dashboard/projects')}>View All Projects</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 uppercase tracking-wider font-black text-slate-700 text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Next Milestone</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-black text-slate-900">Water Purification System</div>
                      <div className="text-[9px] font-mono font-bold text-slate-500">PRJ-104</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-bold text-emerald-800">
                        <Target className="w-3.5 h-3.5" /> Prototype Review
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button className="text-[10px] font-bold py-1 px-2 h-auto bg-emerald-900 text-white hover:bg-emerald-800" onClick={() => navigate('/dashboard/projects')}>
                        Update Progress
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-indigo-50 border-2 border-indigo-200 rounded-none shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-black text-indigo-900 mb-2 uppercase tracking-tight">University Operations</h3>
              <div className="space-y-2">
                <Button className="w-full justify-between bg-white text-indigo-900 font-bold border border-indigo-300 hover:bg-indigo-100 text-xs" onClick={() => navigate('/dashboard/projects')}>
                  <span>NEP 2020 Credit Reports</span>
                  <BookOpen className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between bg-indigo-900 text-white font-bold border-none hover:bg-indigo-950 text-xs" onClick={() => navigate('/dashboard/challenges')}>
                  <span>Browse Gov Challenges</span>
                  <Cpu className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-slate-300 rounded-none shadow-sm">
            <CardHeader className="py-3 border-b border-slate-200">
              <CardTitle className="uppercase tracking-tight text-xs font-black">NEP 2020 Credit Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Computer Science & IT</span>
                  <span className="text-indigo-700">45%</span>
                </div>
                <Progress value={45} className="bg-indigo-100 [&>div]:bg-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Civil & Infrastructure</span>
                  <span className="text-emerald-700">35%</span>
                </div>
                <Progress value={35} className="bg-emerald-100 [&>div]:bg-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon: Icon, trend, color, bg, border }: { title: string, value: string, icon: any, trend: string, color: string, bg: string, border: string }) {
  return (
    <div className={cn("p-4 border-2 shadow-sm flex flex-col justify-between rounded-none", bg, border)}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">{title}</h4>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <div className={cn("text-3xl font-black tracking-tight", color)}>{value}</div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mt-1">{trend}</div>
      </div>
    </div>
  );
}
