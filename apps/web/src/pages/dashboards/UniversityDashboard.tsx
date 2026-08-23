import React, { useState } from 'react';
import { BookOpen, Users, Briefcase, Activity, CheckCircle2, ChevronRight, FileText, X, Clock, Target, PlusCircle, GraduationCap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from '../../components/ui';

// Mock Data for University Features
const newChallenges = [
  { id: 'CHL-890', title: 'Rural Healthcare AI Diagnosis', department: 'Unassigned', deadline: '2023-11-15' },
  { id: 'CHL-892', title: 'Solar Micro-Grid Optimization', department: 'Unassigned', deadline: '2023-11-20' },
];

const pendingProposals = [
  { id: 'PRJ-115', title: 'Smart Traffic Management', department: 'Computer Science', team: 'Forming', deadline: '2023-10-25' },
];

const activeProjects = [
  { id: 'PRJ-104', title: 'Water Purification System', nextMilestone: 'Prototype Phase 1 Review', deadline: '2023-10-15', status: 'On Track' },
  { id: 'PRJ-098', title: 'Bridge Structural Health AI', nextMilestone: 'Sensor Deployment', deadline: '2023-11-01', status: 'At Risk' },
];

export const UniversityDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Modal states
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <GraduationCap className="w-6 h-6 text-indigo-900" />
            University Academic Command Center
          </h1>
          <p className="text-xs text-slate-700 mt-1 font-bold uppercase tracking-wider">NEP 2020 Compliance & Student Innovation Tracking</p>
        </div>
        <div className="text-right">
          <Button onClick={() => navigate('/dashboard/challenges')} className="bg-indigo-900 hover:bg-indigo-950">
            Discover Government Challenges
          </Button>
        </div>
      </div>

      {/* NEP 2020 KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Experiential Learning" value="12,450" icon={Clock} trend="Hours Logged (NEP 2020)" color="text-indigo-800" bg="bg-indigo-50" border="border-indigo-200" />
        <StatCard title="Internship Credits" value="840" icon={CheckCircle2} trend="Credits Earned via SIIP" color="text-emerald-800" bg="bg-emerald-50" border="border-emerald-200" />
        <StatCard title="Multidisciplinary Teams" value="28" icon={Users} trend="Cross-Department Collabs" color="text-blue-800" bg="bg-blue-50" border="border-blue-200" />
        <StatCard title="Faculty Mentors" value="45" icon={BookOpen} trend="Active Academic Guides" color="text-purple-800" bg="bg-purple-50" border="border-purple-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Challenge Discovery & Triage */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="py-3 bg-amber-50/50 border-b border-slate-100">
              <CardTitle className="uppercase tracking-tight text-xs font-black flex justify-between items-center text-amber-900">
                <span>Incoming Challenges Awaiting Triage</span>
                <Badge variant="warning" className="text-[9px]">2 Action Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {newChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-black text-sm text-slate-900">{challenge.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">ID: {challenge.id} | Deadline: {challenge.deadline}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-[10px] py-1 h-auto" onClick={() => { setSelectedItem(challenge.id); setShowTriageModal(true); }}>Triage to Dept</Button>
                      <Button className="text-[10px] py-1 h-auto bg-amber-600 hover:bg-amber-700 text-white" onClick={() => alert('Challenge Accepted! Moved to Proposal stage.')}>Accept Challenge</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proposal Pipeline & Team Formation */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="py-3 bg-blue-50/50 border-b border-slate-100">
              <CardTitle className="uppercase tracking-tight text-xs font-black text-blue-900">Proposal & Team Formation Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {pendingProposals.map((proposal) => (
                  <div key={proposal.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-black text-sm text-slate-900">{proposal.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{proposal.department} | Due: {proposal.deadline}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-[10px] py-1 h-auto" onClick={() => { setSelectedItem(proposal.id); setShowTeamModal(true); }}>
                        <Users className="w-3 h-3 mr-1" /> Assign Team
                      </Button>
                      <Button className="text-[10px] py-1 h-auto bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setSelectedItem(proposal.id); setShowProposalModal(true); }}>
                        <FileText className="w-3 h-3 mr-1" /> Submit Proposal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestone Tracking */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="py-3 bg-emerald-50/50 border-b border-slate-100 flex justify-between items-center flex-row">
              <CardTitle className="uppercase tracking-tight text-xs font-black text-emerald-900">Active Project Milestones</CardTitle>
              <Button variant="outline" className="text-[10px] py-1 h-auto" onClick={() => navigate('/dashboard/projects')}>View Full Roster</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 uppercase tracking-wider font-black text-slate-600 text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Next Milestone</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {activeProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-black text-slate-900">{project.title}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{project.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-emerald-600" />
                          {project.nextMilestone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={project.status === 'At Risk' ? 'text-red-600 font-bold' : 'text-slate-600'}>
                          {project.deadline}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button className="text-[10px] py-1 px-2 h-auto bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                          Update Progress
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-black text-indigo-900 mb-2 uppercase tracking-tight">University Operations</h3>
              <div className="space-y-2">
                <Button className="w-full justify-between bg-white text-indigo-800 border border-indigo-300 hover:bg-indigo-100" onClick={() => navigate('/dashboard/projects')}>
                  <span>NEP 2020 Credit Reports</span>
                  <FileText className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between bg-white text-indigo-800 border border-indigo-300 hover:bg-indigo-100" onClick={() => setShowTeamModal(true)}>
                  <span>Manage Faculty Mentors</span>
                  <Users className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between bg-indigo-900 text-white border-none hover:bg-indigo-950" onClick={() => navigate('/dashboard/challenges')}>
                  <span>Browse Gov Challenges</span>
                  <Activity className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="uppercase tracking-tight text-xs font-black">NEP 2020 Credit Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Computer Science</span>
                  <span className="text-indigo-600">45%</span>
                </div>
                <Progress value={45} className="bg-indigo-100 [&>div]:bg-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Civil & Mechanical</span>
                  <span className="text-emerald-600">35%</span>
                </div>
                <Progress value={35} className="bg-emerald-100 [&>div]:bg-emerald-600" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Humanities & Social Sciences</span>
                  <span className="text-amber-600">20%</span>
                </div>
                <Progress value={20} className="bg-amber-100 [&>div]:bg-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      
      {/* Triage Modal */}
      {showTriageModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Triage Challenge</h3>
              <button onClick={() => setShowTriageModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-600 mb-4">Assign this challenge to a specific department for review before accepting.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Select Department</label>
                <select className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option>Computer Science & Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Electrical Engineering</option>
                  <option>Social Sciences</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowTriageModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowTriageModal(false); alert('Challenge triaged to department.'); }} className="bg-indigo-900 hover:bg-indigo-950 rounded-none text-white">Forward to Dept</Button>
            </div>
          </div>
        </div>
      )}

      {/* Team Formation & Mentor Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-lg w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Form Multidisciplinary Team</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Team Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Innovators Club" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Faculty Mentor Assignment</label>
                <select className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option>Dr. A. Sharma (Computer Science)</option>
                  <option>Prof. V. Kumar (Civil Eng)</option>
                </select>
              </div>
              <div className="border border-slate-200 p-3 bg-slate-50">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">NEP 2020 Multi-Disciplinary Check</label>
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-xs text-slate-600">Requires students from at least 2 different departments.</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add Student ID" className="flex-1 border border-slate-300 rounded-none px-2 py-1 text-sm focus:outline-none focus:border-indigo-500" />
                  <Button className="bg-slate-800 hover:bg-slate-900 text-white rounded-none py-1 h-auto text-xs"><PlusCircle className="w-3 h-3 mr-1" /> Add</Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowTeamModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowTeamModal(false); alert('Multidisciplinary team registered successfully!'); }} className="bg-blue-600 hover:bg-blue-700 rounded-none text-white">Register Team</Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-lg w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Submit Project Proposal</h3>
              <button onClick={() => setShowProposalModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-600 mb-4">Submit your technical approach and budget requirements to the government nodal officer for approval.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Executive Summary / Abstract</label>
                <textarea className="w-full border border-slate-300 rounded-none p-2 text-sm h-24 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Summarize the technical approach..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Estimated Budget (INR)</label>
                <input type="number" className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 500000" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Attach Full Proposal (PDF)</label>
                <input type="file" className="w-full border border-slate-300 rounded-none p-2 text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowProposalModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowProposalModal(false); alert('Proposal submitted for government review.'); }} className="bg-indigo-900 hover:bg-indigo-950 rounded-none text-white">Submit to Gov</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({ title, value, icon: Icon, trend, color, bg, border }: { title: string, value: string, icon: any, trend: string, color: string, bg: string, border: string }) {
  return (
    <div className={cn("p-4 border shadow-sm flex flex-col justify-between", bg, border)}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">{title}</h4>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <div className={cn("text-3xl font-black tracking-tight", color)}>{value}</div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">{trend}</div>
      </div>
    </div>
  );
}
