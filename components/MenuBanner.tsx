import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../types';
import { UserCircleIcon, SunIcon, MoonIcon } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface MenuBannerProps {
  isKidsMode: boolean;
  onSwitchToKidMode: () => void;
  onAttemptSwitchToParentMode: () => void;
  pendingCount: number;
  onShowPending: () => void;
  profile: Profile;
  onShowEditProfile: () => void;
}

const MenuBanner: React.FC<MenuBannerProps> = ({ isKidsMode, onSwitchToKidMode, onAttemptSwitchToParentMode, pendingCount, onShowPending, profile, onShowEditProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const bannerClasses = `
    relative h-16 w-full flex items-center justify-between px-3 sm:px-4 md:px-6 z-10 transition-all duration-500
    bg-white/80 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xl rounded-2xl mb-8
  `;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const profileName = profile?.name || 'Child';
  const profileImage = profile?.image;

  return (
    <div className={bannerClasses}>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 font-bold p-2 rounded-lg text-slate-800 dark:text-white hover:bg-slate-200/50 dark:hover:bg-gray-800 transition-colors"
        >
          {isKidsMode ? (
            profileImage ? (
                <img src={profileImage} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
            ) : (
                <UserCircleIcon />
            )
          ) : (
            <UserCircleIcon />
          )}
          
          <span className="hidden sm:inline">{isKidsMode ? profileName : 'Parent Mode'}</span>
          <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-52 rounded-lg py-1 z-50 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xl animate-fade-in-fast">
            <div className="px-4 py-2 border-b border-slate-200 dark:border-gray-800">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {isKidsMode ? profileName : "Parent Mode"}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {isKidsMode ? "Viewing as Child" : "Viewing as Parent"}
                </p>
            </div>
            <div className="py-1">
                <button onClick={() => { onSwitchToKidMode(); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${isKidsMode ? 'font-bold text-blue-600 dark:text-white bg-blue-100 dark:bg-blue-600/30' : 'text-slate-700 dark:text-gray-300'} hover:bg-slate-100 dark:hover:bg-gray-800`}>
                    Child Mode
                </button>
                <button onClick={() => { onAttemptSwitchToParentMode(); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${!isKidsMode ? 'font-bold text-blue-600 dark:text-white bg-blue-100 dark:bg-blue-600/30' : 'text-slate-700 dark:text-gray-300'} hover:bg-slate-100 dark:hover:bg-gray-800`}>
                    Parent Mode
                </button>
            </div>
             {!isKidsMode && (
              <div className="py-1 border-t border-slate-200 dark:border-gray-800">
                <button onClick={() => { onShowEditProfile(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800">
                    Edit Kid's Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        {!isKidsMode && pendingCount > 0 && (
           <button onClick={onShowPending} className="relative flex items-center gap-2 font-bold text-yellow-900 bg-yellow-400 py-2 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all animate-fade-in text-sm sm:text-base">
            <span>Pending</span>
            <span className="hidden sm:inline">Cash Outs</span>
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-yellow-400 animate-pulse">
              {pendingCount}
            </span>
          </button>
        )}
        {isKidsMode && (
          <span className="font-bold text-lg hidden sm:inline animate-fade-in text-yellow-500 dark:text-yellow-400">
            Earning Mode 💰
          </span>
        )}
        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-gray-800 transition-colors">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
        </button>
      </div>

       <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in-fast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MenuBanner;