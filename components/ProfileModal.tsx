
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    `https://i.pravatar.cc/150?u=${user.id}`,
    `https://i.pravatar.cc/150?u=zenith_1`,
    `https://i.pravatar.cc/150?u=zenith_2`,
    `https://i.pravatar.cc/150?u=zenith_3`,
    `https://i.pravatar.cc/150?u=zenith_4`,
    `https://i.pravatar.cc/150?u=zenith_5`,
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Tactical Error: Identifier payload too large. Max 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdate({ ...user, name, avatar });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Personnel Identity</h2>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Manage your neural presence</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img src={avatar} className="w-32 h-32 rounded-[2.5rem] border-8 border-slate-50 shadow-2xl group-hover:opacity-80 transition-all group-hover:scale-105 object-cover" alt="" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 rounded-[2.5rem] pointer-events-none">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>

            <div className="text-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
              >
                Upload Custom Identifier
              </button>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Presets</label>
                <div className="h-px bg-slate-100 flex-1 ml-4"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {presetAvatars.map((url, i) => (
                  <button 
                    key={url} 
                    onClick={() => setAvatar(url)}
                    className={`w-12 h-12 rounded-xl border-4 transition-all overflow-hidden ${avatar === url ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:border-slate-200'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all"
                placeholder="Your Full Name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Neural ID (Non-editable)</label>
              <input 
                type="text" 
                value={user.email} 
                disabled 
                className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-medium opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">Abort</button>
          <button 
            onClick={handleSave}
            className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Update Identity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
