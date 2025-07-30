


import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Chore, Day, EarningsRecord, Profile, ChoreCategory, ParentSettings, PastChoreApproval, CompletionSnapshot, CompletionState, PayDayConfig } from './types';
import Header from './components/Header';
import ChoreList from './components/ChoreList';
import ChoreFormModal from './components/AddChoreModal';
import { PlusIcon, CHORE_CATEGORY_ORDER, UserCircleIcon } from './constants';
import EarningsHistoryModal from './components/EarningsHistoryModal';
import MenuBanner from './components/MenuBanner';
import PendingCashOutsModal from './components/PendingCashOutsModal';
import CashOutConfirmationModal from './components/CashOutConfirmationModal';
import EditProfileModal from './components/EditProfileModal';
import PasscodeSetupModal from './components/PasscodeSetupModal';
import PasscodeEntryModal from './components/PasscodeEntryModal';
import WelcomeModal from './components/WelcomeModal';
import ForgotPasscodeModal from './components/ForgotPasscodeModal';
import AllChoresDoneModal from './components/AllChoresDoneModal';
import OptionsMenuModal from './components/OptionsMenuModal';
import AddChildModal from './components/AddChildModal';
import ThemeModal from './components/ThemeModal';
import PastChoresApprovalModal from './components/PastChoresApprovalModal';
import ReviewCashOutModal from './components/ReviewCashOutModal';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // Normalize to the start of the day in local time
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get the start of the current week (Sunday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay();
  const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
  return days[dayIndex];
};

// Re-usable hook for state that syncs with localStorage
const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
        return defaultValue;
    }
    
    try {
      return JSON.parse(storedValue);
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}". Backing up corrupted data.`, error);
      // Back up the corrupted data before resetting
      try {
        localStorage.setItem(`${key}_corrupted_backup_${new Date().toISOString()}`, storedValue);
      } catch (backupError) {
        console.error(`Failed to back up corrupted data for key "${key}".`, backupError);
      }
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
        console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
};

