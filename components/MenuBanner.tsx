

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Profile } from '../types';
import { MenuIcon, UserCircleIcon, PencilIcon, PaintBrushIcon, SettingsIcon, ExclamationIcon } from '../constants';

interface MenuBannerProps {
  isKidsMode: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
  onSwitchToChild: (profileId: string) => void;
  onAttemptSwitchToParentMode: () => void;
  pendingCount: number;
  pastApprovalsCount: number;
  onShowPending: () => void;
  onShowPastApprovals: () => void;
  onEditProfile: (profile: Profile) => void;
  onShowOptionsModal: () => void;
  onShowAddChildModal: () => void;
  onShowThemeModal: () => void;
  menuPulse?: boolean;
  potentialEarnings: number;
  showPotentialEarnings?: boolean;
  todaysTotalChores: number;
  todaysCompletedChores: number;
}

const MenuBanner: React.FC<MenuBannerProps> = ({ 
    isKidsMode, profiles, activeProfileId, onSwitchToChild, 
    onAttemptSwitchToParentMode, pendingCount, pastApprovalsCount, 
    onShowPending, onShowPastApprovals, onEditProfile, 
    onShowOptionsModal, onShowAddChildModal, onShowThemeModal, 
    menuPulse, potentialEarnings, showPotentialEarnings,
    todaysTotalChores, todaysCompletedChores
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  
  const [messageIndex, setMessageIndex] = useState(0);

  const bannerClasses = `
    relative h-16 w-full flex items-center justify-between px-3 sm:px-4 md:px-6 z-40
    bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xl rounded-2xl mb-8
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

  const kidsTitle = activeProfile?.name ? `${activeProfile.name}'s Chores` : 'Kids Mode';

  const motivationalMessage = useMemo(() => {
    if (!isKidsMode) return "";
    
    const completed = todaysCompletedChores;
    const total = todaysTotalChores;

    if (total === 0) return "Earning Mode 💰";
    if (completed === total) return "You’ve smashed it! 🤯";
    if (total > 2 && total - completed <= 2) return "Almost there! 🤩";
    if (total > 2 && completed >= total / 2) return "Cha-Ching! 🤑";
    if (completed >= 2) return "You’ve got this! 👊";
    
    return "Earning Mode 💰";
  }, [isKidsMode, todaysCompletedChores, todaysTotalChores]);

  const potentialMessage = `Potential: $${(potentialEarnings / 100).toFixed(2)} 💰🥕`;
  const shouldShowPotential = showPotentialEarnings && potentialEarnings > 0 && activeProfile?.payDayConfig.mode !== 'anytime';
  
  const messagesToShow = useMemo(() => {
      const msgs = [motivationalMessage];
      if (shouldShowPotential) {
          msgs.push(potentialMessage);
      }
      return msgs;
  }, [motivationalMessage, potentialMessage, shouldShowPotential]);
  
  useEffect(() => {
      if (messagesToShow.length > 1) {
          const interval = setInterval(() => {
              setMessageIndex(prev => (prev + 1) % messagesToShow.length);
          }, 5000);
          return () => clearInterval(interval);
      }
  }, [messagesToShow.length]);

  const currentMessage = messagesToShow[messageIndex % messagesToShow.length] || "Earning Mode 💰";

  return (
    <div className={bannerClasses}>
       {/* LEFT GROUP */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <div className={`absolute -inset-1.5 rounded-lg ${menuPulse ? 'animate-pulse-strong' : ''}`} aria-hidden="true" />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-10 p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="h-8 w-8" />
          </button>
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-lg py-1 z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl animate-fade-in-fast">
              <div className="py-1">
                  {profiles.map(p => (
                      <div key={p.id} className={`flex items-center justify-between pr-2 transition-colors ${isKidsMode && activeProfileId === p.id ? 'bg-[var(--bg-tertiary)]' : ''} hover:bg-[var(--bg-tertiary)]`}>
                          <button onClick={() => { onSwitchToChild(p.id); setIsMenuOpen(false); }} className={`flex-grow text-left px-4 py-2 text-sm flex items-center gap-3 ${isKidsMode && activeProfileId === p.id ? 'font-bold text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                              {p.image ? <img src={p.image} alt={p.name} className="w-6 h-6 rounded-full object-cover" /> : <UserCircleIcon className="w-6 h-6" />}
                              <span>{p.name}'s Chores</span>
                          </button>
                          {!isKidsMode && (
                              <button onClick={() => { onEditProfile(p); setIsMenuOpen(false); }} className="flex-shrink-0 p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-primary)]" aria-label={`Edit ${p.name}'s profile`}>
                                  <PencilIcon />
                              </button>
                          )}
                      </div>
                  ))}
              </div>
               {!isKidsMode && (
                <div className="py-1 border-t border-[var(--border-primary)]">
                   <button onClick={() => { onShowAddChildModal(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">
                      + Add Child
                  </button>
                </div>
              )}
              <div className="py-1 border-t border-[var(--border-primary)]">
                  <button onClick={() => { onAttemptSwitchToParentMode(); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${!isKidsMode ? 'font-bold text-[var(--accent-primary)] bg-[var(--bg-tertiary)]' : 'text-[var(--text-primary)]'} hover:bg-[var(--bg-tertiary)]`}>
                      Parent Mode
                  </button>
              </div>
               {!isKidsMode && (
                <div className="py-1 border-t border-[var(--border-primary)]">
                  <button onClick={() => { onShowOptionsModal(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] flex items-center gap-3">
                      <SettingsIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                      <span>Options</span>
                  </button>
                </div>
              )}
              <div className="py-1 border-t border-[var(--border-primary)]">
                  <button onClick={() => { onShowThemeModal(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] flex items-center gap-3">
                      <PaintBrushIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                      <span>Change Theme</span>
                  </button>
              </div>
            </div>
          )}
        </div>
        {!isKidsMode && (
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Pocket Money Chores
          </h1>
        )}
      </div>
      
       {/* CENTER GROUP (KIDS MODE) */}
      {isKidsMode && (
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate whitespace-nowrap px-4">
              {kidsTitle}
            </h1>
        </div>
      )}

      {/* RIGHT GROUP */}
      <div className="flex items-center gap-2 sm:gap-4">
        {!isKidsMode && pendingCount > 0 && (
           <button onClick={onShowPending} className="relative flex items-center gap-2 font-bold text-[var(--warning-text)] bg-[var(--warning)] py-2 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all animate-fade-in text-sm sm:text-base">
            <span>Pending</span>
            <span className="hidden sm:inline">Cash Outs</span>
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--danger)] text-xs font-bold text-[var(--danger-text)] ring-2 ring-[var(--warning)] animate-pulse">
              {pendingCount}
            </span>
          </button>
        )}
         {!isKidsMode && pastApprovalsCount > 0 && (
            <button 
                onClick={onShowPastApprovals} 
                className="relative flex items-center justify-center p-2 rounded-full transition-all duration-300 bg-[var(--warning)] text-[var(--warning-text)] animate-pulse"
                aria-label={`${pastApprovalsCount} past chores to approve`}
            >
                <ExclamationIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-xs font-bold text-white ring-2 ring-[var(--bg-secondary)]">
                    {pastApprovalsCount}
                </span>
            </button>
        )}
        {!isKidsMode && pendingCount === 0 && pastApprovalsCount === 0 && showPotentialEarnings && potentialEarnings > 0 && activeProfile?.payDayConfig.mode !== 'anytime' && (
            <div className="hidden md:flex items-baseline gap-2 font-semibold text-sm text-[var(--text-secondary)] animate-fade-in">
                <span>Potential:</span>
                <span className="font-bold text-lg text-[var(--text-primary)]">${(potentialEarnings / 100).toFixed(2)}</span>
            </div>
        )}
        {isKidsMode && (
          <div key={currentMessage} className="font-semibold text-sm sm:text-base hidden sm:inline animate-fade-in text-[var(--warning)]">
            {currentMessage}
          </div>
        )}
      </div>

       <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in-fast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }

        @keyframes pulse-strong {
          0% { box-shadow: 0 0 0 0px rgba(var(--accent-primary-values), 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(var(--accent-primary-values), 0); }
          100% { box-shadow: 0 0 0 0px rgba(var(--accent-primary-values), 0); }
        }
        .animate-pulse-strong {
            animation: pulse-strong 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default MenuBanner;