
import React, { useState } from 'react';
import { Task, TaskStatus, Project, User } from '../types';

interface BoardProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onBulkUpdate: (taskIds: string[], updates: Partial<Task>) => void;
  onBulkDelete: (taskIds: string[]) => void;
}

const Board: React.FC<BoardProps> = ({ 
  project, tasks, users, onTaskClick, onAddTask, onMoveTask, onBulkUpdate, onBulkDelete 
}) => {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  
  const columns = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

  const getPriorityTheme = (priority: string) => {
    switch (priority) {
      case 'high': return { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' };
      case 'medium': return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' };
      default: return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' };
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const toggleTaskSelection = (taskId: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setSelectedTaskIds(next);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#fcfdfe] relative">
      <header className="p-10 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Sector</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              {project.name}
              <span className="text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Active</span>
            </h1>
          </div>
          <div className="flex -space-x-3">
            {users.map((u) => (
              <img key={u.id} src={u.avatar} className="w-10 h-10 rounded-2xl border-4 border-white shadow-lg ring-1 ring-slate-100 object-cover" alt={u.name} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 max-w-2xl">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-4 top-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search tactical objectives..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none pl-12 py-2 text-sm font-medium focus:ring-0 outline-none"
            />
          </div>
          <div className="h-6 w-px bg-slate-100"></div>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 outline-none cursor-pointer"
          >
            <option value="all">ALL PRIORITIES</option>
            <option value="high">CRITICAL ONLY</option>
            <option value="medium">STANDARD</option>
            <option value="low">LOW IMPACT</option>
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-10 pt-0 flex gap-10 scrollbar-hide">
        {columns.map(status => {
          const colTasks = filteredTasks.filter(t => t.status === status);
          return (
            <div 
              key={status} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData('taskId');
                onMoveTask(id, status);
              }}
              className="w-[400px] flex-shrink-0 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-black text-slate-900 text-sm tracking-widest uppercase">{status}</h2>
                  <span className="text-[10px] bg-white border border-slate-100 text-slate-400 px-2 py-0.5 rounded-lg font-black">{colTasks.length}</span>
                </div>
                <button onClick={() => onAddTask(status)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 scrollbar-hide pb-10">
                {colTasks.map(task => {
                  const theme = getPriorityTheme(task.priority);
                  const isSelected = selectedTaskIds.has(task.id);
                  const assignee = users.find(u => u.id === task.assigneeId);
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('.check-zone')) return;
                        onTaskClick(task);
                      }}
                      className={`group relative bg-white rounded-[2rem] p-6 border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/5 shadow-2xl' : 'border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1'
                      } ${task.isBlocked ? 'opacity-90' : ''}`}
                    >
                      {/* Priority Energy Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg} ${task.priority === 'high' ? 'animate-pulse' : ''}`}></div>
                      
                      {/* Selection Zone */}
                      <div className="check-zone absolute top-6 left-6 z-20">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="w-4 h-4 rounded-lg border-slate-200 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </div>

                      <div className="pl-8">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${theme.text}`}>
                            {task.priority} Priority
                          </span>
                          {task.isBlocked && (
                            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-500 px-2.5 py-1 rounded-full text-[9px] font-black animate-bounce">
                              <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                              BLOCKED
                            </div>
                          )}
                        </div>

                        <h3 className={`text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors ${task.status === TaskStatus.DONE ? 'line-through opacity-40' : ''}`}>
                          {task.title || 'Untitled Objective'}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed mb-6">
                          {task.description || 'Mission parameters awaiting detailed input...'}
                        </p>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                          <div className="flex items-center gap-3">
                            {assignee ? (
                              <div className="relative">
                                <img src={assignee.avatar} className="w-8 h-8 rounded-xl ring-2 ring-white shadow-sm" alt="" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              </div>
                            )}
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              {assignee?.name.split(' ')[0] || 'Standby'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              <span>3</span>
                            </div>
                            <div className={`w-10 h-1 rounded-full ${theme.bg} opacity-20`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Action Bar - High fidelity overhaul */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-4 border border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <div className="px-6 py-2 border-r border-white/10">
            <span className="text-xs font-black text-indigo-400 tracking-widest">{selectedTaskIds.size} NODES ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 p-1">
            <button onClick={() => { onBulkUpdate(Array.from(selectedTaskIds), { status: TaskStatus.DONE }); setSelectedTaskIds(new Set()); }} className="px-6 py-3 bg-white/5 hover:bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">Resolve</button>
            <button onClick={() => { onBulkUpdate(Array.from(selectedTaskIds), { priority: 'high' }); setSelectedTaskIds(new Set()); }} className="px-6 py-3 bg-white/5 hover:bg-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">Prioritize</button>
            <button onClick={() => { if(confirm('Delete tactical nodes?')) onBulkDelete(Array.from(selectedTaskIds)); setSelectedTaskIds(new Set()); }} className="p-3 bg-white/5 hover:bg-rose-500 rounded-full text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
