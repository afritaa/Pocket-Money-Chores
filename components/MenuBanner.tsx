import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Profile } from '../types';
import { MenuIcon, UserCircleIcon, PencilIcon, ImageIcon, SettingsIcon, ExclamationIcon, LockClosedIcon, PlusIcon } from '../constants';

interface MenuBannerProps {
  isKidsMode: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
  onSwitchToChild: (profileId: string) => void;
  onSwitchToParent: () => void;
  pendingCount?: number;
  pastApprovalsCount?: number;
  onShowPending?: () => void;
  onShowPastApprovals?: () => void;
  onEditProfile?: (profile: Profile) => void;
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
    isKidsMode, profiles, activeProfileId, onSwitchToChild, onSwitchToParent,
    pendingCount = 0, pastApprovalsCount = 0, onShowPending, onShowPastApprovals, onEditProfile, 
    onShowOptionsModal, onShowAddChildModal, onShowThemeModal, 
    menuPulse, potentialEarnings, showPotentialEarnings,
    todaysTotalChores, todaysCompletedChores
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  
  const [messageIndex, setMessageIndex] = useState(0);

  const bannerClasses = `
    h-16 w-full flex items-center justify-between z-40
    glass-header-container
    md:relative md:mb-4 md:bg-transparent md:backdrop-blur-none
  `;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const shouldShowPotential = showPotentialEarnings && potentialEarnings > 0 && activeProfile?.payDayConfig.mode !== 'anytime';
  
  const messagesToShow = useMemo(() => {
    const msgs = [motivationalMessage];
    if (shouldShowPotential) {
        msgs.push(potentialMessage);
    } else if (isKidsMode && activeProfile?.payDayConfig.mode === 'anytime') {
        const extraMessage = "You've got this! 👊";
        if (motivationalMessage !== extraMessage) {
            msgs.push(extraMessage);
        }
    }
    return msgs.filter(m => m);
  }, [motivationalMessage, potentialMessage, shouldShowPotential, isKidsMode, activeProfile]);
  
  useEffect(() => {
      if (messagesToShow.length > 1) {
          const interval = setInterval(() => {
              setMessageIndex(prev => (prev + 1) % messagesToShow.length);
          }, 5000);
          return () => clearInterval(interval);
      }
  }, [messagesToShow.length]);

  const currentMessage = messagesToShow[messageIndex % messagesToShow.length] || "Earning Mode 💰";
  const otherProfiles = profiles.filter(p => p.id !== activeProfileId);

  return (
    <div className={bannerClasses}>
       {/* LEFT GROUP */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className="relative" ref={menuRef}>
          <div className={`absolute -inset-1.5 rounded-lg ${menuPulse ? 'animate-pulse-strong' : ''}`} aria-hidden="true" />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-10 p-1 md:p-2 rounded-lg text-[var(--text-primary)] hover:bg-white/20 transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="h-7 w-7 md:h-8 w-8" />
          </button>
          {isMenuOpen && (
            <div className={`absolute top-full left-0 mt-2 ${isKidsMode ? 'w-52' : 'w-72'} rounded-lg py-1 z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-lg animate-fade-in-fast`}>
              {isKidsMode ? (
                  <div className="flex flex-col gap-1 p-1">
                    {otherProfiles.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { onSwitchToChild(p.id); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                          aria-label={`Switch to ${p.name}'s Chores`}
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <UserCircleIcon className="w-8 h-8" />
                          )}
                          <span className="font-semibold text-sm">{p.name}'s Chores</span>
                        </button>
                    ))}

                    {otherProfiles.length > 0 && (
                      <div className="w-full h-px bg-[var(--border-primary)] my-1" />
                    )}

                    <button
                      onClick={() => { onShowThemeModal(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                      aria-label="Change Theme"
                    >
                      <ImageIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                      <span className="font-semibold text-sm">Change Theme</span>
                    </button>
                    
                    <button
                      onClick={() => { onSwitchToParent(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                      aria-label="Parent Zone"
                    >
                      <LockClosedIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                      <span className="font-semibold text-sm">Parent View</span>
                    </button>
                  </div>
              ) : (
                  <>
                      {profiles.length > 0 && (
                          <>
                              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Switch to Child</div>
                              {profiles.map(p => (
                                  <div key={p.id} className="flex items-center justify-between pr-2 hover:bg-[var(--bg-tertiary)] rounded-lg mx-1">
                                    <button onClick={() => { onSwitchToChild(p.id); setIsMenuOpen(false); }} className="flex-grow text-left px-3 py-2 flex items-center gap-3 rounded-lg transition-colors">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <UserCircleIcon className="w-8 h-8" />
                                        )}
                                        <span className="font-semibold">{p.name}</span>
                                    </button>
                                    {onEditProfile && <button onClick={() => { onEditProfile(p); setIsMenuOpen(false); }} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]" aria-label={`Edit ${p.name}'s profile`}>
                                        <PencilIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                                    </button>}
                                  </div>
                              ))}
                          </>
                      )}
                      <div className="w-full h-px bg-[var(--border-primary)] my-1" />
                      <button
                          onClick={() => { onShowAddChildModal(); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                          aria-label="Add Child"
                      >
                          <PlusIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                          <span className="font-semibold">Add Child</span>
                      </button>
                  </>
              )}
            </div>
          )}
        </div>
        <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)] whitespace-nowrap truncate">
          {isKidsMode ? `${activeProfile?.name || ''}'s Pocket Money Chores.` : 'Pocket Money Chores.'}
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

        {!isKidsMode && (
            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-white/20 transition-colors"
                aria-label="Open settings"
              >
                <SettingsIcon className="h-7 w-7" />
              </button>
              {isSettingsMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-lg py-1 z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-lg animate-fade-in-fast">
                  <button
                    onClick={() => { onShowOptionsModal(); setIsSettingsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                  >
                    <SettingsIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                    <span className="font-semibold">Settings</span>
                  </button>
                  <button
                    onClick={() => { onShowThemeModal(); setIsSettingsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                  >
                    <ImageIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                    <span className="font-semibold">Change Theme</span>
                  </button>
                </div>
              )}
            </div>
        )}
      </div>

      <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          
          @keyframes pulse-strong {
              0% { box-shadow: 0 0 0 0 rgba(var(--accent-primary-values), 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(var(--accent-primary-values), 0); }
              100% { box-shadow: 0 0 0 0 rgba(var(--accent-primary-values), 0); }
          }
          .animate-pulse-strong { animation: pulse-strong 1.5s infinite; }
          
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