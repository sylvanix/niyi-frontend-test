import React, { useMemo, useState, useEffect } from 'react';
import { useDebugStats } from '../../hooks/useDebugStats';
import { useNetworkStore } from '../../stores/useNetworkStore';
import {
  Terminal,
  HardDrive,
  Clock,
  Wifi,
  Activity,
  FileText,
  Users,
  Zap,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// Single Stat Item
const StatItem = React.memo(function StatItem({
  icon: Icon,
  label,
  value,
  color = 'text-[var(--text-secondary)]',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} className={color} />
      <span className="text-[10px] text-[var(--text-muted)]">{label}:</span>
      <span className={`text-[10px] font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
});

// Debug Console (Footer)
const DebugConsole = React.memo(function DebugConsole() {
  const stats = useDebugStats();
  const status = useNetworkStore((s) => s.status);
  const totalPacketsSent = useNetworkStore((s) => s.totalPacketsSent);
  const totalPacketsLost = useNetworkStore((s) => s.totalPacketsLost);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uptime, setUptime] = useState(0);

  // Uptime timer
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const uptimeStr = useMemo(() => {
    const m = Math.floor(uptime / 60);
    const s = uptime % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [uptime]);

  const latencyColor = useMemo(() => {
    if (status === 'disconnected') return 'text-red-400';
    if (stats.currentLatency < 200) return 'text-green-400';
    if (stats.currentLatency < 500) return 'text-yellow-400';
    return 'text-red-400';
  }, [stats.currentLatency, status]);

  const lossRate = useMemo(() => {
    if (totalPacketsSent === 0) return '0.0';
    return ((totalPacketsLost / totalPacketsSent) * 100).toFixed(1);
  }, [totalPacketsSent, totalPacketsLost]);

  return (
    <footer className="glass-footer text-gray-300">
      {/* Toggle Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-1.5
                   hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[var(--color-primary-400)]" />
          <span className="text-[10px] font-mono font-semibold text-[var(--color-primary-400)] uppercase tracking-wider">
            Console de débogage
          </span>
        </div>
        {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {/* Compact Stats (always visible) */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-t border-white/5 flex-wrap">
        <StatItem icon={FileText} label="Taille" value={`${stats.documentSize} chars`} />
        <StatItem icon={HardDrive} label="Lignes" value={stats.lineCount} />
        <StatItem icon={Users} label="Actifs" value={stats.activeUsers} color="text-green-400" />
        <StatItem icon={Activity} label="Latence" value={`${stats.currentLatency}ms`} color={latencyColor} />
        <StatItem icon={Wifi} label="Mode" value={stats.syncMode} />
        <StatItem icon={Clock} label="Uptime" value={uptimeStr} />
      </div>

      {/* Expanded Debug Panel */}
      {isExpanded && (
        <div className="px-4 py-2 border-t border-white/5 animate-slide-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Document</div>
              <div className="space-y-1">
                <StatItem icon={FileText} label="Caractères" value={stats.documentSize} />
                <StatItem icon={FileText} label="Lignes" value={stats.lineCount} />
                <StatItem icon={FileText} label="Mots" value={stats.wordCount} />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Réseau</div>
              <div className="space-y-1">
                <StatItem icon={Activity} label="Latence" value={`${stats.currentLatency}ms`} color={latencyColor} />
                <StatItem icon={Wifi} label="Mode" value={stats.syncMode} />
                <StatItem icon={Zap} label="Perte" value={`${lossRate}%`} color={Number(lossRate) > 0 ? 'text-red-400' : 'text-green-400'} />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Opérations</div>
              <div className="space-y-1">
                <StatItem icon={Zap} label="Total" value={stats.totalOperations} />
                <StatItem icon={Zap} label="Paquets" value={totalPacketsSent} />
                <StatItem icon={Zap} label="Perdus" value={totalPacketsLost} color={totalPacketsLost > 0 ? 'text-red-400' : 'text-green-400'} />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2.5">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Système</div>
              <div className="space-y-1">
                <StatItem icon={Users} label="Actifs" value={stats.activeUsers} color="text-green-400" />
                <StatItem icon={Clock} label="Uptime" value={uptimeStr} />
                <StatItem icon={HardDrive} label="Mémoire" value={`${stats.memoryUsage}MB`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
});

export default DebugConsole;
