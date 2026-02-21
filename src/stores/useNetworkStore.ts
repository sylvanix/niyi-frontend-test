import { create } from 'zustand';
import type { ConnectionStatus, NetworkState } from '../types';

interface NetworkStore extends NetworkState {
  // Actions
  setStatus: (status: ConnectionStatus) => void;
  setLatency: (latency: number) => void;
  incrementPackets: (lost?: boolean) => void;
  setSyncMode: (mode: NetworkState['syncMode']) => void;
  simulateDisconnect: () => void;
  simulateReconnect: () => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  status: 'connected',
  latency: 0,
  packetLoss: 0.01,
  totalPacketsSent: 0,
  totalPacketsLost: 0,
  syncMode: 'real-time',

  setStatus: (status: ConnectionStatus) => set({ status }),

  setLatency: (latency: number) => set({ latency }),

  incrementPackets: (lost = false) =>
    set((state) => ({
      totalPacketsSent: state.totalPacketsSent + 1,
      totalPacketsLost: lost ? state.totalPacketsLost + 1 : state.totalPacketsLost,
    })),

  setSyncMode: (mode: NetworkState['syncMode']) => set({ syncMode: mode }),

  simulateDisconnect: () =>
    set({ status: 'disconnected', syncMode: 'offline' }),

  simulateReconnect: () =>
    set({ status: 'syncing', syncMode: 'buffered' }),
}));
