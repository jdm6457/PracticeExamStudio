import React from 'react';
import type { AppView } from '../types';
import { HomeIcon, TestIcon, HistoryIcon, ImportExportIcon } from './icons';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: 'banks' as AppView, label: 'Question Banks', icon: <HomeIcon /> },
    { view: 'take_exam' as AppView, label: 'Take Exam', icon: <TestIcon /> },
    { view: 'history' as AppView, label: 'History', icon: <HistoryIcon /> },
    { view: 'import_export' as AppView, label: 'Import/Export', icon: <ImportExportIcon /> },
  ];

  const handleUpdateKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    } else {
      alert("API Key selection is not available in this environment.");
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900/70 backdrop-blur-lg p-5 flex flex-col border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shadow-lg">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Practice Exam Studio</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Master Your Exams</p>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.view}>
              <button
                onClick={() => onNavigate(item.view)}
                className={`w-full text-left px-4 py-2.5 rounded-lg my-1 flex items-center gap-3 transition-colors duration-200 text-base ${
                  currentView === item.view
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4">
        {typeof window !== 'undefined' && window.aistudio && (
          <button 
            onClick={handleUpdateKey}
            className="w-full text-left px-4 py-2 mb-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline focus:outline-none"
          >
            Change API Key
          </button>
        )}
        <div className="text-xs text-slate-400 dark:text-slate-500 px-4">
          <p>&copy; {new Date().getFullYear()} Practice Exam Studio</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;