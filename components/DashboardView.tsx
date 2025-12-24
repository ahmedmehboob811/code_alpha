
import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, Activity, User } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface DashboardViewProps {
  project: Project;
  tasks: Task[];
  users: User[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ project, tasks, users }) => {
  const [healthInsight, setHealthInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fix: Activities are fetched from an async method, must await
  useEffect(() => {
    const fetchActivities = async () => {
      const data = await storageService.getActivities(project.id);
      setActivities(data);
    };
    fetchActivities();
  }, [project.id]);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    completion: tasks.length ? Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100) : 0
  };

  const handleHealthCheck = async () => {
    setIsLoading(true);
    const insight = await geminiService.analyzeProjectHealth(project.name, tasks);
    setHealthInsight(insight);
    setIsLoading(false);
  };

  return (
    <div className="p-10 space-y-12 max-w-[1600px] mx-auto overflow-y-auto h-full scrollbar-hide bg-[#fcfdfe]">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Neural Analytics Online</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Mission Intelligence</h1>
          <p className="text-slate-500 mt-3 font-medium text-lg">Cross-referencing tactical nodes and team velocity.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Completion</p>
              <p className="text-2xl font-black text-slate-900">{stats.completion}%</p>
            </div>
            <div className="w-16 h-16 rounded-full border-8 border-slate-50 relative flex items-center justify-center">
              <svg className="w-16 h-16 absolute -rotate-90">
                <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="8" className="text-indigo-500" strokeDasharray={`${stats.completion * 1.5} 1000`} />
              </svg>
            </div>
          </div>
          <button 
            onClick={handleHealthCheck}
            disabled={isLoading}
            className="px-10 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <span className="animate-spin border-2 border-white/20 border-t-white w-4 h-4 rounded-full"></span> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            Heuristic Scan
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Active Objectives', value: stats.total, color: 'text-slate-900', trend: '+12% vs last cycle' },
          { label: 'Neural Flux', value: stats.inProgress, color: 'text-indigo-600', trend: 'Optimal Velocity' },
          { label: 'Resolved Paths', value: stats.done, color: 'text-emerald-600', trend: 'Ahead of schedule' },
          { label: 'Threat Vectors', value: stats.highPriority, color: 'text-rose-600', trend: 'Immediate Action Required' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-indigo-500 transition-colors">{s.label}</p>
            <p className={`text-6xl font-black ${s.color} tracking-tighter mb-4`}>{s.value}</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{s.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black tracking-tight flex items-center gap-4">
                <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></span>
                Tactical Intelligence Summary
              </h3>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full bg-white/5">
                ENCRYPTION: LEVEL 4
              </div>
            </div>
            {healthInsight ? (
              <div className="prose prose-invert max-w-none text-slate-300 text-xl leading-relaxed font-medium space-y-6">
                {healthInsight.split('\n').map((line, i) => (
                  <p key={i} className={`${line.includes('Critical') ? 'text-rose-400' : ''}`}>{line}</p>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center gap-6 opacity-30">
                <svg className="w-24 h-24 text-slate-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-black uppercase tracking-[0.4em] text-xs">Run heuristic analysis to unlock strategic insights</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black mb-10 tracking-tight">Team Saturation Flux</h3>
            <div className="flex items-end gap-10 h-64">
              {users.map((u, i) => {
                const userTasks = tasks.filter(t => t.assigneeId === u.id).length;
                const h = tasks.length ? (userTasks / tasks.length) * 100 : 0;
                return (
                  <div key={u.id} className="flex-1 flex flex-col items-center group">
                    <div className="mb-4 text-xs font-black text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      {userTasks} Nodes
                    </div>
                    <div 
                      className={`w-full rounded-3xl transition-all duration-1000 shadow-xl ${i % 2 === 0 ? 'bg-indigo-500 shadow-indigo-100' : 'bg-slate-900 shadow-slate-100'}`}
                      style={{ height: `${Math.max(h, 8)}%` }}
                    ></div>
                    <div className="mt-8 flex flex-col items-center gap-2">
                      <img src={u.avatar} className="w-8 h-8 rounded-xl shadow-lg" alt="" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.name.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Activity Waveform</h3>
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <div className="space-y-8 max-h-[800px] overflow-y-auto scrollbar-hide pr-2">
              {activities.map((a, i) => (
                <div key={a.id} className="relative pl-8 group">
                  <div className={`absolute left-0 top-1 w-2 h-2 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-150 ${i === 0 ? 'bg-indigo-500 ring-4 ring-indigo-50' : 'bg-slate-200'}`}></div>
                  <div className="absolute left-[3px] top-4 bottom-[-20px] w-0.5 bg-slate-50"></div>
                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 group-hover:bg-white group-hover:border-indigo-100 group-hover:shadow-xl transition-all">
                    <p className="text-xs text-slate-600 font-medium">
                      <span className="font-black text-slate-900">{a.userName}</span> 
                      <span className="mx-1 text-slate-400 font-bold uppercase text-[9px]">{a.action}</span>
                      <span className="font-black text-indigo-600">"{a.targetName}"</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
