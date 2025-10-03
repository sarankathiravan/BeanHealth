import React, { useState } from 'react';
import { User } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';
import ThemeToggle from './ThemeToggle';
import { MenuIcon } from './icons/MenuIcon';
import ProfilePhotoUploader from './ProfilePhotoUploader';
import { getInitials, getInitialsColor, getInitialsAvatarClasses } from '../utils/avatarUtils';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onMenuClick: () => void;
    onUpdateAvatar: (dataUrl: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick, onUpdateAvatar }) => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const handleSaveAvatar = (dataUrl: string) => {
    if(user.role === 'patient') {
      onUpdateAvatar(dataUrl);
    }
    // In a real app, you would handle doctor avatar updates as well.
    // For now, we only persist patient avatars.
    setIsUploaderOpen(false);
  };

  // Get initials and color for avatar
  const initials = getInitials(user.name, user.email);
  const colorClass = getInitialsColor(user.name, user.email);
  const avatarClasses = getInitialsAvatarClasses('lg');

  return (
    <header className="sticky top-0 z-40 h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl flex-shrink-0 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-4 sm:px-8 shadow-sm">
        <div className="flex items-center space-x-4">
             <button 
              onClick={onMenuClick} 
              className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label="Toggle menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="animate-fade-in">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
                  Welcome back, <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">{user.name}</span>
                </h2>
                <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {user.role === 'patient' 
                    ? "Here's your latest health overview" 
                    : "Here's an overview of your patients"}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            <button 
              onClick={() => setIsUploaderOpen(true)} 
              className="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 hover:scale-105 active:scale-95 transition-all duration-200" 
              aria-label="Update profile photo"
            >
              <div className={`${avatarClasses} ${colorClass} ring-2 ring-white dark:ring-slate-800 group-hover:ring-sky-400 transition-all duration-200`}>
                <span className="text-white font-semibold">
                  {initials}
                </span>
              </div>
              <div className="absolute inset-0 bg-sky-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
            <button 
              onClick={onLogout} 
              className="flex items-center justify-center p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label="Log out"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
        </div>
        {isUploaderOpen && (
            <ProfilePhotoUploader
                onClose={() => setIsUploaderOpen(false)}
                onSave={handleSaveAvatar}
            />
        )}
    </header>
  );
};

export default Header;