// Helper hook to get previous value
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const ThemeStyles = () => (
  <style>{`
    :root { /* Default to light theme if nothing is set */
        --bg-primary: #f1f5f9; --bg-secondary: #ffffff; --bg-tertiary: #e2e8f0; --bg-backdrop: rgba(20, 20, 20, 0.6);
        --text-primary: #1e293b; --text-secondary: #64748b; --text-tertiary: #94a3b8;
        --accent-primary: #3b82f6; --accent-secondary: #2563eb; --accent-primary-text: #ffffff;
        --border-primary: #e2e8f0; --border-secondary: #cbd5e1;
        --success: #16a34a; --success-text: #ffffff; --success-bg-subtle: rgba(22, 163, 74, 0.1); --success-border: rgba(22,163,74,0.3); --success-cashed-out-bg: rgba(22, 163, 74, 0.2); --success-cashed-out-text: #166534;
        --danger: #dc2626; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 38, 38, 0.1); --danger-border: rgba(220,38,38,0.3);
        --warning: #d97706; --warning-text: #ffffff; --warning-bg-subtle: rgba(217, 119, 6, 0.1); --warning-border: rgba(217, 119, 6, 0.3);
        --shadow-color: rgba(0, 0, 0, 0.1);
    }
    
    body[data-theme='light'] {
        --bg-primary: #f1f5f9; --bg-secondary: #ffffff; --bg-tertiary: #e2e8f0; --bg-backdrop: rgba(20, 20, 20, 0.6);
        --text-primary: #1e293b; --text-secondary: #64748b; --text-tertiary: #94a3b8;
        --accent-primary: #3b82f6; --accent-secondary: #2563eb; --accent-primary-text: #ffffff;
        --border-primary: #e2e8f0; --border-secondary: #cbd5e1;
        --success: #16a34a; --success-text: #ffffff; --success-bg-subtle: rgba(22, 163, 74, 0.1); --success-border: rgba(22,163,74,0.3); --success-cashed-out-bg: rgba(22, 163, 74, 0.2); --success-cashed-out-text: #166534;
        --danger: #dc2626; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 38, 38, 0.1); --danger-border: rgba(220,38,38,0.3);
        --warning: #d97706; --warning-text: #ffffff; --warning-bg-subtle: rgba(217, 119, 6, 0.1); --warning-border: rgba(217, 119, 6, 0.3);
        --shadow-color: rgba(0, 0, 0, 0.1);
    }
    
    body[data-theme='dark'] {
        --bg-primary: #020617; --bg-secondary: #0f172a; --bg-tertiary: #1e2937; --bg-backdrop: rgba(0,0,0,0.7);
        --text-primary: #f8fafc; --text-secondary: #94a3b8; --text-tertiary: #64748b;
        --accent-primary: #38bdf8; --accent-secondary: #0ea5e9; --accent-primary-text: #020617;
        --border-primary: #1e2937; --border-secondary: #334155;
        --success: #22c55e; --success-text: #020617; --success-bg-subtle: rgba(34, 197, 94, 0.2); --success-border: rgba(34,197,94,0.5); --success-cashed-out-bg: rgba(34, 197, 94, 0.1); --success-cashed-out-text: #4ade80;
        --danger: #f43f5e; --danger-text: #ffffff; --danger-bg-subtle: rgba(244, 63, 94, 0.2); --danger-border: rgba(244,63,94,0.5);
        --warning: #facc15; --warning-text: #020617; --warning-bg-subtle: rgba(250, 204, 21, 0.15); --warning-border: rgba(250, 204, 21, 0.4);
        --shadow-color: rgba(0, 0, 0, 0.5);
    }

    body[data-theme='dark-blue'] {
        --bg-primary: #0a192f; --bg-secondary: #112240; --bg-tertiary: #233554; --bg-backdrop: rgba(10, 25, 47, 0.8);
        --text-primary: #ccd6f6; --text-secondary: #8892b0; --text-tertiary: #495670;
        --accent-primary: #58a6ff; --accent-secondary: #388bfd; --accent-primary-text: #ffffff;
        --border-primary: #233554; --border-secondary: #303C55;
        --success: #238636; --success-text: #ffffff; --success-bg-subtle: rgba(35, 134, 54, 0.2); --success-border: rgba(35, 134, 54, 0.5); --success-cashed-out-bg: rgba(35, 134, 54, 0.15); --success-cashed-out-text: #34d399;
        --danger: #da3633; --danger-text: #ffffff; --danger-bg-subtle: rgba(218, 54, 51, 0.2); --danger-border: rgba(218, 54, 51, 0.5);
        --warning: #e3b341; --warning-text: #0a192f; --warning-bg-subtle: rgba(227, 179, 65, 0.15); --warning-border: rgba(227, 179, 65, 0.4);
        --shadow-color: rgba(2, 12, 27, 0.5);
    }

    body[data-theme='neon'] {
        --bg-primary: #0d0221; --bg-secondary: #1a0b38; --bg-tertiary: #261447; --bg-backdrop: rgba(13, 2, 33, 0.8);
        --text-primary: #f0f8ff; --text-secondary: #a9a9a9; --text-tertiary: #777;
        --accent-primary: #ff00ff; --accent-secondary: #39ff14; --accent-primary-text: #ffffff;
        --border-primary: #ff00ff; --border-secondary: #39ff14;
        --success: #39ff14; --success-text: #000000; --success-bg-subtle: rgba(57, 255, 20, 0.2); --success-border: #39ff14; --success-cashed-out-bg: rgba(57, 255, 20, 0.1); --success-cashed-out-text: #39ff14;
        --danger: #ff1b4c; --danger-text: #ffffff; --danger-bg-subtle: rgba(255, 27, 76, 0.2); --danger-border: #ff1b4c;
        --warning: #fff000; --warning-text: #000000; --warning-bg-subtle: rgba(255, 240, 0, 0.2); --warning-border: #fff000;
        --shadow-color: #ff00ff;
    }

    body[data-theme='princess'] {
        --bg-primary: #fce4ec; --bg-secondary: #fff; --bg-tertiary: #f8bbd0; --bg-backdrop: rgba(252, 228, 236, 0.8);
        --text-primary: #4a148c; --text-secondary: #8e24aa; --text-tertiary: #c158dc;
        --accent-primary: #ff4081; --accent-secondary: #f50057; --accent-primary-text: #ffffff;
        --border-primary: #f8bbd0; --border-secondary: #f48fb1;
        --success: #00c853; --success-text: #ffffff; --success-bg-subtle: rgba(0, 200, 83, 0.1); --success-border: rgba(0,200,83,0.3); --success-cashed-out-bg: rgba(0, 200, 83, 0.08); --success-cashed-out-text: #007d43;
        --danger: #d50000; --danger-text: #ffffff; --danger-bg-subtle: rgba(213, 0, 0, 0.1); --danger-border: rgba(213,0,0,0.3);
        --warning: #ffab00; --warning-text: #ffffff; --warning-bg-subtle: rgba(255, 171, 0, 0.1); --warning-border: rgba(255, 171, 0, 0.3);
        --shadow-color: rgba(136, 14, 79, 0.15);
        --bg-primary-gradient: linear-gradient(135deg, #fce4ec, #f3e5f5);
    }
    
    body[data-theme='ocean'] {
        --bg-primary: #e0f7fa; --bg-secondary: rgba(255, 255, 255, 0.8); --bg-tertiary: #b2ebf2; --bg-backdrop: rgba(0, 95, 115, 0.7);
        --text-primary: #005f73; --text-secondary: #0077b6; --text-tertiary: #0096c7;
        --accent-primary: #00b4d8; --accent-secondary: #90e0ef; --accent-primary-text: #005f73;
        --border-primary: #b2ebf2; --border-secondary: #80deea;
        --success: #2e8b57; --success-text: #ffffff; --success-bg-subtle: rgba(46, 139, 87, 0.15); --success-border: rgba(46,139,87,0.4); --success-cashed-out-bg: rgba(46, 139, 87, 0.1); --success-cashed-out-text: #2e8b57;
        --danger: #ff7f50; --danger-text: #ffffff; --danger-bg-subtle: rgba(255, 127, 80, 0.2); --danger-border: rgba(255,127,80,0.4);
        --warning: #f4a460; --warning-text: #005f73; --warning-bg-subtle: rgba(244, 164, 96, 0.2); --warning-border: rgba(244, 164, 96, 0.4);
        --shadow-color: rgba(0, 95, 115, 0.2);
        --bg-primary-gradient: linear-gradient(to bottom, #ade8f4, #90e0ef);
    }

    body {
      background: var(--bg-primary-gradient, var(--bg-primary));
    }

    html.no-scroll {
      overflow: hidden;
      overscroll-behavior-y: none;
    }
  `}</style>
);

