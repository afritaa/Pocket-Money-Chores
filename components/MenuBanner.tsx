import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../types';
import { MenuIcon, UserCircleIcon, PencilIcon, PaintBrushIcon } from '../constants';

interface MenuBannerProps {
  isKidsMode: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
  onSwitchToChild: (profileId: string) => void;
  onAttemptSwitchToParentMode: () => void;
  pendingCount: number;
  onShowPending: () => void;
  onEditProfile: (profile: Profile) => void;
  onShowParentPasscode: () => void;
  onShowAddChildModal: () => void;
  onShowThemeModal: () => void;
}

const MenuBanner: React.FC<MenuBannerProps> = ({ isKidsMode, profiles, activeProfileId, onSwitchToChild, onAttemptSwitchToParentMode, pendingCount, onShowPending, onEditProfile, onShowParentPasscode, onShowAddChildModal, onShowThemeModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeProfile = profiles.find(p => p.id === activeProfileId);

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

  return (
    <div className={bannerClasses}>
       {/* LEFT GROUP */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
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
                  <button onClick={() => { onShowParentPasscode(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">
                      Parent Passcode
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
      <div className="flex items-center gap-2 sm:gap-6">
        {!isKidsMode && pendingCount > 0 && (
           <button onClick={onShowPending} className="relative flex items-center gap-2 font-bold text-[var(--warning-text)] bg-[var(--warning)] py-2 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all animate-fade-in text-sm sm:text-base">
            <span>Pending</span>
            <span className="hidden sm:inline">Cash Outs</span>
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--danger)] text-xs font-bold text-[var(--danger-text)] ring-2 ring-[var(--warning)] animate-pulse">
              {pendingCount}
            </span>
          </button>
        )}
        {isKidsMode && (
          <span className="font-bold text-lg hidden sm:inline animate-fade-in text-[var(--warning)]">
            Earning Mode 💰
          </span>
        )}
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