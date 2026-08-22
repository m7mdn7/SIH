import React, { useState, useEffect } from 'react';
import api from './lib/api';
import { Challenge, ChallengeAIAnalysis, InnovationGap, ChallengeAssignment, Project, ProjectMilestone } from '@siip/types';
import { notificationService, ComplaintNotification } from './services/notificationService';
import { NotificationToast } from './components/NotificationToast';
import { 
  Building2, 
  MapPin, 
  Send, 
  BarChart3, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  LogOut, 
  User as UserIcon, 
  Briefcase, 
  FileText, 
  Loader2,
  AlertCircle,
  Coins,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Port Detection & Portal Auto-Wiring
  const [activePort, setActivePort] = useState<string>('3000');
  const [portPortalName, setPortPortalName] = useState<string>('Citizen Portal');
  const [activeToast, setActiveToast] = useState<ComplaintNotification | null>(null);

  // Tab states for different portals
  const [citizenTab, setCitizenTab] = useState<'submit' | 'list'>('submit');
  const [universityTab, setUniversityTab] = useState<'matches' | 'projects'>('matches');
  
  // Data states
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ChallengeAIAnalysis | null>(null);
  const [gapResult, setGapResult] = useState<InnovationGap | null>(null);
  const [similarChallenges, setSimilarChallenges] = useState<Challenge[]>([]);
  const [matches, setMatches] = useState<ChallengeAssignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Form states
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocName, setNewLocName] = useState('North Mandi Market, New Delhi');
  const [newLat, setNewLat] = useState('28.7041');
  const [newLng, setNewLng] = useState('77.1025');
  const [evidenceText, setEvidenceText] = useState('');

  // Initial user check & Port Auto Detection
  useEffect(() => {
    const port = window.location.port || '3000';
    setActivePort(port);

    let roleToLogin = 'citizen';
    let userRole = 'citizen';
    let uniId: string | undefined = undefined;
    let pName = 'Citizen Portal';

    if (port === '3001') {
      roleToLogin = 'uni_admin';
      userRole = 'university_admin';
      uniId = 'uni_agritech';
      pName = 'Institute / University Portal';
    } else if (port === '3002') {
      roleToLogin = 'gov_admin';
      userRole = 'government_admin';
      pName = 'Government Portal';
    } else if (port === '3003') {
      roleToLogin = 'industry_funder';
      userRole = 'industry';
      pName = 'Tax Funder / Industry Portal';
    }

    setPortPortalName(pName);

    const user = api.auth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      handleFastLogin(roleToLogin, userRole, uniId);
    }
  }, []);

  // Real-time Notification Subscriber
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((complaint) => {
      setActiveToast(complaint);
      fetchChallenges();
    });
    return unsubscribe;
  }, []);

  // Fetch data depending on active view
  useEffect(() => {
    if (currentUser) {
      fetchChallenges();
      if (currentUser.role === 'university_admin') {
        fetchProjects();
      }
      if (currentUser.role === 'government_admin' || currentUser.role === 'industry') {
        fetchAnalytics();
      }
    }
  }, [currentUser]);

  const fetchChallenges = async () => {
    try {
      const list = await api.challenges.list();
      setChallenges(list);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const list = await api.projects.list();
      if (currentUser?.role === 'university_admin' && currentUser?.universityId) {
        setProjects(list.filter(p => p.universityId === currentUser.universityId));
      } else {
        setProjects(list);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchMilestones = async (projId: string) => {
    try {
      const ms = await api.projects.milestones(projId);
      setProjectMilestones(ms);
    } catch (err) {
      console.error('Error fetching milestones:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.analytics.overview();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Helper Login / Register functions
  const handleFastLogin = async (username: string, role: string, universityId?: string) => {
    setLoading(true);
    setAuthError('');
    try {
      const payload = { username, password: 'password' };
      try {
        const res = await api.auth.login(payload);
        setCurrentUser(res.user);
      } catch (loginErr) {
        const regPayload = { 
          username, 
          email: `${username}@siip.org`, 
          password: 'password', 
          role,
          universityId
        };
        const res = await api.auth.register(regPayload);
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      setAuthError('Authentication failed. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setSelectedChallenge(null);
    setSelectedProject(null);
    setAnalysisResult(null);
    setGapResult(null);
    setMatches([]);
    setSimilarChallenges([]);
  };

  // Submit challenge with real-time notification emission
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    setSubmittingChallenge(true);
    try {
      const created = await api.challenges.create({
        title: newTitle,
        description: newDesc,
        locationName: newLocName,
        latitude: parseFloat(newLat) || 0,
        longitude: parseFloat(newLng) || 0
      });

      // Broadcast real-time complaint notification across all open portal ports
      notificationService.broadcastComplaint({
        id: created.id || `ch_${Date.now()}`,
        title: created.title || newTitle,
        description: created.description || newDesc,
        locationName: created.locationName || newLocName,
        latitude: created.latitude || parseFloat(newLat),
        longitude: created.longitude || parseFloat(newLng),
        createdAt: new Date().toISOString(),
      });

      setNewTitle('');
      setNewDesc('');
      await fetchChallenges();
      setCitizenTab('list');
    } catch (err) {
      console.error(err);
      alert('Failed to submit challenge');
    } finally {
      setSubmittingChallenge(false);
    }
  };

  // AI Pipeline Actions
  const runAnalysis = async (challengeId: string) => {
    setLoading(true);
    try {
      const res = await api.challenges.analyze(challengeId);
      setAnalysisResult(res);
      await fetchChallenges();
    } catch (err) {
      console.error(err);
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const runGapAnalysis = async (challengeId: string) => {
    setLoading(true);
    try {
      const res = await api.challenges.gapAnalysis(challengeId);
      setGapResult(res);
    } catch (err) {
      console.error(err);
      alert('Gap analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const runMatches = async (challengeId: string) => {
    setLoading(true);
    try {
      const res = await api.challenges.matches(challengeId);
      setMatches(res);
    } catch (err) {
      console.error(err);
      alert('Matching failed');
    } finally {
      setLoading(false);
    }
  };

  const runSimilarity = async (challengeId: string) => {
    setLoading(true);
    try {
      const res = await api.challenges.getSimilar(challengeId);
      setSimilarChallenges(res);
    } catch (err) {
      console.error(err);
      alert('Similarity search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChallenge = async (ch: Challenge) => {
    setSelectedChallenge(ch);
    setAnalysisResult(null);
    setGapResult(null);
    setMatches([]);
    setSimilarChallenges([]);
    
    setLoading(true);
    try {
      if (ch.status !== 'open') {
        const analysis = await api.challenges.analyze(ch.id);
        setAnalysisResult(analysis);
        const gap = await api.challenges.gapAnalysis(ch.id);
        setGapResult(gap);
      }
    } catch (err) {
      console.log('No pre-existing analysis.');
    } finally {
      setLoading(false);
    }
  };

  // University Actions
  const acceptAssignment = async (assignmentId: string) => {
    setLoading(true);
    try {
      await api.assignments.accept(assignmentId);
      alert('Project successfully accepted and created!');
      setSelectedChallenge(null);
      await fetchChallenges();
      await fetchProjects();
      setUniversityTab('projects');
    } catch (err) {
      console.error(err);
      alert('Failed to accept match');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (p: Project) => {
    setSelectedProject(p);
    await fetchMilestones(p.id);
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!evidenceText) {
      alert('Please enter evidence of completion.');
      return;
    }
    setLoading(true);
    try {
      await api.projects.completeMilestone(milestoneId, evidenceText);
      setEvidenceText('');
      if (selectedProject) {
        await fetchMilestones(selectedProject.id);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to complete milestone');
    } finally {
      setLoading(false);
    }
  };

  // Preset loaders for the Citizen Form
  const loadPreset = (preset: 'tomato' | 'traffic' | 'water') => {
    if (preset === 'tomato') {
      setNewTitle('Vegetable rot at farmer coop yard due to heat');
      setNewDesc('Our agricultural cooperative yard has no refrigeration. Vegetables, particularly spinach and tomatoes, spoil rapidly under afternoon sun. We need a low-cost, off-grid cooling solution.');
      setNewLocName('Cooperative Yard, Outer Delhi');
      setNewLat('28.7200');
      setNewLng('77.1500');
    } else if (preset === 'traffic') {
      setNewTitle('Traffic gridlock at Metro Station Circle');
      setNewDesc('Major traffic jams occur daily at the Metro Station junction due to uncoordinated signal timing and passenger boarding congestion.');
      setNewLocName('Metro Station Circle, Delhi');
      setNewLat('28.6139');
      setNewLng('77.2090');
    } else {
      setNewTitle('High nitrate contamination in community wells');
      setNewDesc('Recent drinking water tests show high levels of nitrates and chemical runoff in several community tubewells, likely from nearby farms.');
      setNewLocName('Green Valley Village Wells');
      setNewLat('28.8000');
      setNewLng('77.3000');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* REAL-TIME NOTIFICATION TOAST BANNER */}
      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
        activePortName={portPortalName}
        onInspect={(complaint) => {
          fetchChallenges();
          if (currentUser?.role === 'citizen') {
            setCitizenTab('list');
          }
        }}
      />

      {/* PORTAL PORT IDENTIFIER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-1.5 border-b border-blue-800/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-blue-300">PORT {activePort}</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-400 font-semibold">{portPortalName}</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-300">
          <a href="http://localhost:3000" className={`hover:underline ${activePort === '3000' ? 'text-amber-300 font-bold' : ''}`}>:3000 Citizen</a>
          <span>•</span>
          <a href="http://localhost:3001" className={`hover:underline ${activePort === '3001' ? 'text-amber-300 font-bold' : ''}`}>:3001 Institute</a>
          <span>•</span>
          <a href="http://localhost:3002" className={`hover:underline ${activePort === '3002' ? 'text-amber-300 font-bold' : ''}`}>:3002 Govt</a>
          <span>•</span>
          <a href="http://localhost:3003" className={`hover:underline ${activePort === '3003' ? 'text-amber-300 font-bold' : ''}`}>:3003 Funder</a>
        </div>
      </div>

      {/* HEADER */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold text-xl tracking-wider">SIIP</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Societal Innovation Intelligence Platform</h1>
              <p className="text-xs text-slate-400">Multi-Portal Portal Engine ({portPortalName})</p>
            </div>
          </div>
          
          {currentUser ? (
            <div className="flex items-center space-x-4 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{currentUser.username}</p>
                <p className="text-xs text-blue-400 font-mono uppercase tracking-wider">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-950 hover:bg-red-900 text-red-200 p-2 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* CORE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-6">
        
        {/* LOGIN SCREEN (IF NOT LOGGED IN) */}
        {!currentUser ? (
          <div className="max-w-md w-full mx-auto my-12 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Welcome to SIIP</h2>
            <p className="text-sm text-slate-500 text-center mb-6">Select a portal role to simulate the end-to-end hackathon workflow</p>
            
            {authError ? (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <span>{authError}</span>
              </div>
            ) : null}

            <div className="space-y-4">
              <button
                onClick={() => handleFastLogin('citizen', 'citizen')}
                disabled={loading}
                className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 p-4 rounded-xl font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-bold">Citizen Portal (Port 3000)</p>
                    <p className="text-xs text-blue-700">Submit societal issues and view map</p>
                  </div>
                </div>
                <Send className="h-5 w-5 text-blue-500" />
              </button>

              <button
                onClick={() => handleFastLogin('uni_admin', 'university_admin', 'uni_agritech')}
                disabled={loading}
                className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 p-4 rounded-xl font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-bold">University Portal (Port 3001)</p>
                    <p className="text-xs text-indigo-700">Review gap analysis & accept assignments</p>
                  </div>
                </div>
                <Layers className="h-5 w-5 text-indigo-500" />
              </button>

              <button
                onClick={() => handleFastLogin('gov_admin', 'government_admin')}
                disabled={loading}
                className="w-full flex items-center justify-between bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 p-4 rounded-xl font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                  <div className="text-left">
                    <p className="font-bold">Government Portal (Port 3002)</p>
                    <p className="text-xs text-emerald-700">View aggregations & top innovation gaps</p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </button>

              <button
                onClick={() => handleFastLogin('industry_funder', 'industry')}
                disabled={loading}
                className="w-full flex items-center justify-between bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 p-4 rounded-xl font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <Coins className="h-6 w-6 text-amber-600" />
                  <div className="text-left">
                    <p className="font-bold">Tax Funder / Industry Portal (Port 3003)</p>
                    <p className="text-xs text-amber-700">Fund R&D innovations & sponsor projects</p>
                  </div>
                </div>
                <Award className="h-5 w-5 text-amber-500" />
              </button>
            </div>
            
            {loading ? (
              <div className="mt-6 flex items-center justify-center space-x-2 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span>Connecting to backend...</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* CITIZEN PORTAL */}
        {currentUser && currentUser.role === 'citizen' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: NAVIGATION & CONTROLS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                <span>Citizen Workspace</span>
              </h3>
              
              <div className="flex flex-col space-y-2 mb-6">
                <button
                  onClick={() => setCitizenTab('submit')}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-left transition-colors ${citizenTab === 'submit' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  ➕ Submit a Challenge
                </button>
                <button
                  onClick={() => { setCitizenTab('list'); fetchChallenges(); }}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-left transition-colors ${citizenTab === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  📋 My Challenges ({challenges.length})
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-900">
                <p className="font-semibold mb-1 flex items-center">
                  <ShieldAlert className="h-4 w-4 text-amber-700 mr-1 shrink-0" />
                  Live Cross-Portal Sync Active
                </p>
                <p className="text-xs">When you submit a complaint here, Ports 3001 (Institute), 3002 (Govt), and 3003 (Funder) will receive instant real-time notification alerts!</p>
              </div>
            </div>

            {/* MAIN PORTAL AREA */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* SUBMIT CHALLENGE FORM */}
              {citizenTab === 'submit' ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Report a Societal Problem</h3>
                    <div className="flex space-x-2">
                      <button type="button" onClick={() => loadPreset('tomato')} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 py-1 px-2 rounded">
                        🍅 Tomato Spoilage
                      </button>
                      <button type="button" onClick={() => loadPreset('traffic')} className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1 px-2 rounded">
                        🚗 Traffic congestion
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCreateChallenge} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                      <input 
                        type="text" 
                        value={newTitle} 
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="e.g. Tomato spoilage at mandi yard"
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                      <textarea 
                        value={newDesc} 
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="Describe the issue in detail..."
                        className="w-full border border-slate-300 rounded-lg p-2 h-28 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Location Name</label>
                        <input 
                          type="text" 
                          value={newLocName} 
                          onChange={e => setNewLocName(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Latitude</label>
                          <input 
                            type="text" 
                            value={newLat} 
                            onChange={e => setNewLat(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Longitude</label>
                          <input 
                            type="text" 
                            value={newLng} 
                            onChange={e => setNewLng(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingChallenge}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg w-full flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      {submittingChallenge ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      <span>Submit Challenge & Broadcast Notification</span>
                    </button>
                  </form>
                </div>
              ) : null}

              {/* LIST & ACTIONS */}
              {citizenTab === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Side: Challenge selection list */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-h-[500px] overflow-y-auto">
                    <h3 className="font-bold text-slate-800 mb-3">Submitted Challenges</h3>
                    <div className="space-y-2">
                      {challenges.map(ch => (
                        <div 
                          key={ch.id} 
                          onClick={() => handleSelectChallenge(ch)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedChallenge?.id === ch.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{ch.title}</h4>
                            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${ch.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                              {ch.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ch.description}</p>
                          <div className="flex items-center text-[10px] text-slate-400 mt-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{ch.locationName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Pipelines simulator */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    {selectedChallenge ? (
                      <div className="flex flex-col h-full">
                        <div className="border-b border-slate-100 pb-3 mb-4">
                          <h3 className="font-bold text-slate-800 text-base">{selectedChallenge.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-3">{selectedChallenge.description}</p>
                        </div>

                        <div className="flex-1 space-y-4">
                          <h4 className="font-semibold text-slate-700 text-sm">Simulate AI Processing</h4>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => runAnalysis(selectedChallenge.id)}
                              disabled={loading}
                              className="bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                            >
                              🤖
                              <span>1. Run Classifier</span>
                            </button>
                            
                            <button
                              onClick={() => runGapAnalysis(selectedChallenge.id)}
                              disabled={loading}
                              className="bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                            >
                              💡
                              <span>2. Gap Analysis</span>
                            </button>

                            <button
                              onClick={() => runMatches(selectedChallenge.id)}
                              disabled={loading}
                              className="bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                            >
                              🏫
                              <span>3. Match University</span>
                            </button>

                            <button
                              onClick={() => runSimilarity(selectedChallenge.id)}
                              disabled={loading}
                              className="bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
                            >
                              🔍
                              <span>Compare Similar</span>
                            </button>
                          </div>

                          <div className="bg-slate-900 text-slate-200 font-mono text-[10px] p-3 rounded-lg max-h-[220px] overflow-y-auto mt-2">
                            <p className="text-blue-400 font-bold mb-1">// AI Output Log</p>
                            {loading ? <p className="animate-pulse">🔄 Executing pipeline model...</p> : null}
                            
                            {analysisResult ? (
                              <div className="mb-2">
                                <p className="text-green-400">✓ Classification complete (domain: {analysisResult.domain})</p>
                                <p className="text-slate-400">Problem Type: {analysisResult.problemType}</p>
                                <p className="text-slate-400">Severity: {analysisResult.severity}</p>
                              </div>
                            ) : null}

                            {gapResult ? (
                              <div className="mb-2">
                                <p className="text-green-400">✓ Gap analysis complete (type: {gapResult.gapType})</p>
                                <p className="text-slate-400">Action: {gapResult.recommendedAction}</p>
                              </div>
                            ) : null}

                            {matches.length > 0 ? (
                              <div className="mb-2">
                                <p className="text-green-400">✓ Universities matched:</p>
                                {matches.map((m, idx) => (
                                  <p key={idx} className="text-slate-400">- {m.universityName || m.universityId}: {m.matchScore}%</p>
                                ))}
                              </div>
                            ) : null}

                            {similarChallenges.length > 0 ? (
                              <div>
                                <p className="text-green-400">✓ Similar reports found:</p>
                                {similarChallenges.map((s: any, idx) => (
                                  <p key={idx} className="text-slate-400">- {s.title} (Score: {s.similarityScore})</p>
                                ))}
                              </div>
                            ) : null}

                            {!loading && !analysisResult && !gapResult && matches.length === 0 && similarChallenges.length === 0 ? (
                              <p className="text-slate-500">Wait for trigger...</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Select a challenge on the left to see pipeline simulation tools</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* UNIVERSITY PORTAL (PORT 3001) */}
        {currentUser && currentUser.role === 'university_admin' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* SIDEBAR: NAVIGATION */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                <span>Institute / University</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-semibold uppercase tracking-wider">{currentUser.universityId || 'uni_agritech'}</p>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setUniversityTab('matches')}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-left transition-colors ${universityTab === 'matches' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  🤝 Match Inbox
                </button>
                <button
                  onClick={() => { setUniversityTab('projects'); fetchProjects(); }}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-left transition-colors ${universityTab === 'projects' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  🚀 Active Projects ({projects.length})
                </button>
              </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* MATCH INBOX */}
              {universityTab === 'matches' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left panel: List challenges containing assignments for the university */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-3">Matched Assignment Proposals</h3>
                    <div className="space-y-2">
                      {challenges.map(ch => (
                        <div 
                          key={ch.id}
                          onClick={() => handleSelectChallenge(ch)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedChallenge?.id === ch.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm text-slate-800">{ch.title}</h4>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                              Match score: {ch.id === 'ch_tomato_spoilage' ? '92.4%' : '65.0%'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-2">{ch.description}</p>
                          <div className="text-[10px] text-slate-400 mt-2 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{ch.locationName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right panel: Side by Side Analysis & Accept Button */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    {selectedChallenge ? (
                      <div className="flex flex-col h-full">
                        <div className="border-b border-slate-200 pb-3 mb-4">
                          <h3 className="font-bold text-slate-800 text-base">{selectedChallenge.title}</h3>
                          <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded border border-slate-200 italic">
                            "{selectedChallenge.description}"
                          </p>
                        </div>

                        {loading ? (
                          <div className="flex-1 flex items-center justify-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                            <span className="text-sm text-slate-500">Querying AI pipeline metadata...</span>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col space-y-4">
                            <div>
                              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">Domain Gap Identification</h4>
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-indigo-950">
                                <p className="text-xs font-semibold capitalize mb-1">Innovation Gap: {gapResult?.gapType || 'technology'}</p>
                                <p className="text-xs">{gapResult?.description || 'Off-grid agricultural technology & passive evaporative cooling adaptation.'}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => acceptAssignment('as_tomato_spoilage_1')}
                              className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-sm"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                              <span>Accept Match & Launch Project</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                        <FileText className="h-8 w-8 mb-2 text-indigo-400" />
                        <span>Select a matched proposal from the left list to review detailed AI analysis</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* PROJECTS & MILESTONES WORKSPACE */}
              {universityTab === 'projects' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left side list of active projects */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-h-[500px] overflow-y-auto">
                    <h3 className="font-bold text-slate-800 mb-3">Your Active Projects</h3>
                    {projects.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No projects launched yet. Go to Match Inbox and accept a matched assignment proposal.</p>
                    ) : (
                      <div className="space-y-2">
                        {projects.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => handleSelectProject(p)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedProject?.id === p.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                          >
                            <h4 className="font-bold text-sm text-slate-800">{p.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                              <span>Lead: {p.facultyLead}</span>
                              <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded capitalize">{p.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right side Project Detail */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    {selectedProject ? (
                      <div className="flex flex-col h-full">
                        <div className="border-b border-slate-100 pb-3 mb-4">
                          <h3 className="font-bold text-slate-800 text-base">{selectedProject.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">Lead: <span className="font-semibold text-slate-700">{selectedProject.facultyLead}</span></p>
                        </div>

                        <div className="flex-1 space-y-4">
                          <h4 className="font-semibold text-slate-700 text-sm">Project Milestones Checklist</h4>
                          
                          <div className="space-y-3">
                            {projectMilestones.map(ms => (
                              <div key={ms.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-slate-800">{ms.title}</p>
                                    <p className="text-slate-600 mt-0.5">{ms.description}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Due: {new Date(ms.dueDate).toLocaleDateString()}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 capitalize ${ms.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {ms.status}
                                  </span>
                                </div>

                                {ms.status !== 'complete' ? (
                                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                                    <input 
                                      type="text" 
                                      value={evidenceText}
                                      onChange={e => setEvidenceText(e.target.value)}
                                      placeholder="Provide evidence URL or summary..."
                                      className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                    />
                                    <button
                                      onClick={() => handleCompleteMilestone(ms.id)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-[10px]"
                                    >
                                      Submit Evidence & Complete
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-2 bg-green-50 p-2 rounded border border-green-200 text-[10px] text-green-900">
                                    <p className="font-bold">Submitted Evidence:</p>
                                    <p className="italic font-mono mt-0.5">"{ms.evidence}"</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                        <Briefcase className="h-8 w-8 mb-2" />
                        <span>Select an active project on the left to track milestones and submit evidence</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* GOVERNMENT PORTAL (PORT 3002) */}
        {currentUser && currentUser.role === 'government_admin' ? (
          <div className="flex flex-col gap-6">
            
            {/* UPPER PANEL: GLOBAL ANALYTICS CARDS */}
            {analytics ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Reports</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{analytics.totalChallenges}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">📁</div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active University Projects</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{analytics.totalProjects}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">🏫</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Assignments Flow</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">
                      {analytics.assignmentStatus?.find((a: any) => a.name === 'accepted')?.value || 0} Accepted
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">📈</div>
                </div>
              </div>
            ) : null}

            {/* LOWER PANEL: SPLIT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Problem Domain Distribution</span>
                </h3>

                {analytics && analytics.domainDistribution ? (
                  <div className="space-y-4">
                    {analytics.domainDistribution.map((d: any, i: number) => {
                      const total = analytics.domainDistribution.reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;
                      const percent = Math.round((d.value / total) * 100);
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{d.name}</span>
                            <span>{d.value} ({percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${i % 3 === 0 ? 'bg-blue-600' : i % 3 === 1 ? 'bg-indigo-600' : 'bg-emerald-600'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-emerald-600" />
                  <span>Identified Innovation Gaps & Recommended Actions</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase tracking-wider">
                        <th className="py-2 font-semibold">Gap Type</th>
                        <th className="py-2 font-semibold">Description</th>
                        <th className="py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {challenges.map(ch => (
                        <tr key={ch.id} className="hover:bg-slate-50">
                          <td className="py-3 font-semibold text-slate-900 capitalize">
                            <span className="px-2 py-0.5 rounded font-mono bg-indigo-100 text-indigo-800">
                              technology
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 pr-4">{ch.title}</td>
                          <td className="py-3 text-slate-600 pr-2">Deploy AI automated solution</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        ) : null}

        {/* TAX FUNDER / INDUSTRY PORTAL (PORT 3003) */}
        {currentUser && currentUser.role === 'industry' ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">CSR & R&D Innovation Fund</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">$2,500,000</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Funded HEI Projects</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{projects.length || 3}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Award className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Tech Transfer Return (ROI)</p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">+24.5%</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center space-x-2">
                <Coins className="h-5 w-5 text-amber-600" />
                <span>R&D Grant Sponsorship Opportunities</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map(ch => (
                  <div key={ch.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/50 transition-all">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">{ch.title}</h4>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Matching Grant: $50,000
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ch.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Location: {ch.locationName}</span>
                      <button
                        onClick={() => alert(`Sponsorship intent submitted for challenge ${ch.id}`)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                      >
                        Sponsor Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-500 text-center text-xs mt-12">
        <p>© 2026 SIIP Platform Scaffolding. Dedicated Multi-Portal Port Engine (Ports 3000, 3001, 3002, 3003).</p>
      </footer>
    </div>
  );
}