const App: React.FC = () => {
  // Multi-child state management
  const [profiles, setProfiles] = usePersistentState<Profile[]>('profiles', []);
  const [activeProfileId, setActiveProfileId] = usePersistentState<string | null>('activeProfileId', null);
  const [parentSettings, setParentSettings] = usePersistentState<ParentSettings>('parentSettings', { 
    passcode: null, 
    theme: 'light',
    defaultChoreValue: 20,
  });
  const [choresByProfile, setChoresByProfile] = usePersistentState<Record<string, Chore[]>>('choresByProfile', {});
  const [earningsHistoryByProfile, setEarningsHistoryByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('earningsHistoryByProfile', {});
  const [pendingCashOutsByProfile, setPendingCashOutsByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('pendingCashOutsByProfile', {});
  const [pastChoreApprovalsByProfile, setPastChoreApprovalsByProfile] = usePersistentState<Record<string, PastChoreApproval[]>>('pastChoreApprovalsByProfile', {});
  const [lastAutoCashOut, setLastAutoCashOut] = usePersistentState<Record<string, string>>('lastAutoCashOut', {});

  const hasCompletedOnboarding = useMemo(() => profiles.length > 0, [profiles]);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(!hasCompletedOnboarding);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  
  const [isKidsMode, setIsKidsMode] = usePersistentState<boolean>('isKidsMode', hasCompletedOnboarding);
  
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isPasscodeSetupModalOpen, setIsPasscodeSetupModalOpen] = useState(false);
  const [isPasscodeEntryModalOpen, setIsPasscodeEntryModalOpen] = useState(false);
  const [isForgotPasscodeModalOpen, setIsForgotPasscodeModalOpen] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isCashOutConfirmOpen, setIsCashOutConfirmOpen] = useState(false);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isAllChoresDoneModalOpen, setIsAllChoresDoneModalOpen] = useState(false);
  const [dailyEarningsForModal, setDailyEarningsForModal] = useState(0);
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isPastApprovalModalOpen, setIsPastApprovalModalOpen] = useState(false);
  const [recordToReview, setRecordToReview] = useState<EarningsRecord | null>(null);

  // Drag and drop state for touch devices
  const [draggingChoreId, setDraggingChoreId] = useState<string | null>(null);
  const [dragOverChoreId, setDragOverChoreId] = useState<string | null>(null);

  // Data migration for Pay Day settings
  useEffect(() => {
    const oldSettings = localStorage.getItem('parentSettings');
    if (oldSettings?.includes('isPaydayCashOutOnly')) {
        const parsedOldSettings = JSON.parse(oldSettings);
        if ('isPaydayCashOutOnly' in parsedOldSettings) {
            console.log("Migrating old pay day settings...");
            setProfiles(prevProfiles => {
                return prevProfiles.map(p => {
                    if ((p as any).payDayConfig) return p; // Already migrated
                    const oldProfile = p as any;
                    const newConfig: PayDayConfig = parsedOldSettings.isPaydayCashOutOnly
                        ? { mode: 'manual', day: oldProfile.payDay || Day.Sat }
                        : { mode: 'anytime' };
                    delete oldProfile.payDay;
                    return { ...oldProfile, payDayConfig: newConfig };
                });
            });
            // Clean up old setting
            setParentSettings(prev => {
                const newSettings = {...prev};
                delete (newSettings as any).isPaydayCashOutOnly;
                return newSettings;
            });
        }
    }
  }, []); // Run only once

  // Set active profile if one isn't set
  useEffect(() => {
    if (profiles.length > 0 && !profiles.some(p => p.id === activeProfileId)) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeProfileId, setActiveProfileId]);

  // Derived state for the active profile
  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);
  const chores = useMemo(() => (activeProfileId ? choresByProfile[activeProfileId] : []) || [], [choresByProfile, activeProfileId]);
  const earningsHistory = useMemo(() => (activeProfileId ? earningsHistoryByProfile[activeProfileId] : []) || [], [earningsHistoryByProfile, activeProfileId]);
  const pendingCashOuts = useMemo(() => (activeProfileId ? pendingCashOutsByProfile[activeProfileId] : []) || [], [pendingCashOutsByProfile, activeProfileId]);
  const pastChoreApprovals = useMemo(() => (activeProfileId ? pastChoreApprovalsByProfile[activeProfileId] : []) || [], [pastChoreApprovalsByProfile, activeProfileId]);
  
  // Effect to set the active theme on the body
  useEffect(() => {
    let currentTheme = 'light';
    if (isKidsMode) {
        if (activeProfile) {
            currentTheme = activeProfile.theme;
        }
    } else {
        currentTheme = parentSettings.theme || 'light';
    }
    document.body.setAttribute('data-theme', currentTheme);
  }, [isKidsMode, activeProfile, parentSettings.theme]);
  
  // Effect for migrating old chore data to include 'order' property
  useEffect(() => {
    let needsOrderMigration = false;
    Object.values(choresByProfile).forEach(choreList => {
        if (choreList.some(c => c.order === undefined)) {
            needsOrderMigration = true;
        }
    });

    if (needsOrderMigration) {
        setChoresByProfile(prev => {
            const newChoresByProfile = { ...prev };
            for (const profileId in newChoresByProfile) {
                const choresNeedUpdate = newChoresByProfile[profileId].some(c => c.order === undefined);
                if (choresNeedUpdate) {
                    const categoryMaxOrder: { [key: string]: number } = {};
                    newChoresByProfile[profileId] = newChoresByProfile[profileId].map(chore => {
                        if (chore.order !== undefined) return chore;
                        const categoryKey = chore.category || 'Uncategorized';
                        const maxOrder = categoryMaxOrder[categoryKey] === undefined ? -1 : categoryMaxOrder[categoryKey];
                        categoryMaxOrder[categoryKey] = maxOrder + 1;
                        return { ...chore, order: maxOrder + 1 };
                    });
                }
            }
            return newChoresByProfile;
        });
    }
}, [choresByProfile, setChoresByProfile]);

