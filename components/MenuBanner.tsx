

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Profile } from '../types';
import { MenuIcon, UserCircleIcon, PencilIcon, ImageIcon, SettingsIcon, ExclamationIcon, LockClosedIcon, PlusIcon, StarIcon } from '../constants';

interface MenuBannerProps {
  isKidsMode: boolean;
  onOpenMenu: () => void;
  activeProfileName: string;
  pendingCount?: number;
  pastApprovalsCount?: number;
  onShowPending?: () => void;
  onShowPastApprovals?: () => void;
  potentialEarnings: number;
  showPotentialEarnings?: boolean;
  todaysTotalChores: number;
  todaysCompletedChores: number;
}

const MenuBanner: React.FC<MenuBannerProps> = ({ 
    isKidsMode, onOpenMenu, activeProfileName,
    pendingCount = 0, pastApprovalsCount = 0, onShowPending, onShowPastApprovals,
    potentialEarnings, showPotentialEarnings,
    todaysTotalChores, todaysCompletedChores
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const bannerClasses = `
    w-full z-40
    glass-header-container py-2
    md:relative md:mb-4 md:bg-transparent md:backdrop-blur-none
  `;

  const motivationalMessage = useMemo(() => {
    if (!isKidsMode) return "";
    
    const completed = todaysCompletedChores;
    const total = todaysTotalChores;

    if (total === 0) return "Earning Mode 💰";
    if (completed === total) return "You've smashed it! 🤯";
    if (total > 2 && total - completed <= 2) return "Almost there! 🤩";
    if (total > 2 && completed >= total / 2) return "Cha-Ching! 🤑";
    if (completed >= 2) return "You've got this! 👊";
    
    return "Earning Mode 💰";
  }, [isKidsMode, todaysCompletedChores, todaysTotalChores]);

  const potentialMessage = `Potential: $${(potentialEarnings / 100).toFixed(2)} 💰🥕`;
  const shouldShowPotential = showPotentialEarnings && potentialEarnings > 0;
  
  const messagesToShow = useMemo(() => {
    const msgs = [motivationalMessage];
    if (shouldShowPotential) {
        msgs.push(potentialMessage);
    }
    return msgs.filter(m => m);
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
      <div className="container mx-auto px-4 sm:px-6 md:px-8 w-full flex items-center justify-between">
        {/* LEFT GROUP */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="relative">
            <button
              onClick={onOpenMenu}
              className="relative z-10 p-1 md:p-2 rounded-lg text-[var(--text-primary)] hover:bg-white/20 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="h-7 w-7 md:h-8 w-8" />
            </button>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)] whitespace-nowrap truncate">
            {isKidsMode ? `${activeProfileName}'s Pocket Money Chores.` : 'Pocket Money Chores.'}
          </h1>
        </div>

        {/* RIGHT GROUP */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isKidsMode && (
            <div key={currentMessage} className="text-right text-sm font-bold text-[var(--text-secondary)] hidden md:block animate-fade-in-fast whitespace-nowrap">
              {currentMessage}
            </div>
          )}
          {pastApprovalsCount > 0 && !isKidsMode && onShowPastApprovals && (
            <button onClick={onShowPastApprovals} className="relative p-2 rounded-lg text-[var(--text-primary)] hover:bg-white/20 transition-colors animate-pulse-attention">
              <ExclamationIcon className="h-7 w-7 text-[var(--warning)]" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger)] text-xs font-bold text-white">
                {pastApprovalsCount}
              </span>
            </button>
          )}
          {pendingCount > 0 && !isKidsMode && onShowPending && (
            <button onClick={onShowPending} className="relative p-2 rounded-lg text-[var(--text-primary)] hover:bg-white/20 transition-colors">
              <span className="font-bold text-2xl text-[var(--success)]">$</span>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger)] text-xs font-bold text-white">
                {pendingCount}
              </span>
            </button>
          )}
        </div>
      </div>

      <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          
          @keyframes pulse-attention {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
          }
          .animate-pulse-attention { animation: pulse-attention 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default MenuBanner;