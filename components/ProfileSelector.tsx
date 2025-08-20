

import React, { useState, useMemo } from 'react';
import { Profile } from '../types';
import { UserCircleIcon, LockClosedIcon } from '../constants';

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelectProfile: (profileId: string) => void;
  onAttemptSwitchToParentMode: () => void;
  lastActiveProfileId: string | null;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, onSelectProfile, onAttemptSwitchToParentMode, lastActiveProfileId }) => {
    const [animatingId, setAnimatingId] = useState<string | null>(null);

    const handleProfileSelect = (profileId: string) => {
        setAnimatingId(profileId);
        setTimeout(() => {
            onSelectProfile(profileId);
        }, 800); // This duration should be slightly longer than the CSS animation
    };

    const sortedProfiles = useMemo(() => [...profiles].sort((a, b) => {
        if (a.id === lastActiveProfileId) return -1;
        if (b.id === lastActiveProfileId) return 1;
        return a.name.localeCompare(b.name);
    }), [profiles, lastActiveProfileId]);

    return (
        <div className="fixed inset-0 bg-[var(--bg-primary)] z-[100] flex flex-col items-center justify-center p-8 transition-opacity duration-500 animate-fade-in">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-12 drop-shadow-sm">Who are you?</h1>
            <div className={`flex items-start justify-center gap-8 sm:gap-12 flex-wrap profile-list ${animatingId ? 'is-animating' : ''}`}>
                {sortedProfiles.map(profile => (
                    <div
                        key={profile.id}
                        className={`profile-card text-center cursor-pointer group ${animatingId === profile.id ? 'is-selected' : ''}`}
                        onClick={() => handleProfileSelect(profile.id)}
                    >
                        <div className="relative w-32 h-32 md:w-40 md:h-40 transition-transform duration-300 group-hover:scale-110">
                            {profile.image ? (
                                <img src={profile.image} alt={profile.name} className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white/20" />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-[var(--text-tertiary)]" />
                            )}
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{profile.name}</h2>
                    </div>
                ))}
                 <div
                    className="profile-card text-center cursor-pointer group"
                    onClick={onAttemptSwitchToParentMode}
                >
                    <div className="relative w-32 h-32 md:w-40 md:h-40 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-full shadow-lg border-4 border-white/20">
                        <LockClosedIcon className="w-16 h-16 text-[var(--text-secondary)]" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">Parent</h2>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { 
                  from { opacity: 0; } 
                  to { opacity: 1; } 
                }
                .animate-fade-in { 
                  animation: fade-in 0.5s ease-out forwards; 
                }

                .profile-card {
                  transition: opacity 0.4s ease, transform 0.4s ease;
                }

                .profile-list.is-animating .profile-card:not(.is-selected) {
                    opacity: 0;
                    transform: scale(0.8);
                }

                .profile-list.is-animating .profile-card.is-selected {
                    transform: scale(3);
                    opacity: 0;
                    transition: opacity 0.5s ease 0.2s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default ProfileSelector;