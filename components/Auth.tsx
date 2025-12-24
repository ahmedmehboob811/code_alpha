
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [recognizedUser, setRecognizedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time user recognition
  useEffect(() => {
    const lookupUser = async () => {
      if (!isRegister && email.includes('@')) {
        const users = await storageService.getUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        setRecognizedUser(found || null);
      } else {
        setRecognizedUser(null);
      }
    };
    lookupUser();
  }, [email, isRegister]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Tactical Error: Identifier payload too large. Max 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name || !email) {
          setError('Full identity and neural ID are mandatory.');
          setIsLoading(false);
          return;
        }
        const users = await storageService.getUsers();
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          setError('This neural ID is already registered in the system.');
          setIsLoading(false);
          return;
        }
        
        // Register with custom avatar if provided
        const newUser = await storageService.registerUser(name, email);
        if (avatar) {
          newUser.avatar = avatar;
          await storageService.updateUser(newUser);
        }
        onLogin(newUser);
      } else {
        const users = await storageService.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          onLogin(user);
        } else {
          setError('Access denied. Neural ID not found in the roster.');
        }
      }
    } catch (err) {
      setError('System communication error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Tactical Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-8">
            <div className={`w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center overflow-hidden transition-all duration-700 shadow-[0_0_50px_rgba(255,255,255,0.1)] ring-8 ${recognizedUser ? 'ring-indigo-500/30' : 'ring-white/5'}`}>
              {recognizedUser ? (
                <img src={recognizedUser.avatar} className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" alt="Identity" />
              ) : isRegister && avatar ? (
                <img src={avatar} className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" alt="New Identity" />
              ) : (
                <span className="text-slate-900 text-4xl font-black">PM</span>
              )}
            </div>
            {recognizedUser && (
              <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-1.5 rounded-full border-4 border-[#0f172a] animate-bounce">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            {recognizedUser ? `Welcome, ${recognizedUser.name.split(' ')[0]}` : 'Project Manager'}
          </h1>
          <p className="text-slate-400 mt-3 font-bold uppercase tracking-[0.2em] text-[10px]">
            {recognizedUser ? 'Identity Confirmed • Personnel Found' : 'Command Center Access'}
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/5 space-y-8">
          <div className="flex bg-slate-800 p-1 rounded-2xl">
            <button 
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isRegister ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Authorize
            </button>
            <button 
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isRegister ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Enlist
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl text-xs font-black border border-rose-500/20 uppercase tracking-tight flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}
            
            {isRegister && (
              <div className="flex flex-col items-center gap-4 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Identity Marker (Optional)</label>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/5 hover:bg-slate-700 transition-colors"
                >
                  {avatar ? 'Replace Photo' : 'Upload Tactical Photo'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
            )}

            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Full Identity</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-slate-600 font-medium"
                  placeholder="e.g. Director Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Neural ID (Email)</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-slate-600 font-medium"
                placeholder="name@pm.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Secure Vector (Password)</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-slate-600 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl shadow-2xl hover:bg-slate-100 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></span>}
              {isRegister ? 'Initialize Account' : 'Request Clearance'}
            </button>
          </form>

          <div className="text-center pt-2">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
               {isRegister ? 'Already enlisted?' : 'New personnel?'} 
               <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="ml-2 text-white hover:text-indigo-400 transition-colors">
                 {isRegister ? 'Access Hub' : 'Join Agency'}
               </button>
             </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-600">
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">SECURE ENVIRONMENT 256-BIT ENCRYPTION</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
