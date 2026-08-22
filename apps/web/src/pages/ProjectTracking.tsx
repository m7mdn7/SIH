import React from 'react';
import { useParams } from 'react-router-dom';
import { mockProjects } from '../data/mock';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress, Button } from '../components/ui';
import { CheckCircle, Clock, Users, Building, AlertCircle, FileText, Upload, X } from 'lucide-react';

export function ProjectTracking() {
  const { id } = useParams();
  
  // Local state to simulate updates without a real backend
  const [project, setProject] = React.useState(mockProjects[0]);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [showTeamModal, setShowTeamModal] = React.useState(false);
  const [activeMilestone, setActiveMilestone] = React.useState<number | null>(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <Badge variant="info" className="mb-2">Phase: {project.currentPhase}</Badge>
          <h2 className="text-3xl font-bold text-slate-900">{project.title}</h2>
          <p className="text-slate-500 mt-1">Led by {project.universityName}</p>
        </div>
        <Button onClick={() => setShowReportModal(true)} className="bg-emerald-700 hover:bg-emerald-800 rounded-none">Submit Phase Report</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-700">Overall Progress</span>
                  <span className="text-emerald-600">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>

              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                {project.milestones.map((milestone, idx) => {
                  const isCompleted = milestone.status === 'Completed';
                  const isInProgress = milestone.status === 'In Progress';
                  
                  return (
                    <div key={milestone.id} className="relative pl-8">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-white
                        ${isCompleted ? 'border-emerald-500' : isInProgress ? 'border-emerald-500' : 'border-slate-300'}`}
                      >
                        {isCompleted && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                        {isInProgress && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                      </div>

                      <div className={`p-4 rounded-none border ${isInProgress ? 'border-emerald-200 bg-emerald-50/50 shadow-sm' : 'border-slate-100 bg-white'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-semibold ${isCompleted ? 'text-slate-700' : isInProgress ? 'text-emerald-900' : 'text-slate-500'}`}>
                            {idx + 1}. {milestone.title}
                          </h4>
                          <Badge variant={isCompleted ? 'success' : isInProgress ? 'info' : 'default'} className="text-[10px] uppercase">
                            {milestone.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-2">
                          <Clock className="w-3.5 h-3.5" /> Due: {milestone.dueDate}
                        </p>
                        
                        {isInProgress && (
                           <div className="mt-4 flex gap-2">
                             <Button onClick={() => { setActiveMilestone(milestone.id); setShowUploadModal(true); }} variant="outline" className="text-xs py-1.5 h-auto bg-white rounded-none">Upload Artifact</Button>
                             <Button 
                               onClick={() => {
                                 const updated = {...project};
                                 const ms = updated.milestones.find(m => m.id === milestone.id);
                                 if (ms) ms.status = 'Completed';
                                 
                                 // Make the next one in progress if it exists
                                 const nextMs = updated.milestones[idx + 1];
                                 if (nextMs) nextMs.status = 'In Progress';
                                 
                                 updated.progress = Math.min(100, updated.progress + 25);
                                 setProject(updated);
                               }} 
                               className="text-xs py-1.5 h-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-none">
                               Mark Complete
                             </Button>
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {project.teamMembers.map((member, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button onClick={() => setShowTeamModal(true)} variant="outline" className="w-full mt-6 text-sm rounded-none border-slate-300">Manage Team</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-slate-500" />
                Industry Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.industryPartners.length > 0 ? (
                <ul className="space-y-4">
                  {project.industryPartners.map((partner) => (
                     <li key={partner.id} className="p-3 bg-slate-50 rounded-none border border-slate-100">
                      <p className="font-medium text-slate-900 text-sm">{partner.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <p className="text-xs text-slate-600">{partner.contributionType}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No industry partners yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Artifact Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Upload Project Artifact</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="border-2 border-dashed border-slate-300 p-8 text-center bg-slate-50 mb-4 cursor-pointer hover:bg-slate-100 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Click or drag file to upload</p>
              <p className="text-xs text-slate-500 mt-1">PDF, DOCX, ZIP (Max 50MB)</p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowUploadModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowUploadModal(false); alert('Artifact uploaded successfully'); }} className="bg-emerald-600 hover:bg-emerald-700 rounded-none text-white">Upload</Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Phase Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-lg w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Submit Phase Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Executive Summary</label>
                <textarea className="w-full border border-slate-300 rounded-none p-2 text-sm h-24 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Summarize the progress made in this phase..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Challenges Faced</label>
                <textarea className="w-full border border-slate-300 rounded-none p-2 text-sm h-16 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Any blockers or issues?"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Attach Detailed Report (PDF)</label>
                <input type="file" className="w-full border border-slate-300 rounded-none p-2 text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowReportModal(false)} className="rounded-none">Cancel</Button>
              <Button onClick={() => { setShowReportModal(false); alert('Report submitted for government review.'); }} className="bg-emerald-600 hover:bg-emerald-700 rounded-none text-white">Submit to Government</Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full rounded-none shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Manage Team Roster</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-6">
              {project.teamMembers.map((member, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 border border-slate-100">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                  <button className="text-xs text-red-600 hover:text-red-800 font-bold uppercase tracking-wider">Remove</button>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Add New Member</h4>
              <div className="flex gap-2">
                <input type="text" placeholder="Student ID or Email" className="flex-1 border border-slate-300 rounded-none px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" />
                <Button className="bg-slate-800 hover:bg-slate-900 text-white rounded-none py-1 h-auto text-xs">Add</Button>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowTeamModal(false)} className="bg-emerald-600 hover:bg-emerald-700 rounded-none text-white w-full">Done</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
