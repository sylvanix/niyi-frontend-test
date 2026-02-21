import { create } from 'zustand';
import type { ChatMessage, ActivityLog } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  activityLogs: ActivityLog[];
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  addLog: (log: ActivityLog) => void;
  clearLogs: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  activityLogs: [],

  addMessage: (message: ChatMessage) =>
    set((state) => {
      const messages = [...state.messages, message];
      // Cap at 100 messages
      if (messages.length > 100) messages.shift();
      return { messages };
    }),

  addLog: (log: ActivityLog) =>
    set((state) => {
      const activityLogs = [...state.activityLogs, log];
      // Cap at 200 logs
      if (activityLogs.length > 200) activityLogs.shift();
      return { activityLogs };
    }),

  clearLogs: () => set({ activityLogs: [] }),
}));
