

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Chore, Day, EarningsRecord, Profile, ChoreCategory, ParentSettings } from './types';
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
import ParentPasscodeModal from './components/ParentPasscodeModal';
import AddChildModal from './components/AddChildModal';
import ThemeModal from './components/ThemeModal';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
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
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
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
        --success: #16a34a; --success-text: #ffffff; --success-bg-subtle: rgba(22, 163, 74, 0.1); --success-border: rgba(22,163,74,0.3);
        --danger: #dc2626; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 38, 38, 0.1); --danger-border: rgba(220,38,38,0.3);
        --warning: #d97706; --warning-text: #ffffff;
        --shadow-color: rgba(0, 0, 0, 0.1);
    }
    
    body[data-theme='light'] {
        --bg-primary: #f1f5f9; --bg-secondary: #ffffff; --bg-tertiary: #e2e8f0; --bg-backdrop: rgba(20, 20, 20, 0.6);
        --text-primary: #1e293b; --text-secondary: #64748b; --text-tertiary: #94a3b8;
        --accent-primary: #3b82f6; --accent-secondary: #2563eb; --accent-primary-text: #ffffff;
        --border-primary: #e2e8f0; --border-secondary: #cbd5e1;
        --success: #16a34a; --success-text: #ffffff; --success-bg-subtle: rgba(22, 163, 74, 0.1); --success-border: rgba(22,163,74,0.3);
        --danger: #dc2626; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 38, 38, 0.1); --danger-border: rgba(220,38,38,0.3);
        --warning: #d97706; --warning-text: #ffffff;
        --shadow-color: rgba(0, 0, 0, 0.1);
    }
    
    body[data-theme='dark'] {
        --bg-primary: #020617; --bg-secondary: #0f172a; --bg-tertiary: #1e2937; --bg-backdrop: rgba(0,0,0,0.7);
        --text-primary: #f8fafc; --text-secondary: #94a3b8; --text-tertiary: #64748b;
        --accent-primary: #38bdf8; --accent-secondary: #0ea5e9; --accent-primary-text: #020617;
        --border-primary: #1e2937; --border-secondary: #334155;
        --success: #22c55e; --success-text: #020617; --success-bg-subtle: rgba(34, 197, 94, 0.2); --success-border: rgba(34,197,94,0.5);
        --danger: #f43f5e; --danger-text: #ffffff; --danger-bg-subtle: rgba(244, 63, 94, 0.2); --danger-border: rgba(244,63,94,0.5);
        --warning: #facc15; --warning-text: #020617;
        --shadow-color: rgba(0, 0, 0, 0.5);
    }

    body[data-theme='neon'] {
        --bg-primary: #0d0221; --bg-secondary: #1a0b38; --bg-tertiary: #261447; --bg-backdrop: rgba(13, 2, 33, 0.8);
        --text-primary: #f0f8ff; --text-secondary: #a9a9a9; --text-tertiary: #777;
        --accent-primary: #ff00ff; --accent-secondary: #39ff14; --accent-primary-text: #ffffff;
        --border-primary: #ff00ff; --border-secondary: #39ff14;
        --success: #39ff14; --success-text: #000000; --success-bg-subtle: rgba(57, 255, 20, 0.2); --success-border: #39ff14;
        --danger: #ff1b4c; --danger-text: #ffffff; --danger-bg-subtle: rgba(255, 27, 76, 0.2); --danger-border: #ff1b4c;
        --warning: #fff000; --warning-text: #000000;
        --shadow-color: #ff00ff;
    }

    body[data-theme='princess'] {
        --bg-primary: #fce4ec; --bg-secondary: #fff; --bg-tertiary: #f8bbd0; --bg-backdrop: rgba(252, 228, 236, 0.8);
        --text-primary: #4a148c; --text-secondary: #8e24aa; --text-tertiary: #c158dc;
        --accent-primary: #ff4081; --accent-secondary: #f50057; --accent-primary-text: #ffffff;
        --border-primary: #f8bbd0; --border-secondary: #f48fb1;
        --success: #00c853; --success-text: #ffffff; --success-bg-subtle: rgba(0, 200, 83, 0.1); --success-border: rgba(0,200,83,0.3);
        --danger: #d50000; --danger-text: #ffffff; --danger-bg-subtle: rgba(213, 0, 0, 0.1); --danger-border: rgba(213,0,0,0.3);
        --warning: #ffab00; --warning-text: #ffffff;
        --shadow-color: rgba(136, 14, 79, 0.15);
        --bg-primary-gradient: linear-gradient(135deg, #fce4ec, #f3e5f5);
    }
    
    body[data-theme='ocean'] {
        --bg-primary: #e0f7fa; --bg-secondary: rgba(255, 255, 255, 0.8); --bg-tertiary: #b2ebf2; --bg-backdrop: rgba(0, 95, 115, 0.7);
        --text-primary: #005f73; --text-secondary: #0077b6; --text-tertiary: #0096c7;
        --accent-primary: #00b4d8; --accent-secondary: #90e0ef; --accent-primary-text: #005f73;
        --border-primary: #b2ebf2; --border-secondary: #80deea;
        --success: #2e8b57; --success-text: #ffffff; --success-bg-subtle: rgba(46, 139, 87, 0.15); --success-border: rgba(46,139,87,0.4);
        --danger: #ff7f50; --danger-text: #ffffff; --danger-bg-subtle: rgba(255, 127, 80, 0.2); --danger-border: rgba(255,127,80,0.4);
        --warning: #f4a460; --warning-text: #005f73;
        --shadow-color: rgba(0, 95, 115, 0.2);
        --bg-primary-gradient: linear-gradient(to bottom, #ade8f4, #90e0ef);
    }

    body {
      background: var(--bg-primary-gradient, var(--bg-primary));
    }
  `}</style>
);

const App: React.FC = () => {
  // Multi-child state management
  const [profiles, setProfiles] = usePersistentState<Profile[]>('profiles', []);
  const [parentSettings, setParentSettings] = usePersistentState<ParentSettings>('parentSettings', { passcode: null, theme: 'light' });
  const [choresByProfile, setChoresByProfile] = usePersistentState<Record<string, Chore[]>>('choresByProfile', {});
  const [earningsHistoryByProfile, setEarningsHistoryByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('earningsHistoryByProfile', {});
  const [pendingCashOutsByProfile, setPendingCashOutsByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('pendingCashOutsByProfile', {});
  const [activeProfileId, setActiveProfileId] = usePersistentState<string | null>('activeProfileId', null);

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
  const [isParentPasscodeModalOpen, setIsParentPasscodeModalOpen] = useState(false);
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
    Object.values(choresByProfile).forEach(choreList => {
        if (choreList.some(c => c.order === undefined)) {
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
    });
}, [choresByProfile, setChoresByProfile]);


  // Effect to update the current date if the app is left open across days
  useEffect(() => {
    const checkDate = () => {
      const today = new Date();
      setCurrentDate(current => {
        if (formatDate(current) !== formatDate(today)) {
          setSelectedDate(today);
          return today;
        }
        return current;
      });
    };
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') checkDate(); };
    const intervalId = setInterval(checkDate, 60 * 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    checkDate();
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
    const prevChores = usePrevious(chores);
    
    useEffect(() => {
        if (!prevChores || !chores.length || isAllChoresDoneModalOpen) return;
        const todayString = formatDate(new Date());
        const wasCompletionJustAddedForToday = chores.some(chore => {
            const prevChore = prevChores.find(p => p.id === chore.id);
            if (!prevChore) return false;
            return chore.completions[todayString] && !prevChore.completions[todayString];
        });
        if (!wasCompletionJustAddedForToday) return;
        const todayDay = getDayFromDate(new Date());
        const todaysChores = chores.filter(c => c.days.includes(todayDay));
        if (todaysChores.length === 0) return;
        const areAllDoneNow = todaysChores.every(c => c.completions[todayString]);
        if (areAllDoneNow) {
            const todayEarnings = todaysChores.reduce((sum, chore) => sum + chore.value, 0);
            setDailyEarningsForModal(todayEarnings);
            setIsAllChoresDoneModalOpen(true);
        }
    }, [chores, prevChores, isAllChoresDoneModalOpen]);

  const handleWelcomeSave = useCallback((data: { name: string, image: string | null, payDay: Day | null, passcode: string | null }) => {
    const newProfileId = Date.now().toString();
    const newProfile: Profile = {
      id: newProfileId,
      name: data.name,
      image: data.image,
      payDay: data.payDay,
      theme: 'light',
    };
    setProfiles([newProfile]);
    setParentSettings({ passcode: data.passcode, theme: 'light' });
    setActiveProfileId(newProfileId);
    setChoresByProfile({ [newProfileId]: [] });
    setEarningsHistoryByProfile({ [newProfileId]: [] });
    setPendingCashOutsByProfile({ [newProfileId]: [] });
    setIsWelcomeModalOpen(false);
    setIsKidsMode(false);
  }, [setProfiles, setParentSettings, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setIsKidsMode]);
  
  const handleAddChild = useCallback((data: Omit<Profile, 'id' | 'theme'>) => {
    const newProfileId = Date.now().toString();
    const newProfile: Profile = { ...data, id: newProfileId, theme: 'light' };
    setProfiles(prev => [...prev, newProfile]);
    setChoresByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setEarningsHistoryByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setPendingCashOutsByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setActiveProfileId(newProfileId); // Switch to the new child
    setIsKidsMode(false); // Go to parent mode to manage the new child
    setIsAddChildModalOpen(false);
  }, [setProfiles, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setIsKidsMode]);


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
            setParentSettings({ passcode: null, theme: 'light' });
            setIsKidsMode(false);
        }
        return newProfiles;
    });

    setChoresByProfile(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
    });

    setEarningsHistoryByProfile(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
    });

    setPendingCashOutsByProfile(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
    });
    
    setIsEditProfileModalOpen(false);
    setProfileToEdit(null);
  }, [activeProfileId, setProfiles, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setParentSettings, setIsKidsMode]);

  const handleUpdatePasscode = useCallback((passcode: string | null) => {
    setParentSettings(prev => ({...prev, passcode}));
  }, [setParentSettings]);
  
  const handleUpdatePasscodeForSettings = useCallback((current: string, newPasscode: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (parentSettings.passcode !== null && parentSettings.passcode !== current) {
            reject(new Error("Current passcode is incorrect."));
            return;
        }
        handleUpdatePasscode(newPasscode);
        resolve();
    });
  }, [parentSettings, handleUpdatePasscode]);

  const handleAttemptSwitchToParentMode = useCallback(() => {
    if (parentSettings.passcode) {
      setIsPasscodeEntryModalOpen(true);
    } else {
      setIsKidsMode(false);
    }
  }, [parentSettings.passcode, setIsKidsMode]);

  const handlePasscodeSetupSuccess = (passcode: string) => {
    handleUpdatePasscode(passcode);
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
    handleUpdatePasscode(null);
    setIsKidsMode(false);
    setIsForgotPasscodeModalOpen(false);
    setIsPasscodeSetupModalOpen(true);
  };

  const currentWeekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentDate]);
  
  const weeklyTotal = useMemo(() => {
    const weekDateStrings = currentWeekDays.map(formatDate);
    return chores.reduce((total, chore) => {
      const choreTotal = Object.entries(chore.completions).reduce((sum, [date, completed]) => {
        if (completed && weekDateStrings.includes(date)) return sum + chore.value;
        return sum;
      }, 0);
      return total + choreTotal;
    }, 0);
  }, [chores, currentWeekDays]);

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
    setChoresByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId]?.filter(c => c.id !== choreId) || [] }));
  }, [setChoresByProfile, activeProfileId]);

  const handleToggleCompletion = useCallback((choreId: string, date: Date) => {
    if (!activeProfileId) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() < today.getTime() && isKidsMode) return;
    
    const dateString = formatDate(date);
    setChoresByProfile(prev => {
        const currentChores = prev[activeProfileId] || [];
        const updatedChores = currentChores.map(chore => {
            if (chore.id === choreId) {
                const newCompletions = { ...chore.completions, [dateString]: !chore.completions[dateString] };
                return { ...chore, completions: newCompletions };
            }
            return chore;
        });
        return { ...prev, [activeProfileId]: updatedChores };
    });
  }, [setChoresByProfile, isKidsMode, activeProfileId]);

  const handleCashOut = useCallback(() => {
    if (weeklyTotal <= 0 || !activeProfileId) return;
    const newRecord: EarningsRecord = { id: Date.now().toString(), date: formatDate(new Date()), amount: weeklyTotal };
    setPendingCashOutsByProfile(prev => ({ ...prev, [activeProfileId]: [...(prev[activeProfileId] || []), newRecord] }));
    if (isKidsMode) { setCashedOutAmount(weeklyTotal); setIsCashOutConfirmOpen(true); }
    
    const weekDateStrings = currentWeekDays.map(formatDate);
    setChoresByProfile(prev => {
        const currentChores = prev[activeProfileId] || [];
        const updatedChores = currentChores.map(chore => {
            const newCompletions = { ...chore.completions };
            for (const dateStr of weekDateStrings) delete newCompletions[dateStr];
            return { ...chore, completions: newCompletions };
        });
        return { ...prev, [activeProfileId]: updatedChores };
    });
  }, [weeklyTotal, currentWeekDays, isKidsMode, setChoresByProfile, setPendingCashOutsByProfile, activeProfileId]);

  const handleShowHistory = () => setIsHistoryModalOpen(true);
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);
  const handleOpenPendingModal = () => setIsPendingModalOpen(true);
  const handleClosePendingModal = () => setIsPendingModalOpen(false);

  const handleApproveCashOut = useCallback((recordId: string) => {
    if (!activeProfileId) return;
    const recordToApprove = pendingCashOuts.find(r => r.id === recordId);
    if (recordToApprove) {
      setEarningsHistoryByProfile(prev => ({ ...prev, [activeProfileId]: [...(prev[activeProfileId] || []), recordToApprove] }));
      setPendingCashOutsByProfile(prev => ({ ...prev, [activeProfileId]: prev[activeProfileId]?.filter(r => r.id !== recordId) || [] }));
    }
  }, [pendingCashOuts, setEarningsHistoryByProfile, setPendingCashOutsByProfile, activeProfileId]);

  const handleApproveAllCashOuts = useCallback(() => {
    if (!activeProfileId) return;
    setEarningsHistoryByProfile(prev => ({ ...prev, [activeProfileId]: [...(prev[activeProfileId] || []), ...pendingCashOuts] }));
    setPendingCashOutsByProfile(prev => ({ ...prev, [activeProfileId]: [] }));
  }, [pendingCashOuts, setEarningsHistoryByProfile, setPendingCashOutsByProfile, activeProfileId]);
  
  const isToday = formatDate(selectedDate) === formatDate(new Date());

  const showCashOutButton = useMemo(() => {
    if (!isKidsMode) return true;
    if (activeProfile?.payDay) return getDayFromDate(new Date()) === activeProfile.payDay;
    return true;
  }, [isKidsMode, activeProfile]);

  const isCashOutDisabled = useMemo(() => weeklyTotal <= 0, [weeklyTotal]);

  useEffect(() => {
    // This effect ensures the app shows the welcome modal if all profiles are deleted.
    setIsWelcomeModalOpen(!hasCompletedOnboarding);
  }, [hasCompletedOnboarding]);

  const themeForModal = isKidsMode ? (activeProfile?.theme || 'light') : (parentSettings.theme || 'light');
  
  const kidsModeTitle = isKidsMode ? (isToday ? "Today's Chores" : `${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}'s Chores`) : undefined;


  if (!hasCompletedOnboarding) {
      return (
          <div className="min-h-screen text-[var(--text-primary)] relative bg-[var(--bg-primary)]">
             <ThemeStyles />
             <WelcomeModal isOpen={isWelcomeModalOpen} onSave={handleWelcomeSave} />
          </div>
      );
  }

  return (
    <div className="min-h-screen text-[var(--text-primary)] relative bg-[var(--bg-primary)]">
      <ThemeStyles />
      <div className={`container mx-auto p-4 sm:p-6 md:p-8 transition-all duration-300 ${isWelcomeModalOpen ? 'blur-sm' : ''}`}>
        <header>
          <MenuBanner isKidsMode={isKidsMode} onSwitchToChild={handleSwitchToChild} onAttemptSwitchToParentMode={handleAttemptSwitchToParentMode} pendingCount={pendingCashOuts.length} onShowPending={handleOpenPendingModal} profiles={profiles} activeProfileId={activeProfileId} onEditProfile={handleOpenEditModalForProfile} onShowParentPasscode={() => setIsParentPasscodeModalOpen(true)} onShowAddChildModal={() => setIsAddChildModalOpen(true)} onShowThemeModal={() => setIsThemeModalOpen(true)} />
          <Header weeklyTotal={weeklyTotal} isKidsMode={isKidsMode} profile={activeProfile} onCashOut={handleCashOut} onShowHistory={handleShowHistory} isCashOutDisabled={isCashOutDisabled} showCashOutButton={showCashOutButton} title={kidsModeTitle} />
        </header>
        
        <main>
          {!isKidsMode && (
            <div className="mb-6">
              <div className="flex items-baseline gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] whitespace-nowrap">
                    {displayMode === 'weekly' ? "This Week's Chores" : isToday ? "Today's Chores" : `${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}'s Chores`}
                </h2>
                <div className="bg-[var(--bg-tertiary)] rounded-full p-1 flex items-center">
                  <button onClick={() => setViewMode('weekly')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${viewMode === 'weekly' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Weekly</button>
                  <button onClick={() => setViewMode('daily')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${viewMode === 'daily' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Daily</button>
                </div>
              </div>
            </div>
          )}
          
            {!isKidsMode && profiles.length > 1 && (
                <div className="mb-6 p-3 bg-[var(--bg-tertiary)] rounded-2xl">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 text-center">Managing Chores For</h3>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {profiles.map(p => (
                            <button key={p.id} onClick={() => setActiveProfileId(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${activeProfileId === p.id ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'bg-[var(--bg-secondary)] hover:opacity-80 text-[var(--text-primary)]'}`}>
                                {p.image ? (
                                    <img src={p.image} alt={p.name} className="w-6 h-6 rounded-full object-cover"/>
                                ) : (
                                    <UserCircleIcon className="w-6 h-6" />
                                )}
                                <span>{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          
            {!isKidsMode && (
              <div className="mb-6 flex justify-start">
                <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-primary-text)] font-bold py-3 px-5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
                  <PlusIcon />
                  <span>Add Chore</span>
                </button>
              </div>
            )}
          
           {displayMode === 'daily' && !isKidsMode && (
                <div className="mb-6 flex justify-center gap-1 p-2 rounded-xl bg-[var(--bg-tertiary)]">
                    {currentWeekDays.map(date => {
                        const dayString = formatDate(date);
                        const isSelected = dayString === formatDate(selectedDate);
                        return (
                            <button key={dayString} onClick={() => setSelectedDate(date)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isSelected ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </button>
                        );
                    })}
                </div>
            )}
          
          <ChoreList chores={filteredChores} currentWeekDays={currentWeekDays} onToggleCompletion={handleToggleCompletion} onDeleteChore={isKidsMode ? undefined : handleDeleteChore} onEditChore={isKidsMode ? undefined : handleOpenEditModal} viewMode={displayMode} selectedDate={selectedDate} isKidsMode={isKidsMode} onReorderChores={isKidsMode ? undefined : handleReorderChores} />
        </main>
        <EarningsHistoryModal isOpen={isHistoryModalOpen} onClose={handleCloseHistoryModal} history={earningsHistory} />
        <PendingCashOutsModal isOpen={isPendingModalOpen} onClose={handleClosePendingModal} pendingCashOuts={pendingCashOuts} onApprove={handleApproveCashOut} onApproveAll={handleApproveAllCashOuts} />
        <CashOutConfirmationModal isOpen={isCashOutConfirmOpen} onClose={() => setIsCashOutConfirmOpen(false)} amount={cashedOutAmount} />
        <AllChoresDoneModal isOpen={isAllChoresDoneModalOpen} onClose={() => setIsAllChoresDoneModalOpen(false)} dailyAmount={dailyEarningsForModal} />
        {isEditProfileModalOpen && profileToEdit && (<EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => { setIsEditProfileModalOpen(false); setProfileToEdit(null); }} onSave={handleUpdateProfile} onDelete={handleDeleteProfile} initialData={profileToEdit} />)}
        <PasscodeSetupModal isOpen={isPasscodeSetupModalOpen} onClose={() => setIsPasscodeSetupModalOpen(false)} onSave={handlePasscodeSetupSuccess} />
        <PasscodeEntryModal isOpen={isPasscodeEntryModalOpen} onClose={() => setIsPasscodeEntryModalOpen(false)} onSuccess={handlePasscodeEntrySuccess} passcodeToMatch={parentSettings.passcode} onForgotPassword={handleOpenForgotPassword} />
        <ForgotPasscodeModal isOpen={isForgotPasscodeModalOpen} onClose={() => setIsForgotPasscodeModalOpen(false)} onSuccess={handleForgotPasscodeSuccess} />
        <ParentPasscodeModal isOpen={isParentPasscodeModalOpen} onClose={() => setIsParentPasscodeModalOpen(false)} onUpdatePasscode={handleUpdatePasscodeForSettings} hasPasscode={!!parentSettings.passcode} />
        <AddChildModal isOpen={isAddChildModalOpen} onClose={() => setIsAddChildModalOpen(false)} onSave={handleAddChild} />
        <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} onSave={handleUpdateTheme} currentTheme={themeForModal} />
        {!isKidsMode && (<ChoreFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveChore} initialData={choreToEdit} />)}
      </div>
    </div>
  );
};

export default App;