import React, { useState } from 'react';
import { Factory, Banknote, Users, Lightbulb, CheckCircle2, ChevronRight, MessageSquare, Wrench, X, TrendingUp, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from '../../components/ui';

// Mock Data for Industry Features
const expertiseMatches = [
  { id: 'PRJ-145', title: 'Smart Grid Load Balancing Algorithm', university: 'IIT ISM Dhanbad', matchScore: '94%', category: 'Electrical' },
  { id: 'PRJ-148', title: 'Eco-friendly Slag Utilization', university: 'NIT Jamshedpur', matchScore: '88%', category: 'Materials' },
];

const mentoredProjects = [
  { id: 'PRJ-098', title: 'Bridge Structural Health AI', nextSession: 'Tomorrow, 14:00', mentor: 'R. K. Singh (Sr. Engineer)' },
];

const prototypeProjects = [
  { id: 'PRJ-104', title: 'Water Purification System', phase: 'Prototype Testing', testingStatus: 'Pending Review' },
];

export const IndustryDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Modal states
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [showPrototypeModal, setShowPrototypeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Factory className="w-6 h-6 text-purple-900" />
            Corporate Partner Command Center
          </h1>
          <p className="text-xs text-slate-700 mt-1 font-bold uppercase tracking-wider">CSR Allocation, Mentorship & Technical Collaboration</p>
        </div>
        <div className="text-right">
          <Button onClick={() => navigate('/dashboard/projects')} className="bg-purple-900 hover:bg-purple-950">
            Browse All Projects
          </Button>
        </div>
      </div>

      {/* Corporate KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Funding Committed" value="₹24.5L" icon={Banknote} trend="CSR Budget Utilized" color="text-purple-800" bg="bg-purple-50" border="border-purple-200" />
        <StatCard title="Active Mentorships" value="12" icon={Users} trend="Experts Deployed" color="text-blue-800" bg="bg-blue-50" border="border-blue-200" />
        <StatCard title="Prototypes Backed" value="4" icon={Wrench} trend="In Testing Phase" color="text-amber-800" bg="bg-amber-50" border="border-amber-200" />
        <StatCard title="Expertise Match Rate" value="88%" icon={TrendingUp} trend="Successful Pairings" color="text-emerald-800" bg="bg-emerald-50" border="border-emerald-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Expertise Match Inbox */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="py-3 bg-purple-50/50 border-b border-slate-100">
              <CardTitle className="uppercase tracking-tight text-xs font-black flex justify-between items-center text-purple-900">
                <span>Expertise Matches (New Proposals)</span>
                <Badge variant="default" className="text-[9px] bg-purple-200 text-purple-900 hover:bg-purple-300 border-transparent">2 Matches Found</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {expertiseMatches.map((match) => (
                  <div key={match.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-black text-sm text-slate-900">{match.title}</div>
                        <Badge variant="success" className="text-[9px]">{match.matchScore} Match</Badge>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{match.university} | Category: {match.category}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-[10px] py-1 h-auto" onClick={() => { setSelectedItem(match.id); setShowMentorshipModal(true); }}>Offer Mentorship</Button>
                      <Button className="text-[10px] py-1 h-auto bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { setSelectedItem(match.id); setShowFundingModal(true); }}>Review for Funding</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mentorship Pipeline */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="py-3 bg-blue-50/50 border-b border-slate-100">
              <CardTitle className="uppercase tracking-tight text-xs font-black text-blue-900">Active Technical Mentorships</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {mentoredProjects.map((project) => (
                  <div key={project.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-black text-sm text-slate-900">{project.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Assigned to: {project.mentor}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Session</div>
                        <div className="text-[10px] font-bold text-slate-700">{project.nextSession}</div>
                      </div>
                      <Button className="text-[10px] py-1 h-auto bg-blue-100 text-blue-800 hover:bg-blue-200" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                        <MessageSquare className="w-3 h-3 mr-1" /> Mentor Workspace
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prototype Collaboration */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="py-3 bg-amber-50/50 border-b border-slate-100 flex justify-between items-center flex-row">
              <CardTitle className="uppercase tracking-tight text-xs font-black text-amber-900">Prototype Testing & Scaling</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 border-y border-slate-200 uppercase tracking-wider font-black text-slate-600 text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Phase</th>
                    <th className="px-4 py-3">Industry Action</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {prototypeProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-black text-slate-900">{project.title}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{project.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-600" />
                          {project.phase}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider">
                          {project.testingStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button className="text-[10px] py-1 px-2 h-auto bg-amber-600 text-white hover:bg-amber-700" onClick={() => { setSelectedItem(project.id); setShowPrototypeModal(true); }}>
                          Review Prototype
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
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">Partner Operations</h3>
              <div className="space-y-2">
                <Button className="w-full justify-between bg-white text-slate-800 border border-slate-300 hover:bg-slate-100" onClick={() => navigate('/dashboard/projects')}>
                  <span>CSR Impact Report</span>
                  <FileText className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between bg-white text-slate-800 border border-slate-300 hover:bg-slate-100" onClick={() => navigate('/dashboard/challenges')}>
                  <span>Define New Challenge</span>
                  <Lightbulb className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between bg-slate-900 text-white border-none hover:bg-slate-950" onClick={() => setShowFundingModal(true)}>
                  <span>Allocate CSR Funds</span>
                  <Banknote className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="uppercase tracking-tight text-xs font-black">Expertise Profile Strength</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Manufacturing & Materials</span>
                  <span className="text-purple-600">High</span>
                </div>
                <Progress value={90} className="bg-purple-100 [&>div]:bg-purple-600" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Software & AI</span>
                  <span className="text-slate-600">Medium</span>
                </div>
                <Progress value={50} className="bg-slate-100 [&>div]:bg-slate-600" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Renewable Energy</span>
                  <span className="text-emerald-600">High</span>
                </div>
                <Progress value={75} className="bg-emerald-100 [&>div]:bg-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      
      {/* Funding Modal */}
      {showFundingModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Commit Funding / Support</h3>
              <button onClick={() => setShowFundingModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-600 mb-4">Allocate CSR funds or material resources to support a university project.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Target Project</label>
                <select className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-purple-500">
                  <option>PRJ-145: Smart Grid Load Balancing</option>
                  <option>PRJ-148: Eco-friendly Slag</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Support Type</label>
                <select className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-purple-500">
                  <option>Financial Grant (CSR)</option>
                  <option>Hardware/Equipment Donation</option>
                  <option>Cloud Credits</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Commitment Value (INR Equivalent)</label>
                <input type="number" className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="e.g. 200000" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowFundingModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowFundingModal(false); alert('Funding commitment submitted for verification.'); }} className="bg-purple-900 hover:bg-purple-950 rounded-none text-white">Authorize Support</Button>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Modal */}
      {showMentorshipModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Offer Technical Mentorship</h3>
              <button onClick={() => setShowMentorshipModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Assign Expert</label>
                <select className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-blue-500">
                  <option>R. K. Singh (Materials Eng)</option>
                  <option>P. Desai (Software Architect)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Mentorship Hours per Month</label>
                <input type="number" className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. 10" defaultValue="10" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Initial Feedback to Team</label>
                <textarea className="w-full border border-slate-300 rounded-none p-2 text-sm h-20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Briefly explain how you can help..."></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowMentorshipModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowMentorshipModal(false); alert('Mentorship offer sent to the university team.'); }} className="bg-blue-600 hover:bg-blue-700 rounded-none text-white">Offer Mentorship</Button>
            </div>
          </div>
        </div>
      )}

      {/* Prototype Review Modal */}
      {showPrototypeModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-lg w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Review Prototype Milestone</h3>
              <button onClick={() => setShowPrototypeModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-600 mb-4">Provide industry-standard feedback on the submitted prototype tests for PRJ-104.</p>
            <div className="space-y-4">
              <div className="border border-slate-200 p-3 bg-slate-50 mb-2">
                <div className="flex items-center gap-2 mb-1">
                   <FileText className="w-4 h-4 text-slate-500" />
                   <span className="text-xs font-bold text-slate-800">Test_Results_v2.pdf</span>
                </div>
                <a href="#" className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:underline">Download Attached Artifact</a>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Review Decision</label>
                <select className="w-full border border-slate-300 rounded-none p-2 text-sm focus:outline-none focus:border-amber-500">
                  <option>Approved for Next Phase</option>
                  <option>Requires Iteration (See notes)</option>
                  <option>Failed Industry Standards</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Technical Feedback / Notes</label>
                <textarea className="w-full border border-slate-300 rounded-none p-2 text-sm h-24 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" placeholder="Provide detailed feedback on durability, cost-efficiency, etc..."></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowPrototypeModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowPrototypeModal(false); alert('Prototype feedback submitted.'); }} className="bg-amber-600 hover:bg-amber-700 rounded-none text-white">Submit Review</Button>
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
