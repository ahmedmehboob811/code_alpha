
import React, { useState } from 'react';
import { Project, User } from '../types';
import { storageService } from '../services/storageService';

interface ProjectModalProps {
  project?: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
  currentUser: User;
  allUsers: User[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave, currentUser, allUsers }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#4f46e5');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(project?.members || [currentUser.id]);
  const [inviteEmail, setInviteEmail] = useState('');

  const colors = [
    '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f472b6', '#64748b',
  ];

  const handleToggleMember = (userId: string) => {
    if (userId === currentUser.id) return; 
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Fix: handleInvite must be async to await the registerUser Promise
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return;
    
    // Simulate finding or creating a user
    const existing = allUsers.find(u => u.email === inviteEmail);
    if (existing) {
      if (!selectedMembers.includes(existing.id)) {
        setSelectedMembers([...selectedMembers, existing.id]);
      }
    } else {
      // Fix: Await the async registerUser call to get the User object instead of a Promise
      const newUser = await storageService.registerUser(inviteEmail.split('@')[0], inviteEmail);
      setSelectedMembers([...selectedMembers, newUser.id]);
    }
    setInviteEmail('');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: project?.id || Date.now().toString(),
      name,
      description,
      color,
      members: selectedMembers,
      ownerId: project?.ownerId || currentUser.id,
      createdAt: project?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/20 flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {project ? 'Mission Configuration' : 'Initialize Workspace'}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Define the operational parameters</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-300 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workspace Identifier</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Project Zenith"
                  className="w-full text-xl font-black border-none bg-slate-50 rounded-2xl p-5 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Brief</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Strategic objectives..."
                  className="w-full min-h-[120px] bg-slate-50 border-none rounded-2xl p-5 text-slate-600 focus:ring-4 focus:ring-indigo-50 outline-none resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Identity</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-xl transition-all border-4 ${color === c ? 'border-white ring-2 ring-indigo-500 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recruit Personnel</label>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email to recruit..."
                    className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none"
                  />
                  <button onClick={handleInvite} className="px-4 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Roster</label>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      disabled={u.id === currentUser.id}
                      onClick={() => handleToggleMember(u.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                        selectedMembers.includes(u.id) 
                        ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <img src={u.avatar} className="w-8 h-8 rounded-xl shadow-sm" alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      {selectedMembers.includes(u.id) && (
                        <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-4 rounded-b-[3rem]">
          <button onClick={onClose} className="px-8 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">Abort</button>
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-14 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30 uppercase tracking-widest text-xs"
          >
            {project ? 'Commit Changes' : 'Initialize Mission'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
