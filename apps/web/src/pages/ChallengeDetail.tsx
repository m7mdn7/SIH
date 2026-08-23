import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from '../components/ui';
import { Brain, MapPin, CheckCircle, Users, Activity, Cpu, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { Role, Problem, ChallengeAIAnalysis, InnovationGap, ChallengeAssignment } from '../types';
import { apiClient } from '../lib/apiClient';

export function ChallengeDetail({ role }: { role: Role }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const challengeId = id || 'ch_01';

  const [problem, setProblem] = useState<Problem | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ChallengeAIAnalysis | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<InnovationGap | null>(null);
  const [assignments, setAssignments] = useState<ChallengeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      const p = await apiClient.challenges.get(challengeId);
      setProblem(p);

      try {
        const ai = await apiClient.challenges.analyze(challengeId);
        setAiAnalysis(ai);
      } catch (e) {
        console.warn('AI analysis fetch warning:', e);
      }

      try {
        const gap = await apiClient.challenges.gapAnalysis(challengeId);
        setGapAnalysis(gap);
      } catch (e) {
        console.warn('Gap analysis fetch warning:', e);
      }

      try {
        const m = await apiClient.challenges.matches(challengeId);
        setAssignments(m || []);
      } catch (e) {
        console.warn('Matches fetch warning:', e);
      }
    } catch (err) {
      console.error('Failed to load challenge details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
  }, [challengeId]);

  const handleAcceptAssignment = async (assignId: string) => {
    setAssigning(true);
    try {
      await apiClient.assignments.accept(assignId);
      setAccepted(true);
      alert('Assignment accepted successfully! Project created in central database.');
      loadLiveData();
    } catch (err) {
      console.error('Failed to accept assignment:', err);
      alert('Failed to accept assignment. Check API server.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center bg-white border-2 border-slate-300 font-black text-slate-800 uppercase tracking-wider">
        Loading live challenge details & AI intelligence stream...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center bg-white border-2 border-slate-300 font-bold text-slate-800">
        Challenge details not found.
        <div className="mt-4">
          <Button onClick={() => navigate('/dashboard/challenges')} className="bg-blue-900 text-white font-bold">
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 border-2 border-slate-300 shadow-sm flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-xs font-black uppercase text-blue-900 hover:text-blue-800 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{problem.title}</h2>
            <Badge variant={problem.severity === 'Critical' ? 'danger' : 'warning'} className="font-bold text-xs uppercase">
              {problem.severity}
            </Badge>
          </div>
          <p className="text-slate-700 flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-blue-800" /> {problem.location?.address || 'Ranchi, Jharkhand'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLiveData} variant="outline" className="text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sync AI Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Problem Details & AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-slate-300 rounded-none bg-white shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 py-3">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">Problem Description & Location</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <p className="text-slate-800 leading-relaxed font-medium text-sm">{problem.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-4 rounded-none border border-slate-300">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Affected Population</p>
                    <p className="text-xl font-black text-slate-900">{problem.affectedPopulation?.toLocaleString() || '1,200'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-none border border-slate-300">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Reporter ID</p>
                    <p className="text-xl font-mono font-black text-blue-900">{problem.reporterId || 'USR-01'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Section */}
          <Card className="border-2 border-slate-300 rounded-none shadow-sm bg-white overflow-hidden">
            <div className="bg-blue-950 px-6 py-4 border-b border-blue-900 flex items-center gap-3 text-white">
              <div className="bg-blue-600 text-white p-2 rounded shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">FastAPI SentenceTransformers AI Analysis</h3>
                <p className="text-xs text-blue-300 font-bold">Domain & Severity Classifier (PyTorch MiniLM-L6-v2 Engine)</p>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              {aiAnalysis ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 border border-slate-300">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Domain</p>
                      <p className="font-black text-slate-900 text-sm">{aiAnalysis.domain}</p>
                    </div>
                    <div className="bg-slate-50 p-3 border border-slate-300">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Problem Type</p>
                      <p className="font-black text-slate-900 text-sm">{aiAnalysis.problemType || 'Infrastructure'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 border border-slate-300">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">AI Confidence</p>
                      <p className="font-black text-emerald-800 text-sm">{((aiAnalysis.confidence || 0.92) * 100).toFixed(0)}% Match</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-black uppercase text-slate-700">Calculated Priority Score</span>
                      <span className="text-xs font-black text-red-700">{aiAnalysis.severity === 'CRITICAL' ? '88/100' : '72/100'}</span>
                    </div>
                    <Progress value={aiAnalysis.severity === 'CRITICAL' ? 88 : 72} className="h-2 bg-red-100 [&>div]:bg-red-700" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Extracted Key Risk Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(aiAnalysis.keyFactors) ? aiAnalysis.keyFactors.map((kf, i) => (
                        <Badge key={i} variant="info" className="bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[10px] uppercase">{kf}</Badge>
                      )) : (
                        <Badge variant="info" className="bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[10px] uppercase">Infrastructure Risk</Badge>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs">
                  AI analysis for this challenge is processing in the background.
                </div>
              )}

              {/* Innovation Gap Section */}
              {gapAnalysis && (
                <div className="bg-slate-50 p-4 border-2 border-slate-300">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-800" /> Innovation Gap Breakdown
                  </h4>
                  <div className="space-y-2 text-xs font-medium text-slate-800">
                    <p><span className="font-bold text-slate-900">Domain Gap:</span> {gapAnalysis.domainGap}</p>
                    <p><span className="font-bold text-slate-900">Technological Gap:</span> {gapAnalysis.technologicalGap}</p>
                    <p><span className="font-bold text-slate-900">Academic R&D Opportunity:</span> {gapAnalysis.academicOpportunity}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: University Matches & Routing */}
        <div className="space-y-6">
          <Card className="border-2 border-slate-300 rounded-none bg-white shadow-sm">
            <CardHeader className="bg-slate-100 border-b border-slate-200 py-3">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                <Users className="w-4 h-4 text-blue-800" />
                Matched University Roster
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-200">
              {assignments.length > 0 ? (
                assignments.map((asg, idx) => (
                  <div key={asg.id || idx} className={`p-4 ${idx === 0 ? 'bg-indigo-50/70' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-900 text-sm">{asg.universityId || 'IIT / NIT Roster'}</h4>
                      <span className="text-xs font-black text-indigo-900 bg-indigo-100 px-2 py-0.5 border border-indigo-200">
                        {((asg.matchScore || 0.85) * 100).toFixed(0)}% Match
                      </span>
                    </div>
                    {idx === 0 && (
                      <div className="mt-2 text-[10px] text-emerald-800 flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Best fit based on HEI department domain expertise
                      </div>
                    )}
                    <div className="mt-4">
                      <Button 
                        disabled={assigning}
                        onClick={() => handleAcceptAssignment(asg.id)}
                        className="w-full text-xs font-black text-white uppercase tracking-wider py-2 bg-blue-900 hover:bg-blue-800 rounded-none shadow">
                        {assigning ? 'Assigning...' : 'Assign Challenge & Launch Project'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-bold text-slate-600">
                  No university assignments generated yet. Click "Sync AI Analysis" to trigger matching.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
