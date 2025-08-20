import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Profile } from '../types';
import { UserCircleIcon, PlusIcon, StarIcon, SettingsIcon, ImageIcon, LockClosedIcon, PencilIcon, BanknotesIcon, HistoryIcon } from '../constants';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isKidsMode: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
  onSwitchProfile: (profileId: string) => void;
  onAddChild: () => void;
  onEnterKidsMode: () => void;
  onSwitchToParent: () => void;
  onShowSettings: () => void;
  onShowTheme: () => void;
  onEditProfile: (profile: Profile) => void;
  onCashOut: (profileId?: string) => void;
  onShowHistory: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const menuVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 350, damping: 30 } },
  exit: { x: '-100%', transition: { type: 'spring', stiffness: 350, damping: 30 } },
};

const MenuItem: React.FC<{ onClick: () => void, children: React.ReactNode, 'aria-label': string, isActive?: boolean }> = ({ onClick, children, 'aria-label': ariaLabel, isActive }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors ${isActive ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] font-bold' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold'}`}
      aria-label={ariaLabel}
    >
        {children}
    </button>
);


const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  isKidsMode,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onAddChild,
  onEnterKidsMode,
  onSwitchToParent,
  onShowSettings,
  onShowTheme,
  onEditProfile,
  onCashOut,
  onShowHistory,
}) => {
  const otherProfiles = profiles.filter(p => p.id !== activeProfileId);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.nav
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-[var(--menu-bg)] z-50 shadow-2xl p-4 flex flex-col gap-4"
            aria-label="Main Menu"
          >
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-hide">
              {isKidsMode ? (
                <>
                  {otherProfiles.length > 0 && (
                     <div className="space-y-1">
                        <h2 className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">Switch Profile</h2>
                        {otherProfiles.map(p => (
                            <MenuItem key={p.id} onClick={() => onSwitchProfile(p.id)} aria-label={`Switch to ${p.name}'s profile`}>
                                {p.image ? ( <img src={p.image} alt="" className="w-8 h-8 rounded-full object-cover" /> ) : ( <UserCircleIcon className="w-8 h-8 text-[var(--text-secondary)]" /> )}
                                <span>{p.name}</span>
                            </MenuItem>
                        ))}
                     </div>
                  )}
                  <div className="h-px bg-[var(--border-primary)]" />
                  <div className="space-y-1">
                     <MenuItem onClick={onShowTheme} aria-label="Change Theme">
                        <ImageIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                        <span>Change Theme</span>
                     </MenuItem>
                  </div>
                </>
              ) : (
                <>
                  {/* Section 1: Kids Mode */}
                  <div className="space-y-1">
                      {profiles.length > 0 && (
                          <MenuItem onClick={onEnterKidsMode} aria-label="Switch to Kids Mode">
                              <StarIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                              <span>Kids Mode</span>
                          </MenuItem>
                      )}
                  </div>

                  <div className="h-px bg-[var(--border-primary)]" />

                  {/* Section 2: Profiles */}
                  {profiles.length > 0 && (
                    <div className="space-y-1">
                        <h2 className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">View Profile</h2>
                        {profiles.map(p => (
                            <MenuItem 
                                key={p.id} 
                                onClick={() => onSwitchProfile(p.id)} 
                                isActive={p.id === activeProfileId} 
                                aria-label={`View ${p.name}'s profile`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-4">
                                        {p.image ? ( <img src={p.image} alt="" className="w-8 h-8 rounded-full object-cover" /> ) : ( <UserCircleIcon className="w-8 h-8 text-[var(--text-secondary)]" /> )}
                                        <span>{p.name}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEditProfile(p); }} 
                                        className="p-2 -m-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]" 
                                        aria-label={`Edit ${p.name}'s profile`}
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </MenuItem>
                        ))}
                    </div>
                  )}
                  <div className="space-y-1">
                      <MenuItem onClick={onAddChild} aria-label="Add a new child">
                        <PlusIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                        <span>Add Child</span>
                      </MenuItem>
                  </div>

                  <div className="h-px bg-[var(--border-primary)]" />
                  
                  {/* Section 3: Actions */}
                  <div className="space-y-1">
                     <MenuItem onClick={onShowTheme} aria-label="Change Theme">
                        <ImageIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                        <span>Change Theme</span>
                     </MenuItem>
                     <MenuItem onClick={onShowSettings} aria-label="Open Settings">
                        <SettingsIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                        <span>Settings</span>
                     </MenuItem>
                  </div>
                </>
              )}
            </div>
            
            {isKidsMode && (
              <div className="flex-shrink-0 border-t border-[var(--border-primary)] pt-4 mt-auto">
                 <MenuItem onClick={onSwitchToParent} aria-label="Enter Parent View">
                    <LockClosedIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                    <span>Parent View</span>
                 </MenuItem>
              </div>
            )}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;