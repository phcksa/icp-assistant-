
import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, History, ClipboardCheck, Activity, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.AUDIT, label: 'Round Audit', icon: ClipboardCheck },
    { id: Tab.MASTER_LIST, label: 'Official Records', icon: Database },
    { id: Tab.HISTORY, label: 'History', icon: History },
    { id: Tab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <Activity className="text-teal-400 w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">ICP Assistant</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                ? 'bg-teal-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 text-[10px] text-slate-500">
          v1.1.0 • Excel Sync Active
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 min-w-[70px] rounded-lg ${
              activeTab === item.id ? 'text-teal-600' : 'text-slate-500'
            }`}
          >
            <item.icon size={18} />
            <span className="text-[9px] font-bold whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
