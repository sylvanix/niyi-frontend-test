import React from 'react';
import { useUsersStore } from '../../stores/useUsersStore';
import { Users, Pencil, Circle } from 'lucide-react';

// Single User Card
const UserCard = React.memo(function UserCard({
  name,
  color,
  avatar,
  status,
  operationCount,
}: {
  name: string;
  color: string;
  avatar: string;
  status: string;
  operationCount: number;
}) {
  const statusLabel = {
    active: 'En ligne',
    typing: 'En train d\'écrire...',
    idle: 'Inactif',
    offline: 'Hors ligne',
  }[status] || 'Inconnu';

  const statusColor = {
    active: 'text-green-400',
    typing: 'text-blue-400',
    idle: 'text-yellow-400',
    offline: 'text-red-400',
  }[status] || 'text-gray-400';

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                    hover:bg-[var(--accent-glow)] transition-all duration-150 group">
      {/* Avatar */}
      <div
        className="relative w-9 h-9 rounded-full flex items-center justify-center
                   text-white font-bold text-sm shrink-0 shadow-md"
        style={{ backgroundColor: color }}
      >
        {avatar}
        {/* Status dot */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2
                     border-[var(--bg-panel)] ${
                       status === 'active'
                         ? 'bg-green-500'
                         : status === 'typing'
                         ? 'bg-blue-500'
                         : status === 'idle'
                         ? 'bg-yellow-500'
                         : 'bg-gray-500'
                     }`}
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {name}
          </span>
          {status === 'typing' && (
            <Pencil size={12} className="text-blue-400 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Circle size={6} className={`${statusColor} fill-current`} />
          <span className={`text-[11px] ${statusColor}`}>{statusLabel}</span>
        </div>
      </div>

      {/* Operation Counter */}
      <div className="flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono font-bold text-[var(--text-primary)]">
          {operationCount}
        </span>
        <span className="text-[9px] text-[var(--text-muted)]">ops</span>
      </div>
    </div>
  );
});

// User Panel (Left Sidebar)
const UserPanel = React.memo(function UserPanel() {
  const users = useUsersStore((s) => s.users);

  const activeCount = users.filter((u) => u.status !== 'offline').length;

  return (
    <aside className="sidebar-left glass-panel flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[var(--color-primary-400)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Utilisateurs
          </span>
          <span className="ml-auto text-[10px] font-mono bg-[var(--color-primary-600)] text-white
                         px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {users.map((user) => (
          <UserCard
            key={user.id}
            name={user.name}
            color={user.color}
            avatar={user.avatar}
            status={user.status}
            operationCount={user.operationCount}
          />
        ))}
      </div>

      {/* Bottom Stats */}
      <div className="px-4 py-2 border-t border-[var(--border-color)]">
        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>Total ops</span>
          <span className="font-mono font-bold">
            {users.reduce((sum, u) => sum + u.operationCount, 0)}
          </span>
        </div>
      </div>
    </aside>
  );
});

export default UserPanel;
