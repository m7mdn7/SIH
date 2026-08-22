import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Home, AlertTriangle, Briefcase, Map, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  // Add Live Map to ALL roles so every user role views the real PostGIS Leaflet map
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Live GIS Map', path: '/dashboard/map', icon: Map },
    { name: 'Challenges', path: '/dashboard/challenges', icon: AlertTriangle },
    { name: 'Projects', path: '/dashboard/projects', icon: Briefcase },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gov-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-gov-slate-900 text-white flex flex-col transition-all duration-300 border-r-2 border-gov-slate-800">
        <div className="h-14 flex items-center px-4 border-b border-gov-slate-700 bg-gov-blue-950">
          <div className="w-6 h-6 bg-white rounded-none flex items-center justify-center shadow-sm mr-2 shrink-0">
            <Shield className="h-3.5 w-3.5 text-gov-blue-800" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight text-white uppercase">SIIP</span>
            <span className="text-[9px] text-gov-blue-200 uppercase tracking-widest leading-none mt-0.5">Portal</span>
          </div>
        </div>

        <div className="p-3 border-b border-gov-slate-700 bg-gov-slate-800/50">
          <div className="text-[10px] uppercase tracking-widest text-gov-slate-500 mb-1 font-bold">Session</div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-white">{user.name}</span>
            <span className="text-[10px] text-gov-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <span className="px-1 py-0.5 bg-gov-blue-800 text-white rounded-none">{user.role}</span>
              {user.level === 'State' && <span>| State Nodal</span>}
              {user.level === 'District' && <span>| DM, {user.district}</span>}
              {user.role === 'University' && <span>| {user.department}</span>}
            </span>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors group',
                    isActive
                      ? 'bg-gov-blue-800 text-white border-l-2 border-gov-blue-400'
                      : 'text-gov-slate-400 hover:bg-gov-slate-800 hover:text-white border-l-2 border-transparent'
                  )
                }
              >
                <Icon className={cn('mr-2 flex-shrink-0 h-4 w-4')} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-2 border-t border-gov-slate-700 bg-gov-slate-900 space-y-0.5">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center w-full px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors group',
                isActive
                  ? 'bg-gov-blue-800 text-white border-l-2 border-gov-blue-400'
                  : 'text-gov-slate-400 hover:bg-gov-slate-800 hover:text-white border-l-2 border-transparent'
              )
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors text-red-500 hover:bg-red-950 hover:text-red-400 border-l-2 border-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        <div className="h-1 w-full flex">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>
        <header className="h-14 bg-white border-b border-gov-slate-300 flex items-center justify-between px-4 z-10 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-none border border-gov-blue-900 flex items-center justify-center bg-gov-slate-50">
                <span className="text-gov-blue-900 text-[9px] font-black">GOV</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black text-gov-slate-900 uppercase tracking-tight leading-tight">
                Government of Jharkhand
              </h1>
              <p className="text-[10px] text-gov-slate-500 uppercase tracking-widest font-bold">
                Social Innovation & Integration Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-gov-slate-200 pl-4 h-full py-2">
            <div className="text-right hidden md:block">
              <div className="text-[10px] uppercase font-bold text-gov-slate-900">{user.name}</div>
              <div className="text-[9px] uppercase tracking-wider text-gov-blue-700">{user.role}</div>
            </div>
            <div className="h-8 w-8 bg-gov-slate-100 flex items-center justify-center text-gov-slate-800 font-black border border-gov-slate-300 text-xs">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gov-slate-100 p-4 md:p-6 border-t-4 border-gov-slate-200/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
