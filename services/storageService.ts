
import { Project, Task, Comment, User, Activity } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'pm_projects_v1',
  TASKS: 'pm_tasks_v1',
  COMMENTS: 'pm_comments_v1',
  USERS: 'pm_users_v1',
  ACTIVITIES: 'pm_activities_v1',
  CURRENT_USER: 'pm_current_user_v1',
  TOKEN: 'pm_auth_token_v1'
};

const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Alex Rivera', email: 'alex@pm.ai', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@pm.ai', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '3', name: 'Marcus Bell', email: 'marcus@pm.ai', avatar: 'https://i.pravatar.cc/150?u=marcus' },
];

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: async (user: User | null) => {
    await delay(400);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, `jwt-${user.id}-${Date.now()}`);
      
      const users = await storageService.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx > -1) {
        users[idx] = user;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  updateUser: async (user: User) => {
    await delay(500);
    const users = await storageService.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) {
      users[idx] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const current = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (current) {
        const currentUser = JSON.parse(current);
        if (currentUser.id === user.id) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        }
      }
    }
  },

  registerUser: async (name: string, email: string): Promise<User> => {
    await delay(800);
    const users = await storageService.getUsers();
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  getUsers: async (): Promise<User[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getProjects: async (userId: string): Promise<Project[]> => {
    await delay(500);
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = data ? JSON.parse(data) : [];
    return projects.filter(p => p.members.includes(userId) || p.ownerId === userId);
  },

  saveProject: async (project: Project) => {
    await delay(600);
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
    const existing = projects.findIndex((p: any) => p.id === project.id);
    if (existing > -1) projects[existing] = project;
    else projects.push(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  deleteProject: async (projectId: string, requesterId: string) => {
    await delay(700);
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project || project.ownerId !== requesterId) {
      throw new Error("Unauthorized: Only the project lead can delete this workspace.");
    }

    const updated = projects.filter((p: any) => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]').filter((t: Task) => t.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getTasks: async (projectId: string): Promise<Task[]> => {
    await delay(400);
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    return tasks.filter(t => t.projectId === projectId);
  },

  saveTask: async (task: Task, userId: string, userName: string) => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    const existingIdx = tasks.findIndex(t => t.id === task.id);
    
    const action = existingIdx > -1 ? 'updated' : 'created';
    await storageService.logActivity({
      id: Date.now().toString(),
      projectId: task.projectId,
      userId,
      userName,
      action,
      targetName: task.title,
      createdAt: new Date().toISOString()
    });

    if (existingIdx > -1) tasks[existingIdx] = task;
    else tasks.push(task);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  deleteTask: async (taskId: string) => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks.filter(t => t.id !== taskId)));
  },

  getComments: async (taskId: string): Promise<Comment[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = data ? JSON.parse(data) : [];
    return comments.filter(c => c.taskId === taskId);
  },

  saveComment: async (comment: Comment) => {
    await delay(200);
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = data ? JSON.parse(data) : [];
    comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  },

  getActivities: async (projectId: string): Promise<Activity[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const activities: Activity[] = data ? JSON.parse(data) : [];
    return activities.filter(a => a.projectId === projectId).reverse().slice(0, 30);
  },

  logActivity: async (activity: Activity) => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const activities: Activity[] = data ? JSON.parse(data) : [];
    activities.push(activity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }
};
