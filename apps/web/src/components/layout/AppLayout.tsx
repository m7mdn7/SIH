import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Home, AlertTriangle, Briefcase, Map, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  let navItems: { name: string, path: string, icon: any }[] = [];

  if (user.role === 'Citizen') {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
    ];
  } else if (user.role === 'Government') {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Live Map', path: '/dashboard/map', icon: Map },
      { name: 'Challenges', path: '/dashboard/challenges', icon: AlertTriangle },
      { name: 'Projects', path: '/dashboard/projects', icon: Briefcase },
    ];
  } else if (user.role === 'University') {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Challenges', path: '/dashboard/challenges', icon: AlertTriangle },
      { name: 'Projects', path: '/dashboard/projects', icon: Briefcase },
    ];
  } else if (user.role === 'Industry') {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Projects', path: '/dashboard/projects', icon: Briefcase },
      { name: 'Challenges', path: '/dashboard/challenges', icon: AlertTriangle },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col transition-all duration-300 border-r border-slate-800 shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-blue-950">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shadow-sm mr-2 shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight text-white uppercase">SIIP</span>
            <span className="text-[9px] text-blue-300 uppercase tracking-widest leading-none mt-0.5 font-bold">Portal</span>
          </div>
        </div>
        
        <div className="p-3 border-b border-slate-800 bg-slate-800/80">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">Active Session</div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-white tracking-wide">{user.name}</span>
            <span className="text-[10px] text-blue-300 uppercase tracking-widest flex items-center gap-1 mt-1 font-semibold">
              <span className="px-1.5 py-0.5 bg-blue-700 text-white rounded font-mono font-bold">{user.role}</span>
              {user.level === 'State' && <span>| State Nodal</span>}
              {user.level === 'District' && <span>| DM, {user.district}</span>}
            </span>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors group",
                  isActive 
                    ? "bg-blue-700 text-white shadow-sm border-l-4 border-blue-400" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
                )}
              >
                <Icon className={cn("mr-2 flex-shrink-0 h-4 w-4 text-blue-400 group-hover:text-white")} />
                <span className="text-white">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 bg-slate-900 space-y-1">
          <NavLink 
            to="/settings" 
            className={({ isActive }) => cn(
              "flex items-center w-full px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors group",
              isActive 
                ? "bg-blue-700 text-white border-l-4 border-blue-400" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
            )}
          >
            <Settings className="mr-2 h-4 w-4 text-slate-400" />
            <span className="text-white">Settings</span>
          </NavLink>
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors text-red-400 hover:bg-red-950 hover:text-red-200 border-l-4 border-transparent mt-1"
          >
            <LogOut className="mr-2 h-4 w-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* National Colors Top Bar */}
        <div className="h-1 w-full flex">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>
        <header className="h-14 bg-white border-b border-slate-300 flex items-center justify-between px-4 z-10 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded border-2 border-blue-900 flex items-center justify-center bg-blue-50 shadow-sm">
                <span className="text-blue-900 text-[10px] font-black tracking-tight">GOV</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">
                Government of Jharkhand
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Social Innovation & Integration Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4 h-full py-2">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-900">{user.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">{user.role}</div>
            </div>
            <div className="h-8 w-8 bg-blue-900 text-white flex items-center justify-center font-black rounded border border-blue-950 text-xs shadow-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-6 border-t-2 border-slate-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
