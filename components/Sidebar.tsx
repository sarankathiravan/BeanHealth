import React from 'react';
import { View } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { RecordsIcon } from './icons/RecordsIcon';
import { UploadIcon } from './icons/UploadIcon';
import { MessagesIcon } from './icons/MessagesIcon';
import { LogoIcon } from './icons/LogoIcon';
import { BillingIcon } from './icons/BillingIcon';
import { XIcon } from './icons/XIcon';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose }) => {
  const navItems: { view: View; label: string; icon: React.ReactElement }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { view: 'records', label: 'View Records', icon: <RecordsIcon /> },
    { view: 'upload', label: 'Upload Record', icon: <UploadIcon /> },
    { view: 'messages', label: 'Messages', icon: <MessagesIcon /> },
    { view: 'billing', label: 'Billing', icon: <BillingIcon /> },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl flex-shrink-0 flex flex-col transform transition-all duration-300 ease-out md:relative md:translate-x-0 md:z-10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-xl p-2 -ml-2 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-2 rounded-xl shadow-lg">
              <LogoIcon className="h-6 w-6 text-white"/>
            </div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Beanhealth
            </h1>
          </button>
          <button 
            onClick={onClose} 
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <XIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={item.view} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <button
                  onClick={() => {
                    setActiveView(item.view);
                    onClose();
                  }}
                  className={`group relative w-full flex items-center px-4 py-3.5 rounded-xl text-left transition-all duration-200 overflow-hidden ${
                    activeView === item.view
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:scale-105 active:scale-95'
                  }`}
                >
                  {activeView === item.view && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  <span className={`relative mr-3 ${activeView === item.view ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400'}`}>
                    {item.icon}
                  </span>
                  <span className="relative font-semibold">{item.label}</span>
                  {activeView === item.view && (
                    <span className="relative ml-auto">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Need help?</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Contact our support team</p>
            <button className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Get Support
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            © 2024 Beanhealth
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;