import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockProblems, mockAiAnalysisForPrb001, mockUniversityMatches } from '../data/mock';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from '../components/ui';
import { Brain, MapPin, AlertTriangle, CheckCircle, Users, ArrowRight, Activity, Cpu } from 'lucide-react';
import { Role } from '../types';

export function ChallengeDetail({ role }: { role: Role }) {
  const { id } = useParams();
  const problem = mockProblems.find(p => p.id === (id || 'PRB-001')) || mockProblems[0];
  const ai = mockAiAnalysisForPrb001;
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">{problem.title}</h2>
            <Badge variant="danger">{problem.severity}</Badge>
          </div>
          <p className="text-slate-500 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {problem.location.address}
          </p>
        </div>
        {role === 'University' && !accepted && (
          <Button onClick={() => setAccepted(true)} className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
            Accept Challenge & Form Team
          </Button>
        )}
        {accepted && (
          <Badge variant="success" className="px-4 py-2 text-sm shadow-sm border border-emerald-200">
            <CheckCircle className="w-4 h-4 mr-2 inline" />
            Challenge Accepted
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Problem Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed">{problem.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-4 rounded-none border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Affected Population</p>
                    <p className="text-xl font-bold text-slate-800">{problem.affectedPopulation.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-none border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Reported By</p>
                    <p className="text-xl font-bold text-slate-800">{problem.reporterName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Section */}
          <Card className="border-emerald-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-3">
              <div className="bg-emerald-600 text-white p-2 rounded-none">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900">AI Analysis & Classification</h3>
                <p className="text-sm text-emerald-700">Powered by Google Gemini</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Classification</p>
                    <p className="font-semibold text-slate-900">{ai.classification}</p>
                 </div>
                 <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Duplicate Risk</p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-600">{ai.duplicateRisk}%</span>
                      <span className="text-sm text-slate-500">(Unique report)</span>
                    </div>
                 </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Calculated Priority Score</span>
                  <span className="text-sm font-bold text-red-600">{ai.priorityScore}/100</span>
                </div>
                <Progress value={ai.priorityScore} className="h-2 bg-red-100 [&>div]:bg-red-600" />
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-slate-500 mb-2">Required Expertise Extracted</p>
                <div className="flex flex-wrap gap-2">
                  {ai.requiredExpertise.map(exp => (
                    <Badge key={exp} variant="info" className="bg-blue-50 border border-blue-100 text-blue-700">{exp}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-none border border-slate-200">
                <p className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  AI Suggested Solutions
                </p>
                <ul className="space-y-2">
                  {ai.suggestedSolutions.map((sol, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span> {sol}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: University Matches & Routing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                University Matching
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100">
                  {mockUniversityMatches.map((uni, idx) => (
                    <div key={uni.universityId} className={`p-5 ${idx === 0 ? 'bg-emerald-50/50' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900">{uni.name}</h4>
                        <span className={`text-sm font-bold ${idx === 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {uni.matchPercentage}% Match
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {uni.relevantExpertise.map(exp => (
                          <span key={exp} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-none">
                            {exp}
                          </span>
                        ))}
                      </div>
                      {idx === 0 && (
                        <div className="mt-3 text-xs text-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3 h-3" /> Best fit based on past success rate ({uni.pastProjectsSuccessRate}%)
                        </div>
                      )}
                      {role === 'Government' && (
                        <div className="mt-4">
                          <Button 
                            onClick={() => alert(`Assigned challenge to ${uni.name}`)}
                            className="text-[10px] text-white uppercase tracking-wider py-1 h-auto bg-gov-blue-700 hover:bg-gov-blue-900 rounded-none border border-gov-blue-900">
                            Assign to University
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

          {role === 'Industry' && (
            <Card className="bg-emerald-600 text-white border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Offer Support</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Partner with the university team taking this challenge. Provide funding, materials, or mentorship.
                </p>
                <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50">Join as Partner</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
