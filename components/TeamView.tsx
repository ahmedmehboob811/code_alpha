
import React from 'react';
import { Project, Task, User, TaskStatus } from '../types';

interface TeamViewProps {
  project: Project;
  tasks: Task[];
  users: User[];
}

const TeamView: React.FC<TeamViewProps> = ({ project, tasks, users }) => {
  const projectMembers = users.filter(u => project.members.includes(u.id) || u.id === project.ownerId);

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(t => t.assigneeId === userId);
    const done = userTasks.filter(t => t.status === TaskStatus.DONE).length;
    const active = userTasks.length - done;
    const saturation = userTasks.length > 0 ? (active / 5) * 100 : 0; // Baseline 5 tasks as "full"
    
    return {
      total: userTasks.length,
      done,
      active,
      saturation: Math.min(saturation, 100)
    };
  };

  return (
    <div className="p-10 space-y-12 h-full overflow-y-auto scrollbar-hide bg-[#fcfdfe]">
      <header>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Personnel Roster</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Tactical Deployment</h1>
        <p className="text-slate-500 mt-3 font-medium text-lg">Monitoring individual bandwidth and mission alignment.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {projectMembers.map(user => {
          const stats = getUserStats(user.id);
          const isLead = user.id === project.ownerId;
          
          return (
            <div key={user.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 transition-transform">
                 <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
              </div>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-6">
                  <img src={user.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-slate-50 shadow-xl" alt="" />
                  {isLead && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 border-white">
                      Project Lead
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned</p>
                   <p className="text-xl font-black text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
                   <p className="text-xl font-black text-emerald-600">{stats.done}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Saturation Level</span>
                  <span className={stats.saturation > 80 ? 'text-rose-500' : 'text-indigo-500'}>{Math.round(stats.saturation)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${stats.saturation > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${stats.saturation}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center gap-4">
                 <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="Direct Communication">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 </button>
                 <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="View Worklog">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </button>
              </div>
            </div>
          );
        })}

        <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
           </div>
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Recruit Specialist</p>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
