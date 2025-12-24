
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';
import ProfileModal from './components/ProfileModal';
import ProjectChat from './components/ProjectChat';
import Auth from './components/Auth';
import { Project, Task, User, TaskStatus, AppView } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('board');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialize and load persisted session
  useEffect(() => {
    const initApp = async () => {
      storageService.init();
      const user = await storageService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const storedProjects = await storageService.getProjects(user.id);
        setProjects(storedProjects);
        if (storedProjects.length > 0) setActiveProjectId(storedProjects[0].id);
      }
      const allUsers = await storageService.getUsers();
      setUsers(allUsers);
      setIsInitializing(false);
    };
    initApp();
  }, []);

  // Sync tasks when project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (activeProjectId) {
        const projectTasks = await storageService.getTasks(activeProjectId);
        setTasks(projectTasks);
      } else {
        setTasks([]);
      }
    };
    fetchTasks();
  }, [activeProjectId]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    await storageService.setCurrentUser(user);
    const userProjects = await storageService.getProjects(user.id);
    setProjects(userProjects);
    if (userProjects.length > 0) setActiveProjectId(userProjects[0].id);
    const allUsers = await storageService.getUsers();
    setUsers(allUsers);
  };

  const handleLogout = async () => {
    await storageService.setCurrentUser(null);
    setCurrentUser(null);
    setProjects([]);
    setActiveProjectId(null);
  };

  const handleUpdateProfile = async (user: User) => {
    await storageService.updateUser(user);
    setCurrentUser(user);
    const allUsers = await storageService.getUsers();
    setUsers(allUsers);
    setIsProfileModalOpen(false);
  };

  const handleSaveProject = async (projectData: Project) => {
    if (!currentUser) return;
    await storageService.saveProject(projectData);
    
    // Refresh local project list
    const updatedProjects = await storageService.getProjects(currentUser.id);
    setProjects(updatedProjects);
    const allUsers = await storageService.getUsers();
    setUsers(allUsers);
    setActiveProjectId(projectData.id);
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!currentUser) return;
    try {
      await storageService.deleteProject(projectId, currentUser.id);
      const updated = projects.filter(p => p.id !== projectId);
      setProjects(updated);
      if (activeProjectId === projectId) {
        setActiveProjectId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    if (!activeProjectId || !currentUser) return;
    setSelectedTask({
      id: 'temp-' + Date.now(),
      projectId: activeProjectId,
      title: "",
      description: "",
      status,
      priority: 'medium',
      tags: [],
      createdAt: new Date().toISOString()
    });
  };

  const handleSaveTask = async (task: Task) => {
    if (!currentUser || !activeProjectId) return;
    const taskToSave = task.id.startsWith('temp-') ? { ...task, id: Date.now().toString() } : task;
    await storageService.saveTask(taskToSave, currentUser.id, currentUser.name);
    const projectTasks = await storageService.getTasks(activeProjectId);
    setTasks(projectTasks);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    await storageService.deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && currentUser) {
      await handleSaveTask({ ...task, status: newStatus });
    }
  };

  const handleBulkUpdate = async (taskIds: string[], updates: Partial<Task>) => {
    if (!currentUser || !activeProjectId) return;
    for (const id of taskIds) {
      const task = tasks.find(t => t.id === id);
      if (task) await storageService.saveTask({ ...task, ...updates }, currentUser.id, currentUser.name);
    }
    const projectTasks = await storageService.getTasks(activeProjectId);
    setTasks(projectTasks);
  };

  const handleBulkDelete = async (taskIds: string[]) => {
    for (const id of taskIds) await storageService.deleteTask(id);
    setTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
  };

  const getProjectProgress = useCallback((projectId: string) => {
    // In a real app we might fetch this from storage or compute from current tasks if loaded
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const done = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    return Math.round((done / projectTasks.length) * 100);
  }, [tasks]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-[3rem] mx-auto mb-8 flex items-center justify-center text-4xl font-black text-slate-900 shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-pulse">PM</div>
          <p className="text-slate-500 font-black tracking-[0.5em] uppercase text-[10px]">Neural Synchronizing</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={handleLogin} />;

  const activeProject = projects.find(p => p.id === activeProjectId);

  const renderView = () => {
    if (!activeProject) return null;
    switch (currentView) {
      case 'dashboard': return <DashboardView project={activeProject} tasks={tasks} users={users} />;
      case 'team': return <TeamView project={activeProject} tasks={tasks} users={users} />;
      default: return (
        <Board 
          project={activeProject}
          tasks={tasks}
          users={users}
          onTaskClick={setSelectedTask}
          onAddTask={handleAddTask}
          onMoveTask={handleMoveTask}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
        />
      );
    }
  };

  return (
    <div className="flex h-screen bg-white relative overflow-hidden font-['Inter']">
      <Sidebar 
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onNewProject={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
        onEditProject={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }}
        onDeleteProject={handleDeleteProject}
        currentUser={currentUser}
        onLogout={handleLogout}
        onProfileClick={() => setIsProfileModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
        getProjectProgress={getProjectProgress}
      />

      <main className="flex-1 overflow-hidden flex flex-col bg-[#fcfdfe] relative">
        {activeProject ? (
          <>
            <div className="absolute right-10 top-10 z-50 flex gap-4">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-16 h-16 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:bg-indigo-600 transition-all hover:scale-110 active:scale-95 group border border-white/10"
              >
                <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </button>
            </div>
            {renderView()}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
             <div className="w-48 h-48 bg-slate-50 rounded-[4rem] flex items-center justify-center mb-10 text-slate-200 shadow-inner group">
               <svg className="w-24 h-24 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Command Center Standby</h2>
             <p className="text-slate-500 max-w-sm mb-12 leading-relaxed font-medium">No tactical workspaces detected for your neural ID. Initialize a mission to begin.</p>
             <button 
               onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
               className="bg-slate-900 text-white px-14 py-6 rounded-[2.5rem] font-black shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest text-xs"
             >
               Launch New Mission
             </button>
          </div>
        )}
      </main>

      {isChatOpen && activeProject && (
        <ProjectChat project={activeProject} tasks={tasks} users={users} onClose={() => setIsChatOpen(false)} />
      )}

      {isProjectModalOpen && currentUser && (
        <ProjectModal 
          project={editingProject || undefined}
          currentUser={currentUser}
          allUsers={users}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
        />
      )}

      {isProfileModalOpen && currentUser && (
        <ProfileModal 
          user={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {selectedTask && (
        <TaskModal 
          task={selectedTask}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default App;
