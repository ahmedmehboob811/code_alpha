
import React from 'react';
import { Project, User, AppView, Task } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onProfileClick: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  getProjectProgress: (projectId: string) => number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onNewProject,
  onEditProject,
  onDeleteProject,
  currentUser,
  onLogout,
  onProfileClick,
  currentView,
  onViewChange,
  getProjectProgress
}) => {
  return (
    <aside className="w-72 h-screen bg-slate-900 text-white flex flex-col flex-shrink-0 border-r border-slate-800">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-2xl text-slate-900 shadow-xl shadow-white/5 ring-4 ring-slate-800/50">
            PM
          </div>
          <div>
            <span className="text-xl font-black tracking-tight block uppercase">Project Manager</span>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Agency</span>
          </div>
        </div>

        <nav className="space-y-1.5 mb-10">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Navigation</p>
          {[
            { id: 'dashboard', label: 'Overview', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'board', label: 'Project Board', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { id: 'team', label: 'Personnel', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id as AppView)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold text-sm ${
                currentView === view.id 
                ? 'bg-white text-slate-900 shadow-lg' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={view.icon} />
              </svg>
              {view.label}
            </button>
          ))}
        </nav>

        <div className="space-y-1 mb-10">
          <div className="flex items-center justify-between px-3 mb-3">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Workspaces</p>
             <button onClick={onNewProject} className="text-white hover:text-slate-400 transition-colors" title="Initialize Mission">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
             </button>
          </div>
          <div className="max-h-[40vh] overflow-y-auto space-y-1.5 scrollbar-hide pr-1">
            {projects.map(p => {
              const progress = getProjectProgress(p.id);
              const isActive = activeProjectId === p.id;
              const isOwner = currentUser?.id === p.ownerId;
              return (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => onSelectProject(p.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-2 ${
                      isActive 
                      ? 'bg-slate-800 text-white ring-1 ring-slate-700 shadow-xl' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] flex-shrink-0`} style={{ backgroundColor: p.color || '#4f46e5' }}></div>
                        <span className="truncate text-sm font-bold tracking-tight">{p.name}</span>
                      </div>
                      {isOwner && (
                        <span className="text-[8px] font-black uppercase text-indigo-400 border border-indigo-400/30 px-1 rounded">Lead</span>
                      )}
                    </div>
                    
                    <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${progress}%`, backgroundColor: p.color }}
                      ></div>
                    </div>
                  </button>
                  
                  {isOwner && (
                    <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditProject(p); }}
                        className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
                        title="Mission Settings"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                        className="p-1 text-slate-500 hover:text-rose-500 transition-colors"
                        title="Purge Mission"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {projects.length === 0 && (
              <p className="text-[10px] text-slate-600 italic px-4">No active missions</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 bg-slate-950/50 border-t border-slate-800">
        <button 
          onClick={onProfileClick}
          className="w-full flex items-center gap-3 mb-5 px-2 py-2 rounded-xl hover:bg-white/5 transition-all text-left group"
        >
          <div className="relative">
            <img src={currentUser?.avatar} alt="User" className="w-10 h-10 rounded-xl border-2 border-slate-700 p-0.5 group-hover:border-white transition-colors" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate text-slate-200 group-hover:text-white">{currentUser?.name}</span>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">View Profile</span>
          </div>
        </button>
        <button 
          onClick={onLogout}
          className="w-full text-left px-4 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all flex items-center gap-3 text-sm font-bold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
