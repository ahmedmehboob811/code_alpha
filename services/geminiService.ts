
import { GoogleGenAI } from "@google/genai";
import { Task, Project, User } from "../types";

// Always use the recommended initialization and model call patterns
export const geminiService = {
  suggestSubtasks: async (taskTitle: string, taskDescription: string) => {
    // Direct initialization with apiKey property as required
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      // Use ai.models.generateContent directly with model name and prompt
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given the task title "${taskTitle}" and description "${taskDescription}", suggest 3 to 5 actionable subtasks in a clear checklist format. Keep them concise and professional.`,
      });
      // Access the .text property directly (not a method)
      return response.text || "No suggestions available.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to reach AI assistant.";
    }
  },

  analyzeProjectHealth: async (projectName: string, tasks: Task[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const taskSummary = tasks.map(t => `- ${t.title} (${t.status}, ${t.priority} priority)`).join('\n');
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Expert PM Analysis for "${projectName}":
        ${taskSummary}
        
        Provide health score, 2-sentence status, and 3 high-impact action items.`,
      });
      return response.text || "Insight unavailable.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Health check failed.";
    }
  },

  coordinatorChat: async (project: Project, tasks: Task[], users: User[], userPrompt: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = `
      Project: ${project.name}
      Users: ${users.map(u => u.name).join(', ')}
      Tasks: ${tasks.map(t => `${t.title} [Status: ${t.status}, Assigned to: ${users.find(u => u.id === t.assigneeId)?.name || 'Unassigned'}]`).join('\n')}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the AI Project Coordinator for Zenith Hub.
        Context: ${context}
        
        User Question: ${userPrompt}
        
        Answer professionally, concisely, and specifically based on the project data.`,
      });
      return response.text || "I'm sorry, I couldn't analyze the project data.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Connection to AI Coordinator lost.";
    }
  }
};
