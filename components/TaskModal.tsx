
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Comment, User } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  currentUser: User | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onUpdate, onDelete, currentUser }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [isBlocked, setIsBlocked] = useState(task.isBlocked || false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Fix: Async calls in useEffect must be handled inside an async function
  useEffect(() => {
    const loadData = async () => {
      const [fetchedComments, fetchedUsers] = await Promise.all([
        storageService.getComments(task.id),
        storageService.getUsers()
      ]);
      setComments(fetchedComments);
      setAvailableUsers(fetchedUsers);
    };
    loadData();
  }, [task.id]);

  const handleSave = () => {
    onUpdate({ ...task, title, description, status, priority, dueDate, assigneeId, isBlocked });
  };

  // Fix: handleAddComment should await the async storage save
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    const comment: Comment = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: currentUser.id,
      userName: currentUser.name,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    await storageService.saveComment(comment);
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleAskAI = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    const suggestion = await geminiService.suggestSubtasks(title, description);
    setAiInsight(suggestion);
    setIsAiLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col max-h-[92vh] border border-white/20">
        <div className="flex items-center justify-between p-10 border-b border-slate-50">
          <div className="flex items-center gap-5">
             <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg ${isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {isBlocked ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Task Blueprint</h2>
               <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: ZNT-{task.id.slice(-4)}</span>
                 <button 
                  onClick={() => setIsBlocked(!isBlocked)}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all ${isBlocked ? 'bg-rose-600 text-white border-rose-600' : 'text-slate-400 border-slate-200 hover:border-rose-400 hover:text-rose-400'}`}
                 >
                   {isBlocked ? 'Blocked' : 'Set Blocked'}
                 </button>
               </div>
             </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-300 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-12 overflow-y-auto space-y-12 flex-1 scrollbar-hide">
          <div className="space-y-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-black border-none focus:ring-0 placeholder:text-slate-200 p-0 tracking-tighter text-slate-900"
              placeholder="Task Title"
            />
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[140px] bg-transparent border-none p-0 text-slate-600 focus:ring-0 transition-all outline-none resize-none text-lg leading-relaxed font-medium"
                placeholder="Describe the mission objectives and technical constraints..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Lifecycle</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none uppercase tracking-widest cursor-pointer"
              >
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Urgency</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none uppercase tracking-widest cursor-pointer"
              >
                <option value="low">Low Impact</option>
                <option value="medium">Standard</option>
                <option value="high">Critical</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none uppercase tracking-widest cursor-pointer"
              >
                <option value="">Unassigned</option>
                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
              <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                <div>
                  <h4 className="font-black text-xl tracking-tight">AI Deployment Roadmap</h4>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Neural Breakdown Generator</p>
                </div>
              </div>
              <button 
                onClick={handleAskAI}
                disabled={isAiLoading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {isAiLoading ? 'Synthesizing...' : 'Generate Roadmap'}
              </button>
            </div>
            {aiInsight ? (
              <div className="text-base font-medium text-slate-200 leading-relaxed whitespace-pre-wrap bg-white/5 p-8 rounded-[1.5rem] border border-white/5">
                {aiInsight}
              </div>
            ) : (
              <div className="text-center py-6 opacity-40">
                <p className="text-sm italic font-medium">Break complex objectives into actionable neural nodes.</p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <h3 className="font-black text-slate-900 text-2xl tracking-tight">Intel & Collaboration</h3>
            
            <div className="space-y-6">
              {comments.map(c => (
                <div key={c.id} className="group flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center font-black text-slate-500 text-sm border border-slate-100">
                    {c.userName.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:border-indigo-100 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.userName}</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-5 items-end pt-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-xl">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Transmit collaboration logs..."
                  className="w-full p-6 pr-20 rounded-[2rem] border-2 border-slate-100 text-base font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none resize-none h-32 transition-all"
                />
                <button 
                  onClick={handleAddComment}
                  className="absolute bottom-6 right-6 p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/50 rounded-b-[3rem] flex items-center justify-between">
          <button 
            onClick={() => onDelete(task.id)}
            className="text-rose-500 hover:text-white hover:bg-rose-500 px-8 py-4 rounded-2xl font-black text-xs transition-all uppercase tracking-widest border border-rose-100 hover:border-rose-500"
          >
            Purge Metadata
          </button>
          <div className="flex gap-6">
            <button onClick={onClose} className="px-10 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">Discard</button>
            <button 
              onClick={handleSave}
              className="px-14 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-300 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              Commit to Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