// Effect for migrating old chore data to include 'completions' as CompletionState
useEffect(() => {
    let needsStateMigration = false;
    Object.values(choresByProfile).forEach(choreList => {
        if (choreList.some(c => Object.values(c.completions).some(val => typeof val === 'boolean' || val === null))) {
            needsStateMigration = true;
        }
    });

    if (needsStateMigration) {
        console.log("Migrating chore completion data to new state format...");
        setChoresByProfile(prev => {
            const newChoresByProfile = { ...prev };
            for (const profileId in newChoresByProfile) {
                newChoresByProfile[profileId] = newChoresByProfile[profileId].map(chore => {
                    const newCompletions: { [date: string]: CompletionState } = {};
                    for (const date in chore.completions) {
                        const value = (chore.completions as any)[date];
                        if (value === true) {
                            newCompletions[date] = 'completed';
                        } else if (value === 'completed' || value === 'cashed_out' || value === 'pending_cash_out') {
                            newCompletions[date] = value; // Already in new format
                        }
                    }
                    return { ...chore, completions: newCompletions };
                });
            }
            return newChoresByProfile;
        });
    }
}, []); // Run only once on mount


  // Effect to automatically refresh the page when the date changes
  useEffect(() => {
    const mountedDateString = formatDate(new Date());
    const checkDateAndRefresh = () => {
      if (mountedDateString !== formatDate(new Date())) {
        window.location.reload();
      }
    };
    const intervalId = setInterval(checkDateAndRefresh, 30000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkDateAndRefresh();
    });
    checkDateAndRefresh();
    return () => clearInterval(intervalId);
  }, []);
  
    const prevChores = usePrevious(chores);
    
    useEffect(() => {
        if (!prevChores || !chores.length || isAllChoresDoneModalOpen) return;
        const todayString = formatDate(new Date());
        const wasCompletionJustAddedForToday = chores.some(chore => {
            const prevChore = prevChores.find(p => p.id === chore.id);
            if (!prevChore) return false;
            return chore.completions[todayString] === 'completed' && prevChore.completions[todayString] !== 'completed';
        });
        if (!wasCompletionJustAddedForToday) return;
        const todayDay = getDayFromDate(new Date());
        const todaysChores = chores.filter(c => c.days.includes(todayDay));
        if (todaysChores.length === 0) return;
        const areAllDoneNow = todaysChores.every(c => c.completions[todayString]);
        if (areAllDoneNow) {
            const todayEarnings = todaysChores.reduce((sum, chore) => chore.completions[todayString] ? sum + chore.value : sum, 0);
            setDailyEarningsForModal(todayEarnings);
            setIsAllChoresDoneModalOpen(true);
        }
    }, [chores, prevChores, isAllChoresDoneModalOpen]);

  const handleWelcomeSave = useCallback((data: { name: string; image: string | null; payDayConfig: PayDayConfig; passcode: string | null; }) => {
    const newProfileId = Date.now().toString();
    const newProfile: Profile = {
      id: newProfileId,
      name: data.name,
      image: data.image,
      payDayConfig: data.payDayConfig,
      theme: 'light',
    };
    setProfiles([newProfile]);
    setParentSettings(prev => ({ ...prev, passcode: data.passcode }));
    setActiveProfileId(newProfileId);
    setChoresByProfile({ [newProfileId]: [] });
    setEarningsHistoryByProfile({ [newProfileId]: [] });
    setPendingCashOutsByProfile({ [newProfileId]: [] });
    setPastChoreApprovalsByProfile({ [newProfileId]: [] });
    setIsWelcomeModalOpen(false);
    setIsKidsMode(false);
  }, [setProfiles, setParentSettings, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setIsKidsMode]);
  
  const handleAddChild = useCallback((data: Omit<Profile, 'id' | 'theme'>) => {
    const newProfileId = Date.now().toString();
    const newProfile: Profile = { 
        ...data, 
        id: newProfileId, 
        theme: 'light', 
    };
    setProfiles(prev => [...prev, newProfile]);
    setChoresByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setEarningsHistoryByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setPendingCashOutsByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setPastChoreApprovalsByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setActiveProfileId(newProfileId); // Switch to the new child
    setIsKidsMode(false); // Go to parent mode to manage the new child
    setIsAddChildModalOpen(false);
  }, [setProfiles, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setIsKidsMode]);


  const handleSwitchToChild = (profileId: string) => {
    setActiveProfileId(profileId);
    setIsKidsMode(true);
  };
  
  const handleSwitchToParent = () => setIsKidsMode(false);

  const handleOpenEditModalForProfile = useCallback((profile: Profile) => {
    setProfileToEdit(profile);
    setIsEditProfileModalOpen(true);
  }, []);

  const handleUpdateProfile = useCallback((updatedProfileData: Profile) => {
    setProfiles(prevProfiles => prevProfiles.map(p => (p.id === updatedProfileData.id ? updatedProfileData : p)));
    setIsEditProfileModalOpen(false);
    setProfileToEdit(null);
  }, [setProfiles]);
  
  const handleUpdateProfileImage = useCallback((profileId: string, image: string | null) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(p =>
        p.id === profileId ? { ...p, image } : p
      )
    );
  }, [setProfiles]);
  
  const handleUpdateTheme = useCallback((theme: string) => {
    if (isKidsMode) {
        if (!activeProfileId) return;
        setProfiles(prevProfiles =>
          prevProfiles.map(p =>
            p.id === activeProfileId ? { ...p, theme } : p
          )
        );
    } else {
        setParentSettings(prev => ({ ...prev, theme }));
    }
  }, [isKidsMode, activeProfileId, setProfiles, setParentSettings]);

  const handleDeleteProfile = useCallback((profileId: string) => {
    setProfiles(prev => {
        const newProfiles = prev.filter(p => p.id !== profileId);
        if (activeProfileId === profileId) {
            setActiveProfileId(newProfiles.length > 0 ? newProfiles[0].id : null);
        }
        if (newProfiles.length === 0) {
            // Reset app to onboarding state
            setParentSettings({ passcode: null, theme: 'light', defaultChoreValue: 20 });
            setIsKidsMode(false);
        }
        return newProfiles;
    });

    const removeByProfileId = (setter: React.Dispatch<React.SetStateAction<Record<string, any>>>) => {
      setter(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
      });
    };
    
    removeByProfileId(setChoresByProfile);
    removeByProfileId(setEarningsHistoryByProfile);
    removeByProfileId(setPendingCashOutsByProfile);
    removeByProfileId(setPastChoreApprovalsByProfile);
    removeByProfileId(setLastAutoCashOut);
    
    setIsEditProfileModalOpen(false);
    setProfileToEdit(null);
  }, [activeProfileId, setProfiles, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setParentSettings, setIsKidsMode, setLastAutoCashOut]);

  const handleUpdateParentSettings = useCallback((newSettings: Partial<ParentSettings>) => {
    setParentSettings(prev => ({...prev, ...newSettings}));
  }, [setParentSettings]);

  const handleAttemptSwitchToParentMode = useCallback(() => {
    if (parentSettings.passcode) {
      setIsPasscodeEntryModalOpen(true);
    } else {
      setIsKidsMode(false);
    }
  }, [parentSettings.passcode, setIsKidsMode]);

  const handlePasscodeSetupSuccess = (passcode: string) => {
    handleUpdateParentSettings({ passcode });
    setIsKidsMode(false);
    setIsPasscodeSetupModalOpen(false);
  };

  const handlePasscodeEntrySuccess = () => {
    setIsKidsMode(false);
    setIsPasscodeEntryModalOpen(false);
  };

  const handleOpenForgotPassword = () => {
    setIsPasscodeEntryModalOpen(false);
    setIsForgotPasscodeModalOpen(true);
  };

  const handleForgotPasscodeSuccess = () => {
    handleUpdateParentSettings({ passcode: null });
    setIsKidsMode(false);
    setIsForgotPasscodeModalOpen(false);
    setIsOptionsMenuOpen(true);
  };

  const currentWeekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentDate]);
  
  const calculateEarnings = useCallback((chores: Chore[]) => {
    return chores.reduce((total, chore) => {
      const choreTotal = Object.entries(chore.completions).reduce((sum, [, state]) => {
        if (state === 'completed') return sum + chore.value;
        return sum;
      }, 0);
      return total + choreTotal;
    }, 0);
  }, []);

  const earnings = useMemo(() => calculateEarnings(chores), [chores, calculateEarnings]);

  const displayMode = isKidsMode ? 'daily' : viewMode;

  useEffect(() => { if (isKidsMode) setSelectedDate(new Date()); }, [isKidsMode]);

   const filteredChores = useMemo(() => {
    if (!activeProfileId) return [];
    const baseChores = displayMode === 'daily'
        ? chores.filter(chore => chore.days.includes(getDayFromDate(selectedDate)))
        : chores;

    return [...baseChores].sort((a, b) => {
        const aCategoryOrder = a.category ? CHORE_CATEGORY_ORDER[a.category] : 99;
        const bCategoryOrder = b.category ? CHORE_CATEGORY_ORDER[b.category] : 99;
        if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
        return (a.order || 0) - (b.order || 0);
    });
  }, [chores, displayMode, selectedDate, activeProfileId]);
  
  const handleReorderChores = useCallback((draggedChoreId: string, targetChoreId: string) => {
    if (!activeProfileId) return;
    setChoresByProfile(prev => {
        const currentChores = prev[activeProfileId] || [];
        const draggedChore = currentChores.find(c => c.id === draggedChoreId);
        const targetChore = currentChores.find(c => c.id === targetChoreId);
        if (!draggedChore || !targetChore || draggedChore.category !== targetChore.category) return prev;

        const choresInCategory = currentChores
            .filter(c => c.category === draggedChore.category)
            .sort((a, b) => a.order - b.order);
        
        const otherChores = currentChores.filter(c => c.category !== draggedChore.category);

        const draggedIndex = choresInCategory.findIndex(c => c.id === draggedChoreId);
        const [removed] = choresInCategory.splice(draggedIndex, 1);
        
        const targetIndex = choresInCategory.findIndex(c => c.id === targetChoreId);
        choresInCategory.splice(targetIndex, 0, removed);

        const updatedChoresInCategory = choresInCategory.map((chore, index) => ({ ...chore, order: index }));
        return { ...prev, [activeProfileId]: [...otherChores, ...updatedChoresInCategory] };
    });
  }, [setChoresByProfile, activeProfileId]);

  // Touch drag and drop handlers
  const handleDragStartTouch = useCallback((e: React.TouchEvent, choreId: string) => {
    e.stopPropagation();
    setDraggingChoreId(choreId);
    document.documentElement.classList.add('no-scroll');
  }, []);

  const handleDragMoveTouch = useCallback((e: TouchEvent) => {
      if (!draggingChoreId) return;
      e.preventDefault();
      const touch = e.touches[0];
      const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
      const choreCardElement = targetElement?.closest('[data-chore-id]');
      setDragOverChoreId(choreCardElement?.getAttribute('data-chore-id') || null);
  }, [draggingChoreId]);

  const handleDragEndTouch = useCallback(() => {
      if (draggingChoreId && dragOverChoreId) {
          handleReorderChores(draggingChoreId, dragOverChoreId);
      }
      setDraggingChoreId(null);
      setDragOverChoreId(null);
      document.documentElement.classList.remove('no-scroll');
  }, [draggingChoreId, dragOverChoreId, handleReorderChores]);
  
  useEffect(() => {
    if (draggingChoreId) {
      document.addEventListener('touchmove', handleDragMoveTouch, { passive: false });
      document.addEventListener('touchend', handleDragEndTouch);
      document.addEventListener('touchcancel', handleDragEndTouch);
    }
    return () => {
      document.removeEventListener('touchmove', handleDragMoveTouch);
      document.removeEventListener('touchend', handleDragEndTouch);
      document.removeEventListener('touchcancel', handleDragEndTouch);
    };
  }, [draggingChoreId, handleDragMoveTouch, handleDragEndTouch]);


  const handleOpenAddModal = () => { setChoreToEdit(null); setIsModalOpen(true); };
  const handleOpenEditModal = (chore: Chore) => { setChoreToEdit(chore); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setChoreToEdit(null); };

  const handleSaveChore = useCallback((choreData: Omit<Chore, 'id' | 'completions' | 'order'>) => {
    if (!activeProfileId) return;
    setChoresByProfile(prev => {
      const currentChores = prev[activeProfileId] || [];
      const updatedChores = choreToEdit
        ? currentChores.map(c => c.id === choreToEdit.id ? { ...c, ...choreData } : c)
        : [...currentChores, { ...choreData, id: Date.now().toString(), completions: {}, order: currentChores.filter(c => c.category === choreData.category).length }];
      return { ...prev, [activeProfileId]: updatedChores };
    });
    handleCloseModal();
  }, [choreToEdit, setChoresByProfile, activeProfileId]);

  const handleDeleteChore = useCallback((choreId: string) => {
    if (!activeProfileId) return;
    setPastChoreApprovalsByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId]?.filter(a => a.choreId !== choreId) || [] }));
    setChoresByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId]?.filter(c => c.id !== choreId) || [] }));
    handleCloseModal();
  }, [setChoresByProfile, setPastChoreApprovalsByProfile, activeProfileId]);

  const handleToggleCompletion = useCallback((choreId: string, date: Date) => {
    if (!activeProfileId) return;
    const dateString = formatDate(date);
    const chore = (choresByProfile[activeProfileId] || []).find(c => c.id === choreId);
    if (!chore) return;
    const currentCompletionState = chore.completions[dateString];

    if (isKidsMode && (currentCompletionState === 'cashed_out' || currentCompletionState === 'pending_cash_out')) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const isPast = targetDate.getTime() < today.getTime();
    
    if (isKidsMode && isPast && !currentCompletionState) {
        setPastChoreApprovalsByProfile(prev => {
            const currentApprovals = prev[activeProfileId] || [];
            const newApproval: PastChoreApproval = { id: `${choreId}-${dateString}`, choreId, choreName: chore.name, date: dateString };
            return { ...prev, [activeProfileId]: [...currentApprovals, newApproval] };
        });
        return;
    }

    setChoresByProfile(prev => {
        const currentChores = prev[activeProfileId] || [];
        const updatedChores = currentChores.map(c => {
            if (c.id === choreId) {
                const newCompletions = { ...c.completions };
                if (currentCompletionState) {
                    delete newCompletions[dateString];
                } else {
                    newCompletions[dateString] = 'completed';
                }
                return { ...c, completions: newCompletions };
            }
            return c;
        });
        return { ...prev, [activeProfileId]: updatedChores };
    });
}, [isKidsMode, activeProfileId, setChoresByProfile, setPastChoreApprovalsByProfile, choresByProfile]);
  
  const handleCashOut = useCallback((targetProfileId?: string, targetChores?: Chore[]) => {
    const pId = targetProfileId || activeProfileId;
    const pChores = targetChores || chores;
    const pProfile = profiles.find(p => p.id === pId);
    if (!pId || !pProfile) return;
    
    const currentEarnings = calculateEarnings(pChores);
    if (currentEarnings <= 0) return;

    const snapshot: CompletionSnapshot[] = [];
    const choreIdsAndDatesToUpdate: { choreId: string; date: string }[] = [];

    pChores.forEach(chore => {
        Object.entries(chore.completions).forEach(([dateString, state]) => {
            if (state === 'completed') {
                snapshot.push({ choreId: chore.id, choreName: chore.name, choreValue: chore.value, date: dateString, isCompleted: true });
                choreIdsAndDatesToUpdate.push({ choreId: chore.id, date: dateString });
            }
        });
    });

    const newRecord: EarningsRecord = {
      id: Date.now().toString(),
      date: formatDate(new Date()),
      amount: currentEarnings,
      completionsSnapshot: snapshot
    };
    
    setPendingCashOutsByProfile(prev => ({ ...prev, [pId]: [...(prev[pId] || []), newRecord] }));
    
    if (isKidsMode && pId === activeProfileId) { 
        setCashedOutAmount(currentEarnings); 
        setIsCashOutConfirmOpen(true);
    }
    
    setChoresByProfile(prev => {
        const currentChores = prev[pId] || [];
        const updatedChores = currentChores.map(chore => {
            const completionsToUpdateForThisChore = choreIdsAndDatesToUpdate.filter(item => item.choreId === chore.id).map(item => item.date);
            if (completionsToUpdateForThisChore.length > 0) {
                const newCompletions = { ...chore.completions };
                completionsToUpdateForThisChore.forEach(date => { newCompletions[date] = 'pending_cash_out'; });
                return { ...chore, completions: newCompletions };
            }
            return chore;
        });
        return { ...prev, [pId]: updatedChores };
    });
  }, [activeProfileId, chores, profiles, calculateEarnings, setPendingCashOutsByProfile, isKidsMode]);

  const handleShowHistory = () => setIsHistoryModalOpen(true);
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);
  const handleOpenPendingModal = () => setIsPendingModalOpen(true);
  const handleClosePendingModal = () => setIsPendingModalOpen(false);
  
  const handleOpenReviewModal = (record: EarningsRecord) => {
    setRecordToReview(record);
    setIsPendingModalOpen(false);
  };

  const handleApproveReviewedCashOut = useCallback((reviewedRecord: EarningsRecord) => {
    if (!activeProfileId && !profiles.some(p => p.id === reviewedRecord.id)) return;
    const profileIdForRecord = activeProfileId; 
    if (!profileIdForRecord) return;
    
    setEarningsHistoryByProfile(prev => ({ ...prev, [profileIdForRecord]: [...(prev[profileIdForRecord] || []), reviewedRecord] }));
    setPendingCashOutsByProfile(prev => ({ ...prev, [profileIdForRecord]: prev[profileIdForRecord]?.filter(r => r.id !== reviewedRecord.id) || [] }));
    
    setChoresByProfile(prev => {
        const profileChores = prev[profileIdForRecord] || [];
        const snapshotMap = new Map<string, Set<string>>();
        reviewedRecord.completionsSnapshot?.forEach(item => {
            if (item.isCompleted) {
                if (!snapshotMap.has(item.choreId)) snapshotMap.set(item.choreId, new Set());
                snapshotMap.get(item.choreId)!.add(item.date);
            }
        });
        const updatedChores = profileChores.map(chore => {
            if (snapshotMap.has(chore.id)) {
                const datesToUpdate = snapshotMap.get(chore.id)!;
                const newCompletions = { ...chore.completions };
                datesToUpdate.forEach(dateString => {
                    if (newCompletions[dateString] === 'pending_cash_out') {
                        newCompletions[dateString] = 'cashed_out';
                    }
                });
                return { ...chore, completions: newCompletions };
            }
            return chore;
        });
        return { ...prev, [profileIdForRecord]: updatedChores };
    });

    setRecordToReview(null);
  }, [activeProfileId, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setChoresByProfile, profiles]);
  
  const handleUpdateHistoryAmount = useCallback((recordId: string, newAmount: number) => {
    if (!activeProfileId) return;
    setEarningsHistoryByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId].map(r => r.id === recordId ? { ...r, amount: newAmount } : r) }));
  }, [activeProfileId, setEarningsHistoryByProfile]);

  const handleApprovePastChore = useCallback((approvalId: string) => {
    if (!activeProfileId) return;
    const approval = pastChoreApprovals.find(a => a.id === approvalId);
    if (!approval) return;
    setChoresByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId].map(c => c.id === approval.choreId ? { ...c, completions: { ...c.completions, [approval.date]: 'completed' } } : c) }));
    setPastChoreApprovalsByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId]?.filter(a => a.id !== approvalId) || [] }));
  }, [activeProfileId, pastChoreApprovals, setChoresByProfile, setPastChoreApprovalsByProfile]);

  const handleDismissPastChore = useCallback((approvalId: string) => {
    if (!activeProfileId) return;
    setPastChoreApprovalsByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId]?.filter(a => a.id !== approvalId) || [] }));
  }, [activeProfileId, setPastChoreApprovalsByProfile]);

  const handleApproveAllPastChores = useCallback(() => {
    if (!activeProfileId || pastChoreApprovals.length === 0) return;
    setChoresByProfile(prev => {
      const profileChores = prev[activeProfileId] || [];
      const approvalMap = pastChoreApprovals.reduce((acc, approval) => {
        if (!acc[approval.choreId]) acc[approval.choreId] = new Set();
        acc[approval.choreId].add(approval.date);
        return acc;
      }, {} as Record<string, Set<string>>);
      const updatedChores = profileChores.map(chore => {
        if (approvalMap[chore.id]) {
          const newCompletions = { ...chore.completions };
          approvalMap[chore.id].forEach(date => { newCompletions[date] = 'completed' });
          return { ...chore, completions: newCompletions };
        }
        return chore;
      });
      return { ...prev, [activeProfileId]: updatedChores };
    });
    setPastChoreApprovalsByProfile(prev => ({ ...prev, [activeProfileId]: [] }));
  }, [activeProfileId, pastChoreApprovals, setChoresByProfile, setPastChoreApprovalsByProfile]);

  const handleDismissAllPastChores = useCallback(() => {
    if (!activeProfileId) return;
    setPastChoreApprovalsByProfile(prev => ({ ...prev, [activeProfileId]: [] }));
  }, [activeProfileId, setPastChoreApprovalsByProfile]);

  const isToday = formatDate(selectedDate) === formatDate(new Date());

  const showCashOutButton = useMemo(() => {
    if (!isKidsMode || !activeProfile?.payDayConfig) return true;
    const config = activeProfile.payDayConfig;
    switch (config.mode) {
      case 'anytime': return true;
      case 'manual': return config.day ? getDayFromDate(new Date()) === config.day : false;
      case 'automatic': return false;
      default: return true;
    }
  }, [isKidsMode, activeProfile]);

  const isCashOutDisabled = useMemo(() => earnings <= 0, [earnings]);

  useEffect(() => { setIsWelcomeModalOpen(!hasCompletedOnboarding); }, [hasCompletedOnboarding]);
  useEffect(() => { if (!isKidsMode && viewMode === 'daily') setSelectedDate(new Date()); }, [viewMode, isKidsMode]);
  
  useEffect(() => {
    if (isKidsMode && isToday) {
        const todayString = formatDate(new Date());
        const firstUncompletedChore = filteredChores.find(chore => chore.completions[todayString] !== 'completed' && chore.completions[todayString] !== 'cashed_out' && chore.completions[todayString] !== 'pending_cash_out');
        if (firstUncompletedChore) {
            setTimeout(() => { document.getElementById(`chore-${firstUncompletedChore.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
        }
    }
  }, [isKidsMode, isToday, filteredChores, activeProfileId]);

  // Effect for automatic pay day cash outs
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const todayDay = getDayFromDate(now);
      const todayDateString = formatDate(now);
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      profiles.forEach(p => {
        if (p.payDayConfig.mode === 'automatic' && p.payDayConfig.day === todayDay && p.payDayConfig.time === currentTime) {
          // Check if it already ran today for this profile
          if (lastAutoCashOut[p.id] !== todayDateString) {
            console.log(`Triggering automatic cash out for ${p.name}`);
            const profileChores = choresByProfile[p.id] || [];
            if (calculateEarnings(profileChores) > 0) {
              handleCashOut(p.id, profileChores);
              setLastAutoCashOut(prev => ({ ...prev, [p.id]: todayDateString }));
            }
          }
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [profiles, choresByProfile, lastAutoCashOut, handleCashOut, calculateEarnings, setLastAutoCashOut]);

  const themeForModal = isKidsMode ? (activeProfile?.theme || 'light') : (parentSettings.theme || 'light');
  
  const handlePreviousWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; });
  const handleNextWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; });
  const handleGoToCurrentWeek = () => setCurrentDate(new Date());
  
  const isViewingCurrentWeek = useMemo(() => formatDate(getStartOfWeek(new Date())) === formatDate(getStartOfWeek(currentDate)), [currentDate]);

  const weeklyTitle = useMemo(() => {
    if (isViewingCurrentWeek) return "This Week";
    if (formatDate(getStartOfWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))) === formatDate(getStartOfWeek(currentDate))) return "Last Week";
    const start = currentWeekDays[0];
    const end = currentWeekDays[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    return startMonth === endMonth ? `${startMonth} ${start.getDate()} - ${end.getDate()}` : `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
  }, [currentWeekDays, isViewingCurrentWeek, currentDate]);

  const handleOpenProfileForEditing = useCallback((profileId: string) => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
          setProfileToEdit(profile);
          setIsOptionsMenuOpen(false);
          setIsEditProfileModalOpen(true);
      }
  }, [profiles]);

  if (!hasCompletedOnboarding) {
      return (
          <div className="min-h-screen text-[var(--text-primary)] relative bg-[var(--bg-primary)]">
             <ThemeStyles />
             <WelcomeModal isOpen={isWelcomeModalOpen} onSave={handleWelcomeSave} />
          </div>
      );
  }

  return (
    <div className={`min-h-screen text-[var(--text-primary)] relative bg-[var(--bg-primary)] ${isKidsMode ? 'h-screen flex flex-col' : ''}`}>
      <ThemeStyles />
      <div className={`container mx-auto p-4 sm:p-6 md:p-8 transition-all duration-300 ${isWelcomeModalOpen ? 'blur-sm' : ''} ${isKidsMode ? 'flex-1 flex flex-col overflow-hidden' : ''}`}>
        <header>
          <MenuBanner isKidsMode={isKidsMode} onSwitchToChild={handleSwitchToChild} onAttemptSwitchToParentMode={handleAttemptSwitchToParentMode} pendingCount={pendingCashOuts.length} onShowPending={handleOpenPendingModal} profiles={profiles} activeProfileId={activeProfileId} onEditProfile={handleOpenEditModalForProfile} onShowOptionsModal={() => setIsOptionsMenuOpen(true)} onShowAddChildModal={() => setIsAddChildModalOpen(true)} onShowThemeModal={() => setIsThemeModalOpen(true)} pastApprovalsCount={pastChoreApprovals.length} onShowPastApprovals={() => setIsPastApprovalModalOpen(true)} />
          <Header
            earnings={earnings} isKidsMode={isKidsMode} profile={activeProfile}
            onCashOut={() => handleCashOut()} onShowHistory={handleShowHistory}
            isCashOutDisabled={isCashOutDisabled} showCashOutButton={showCashOutButton}
            viewMode={viewMode} setViewMode={setViewMode} weeklyTitle={weeklyTitle}
            isToday={isToday} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            currentWeekDays={currentWeekDays} handlePreviousWeek={handlePreviousWeek}
            handleNextWeek={handleNextWeek} isViewingCurrentWeek={isViewingCurrentWeek}
            handleGoToCurrentWeek={handleGoToCurrentWeek} onUpdateProfileImage={handleUpdateProfileImage}
          />
        </header>
        
        <main className={isKidsMode ? 'flex-1 overflow-y-auto' : ''}>
            {!isKidsMode && profiles.length > 1 && (
                <div className="mb-6 p-3 bg-[var(--bg-tertiary)] rounded-2xl">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 text-center">Managing Chores For</h3>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {profiles.map(p => (
                            <button key={p.id} onClick={() => setActiveProfileId(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${activeProfileId === p.id ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'bg-[var(--bg-secondary)] hover:opacity-80 text-[var(--text-primary)]'}`}>
                                {p.image ? <img src={p.image} alt={p.name} className="w-6 h-6 rounded-full object-cover"/> : <UserCircleIcon className="w-6 h-6" />}
                                <span>{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {!isKidsMode && (
              <div className="mb-6 flex justify-start">
                <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-primary-text)] font-bold py-3 px-5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
                  <PlusIcon /><span>Add Chore</span>
                </button>
              </div>
            )}
          <ChoreList
            chores={filteredChores} currentWeekDays={currentWeekDays} onToggleCompletion={handleToggleCompletion}
            onEditChore={isKidsMode ? undefined : handleOpenEditModal} viewMode={displayMode} selectedDate={selectedDate}
            isKidsMode={isKidsMode} onReorderChores={handleReorderChores} pastChoreApprovals={pastChoreApprovals}
            onApprovePastChore={isKidsMode ? undefined : handleApprovePastChore} draggingChoreId={draggingChoreId}
            dragOverChoreId={dragOverChoreId} onDragStartTouch={handleDragStartTouch}
          />
        </main>
        <EarningsHistoryModal isOpen={isHistoryModalOpen} onClose={handleCloseHistoryModal} history={earningsHistory} onUpdateAmount={handleUpdateHistoryAmount} />
        <PendingCashOutsModal isOpen={isPendingModalOpen} onClose={handleClosePendingModal} pendingCashOuts={pendingCashOuts} onOpenReview={handleOpenReviewModal} />
        {recordToReview && <ReviewCashOutModal isOpen={!!recordToReview} onClose={() => setRecordToReview(null)} record={recordToReview} onApprove={handleApproveReviewedCashOut} profileName={activeProfile?.name || ''} />}
        <PastChoresApprovalModal isOpen={isPastApprovalModalOpen} onClose={() => setIsPastApprovalModalOpen(false)} approvals={pastChoreApprovals} onApprove={handleApprovePastChore} onDismiss={handleDismissPastChore} onApproveAll={handleApproveAllPastChores} onDismissAll={handleDismissAllPastChores} />
        <CashOutConfirmationModal isOpen={isCashOutConfirmOpen} onClose={() => setIsCashOutConfirmOpen(false)} amount={cashedOutAmount} />
        <AllChoresDoneModal isOpen={isAllChoresDoneModalOpen} onClose={() => setIsAllChoresDoneModalOpen(false)} dailyAmount={dailyEarningsForModal} />
        {isEditProfileModalOpen && profileToEdit && (<EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => { setIsEditProfileModalOpen(false); setProfileToEdit(null); }} onSave={handleUpdateProfile} onDelete={handleDeleteProfile} initialData={profileToEdit} />)}
        <PasscodeSetupModal isOpen={isPasscodeSetupModalOpen} onClose={() => setIsPasscodeSetupModalOpen(false)} onSave={handlePasscodeSetupSuccess} />
        <PasscodeEntryModal isOpen={isPasscodeEntryModalOpen} onClose={() => setIsPasscodeEntryModalOpen(false)} onSuccess={handlePasscodeEntrySuccess} passcodeToMatch={parentSettings.passcode} onForgotPassword={handleOpenForgotPassword} />
        <ForgotPasscodeModal isOpen={isForgotPasscodeModalOpen} onClose={() => setIsForgotPasscodeModalOpen(false)} onSuccess={handleForgotPasscodeSuccess} />
        <OptionsMenuModal isOpen={isOptionsMenuOpen} onClose={() => setIsOptionsMenuOpen(false)} settings={parentSettings} onUpdateSettings={handleUpdateParentSettings} profiles={profiles} onEditProfile={handleOpenProfileForEditing} />
        <AddChildModal isOpen={isAddChildModalOpen} onClose={() => setIsAddChildModalOpen(false)} onSave={handleAddChild} />
        <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} onSave={handleUpdateTheme} currentTheme={themeForModal} />
        {!isKidsMode && (<ChoreFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveChore} initialData={choreToEdit} defaultChoreValue={parentSettings.defaultChoreValue} onDelete={handleDeleteChore} />)}
      </div>
    </div>
  );
};

export default App;