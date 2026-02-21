// ===== Types partagés pour l'application CollabEdit =====

// --- Utilisateurs ---
export interface User {
  id: string;
  name: string;
  color: string;
  avatar: string; // Initiale(s)
  status: 'active' | 'typing' | 'idle' | 'offline';
  cursorPosition: CursorPosition;
  operationCount: number;
  lastActivity: number;
}

export interface CursorPosition {
  line: number;
  column: number;
}

// --- Document ---
export interface DocumentState {
  id: string;
  title: string;
  content: string;
  version: number;
  lastModified: number;
}

// --- Opérations (OT simplifié) ---
export type OperationType = 'insert' | 'delete' | 'replace';

export interface Operation {
  id: string;
  userId: string;
  userName: string;
  type: OperationType;
  position: number;
  content: string;       // Texte inséré ou supprimé
  length: number;        // Longueur de la suppression/remplacement
  timestamp: number;
  version: number;
  applied: boolean;
  retryCount: number;
}

// --- Réseau ---
export type ConnectionStatus = 'connected' | 'syncing' | 'disconnected';

export interface NetworkState {
  status: ConnectionStatus;
  latency: number;
  packetLoss: number;
  totalPacketsSent: number;
  totalPacketsLost: number;
  syncMode: 'real-time' | 'buffered' | 'offline';
}

// --- Historique (Undo/Redo) ---
export interface HistoryEntry {
  content: string;
  timestamp: number;
  operationId: string;
}

// --- Logs d'activité ---
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  action: string;
  detail: string;
  timestamp: number;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: number;
}

// --- Statistiques de debug ---
export interface DebugStats {
  documentSize: number;
  lineCount: number;
  wordCount: number;
  activeUsers: number;
  totalOperations: number;
  pendingOperations: number;
  currentLatency: number;
  syncMode: string;
  memoryUsage: number;
  uptime: number;
}
