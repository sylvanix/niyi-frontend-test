import { create } from 'zustand';
import type { User } from '../types';

interface UsersStore {
  users: User[];
  localUserId: string;
  
  // Actions
  setUsers: (users: User[]) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setUserStatus: (userId: string, status: User['status']) => void;
  incrementOperations: (userId: string) => void;
  updateCursorPosition: (userId: string, line: number, column: number) => void;
}

const SIMULATED_USERS: User[] = [
  {
    id: 'user-local',
    name: 'Vous',
    color: '#3b82f6',
    avatar: 'V',
    status: 'active',
    cursorPosition: { line: 1, column: 0 },
    operationCount: 0,
    lastActivity: Date.now(),
  },
  {
    id: 'user-alice',
    name: 'Alice',
    color: '#ef4444',
    avatar: 'A',
    status: 'active',
    cursorPosition: { line: 4, column: 0 },
    operationCount: 0,
    lastActivity: Date.now(),
  },
  {
    id: 'user-bob',
    name: 'Bob',
    color: '#22c55e',
    avatar: 'B',
    status: 'active',
    cursorPosition: { line: 8, column: 0 },
    operationCount: 0,
    lastActivity: Date.now(),
  },
  {
    id: 'user-charlie',
    name: 'Charlie',
    color: '#f59e0b',
    avatar: 'C',
    status: 'idle',
    cursorPosition: { line: 12, column: 0 },
    operationCount: 0,
    lastActivity: Date.now(),
  },
];

export const useUsersStore = create<UsersStore>((set) => ({
  users: SIMULATED_USERS,
  localUserId: 'user-local',

  setUsers: (users: User[]) => set({ users }),

  updateUser: (userId: string, updates: Partial<User>) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, ...updates, lastActivity: Date.now() } : u
      ),
    })),

  setUserStatus: (userId: string, status: User['status']) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, status, lastActivity: Date.now() } : u
      ),
    })),

  incrementOperations: (userId: string) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, operationCount: u.operationCount + 1 } : u
      ),
    })),

  updateCursorPosition: (userId: string, line: number, column: number) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? { ...u, cursorPosition: { line, column }, lastActivity: Date.now() }
          : u
      ),
    })),
}));
