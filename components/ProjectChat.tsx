
import React, { useState, useRef, useEffect } from 'react';
import { Project, Task, User } from '../types';
import { geminiService } from '../services/geminiService';

interface ProjectChatProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onClose: () => void;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ project, tasks, users, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Hello! I'm your Project AI Coordinator. I'm synced with "${project.name}". How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const aiResponse = await geminiService.coordinatorChat(project, tasks, users, userText);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[60] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-slate-900 rounded-lg flex items-center justify-center font-black">PM</div>
          <div>
            <h3 className="font-bold text-sm">Coordinator Bot</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Neural Link Active</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
              ? 'bg-slate-900 text-white rounded-br-none shadow-lg shadow-slate-200' 
              : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask coordinator for mission intel..."
            className="w-full pl-4 pr-12 py-4 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
          />
          <button 
            onClick={handleSend}
            className="absolute right-3 top-2.5 p-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-md active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-4 font-medium uppercase tracking-tighter">Synchronized with Gemini 3 Intelligence</p>
      </div>
    </div>
  );
};

export default ProjectChat;
