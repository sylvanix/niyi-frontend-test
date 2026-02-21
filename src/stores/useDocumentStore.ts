import { create } from 'zustand';
import type { DocumentState, HistoryEntry } from '../types';

interface DocumentStore {
  document: DocumentState;
  history: HistoryEntry[];
  historyIndex: number;
  
  // Actions
  setTitle: (title: string) => void;
  setContent: (content: string, operationId?: string) => void;
  insertAt: (position: number, text: string, operationId?: string) => void;
  deleteAt: (position: number, length: number, operationId?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const INITIAL_CONTENT = `// Bienvenue dans CollabEdit ! 🚀
// Cet éditeur collaboratif simule des interactions multi-utilisateurs.

function greet(name) {
  console.log(\`Bonjour, \${name} !\`);
}

const users = ["Alice", "Bob", "Charlie"];

users.forEach(user => {
  greet(user);
});

// Les curseurs colorés des autres utilisateurs
// apparaissent en temps réel dans l'éditeur.
// 
// Essayez de taper du texte et observez
// les indicateurs de latence et de synchronisation.
`;

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  document: {
    id: 'doc-001',
    title: 'Document sans titre',
    content: INITIAL_CONTENT,
    version: 1,
    lastModified: Date.now(),
  },
  history: [{ content: INITIAL_CONTENT, timestamp: Date.now(), operationId: 'init' }],
  historyIndex: 0,

  setTitle: (title: string) => set((state) => ({
    document: { ...state.document, title, lastModified: Date.now() },
  })),

  setContent: (content: string, operationId?: string) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      content,
      timestamp: Date.now(),
      operationId: operationId || `manual-${Date.now()}`,
    });
    
    // Cap history at 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      document: {
        ...state.document,
        content,
        version: state.document.version + 1,
        lastModified: Date.now(),
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  insertAt: (position: number, text: string, operationId?: string) => {
    const state = get();
    const content = state.document.content;
    const newContent = content.slice(0, position) + text + content.slice(position);
    get().setContent(newContent, operationId);
  },

  deleteAt: (position: number, length: number, operationId?: string) => {
    const state = get();
    const content = state.document.content;
    const newContent = content.slice(0, position) + content.slice(position + length);
    get().setContent(newContent, operationId);
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        document: {
          ...state.document,
          content: state.history[newIndex].content,
          version: state.document.version + 1,
          lastModified: Date.now(),
        },
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        document: {
          ...state.document,
          content: state.history[newIndex].content,
          version: state.document.version + 1,
          lastModified: Date.now(),
        },
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => {
    return get().historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
}));
