import { useMemo } from 'react';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useUsersStore } from '../stores/useUsersStore';
import { useNetworkStore } from '../stores/useNetworkStore';
import type { DebugStats } from '../types';

/**
 * Hook that computes debug statistics from various stores.
 * Uses useMemo + shallow selectors to avoid unnecessary recomputations.
 */
export function useDebugStats(): DebugStats {
  const content = useDocumentStore((s) => s.document.content);
  const users = useUsersStore((s) => s.users);
  const latency = useNetworkStore((s) => s.latency);
  const syncMode = useNetworkStore((s) => s.syncMode);
  const totalPacketsSent = useNetworkStore((s) => s.totalPacketsSent);

  return useMemo<DebugStats>(() => {
    const lines = content.split('\n');
    const words = content.split(/\s+/).filter(Boolean);
    const activeUsers = users.filter((u) => u.status !== 'offline').length;
    const totalOps = users.reduce((sum, u) => sum + u.operationCount, 0);

    return {
      documentSize: content.length,
      lineCount: lines.length,
      wordCount: words.length,
      activeUsers,
      totalOperations: totalOps,
      pendingOperations: 0,
      currentLatency: latency,
      syncMode,
      memoryUsage: Math.round((performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize / 1024 / 1024 || 0),
      uptime: Math.floor((Date.now() - (window as unknown as { __appStartTime?: number }).__appStartTime || 0) / 1000),
    };
  }, [content, users, latency, syncMode, totalPacketsSent]);
}
