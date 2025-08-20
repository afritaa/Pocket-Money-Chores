import React, { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircleIcon, MenuIcon } from '../constants';
import { Profile, BonusNotification } from '../types';
import ProfileMenu from './ProfileMenu';

const AnimatedNumber = React.memo(({ value }: { value: number }) => {
    // This is a placeholder now, the real component is in App.tsx
    // It's kept here to avoid breaking the component if used elsewhere unexpectedly
    // but the primary AnimatedNumber is now in App.tsx
    const [displayValue, setDisplayValue] = useState((value / 100).toFixed(2));
    useEffect(() => {
        setDisplayValue((value / 100).toFixed(2));
    }, [value]);
    return <span>{displayValue}</span>;
});


interface HeaderProps {
    earnings: number;
    isKidsMode: boolean;
    profile: Profile | undefined;
    onOpenMenu: () => void;
    pendingCount: number;
    pastApprovalsCount: number;
    onShowPending: () => void;
    onShowPastApprovals: () => void;
    onEditProfile: (profile: Profile) => void;
    onShowHistory: () => void;
    isProfileMenuOpen: boolean;
    onProfileMenuToggle: () => void;
    onProfileMenuClose: () => void;
    onCashOut: (targetProfileId?: string) => void;
}


const Header: React.FC<HeaderProps> = ({
    earnings,
    isKidsMode,
    profile,
    onOpenMenu,
    pendingCount,
    pastApprovalsCount,
    onShowPending,
    onShowPastApprovals,
    onEditProfile,
    onShowHistory,
    isProfileMenuOpen,
    onProfileMenuToggle,
    onProfileMenuClose,
    onCashOut
}) => {

    const totalNotifications = useMemo(() => pendingCount + pastApprovalsCount, [pendingCount, pastApprovalsCount]);

    return (
        <>
            {isKidsMode ? (
                <header style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                    <div className="bg-[var(--header-bg)] text-[var(--header-text)] py-2 sm:py-4 rounded-b-lg">
                        <div className="flex items-center justify-between px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                <button onClick={onOpenMenu} className="p-2 -m-2 rounded-full hover:bg-black/10 transition-colors flex-shrink-0">
                                    <MenuIcon className="h-6 w-6 sm:h-8 sm:w-8"/>
                                </button>
                                {profile && (
                                    <h2 className="font-bold text-xl sm:text-2xl leading-tight truncate">{`${profile.name}'s Pocket Money Chores.`}</h2>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            ) : (
                // Parent Mode Header
                <header style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                    <div className="bg-[var(--header-bg)] text-[var(--header-text)] py-2 sm:py-4 rounded-b-lg">
                        <div className="flex justify-between items-center px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <button onClick={onOpenMenu} className="p-2 -m-2 rounded-full hover:bg-black/10 transition-colors">
                                    <MenuIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                                </button>
                                <h1 className="font-bold text-xl sm:text-2xl text-left truncate">Pocket Money Chores.</h1>
                            </div>
                            
                            <div className="relative">
                                {profile ? (
                                    <>
                                        <button
                                            onClick={onProfileMenuToggle}
                                            className="flex items-center gap-2 font-bold py-1 pl-2 pr-1 sm:pl-3 rounded-full transition-colors"
                                            style={{ backgroundColor: 'var(--page-bg)', color: 'var(--text-primary)' }}
                                            aria-label="Open profile menu"
                                            aria-expanded={isProfileMenuOpen}
                                        >
                                            <span className="text-sm sm:text-base">$<AnimatedNumber value={earnings} /></span>
                                            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[var(--header-bg)]">
                                                {profile.image ? (
                                                    <img src={profile.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <UserCircleIcon className="w-full h-full" />
                                                )}
                                                {totalNotifications > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[var(--danger)] text-[10px] leading-none sm:text-xs font-bold text-white ring-2 ring-[var(--header-bg)]">
                                                        {totalNotifications}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                        <ProfileMenu
                                            isOpen={isProfileMenuOpen}
                                            onClose={onProfileMenuClose}
                                            profile={profile}
                                            onEdit={() => onEditProfile(profile)}
                                            onCashOut={() => onCashOut()}
                                            onHistory={onShowHistory}
                                            onPending={onShowPending}
                                            pendingCount={pendingCount}
                                            pastApprovalsCount={pastApprovalsCount}
                                            onPastApprovals={onShowPastApprovals}
                                        />
                                    </>
                                ) : (
                                    <div className="w-10 h-10" /> 
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            )}
        </>
    );
};

export default Header;