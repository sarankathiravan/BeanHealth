import React, { useState } from 'react';
import { User } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';
import ThemeToggle from './ThemeToggle';
import { MenuIcon } from './icons/MenuIcon';
import ProfilePhotoUploader from './ProfilePhotoUploader';

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

  const getAvatarSrc = (user: User) => {
    if (user.avatarUrl) {
      return user.avatarUrl;
    }
    if (user.role === 'doctor') {
        if (user.email === 'dr.smith@clinic.com') {
            return 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';
        }
        if (user.email === 'dr.jones@clinic.com') {
            return 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';
        }
    }
    return `https://i.pravatar.cc/150?u=${user.email}`;
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-800 flex-shrink-0 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center">
             <button onClick={onMenuClick} className="md:hidden mr-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <MenuIcon className="h-6 w-6" />
            </button>
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user.name}</span></h2>
                <p className="hidden sm:block text-slate-500 dark:text-slate-400">
                  {user.role === 'patient' 
                    ? "Here's your latest health overview." 
                    : "Here's an overview of your patients."}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <button onClick={() => setIsUploaderOpen(true)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800" aria-label="Update profile photo">
              <img 
                  src={getAvatarSrc(user)} 
                  alt="User avatar" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            </button>
            <button 
              onClick={onLogout} 
              className="flex items-center justify-center p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Log out"
            >
              <LogoutIcon className="h-6 w-6" />
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
