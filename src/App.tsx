import React, { useState, useCallback } from 'react';
import { useSimulation } from './hooks/useSimulation';
import Header from './components/Header/Header';
import UserPanel from './components/Sidebar/UserPanel';
import Editor from './components/Editor/Editor';
import RightPanel from './components/RightPanel/RightPanel';
import DebugConsole from './components/Footer/DebugConsole';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  // Start the simulation
  useSimulation();

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  return (
    <div className="app-layout">
      {/* Header */}
      <Header isDark={isDark} onToggleDark={toggleDark} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Left Sidebar - Users */}
        <UserPanel />

        {/* Center - Editor */}
        <Editor />

        {/* Right Sidebar - Logs & Chat */}
        <RightPanel />
      </main>

      {/* Footer - Debug Console */}
      <DebugConsole />
    </div>
  );
};

export default App;
