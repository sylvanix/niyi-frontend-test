import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { useUsersStore } from '../../stores/useUsersStore';
import { ScrollText, MessageSquare, Send, Trash2 } from 'lucide-react';

// Single Activity Log Entry
const LogEntry = React.memo(function LogEntry({
  userName,
  userColor,
  action,
  detail,
  timestamp,
}: {
  userName: string;
  userColor: string;
  action: string;
  detail: string;
  timestamp: number;
}) {
  const time = useMemo(() => {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  }, [timestamp]);

  const actionColors: Record<string, string> = {
    insert: 'border-green-500',
    delete: 'border-red-500',
    edit: 'border-blue-500',
    error: 'border-red-500',
    disconnect: 'border-red-500',
    reconnect: 'border-green-500',
    start: 'border-blue-500',
  };

  return (
    <div className={`log-entry animate-slide-in ${actionColors[action] || 'border-gray-500'}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[10px] text-[var(--text-muted)] font-mono">{time}</span>
        <span className="font-semibold" style={{ color: userColor }}>
          {userName}
        </span>
      </div>
      <span className="text-[var(--text-secondary)]">{detail}</span>
    </div>
  );
});

// Activity Log Panel
const ActivityLog = React.memo(function ActivityLog() {
  const logs = useChatStore((s) => s.activityLogs);
  const clearLogs = useChatStore((s) => s.clearLogs);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-color)]">
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          {logs.length} entrées
        </span>
        <button
          onClick={clearLogs}
          className="p-1 rounded hover:bg-[var(--accent-glow)] text-[var(--text-muted)]
                     hover:text-red-400 transition-colors cursor-pointer"
          title="Effacer les logs"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5 py-1">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-xs">
            Aucune activité
          </div>
        ) : (
          logs.map((log) => (
            <LogEntry
              key={log.id}
              userName={log.userName}
              userColor={log.userColor}
              action={log.action}
              detail={log.detail}
              timestamp={log.timestamp}
            />
          ))
        )}
      </div>
    </div>
  );
});

// Chat Panel
const ChatPanel = React.memo(function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const localUserId = useUsersStore((s) => s.localUserId);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    addMessage({
      id: `msg-${Date.now()}`,
      userId: localUserId,
      userName: 'Vous',
      userColor: '#3b82f6',
      content: inputValue.trim(),
      timestamp: Date.now(),
    });
    setInputValue('');
  }, [inputValue, addMessage, localUserId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-xs">
            Aucun message
          </div>
        ) : (
          messages.map((msg) => {
            const isLocal = msg.userId === localUserId;
            const time = new Date(msg.timestamp);
            const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

            return (
              <div
                key={msg.id}
                className={`flex flex-col animate-slide-in ${isLocal ? 'items-end' : 'items-start'}`}
              >
                {!isLocal && (
                  <span className="text-[10px] font-semibold mb-0.5 px-1" style={{ color: msg.userColor }}>
                    {msg.userName}
                  </span>
                )}
                <div className={`chat-message ${isLocal ? 'chat-own' : 'chat-other'}`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-[var(--text-muted)] mt-0.5 px-1">
                  {timeStr}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-2 bg-[var(--bg-app)] rounded-lg px-3 py-2
                        border border-[var(--border-color)] focus-within:border-[var(--color-primary-500)]
                        transition-colors">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre message..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none
                       placeholder:text-[var(--text-muted)]"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              inputValue.trim()
                ? 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-500)]'
                : 'text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

// Right Panel with Tabs
const RightPanel = React.memo(function RightPanel() {
  const [activeTab, setActiveTab] = useState<'logs' | 'chat'>('logs');

  return (
    <aside className="sidebar-right glass-panel flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium
                     transition-all cursor-pointer ${activeTab === 'logs' ? 'tab-active' : 'tab-inactive'}`}
        >
          <ScrollText size={14} />
          Journal
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium
                     transition-all cursor-pointer ${activeTab === 'chat' ? 'tab-active' : 'tab-inactive'}`}
        >
          <MessageSquare size={14} />
          Chat
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'logs' ? <ActivityLog /> : <ChatPanel />}
    </aside>
  );
});

export default RightPanel;
