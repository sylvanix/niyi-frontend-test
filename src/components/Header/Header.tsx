import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useNetworkStore } from '../../stores/useNetworkStore';
import {
  Undo2,
  Redo2,
  Wifi,
  WifiOff,
  RefreshCw,
  Moon,
  Sun,
  FileText,
} from 'lucide-react';

// Connection Status Badge
const ConnectionStatus = React.memo(function ConnectionStatus() {
  const status = useNetworkStore((s) => s.status);
  const latency = useNetworkStore((s) => s.latency);

  const statusConfig = {
    connected: {
      label: 'Connecté',
      color: 'bg-green-500',
      textColor: 'text-green-400',
      icon: Wifi,
      pulseClass: 'status-connected',
    },
    syncing: {
      label: 'Synchronisation',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400',
      icon: RefreshCw,
      pulseClass: 'status-syncing',
    },
    disconnected: {
      label: 'Déconnecté',
      color: 'bg-red-500',
      textColor: 'text-red-400',
      icon: WifiOff,
      pulseClass: '',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-app)]`}>
        <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulseClass}`} />
        <Icon size={14} className={config.textColor} />
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
        {status === 'connected' && (
          <span className="text-[10px] text-[var(--text-muted)]">
            {latency}ms
          </span>
        )}
      </div>
    </div>
  );
});

// History Controls (Undo/Redo)
const HistoryControls = React.memo(function HistoryControls() {
  const undo = useDocumentStore((s) => s.undo);
  const redo = useDocumentStore((s) => s.redo);
  const historyIndex = useDocumentStore((s) => s.historyIndex);
  const historyLength = useDocumentStore((s) => s.history.length);

  const canUndoVal = historyIndex > 0;
  const canRedoVal = historyIndex < historyLength - 1;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={undo}
        disabled={!canUndoVal}
        className={`p-2 rounded-lg transition-all duration-150 ${
          canUndoVal
            ? 'hover:bg-[var(--accent-glow)] text-[var(--text-primary)] cursor-pointer'
            : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
        }`}
        title="Annuler (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedoVal}
        className={`p-2 rounded-lg transition-all duration-150 ${
          canRedoVal
            ? 'hover:bg-[var(--accent-glow)] text-[var(--text-primary)] cursor-pointer'
            : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
        }`}
        title="Rétablir (Ctrl+Y)"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
});

// Editable Document Title
const DocumentTitle = React.memo(function DocumentTitle() {
  const title = useDocumentStore((s) => s.document.title);
  const setTitle = useDocumentStore((s) => s.setTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = useCallback(() => {
    if (editValue.trim()) {
      setTitle(editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, setTitle]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') setIsEditing(false);
        }}
        className="text-sm font-semibold bg-[var(--bg-app)] text-[var(--text-primary)]
                   border border-[var(--color-primary-500)] rounded-md px-2 py-1
                   outline-none w-64"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setEditValue(title);
        setIsEditing(true);
      }}
      className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]
                 hover:text-[var(--color-primary-400)] transition-colors cursor-pointer
                 px-2 py-1 rounded-md hover:bg-[var(--accent-glow)]"
      title="Cliquer pour renommer"
    >
      <FileText size={16} className="text-[var(--color-primary-400)]" />
      <span>{title}</span>
    </button>
  );
});

// Dark mode toggle
interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const DarkModeToggle = React.memo(function DarkModeToggle({ isDark, onToggle }: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-[var(--accent-glow)] text-[var(--text-secondary)]
                 transition-all duration-150 cursor-pointer"
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
});

// Main Header Component
interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
}

const Header = React.memo(function Header({ isDark, onToggleDark }: HeaderProps) {
  return (
    <header className="glass-header px-4 py-2 flex items-center justify-between gap-4">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600
                          flex items-center justify-center text-white font-bold text-sm shadow-md">
            C
          </div>
          <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase hidden sm:block">
            CollabEdit
          </span>
        </div>
        <div className="w-px h-6 bg-[var(--border-color)] hidden sm:block" />
        <DocumentTitle />
      </div>

      {/* Center: Connection Status */}
      <div className="hidden md:flex">
        <ConnectionStatus />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        <HistoryControls />
        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />
        <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
      </div>
    </header>
  );
});

export default Header;
