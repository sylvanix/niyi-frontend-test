import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useUsersStore } from '../../stores/useUsersStore';
import { useNetworkStore } from '../../stores/useNetworkStore';
import { useChatStore } from '../../stores/useChatStore';
import { Activity } from 'lucide-react';

// Line Numbers Component - memoized
const LineNumbers = React.memo(function LineNumbers({ count }: { count: number }) {
  return (
    <div className="select-none pr-3 pt-4 text-right border-r border-[var(--border-color-subtle)]
                    min-w-[3rem] shrink-0">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="line-number">
          {i + 1}
        </div>
      ))}
    </div>
  );
});

// Remote Cursor Overlay
const RemoteCursors = React.memo(function RemoteCursors() {
  const users = useUsersStore((s) => s.users);
  const localUserId = useUsersStore((s) => s.localUserId);

  const remoteUsers = useMemo(
    () => users.filter((u) => u.id !== localUserId && u.status !== 'offline'),
    [users, localUserId]
  );

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {remoteUsers.map((user) => {
        const top = (user.cursorPosition.line - 1) * 22.4 + 16; // line-height * line + padding
        const left = user.cursorPosition.column * 8.4 + 16; // char-width * col + padding

        return (
          <div key={user.id} className="remote-cursor cursor-blink" style={{ top, left, backgroundColor: user.color }}>
            <div
              className="remote-cursor-label"
              style={{ backgroundColor: user.color, color: 'white' }}
            >
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// Latency Indicator
const LatencyIndicator = React.memo(function LatencyIndicator() {
  const latency = useNetworkStore((s) => s.latency);
  const status = useNetworkStore((s) => s.status);

  const latencyColor = useMemo(() => {
    if (status === 'disconnected') return 'text-red-400';
    if (latency < 200) return 'text-green-400';
    if (latency < 500) return 'text-yellow-400';
    if (latency < 1000) return 'text-orange-400';
    return 'text-red-400';
  }, [latency, status]);

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md 
                     bg-[var(--bg-app)] border border-[var(--border-color)]
                     ${latencyColor}`}>
      <Activity size={12} />
      <span className="text-[10px] font-mono font-bold">
        {status === 'disconnected' ? '---' : `${latency}ms`}
      </span>
    </div>
  );
});

// Main Editor Component
const Editor = React.memo(function Editor() {
  const content = useDocumentStore((s) => s.document.content);
  const setContent = useDocumentStore((s) => s.setContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = useMemo(() => {
    return content.split('\n').length;
  }, [content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value, `local-${Date.now()}`);
    },
    [setContent]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          useDocumentStore.getState().undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          useDocumentStore.getState().redo();
        }
      }

      // Update local user cursor position
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const pos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, pos);
        const lines = textBefore.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length;
        useUsersStore.getState().updateCursorPosition('user-local', line, column);
      }
    },
    []
  );

  const handleClick = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const pos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, pos);
      const lines = textBefore.split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;
      useUsersStore.getState().updateCursorPosition('user-local', line, column);
    }
  }, []);

  // Log local edits
  const handleInput = useCallback(() => {
    useUsersStore.getState().incrementOperations('user-local');
    useUsersStore.getState().setUserStatus('user-local', 'typing');
    
    // Add log
    useChatStore.getState().addLog({
      id: `log-${Date.now()}`,
      userId: 'user-local',
      userName: 'Vous',
      userColor: '#3b82f6',
      action: 'edit',
      detail: 'Modification du document',
      timestamp: Date.now(),
    });

    // Reset typing status after delay
    setTimeout(() => {
      useUsersStore.getState().setUserStatus('user-local', 'active');
    }, 1500);
  }, []);

  // Sync scroll between line numbers and textarea
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea || !lineNumbers) return;

    const handleScroll = () => {
      if (lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
      }
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden bg-[var(--bg-editor)] border-x border-[var(--border-color)]">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]
                      bg-[var(--bg-panel)]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {lineCount} lignes · {content.length} caractères
          </span>
        </div>
        <LatencyIndicator />
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Line numbers */}
        <div ref={lineNumbersRef} className="overflow-hidden">
          <LineNumbers count={lineCount} />
        </div>

        {/* Text area with cursor overlays */}
        <div className="relative flex-1 overflow-hidden">
          <RemoteCursors />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyDown}
            onClick={handleClick}
            onInput={handleInput}
            className="editor-textarea p-4 overflow-y-auto h-full"
            spellCheck={false}
            placeholder="Commencez à écrire..."
          />
        </div>
      </div>
    </div>
  );
});

export default Editor;
