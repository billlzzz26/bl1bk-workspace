import { useState } from 'react';
import { ThemeProvider } from './components/common/ThemeProvider';
import Layout from './components/Layout';
import Dashboard from './components/dashboard/Dashboard';
import NotesManager from './components/notes/NotesManager';
import TodoManager from './components/todos/TodoManager';
import EnhancedChatInterface from './components/ai/EnhancedChatInterface';
import AgentControlPanel from './components/ai/AgentControlPanel';
import SettingsPage from './components/settings/SettingsPage';
import ProfilePage from './components/profile/ProfilePage';
import './App.css';

const pages = {
  '/': Dashboard,
  '/notes': NotesManager,
  '/todos': TodoManager,
  '/chat': EnhancedChatInterface,
  '/agents': AgentControlPanel,
  '/settings': SettingsPage,
  '/profile': ProfilePage,
  '/knowledge-graph': () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        แผนภาพความรู้
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา
      </p>
    </div>
  ),
  '/search': () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ค้นหา
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        ฟีเจอร์ค้นหาขั้นสูงกำลังอยู่ในระหว่างการพัฒนา
      </p>
    </div>
  )
};

function App() {
  const [currentPath, setCurrentPath] = useState('/');

  // Override link clicks to use our navigation
  const handleLinkClick = (e) => {
    const href = e.target.getAttribute('href');
    if (href && href.startsWith('/')) {
      e.preventDefault();
      setCurrentPath(href);
    }
  };

  const CurrentPageComponent = pages[currentPath] || Dashboard;

  return (
    <ThemeProvider defaultTheme="system" storageKey="unified-ai-workspace-theme">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" onClick={handleLinkClick}>
        <Layout currentPath={currentPath}>
          <CurrentPageComponent />
        </Layout>
      </div>
    </ThemeProvider>
  );
}

export default App;
