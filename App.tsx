
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Chore, Day, EarningsRecord, Profile, ParentSettings, PastChoreApproval, CompletionSnapshot, CompletionState, PayDayConfig, BonusNotification } from './types';
import Header from './components/Header';
import ChoreList from './components/ChoreList';
import ChoreFormModal from './components/AddChoreModal';
import { PlusIcon, CHORE_CATEGORY_ORDER, UserCircleIcon, DAYS_OF_WEEK, StarIcon } from './constants';
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
import BonusAwardModal from './components/BonusAwardModal';
import BonusAwardedNotificationModal from './components/BonusAwardedNotificationModal';
import ActionBar from './components/ActionBar';


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
        --bg-primary: #f1f5f9; --bg-primary-values-rgb: 241, 245, 249; --bg-secondary: #ffffff; --bg-tertiary: #e2e8f0; --bg-backdrop: rgba(20, 20, 20, 0.6);
        --text-primary: #1e293b; --text-secondary: #64748b; --text-tertiary: #94a3b8;
        --accent-primary: #3b82f6; --accent-secondary: #2563eb; --accent-primary-text: #ffffff; --accent-primary-values: 59, 130, 246;
        --border-primary: #e2e8f0; --border-secondary: #cbd5e1;
        --success: #16a34a; --success-text: #ffffff; --success-bg-subtle: rgba(22, 163, 74, 0.1); --success-border: rgba(22,163,74,0.3); --success-cashed-out-bg: rgba(22, 163, 74, 0.2); --success-cashed-out-text: #166534;
        --danger: #dc2626; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 38, 38, 0.1); --danger-border: rgba(220,38,38,0.3);
        --warning: #d97706; --warning-text: #ffffff; --warning-bg-subtle: rgba(217, 119, 6, 0.1); --warning-border: rgba(217, 119, 6, 0.3);
    }
    
    body[data-theme='light'] {
        --bg-primary: #f1f5f9; --bg-primary-values-rgb: 241, 245, 249; --bg-secondary: #ffffff; --bg-tertiary: #e2e8f0; --bg-backdrop: rgba(20, 20, 20, 0.6);
        --text-primary: #1e293b; --text-secondary: #64748b; --text-tertiary: #94a3b8;
        --accent-primary: #3b82f6; --accent-secondary: #2563eb; --accent-primary-text: #ffffff; --accent-primary-values: 59, 130, 246;
        --border-primary: #e2e8f0; --border-secondary: #cbd5e1;
        --success: #16a34a; --success-text: #ffffff; --success-bg-subtle: rgba(22, 163, 74, 0.1); --success-border: rgba(22,163,74,0.3); --success-cashed-out-bg: rgba(22, 163, 74, 0.2); --success-cashed-out-text: #166534;
        --danger: #dc2626; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 38, 38, 0.1); --danger-border: rgba(220,38,38,0.3);
        --warning: #d97706; --warning-text: #ffffff; --warning-bg-subtle: rgba(217, 119, 6, 0.1); --warning-border: rgba(217, 119, 6, 0.3);
    }
    
    body[data-theme='dark'] {
        --bg-primary: #020617; --bg-primary-values-rgb: 2, 6, 23; --bg-secondary: #0f172a; --bg-tertiary: #1e2937; --bg-backdrop: rgba(0,0,0,0.7);
        --text-primary: #f8fafc; --text-secondary: #94a3b8; --text-tertiary: #64748b;
        --accent-primary: #38bdf8; --accent-secondary: #0ea5e9; --accent-primary-text: #020617; --accent-primary-values: 56, 189, 248;
        --border-primary: #1e2937; --border-secondary: #334155;
        --success: #22c55e; --success-text: #020617; --success-bg-subtle: rgba(34, 197, 94, 0.2); --success-border: rgba(34,197,94,0.5); --success-cashed-out-bg: rgba(34, 197, 94, 0.1); --success-cashed-out-text: #4ade80;
        --danger: #f43f5e; --danger-text: #ffffff; --danger-bg-subtle: rgba(244, 63, 94, 0.2); --danger-border: rgba(244,63,94,0.5);
        --warning: #facc15; --warning-text: #020617; --warning-bg-subtle: rgba(250, 204, 21, 0.15); --warning-border: rgba(250, 204, 21, 0.4);
    }

    body[data-theme='dark-blue'] {
        --bg-primary: #4364F7; --bg-primary-values-rgb: 67, 100, 247;
        --bg-secondary: #3b59de;
        --bg-tertiary: #324ecc;
        --bg-backdrop: rgba(67, 100, 247, 0.7);
        --text-primary: #ffffff;
        --text-secondary: #e0eaff;
        --text-tertiary: #c0cfff;
        --accent-primary: #f7b733; --accent-secondary: #fc4a1a; --accent-primary-text: #0b153e; --accent-primary-values: 247, 183, 51;
        --border-primary: #324ecc;
        --border-secondary: #5374ff;
        --success: #2ecc71;
        --success-text: #ffffff;
        --success-bg-subtle: rgba(46, 204, 113, 0.2);
        --success-border: rgba(46, 204, 113, 0.5);
        --success-cashed-out-bg: rgba(46, 204, 113, 0.15);
        --success-cashed-out-text: #aaffc4;
        --danger: #e74c3c;
        --danger-text: #ffffff;
        --danger-bg-subtle: rgba(231, 76, 60, 0.2);
        --danger-border: rgba(231, 76, 60, 0.5);
        --warning: #f1c40f;
        --warning-text: #0b153e;
        --warning-bg-subtle: rgba(241, 196, 15, 0.15);
        --warning-border: rgba(241, 196, 15, 0.4);
        --bg-primary-gradient: linear-gradient(135deg, #0052D4, #4364F7, #6FB1FC);
    }

    body[data-theme='lions'] {
        --bg-primary: #A30D45; --bg-primary-values-rgb: 163, 13, 69; --bg-secondary: #8E2A50; --bg-tertiary: #6A0032; --bg-backdrop: rgba(106, 0, 50, 0.8);
        --text-primary: #FFD700; --text-secondary: #00A2E8; --text-tertiary: #94a3b8;
        --accent-primary: #00A2E8; --accent-secondary: #0077B6; --accent-primary-text: #ffffff; --accent-primary-values: 0, 162, 232;
        --border-primary: #6A0032; --border-secondary: #FFD700;
        --success: #2a9d8f; --success-text: #ffffff; --success-bg-subtle: rgba(42, 157, 143, 0.2); --success-border: #2a9d8f; --success-cashed-out-bg: rgba(42, 157, 143, 0.1); --success-cashed-out-text: #2a9d8f;
        --danger: #e63946; --danger-text: #ffffff; --danger-bg-subtle: rgba(230, 57, 70, 0.2); --danger-border: #e63946;
        --warning: #ffb703; --warning-text: #000000; --warning-bg-subtle: rgba(255, 183, 3, 0.2); --warning-border: #ffb703;
        --bg-primary-gradient: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23FFD700' stroke-width='1' opacity='0.08'%3E%3Cline x1='20' y1='30' x2='20' y2='70' /%3E%3Cline x1='40' y1='20' x2='40' y2='80' /%3E%3Cline x1='60' y1='20' x2='60' y2='80' /%3E%3Cline x1='80' y1='30' x2='80' y2='70' /%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, #6A0032, #A30D45);
    }
    
    body[data-theme='princess'] {
        --bg-primary: #fce4ec; --bg-primary-values-rgb: 252, 228, 236; --bg-secondary: #fff; --bg-tertiary: #f8bbd0; --bg-backdrop: rgba(252, 228, 236, 0.8);
        --text-primary: #4a148c; --text-secondary: #8e24aa; --text-tertiary: #c158dc;
        --accent-primary: #ff4081; --accent-secondary: #f50057; --accent-primary-text: #ffffff; --accent-primary-values: 255, 64, 129;
        --border-primary: #f8bbd0; --border-secondary: #f48fb1;
        --success: #00c853; --success-text: #ffffff; --success-bg-subtle: rgba(0, 200, 83, 0.1); --success-border: rgba(0,200,83,0.3); --success-cashed-out-bg: rgba(0, 200, 83, 0.08); --success-cashed-out-text: #007d43;
        --danger: #d50000; --danger-text: #ffffff; --danger-bg-subtle: rgba(213, 0, 0, 0.1); --danger-border: rgba(213,0,0,0.3);
        --warning: #ffab00; --warning-text: #ffffff; --warning-bg-subtle: rgba(255, 171, 0, 0.1); --warning-border: rgba(255, 171, 0, 0.3);
        --bg-primary-gradient: linear-gradient(135deg, #fce4ec, #f8eaf2);
    }
    
    body[data-theme='ocean'] {
        --bg-primary: #e0f7fa; --bg-primary-values-rgb: 224, 247, 250; --bg-secondary: rgba(255, 255, 255, 0.8); --bg-tertiary: #b2ebf2; --bg-backdrop: rgba(0, 95, 115, 0.7);
        --text-primary: #005f73; --text-secondary: #0077b6; --text-tertiary: #0096c7;
        --accent-primary: #00b4d8; --accent-secondary: #90e0ef; --accent-primary-text: #005f73; --accent-primary-values: 0, 180, 216;
        --border-primary: #b2ebf2; --border-secondary: #80deea;
        --success: #2e8b57; --success-text: #ffffff; --success-bg-subtle: rgba(46, 139, 87, 0.15); --success-border: rgba(46,139,87,0.4); --success-cashed-out-bg: rgba(46, 139, 87, 0.1); --success-cashed-out-text: #2e8b57;
        --danger: #ff7f50; --danger-text: #ffffff; --danger-bg-subtle: rgba(255, 127, 80, 0.2); --danger-border: rgba(255,127,80,0.4);
        --warning: #f4a460; --warning-text: #005f73; --warning-bg-subtle: rgba(244, 164, 96, 0.2); --warning-border: rgba(244, 164, 96, 0.4);
        --bg-primary-gradient: linear-gradient(to bottom, #e0f7fa, #ade8f4);
    }

    body[data-theme='beach'] {
        --bg-primary: #fefae0; --bg-primary-values-rgb: 254, 250, 224; --bg-secondary: #ffffff; --bg-tertiary: #faedcd; --bg-backdrop: rgba(212, 163, 115, 0.7);
        --text-primary: #023047; --text-secondary: #219ebc; --text-tertiary: #8ecae6;
        --accent-primary: #fb8500; --accent-secondary: #e27700; --accent-primary-text: #ffffff; --accent-primary-values: 251, 133, 0;
        --border-primary: #faedcd; --border-secondary: #d4a373;
        --success: #2a9d8f; --success-text: #ffffff; --success-bg-subtle: rgba(42, 157, 143, 0.15); --success-border: rgba(42, 157, 143, 0.4); --success-cashed-out-bg: rgba(42, 157, 143, 0.1); --success-cashed-out-text: #2a9d8f;
        --danger: #e63946; --danger-text: #ffffff; --danger-bg-subtle: rgba(230, 57, 70, 0.2); --danger-border: rgba(230, 57, 70, 0.4);
        --warning: #ffb703; --warning-text: #023047; --warning-bg-subtle: rgba(255, 183, 3, 0.2); --warning-border: rgba(255, 183, 3, 0.4);
        --bg-primary-gradient: linear-gradient(to bottom, #fefae0, #e0f7fa);
    }
    
    body[data-theme='action'] {
        --bg-primary: #f8f9fa; --bg-primary-values-rgb: 248, 249, 250; --bg-secondary: #ffffff; --bg-tertiary: #e9ecef; --bg-backdrop: rgba(20, 20, 20, 0.6);
        --text-primary: #212529; --text-secondary: #6c757d; --text-tertiary: #adb5bd;
        --accent-primary: #00C9A7; --accent-secondary: #00A98F; --accent-primary-text: #ffffff; --accent-primary-values: 0, 201, 167;
        --border-primary: #dee2e6; --border-secondary: #ced4da;
        --success: #28a745; --success-text: #ffffff; --success-bg-subtle: rgba(40, 167, 69, 0.1); --success-border: rgba(40, 167, 69, 0.3); --success-cashed-out-bg: rgba(40, 167, 69, 0.2); --success-cashed-out-text: #1d7a33;
        --danger: #dc3545; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 53, 69, 0.1); --danger-border: rgba(220, 53, 69, 0.3);
        --warning: #ffc107; --warning-text: #212529; --warning-bg-subtle: rgba(255, 193, 7, 0.1); --warning-border: rgba(255, 193, 7, 0.3);
        --bg-primary-gradient: var(--bg-primary) url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23343a40' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round' opacity='.05'%3E%3Cpath d='M89.2 63.3c-2.4 1-4.7 2.1-7 3.2-5.7 2.8-11.4 5.6-17.1 8.4-1.2.6-2.3 1.1-3.5 1.7m13.2-19.2c-2.4 1-4.7 2.1-7 3.2-5.7 2.8-11.4 5.6-17.1 8.4-1.2.6-2.3 1.1-3.5 1.7'/%3E%3Cpath d='M76 44.1c-1.2.6-2.3 1.1-3.5 1.7-5.7 2.8-11.4 5.6-17.1 8.4-2.4 1-4.7 2.1-7 3.2l-3.2-6.3c-1-2-3-3.2-5.2-3.2h-7.8c-2.2 0-4.2 1.2-5.2 3.2l-3.2 6.3c-2.3-1-4.6-2.1-6.9-3.2-5.7-2.8-11.4-5.6-17.1-8.4-1.2-.6-2.4-1.1-3.5-1.7'/%3E%3Cpath d='M225.8 59.1c-1.3 0-2.6-.5-3.5-1.5-1-1-1.5-2.3-1.5-3.5 0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.3-.5 2.6-1.5 3.5-1 1-2.2 1.5-3.5 1.5z'/%3E%3Cpath d='M237.1 76.5c-4.9-4.9-12.8-4.9-17.7 0-4.9 4.9-4.9 12.8 0 17.7 2.5 2.5 5.7 3.7 8.9 3.7s6.4-1.2 8.9-3.7c4.9-4.9 4.9-12.8-.1-17.7z'/%3E%3Cpath d='M230.9 59.1c-1.3 0-2.6-.5-3.5-1.5-1-1-1.5-2.3-1.5-3.5 0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.3-.5 2.6-1.5 3.5-1 1-2.2 1.5-3.5 1.5z'/%3E%3Cpath d='M104.2 214.2c-5.7 0-11.4-2.2-15.8-6.6-4.4-4.4-6.6-10.1-6.6-15.8s2.2-11.4 6.6-15.8c4.4-4.4 10.1-6.6 15.8-6.6s11.4 2.2 15.8 6.6c4.4 4.4 6.6 10.1 6.6 15.8s-2.2 11.4-6.6 15.8c-4.4 4.4-10.1 6.6-15.8 6.6z'/%3E%3Cpath d='M104.2 181.2v-11.3m21.1 53.3l-7.9-7.9m-26.3 0l-8 7.9m-8-26.3l-11.3 0m53.3 21.1l-7.9 8m26.3 26.3l8 7.9m-7.9 26.3l7.9 8m-26.3 7.9l-8 8'/%3E%3Cpath d='M169.2 181.2c5.7 0 11.4-2.2 15.8-6.6 4.4-4.4 6.6-10.1 6.6-15.8s-2.2-11.4-6.6-15.8c-4.4-4.4-10.1-6.6-15.8-6.6s-11.4 2.2-15.8 6.6c-4.4 4.4-6.6 10.1-6.6 15.8s2.2 11.4 6.6 15.8c4.4 4.4 10.1 6.6 15.8 6.6z'/%3E%3Cpath d='M169.2 148.2v11.3m-21.1-53.3l7.9 7.9m26.3 0l8-7.9m8 26.3l11.3 0m-53.3-21.1l7.9 8m26.3 26.3l8 7.9m-7.9 26.3l7.9 8m-26.3 7.9l-8 8'/%3E%3Cpath d='M120.1 172.3l21.1-37.4 28 0'/%3E%3C/g%3E%3C/svg%3E") repeat;
    }

    body {
      background: var(--bg-primary-gradient, var(--bg-primary));
    }

    html.no-scroll {
      overflow: hidden;
      overscroll-behavior-y: none;
    }

    .glass-header-container {
        background: rgba(var(--bg-primary-values-rgb), 0.75);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
    }

    .parent-fade-mask-bottom {
        -webkit-mask-image: linear-gradient(to top, transparent 0%, black 2.5rem);
        mask-image: linear-gradient(to top, transparent 0%, black 2.5rem);
    }
    .parent-fade-mask-bottom-weekly {
        -webkit-mask-image: linear-gradient(to top, transparent 0%, black 1.25rem);
        mask-image: linear-gradient(to top, transparent 0%, black 1.25rem);
    }
  `}</style>
);

const themeColors: { [key: string]: string } = {
  'light': '#f1f5f9',
  'dark': '#020617',
  'dark-blue': '#4364F7',
  'lions': '#A30D45',
  'princess': '#fce4ec',
  'ocean': '#e0f7fa',
  'beach': '#fefae0',
  'action': '#f8f9fa',
};

const App: React.FC = () => {
  // Multi-child state management
  const [profiles, setProfiles] = usePersistentState<Profile[]>('profiles', []);
  const [activeProfileId, setActiveProfileId] = usePersistentState<string | null>('activeProfileId', null);
  const [parentSettings, setParentSettings] = usePersistentState<ParentSettings>('parentSettings', { 
    passcode: null, 
    theme: 'light',
    defaultChoreValue: 20,
    defaultBonusValue: 100,
    customCategories: [],
    areSoundsEnabled: true,
  });
  const [choresByProfile, setChoresByProfile] = usePersistentState<Record<string, Chore[]>>('choresByProfile', {});
  const [earningsHistoryByProfile, setEarningsHistoryByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('earningsHistoryByProfile', {});
  const [pendingCashOutsByProfile, setPendingCashOutsByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('pendingCashOutsByProfile', {});
  const [pastChoreApprovalsByProfile, setPastChoreApprovalsByProfile] = usePersistentState<Record<string, PastChoreApproval[]>>('pastChoreApprovalsByProfile', {});
  const [lastAutoCashOut, setLastAutoCashOut] = usePersistentState<Record<string, string>>('lastAutoCashOut', {});
  const [pendingBonusNotificationsByProfile, setPendingBonusNotificationsByProfile] = usePersistentState<Record<string, BonusNotification[]>>('pendingBonusNotificationsByProfile', {});

  const mainScrollRef = useRef<HTMLElement>(null);
  const [showParentBottomFade, setShowParentBottomFade] = useState(false);


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
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [activeBonusNotification, setActiveBonusNotification] = useState<BonusNotification | null>(null);

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

  const isTouchDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }, []);

  // Data migration for areSoundsEnabled
  useEffect(() => {
    const pSettings = localStorage.getItem('parentSettings');
    if (pSettings) {
        try {
            const parsed = JSON.parse(pSettings);
            if (parsed.areSoundsEnabled === undefined) {
                setParentSettings(prev => ({
                    ...prev,
                    areSoundsEnabled: true // Default to true for existing users
                }));
            }
        } catch (e) {
            // Ignore parse errors, the main loader will handle it
        }
    }
  }, [setParentSettings]);

  // Data migration for showPotentialEarnings from parentSettings to Profile
  useEffect(() => {
    const pSettings = localStorage.getItem('parentSettings');
    const oldSettingsExist = pSettings ? JSON.parse(pSettings).hasOwnProperty('showPotentialEarnings') : false;
    const migrationNeeded = oldSettingsExist || (profiles.length > 0 && !profiles[0].hasOwnProperty('showPotentialEarnings'));

    if (migrationNeeded) {
        console.log("Migrating 'showPotentialEarnings' setting from parent to profile...");
        setProfiles(prevProfiles => {
            return prevProfiles.map(p => {
                if (p.hasOwnProperty('showPotentialEarnings')) return p;
                return { ...p, showPotentialEarnings: true }; // Default to true
            });
        });

        if (oldSettingsExist) {
            setParentSettings(prev => {
                const newSettings = { ...prev };
                delete (newSettings as any).showPotentialEarnings;
                return newSettings;
            });
        }
    }
  }, [profiles, setProfiles, setParentSettings]);

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
  
  // Effect to set the active theme on the body and update browser theme color
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

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themeColors[currentTheme] || '#f1f5f9');
    }
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

  const isFirstTimeThemePrompt = useMemo(() => {
    return isKidsMode && activeProfile && !activeProfile.hasSeenThemePrompt;
  }, [isKidsMode, activeProfile]);

  useEffect(() => {
    if (isFirstTimeThemePrompt) {
      const timer = setTimeout(() => {
          setIsThemeModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstTimeThemePrompt]);

  const handleCloseThemeModal = () => {
    if (isFirstTimeThemePrompt) {
        setProfiles(prevProfiles =>
            prevProfiles.map(p =>
                p.id === activeProfileId ? { ...p, hasSeenThemePrompt: true } : p
            )
        );
    }
    setIsThemeModalOpen(false);
  };

  useEffect(() => {
    if (isKidsMode && activeProfileId) {
        const pendingBonuses = pendingBonusNotificationsByProfile[activeProfileId];
        if (pendingBonuses && pendingBonuses.length > 0) {
            const bonusToShow = pendingBonuses[0];
            setActiveBonusNotification(bonusToShow);

            setPendingBonusNotificationsByProfile(prev => {
                const newState = { ...prev };
                newState[activeProfileId] = newState[activeProfileId].slice(1);
                return newState;
            });
        }
    }
}, [isKidsMode, activeProfileId, pendingBonusNotificationsByProfile, setPendingBonusNotificationsByProfile]);


  const handleWelcomeSave = useCallback((data: { name: string; image: string | null; payDayConfig: PayDayConfig; passcode: string | null; }) => {
    const newProfileId = Date.now().toString();
    const newProfile: Profile = {
      id: newProfileId,
      name: data.name,
      image: data.image,
      payDayConfig: data.payDayConfig,
      theme: 'light',
      hasSeenThemePrompt: false,
      showPotentialEarnings: true,
    };
    setProfiles([newProfile]);
    setParentSettings(prev => ({ ...prev, passcode: data.passcode, defaultBonusValue: prev.defaultBonusValue || 100, customCategories: prev.customCategories || [], areSoundsEnabled: true }));
    setActiveProfileId(newProfileId);
    setChoresByProfile({ [newProfileId]: [] });
    setEarningsHistoryByProfile({ [newProfileId]: [] });
    setPendingCashOutsByProfile({ [newProfileId]: [] });
    setPastChoreApprovalsByProfile({ [newProfileId]: [] });
    setIsWelcomeModalOpen(false);
    setIsKidsMode(false);
  }, [setProfiles, setParentSettings, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setIsKidsMode]);
  
  const handleAddChild = useCallback((data: Omit<Profile, 'id' | 'theme' | 'hasSeenThemePrompt' | 'showPotentialEarnings'>) => {
    const newProfileId = Date.now().toString();
    const newProfile: Profile = { 
        ...data, 
        id: newProfileId, 
        theme: 'light', 
        hasSeenThemePrompt: false,
        showPotentialEarnings: true,
    };
    setProfiles(prev => [...prev, newProfile]);
    setChoresByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setEarningsHistoryByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setPendingCashOutsByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setPastChoreApprovalsByProfile(prev => ({ ...prev, [newProfileId]: [] }));
    setPendingBonusNotificationsByProfile(prev => ({...prev, [newProfileId]: [] }));
    setActiveProfileId(newProfileId); // Switch to the new child
    setIsKidsMode(false); // Go to parent mode to manage the new child
    setIsAddChildModalOpen(false);
  }, [setProfiles, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setPendingBonusNotificationsByProfile, setIsKidsMode]);


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
            setParentSettings({ passcode: null, theme: 'light', defaultChoreValue: 20, defaultBonusValue: 100, customCategories: [], areSoundsEnabled: true });
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
    removeByProfileId(setPendingBonusNotificationsByProfile);
    
    setIsEditProfileModalOpen(false);
    setProfileToEdit(null);
  }, [activeProfileId, setProfiles, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setParentSettings, setIsKidsMode, setLastAutoCashOut, setPendingBonusNotificationsByProfile]);

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

  const potentialEarnings = useMemo(() => {
    if (!activeProfile?.showPotentialEarnings || !activeProfile.payDayConfig.day) {
        return 0;
    }
    const { mode, day: payDayString } = activeProfile.payDayConfig;
    if (mode === 'anytime') {
        return 0;
    }

    const currentEarnings = calculateEarnings(chores);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDayIndex = today.getDay();
    const payDayIndex = DAYS_OF_WEEK.indexOf(payDayString);
    let daysUntilPayday = payDayIndex - todayDayIndex;
    if (daysUntilPayday < 0) {
        daysUntilPayday += 7;
    }
    const nextPayDate = new Date(today);
    nextPayDate.setDate(today.getDate() + daysUntilPayday);

    let futurePotential = 0;
    const loopDate = new Date(today); // Start from today
    
    while(loopDate <= nextPayDate) {
        const dateString = formatDate(loopDate);
        const dayOfWeek = getDayFromDate(loopDate);
        const dailyChores = chores.filter(c => c.days.includes(dayOfWeek));

        for (const chore of dailyChores) {
            // Add value ONLY if the chore is not ALREADY completed and counted in currentEarnings
            const completionState = chore.completions[dateString];
            if (completionState !== 'completed' && completionState !== 'cashed_out' && completionState !== 'pending_cash_out') {
                futurePotential += chore.value;
            }
        }
        loopDate.setDate(loopDate.getDate() + 1);
    }

    return currentEarnings + futurePotential;
  }, [chores, activeProfile, calculateEarnings]);


  const displayMode = isKidsMode ? 'daily' : viewMode;

  useEffect(() => { if (isKidsMode) setSelectedDate(new Date()); }, [isKidsMode]);

   const filteredChores = useMemo(() => {
    if (!activeProfileId) return [];
    
    // Sort bonuses to the end within their category/group
    const baseChores = (displayMode === 'daily'
        ? chores.filter(chore => chore.days.includes(getDayFromDate(selectedDate)))
        : chores
    ).sort((a, b) => {
        const aIsBonus = a.type === 'bonus';
        const bIsBonus = b.type === 'bonus';
        if (aIsBonus && !bIsBonus) return 1;
        if (!aIsBonus && bIsBonus) return -1;
        
        const aCategoryOrder = a.category ? (CHORE_CATEGORY_ORDER[a.category] ?? 100) : 99;
        const bCategoryOrder = b.category ? (CHORE_CATEGORY_ORDER[b.category] ?? 100) : 99;
        if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
        
        return (a.order || 0) - (b.order || 0);
    });

    return baseChores;
  }, [chores, displayMode, selectedDate, activeProfileId]);

  const todaysChoresStats = useMemo(() => {
    if (!activeProfileId || !isKidsMode) return { completed: 0, total: 0 };
    const todayDay = getDayFromDate(new Date());
    const todayString = formatDate(new Date());
    const todaysChores = chores.filter(c => c.days.includes(todayDay));
    const completedCount = todaysChores.filter(c => {
        const state = c.completions[todayString];
        return state === 'completed' || state === 'cashed_out' || state === 'pending_cash_out';
    }).length;
    return { completed: completedCount, total: todaysChores.length };
}, [chores, activeProfileId, isKidsMode]);
  
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

  const handleSaveChore = useCallback((choreData: Omit<Chore, 'id' | 'completions' | 'order'> & { note?: string }) => {
    if (!activeProfileId) return;
    setChoresByProfile(prev => {
      const currentChores = prev[activeProfileId] || [];
      const updatedChores = choreToEdit
        ? currentChores.map(c => c.id === choreToEdit.id ? { ...c, ...choreData, name: choreToEdit.type === 'bonus' ? c.name : choreData.name } : c)
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
    if (!chore || chore.type === 'bonus') return; // Bonuses cannot be toggled
    
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
      completionsSnapshot: snapshot,
      type: 'chore'
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

  const handleAwardBonus = useCallback((selectedProfileIds: string[], amount: number, note: string) => {
    const today = new Date();
    const todayDateString = formatDate(today);
    const todayDay = getDayFromDate(today);

    // Cue up notification for child
    const newBonusNotificationId = Date.now().toString();
    const newBonusNotification: BonusNotification = { id: newBonusNotificationId, amount, note };
    setPendingBonusNotificationsByProfile(prev => {
        const newState = { ...prev };
        selectedProfileIds.forEach(pId => {
            newState[pId] = [...(newState[pId] || []), newBonusNotification];
        });
        return newState;
    });

    // Create a new "bonus" chore for each selected profile
    setChoresByProfile(prev => {
      const newState = { ...prev };
      selectedProfileIds.forEach((pId, index) => {
        const currentChores = newState[pId] || [];
        const newBonusChore: Chore = {
          id: `bonus_${Date.now().toString()}_${index}`,
          name: 'Bonus',
          value: amount,
          days: [todayDay],
          completions: { [todayDateString]: 'completed' },
          icon: 'bonus_icon', // Special identifier for the icon
          category: null,
          order: 99999 + currentChores.length, // Ensure it's last
          type: 'bonus',
          note: note,
        };
        newState[pId] = [...currentChores, newBonusChore];
      });
      return newState;
    });

    setIsBonusModalOpen(false);
}, [setPendingBonusNotificationsByProfile, setChoresByProfile]);

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

      // Only scroll if at least one chore is marked as complete.
      const hasCompletedChoresToday = filteredChores.some(
        chore => ['completed', 'cashed_out', 'pending_cash_out'].includes(chore.completions[todayString])
      );

      if (!hasCompletedChoresToday) {
        return; // Don't scroll if nothing is done yet.
      }
      
      const firstUncompletedChoreIndex = filteredChores.findIndex(
        chore => !['completed', 'cashed_out', 'pending_cash_out'].includes(chore.completions[todayString])
      );

      if (firstUncompletedChoreIndex !== -1) {
        const firstUncompletedChore = filteredChores[firstUncompletedChoreIndex];
        
        setTimeout(() => {
            // Determine if target should be category header.
            let targetElement: HTMLElement | null = null;
            const isFirstInCategory = 
                firstUncompletedChoreIndex === 0 || 
                (filteredChores[firstUncompletedChoreIndex - 1].category !== firstUncompletedChore.category);

            if (isFirstInCategory && firstUncompletedChore.category) {
                const categoryId = `category-header-${firstUncompletedChore.category.replace(/\s+/g, '-').toLowerCase()}`;
                targetElement = document.getElementById(categoryId);
            }
            
            // Fallback to the chore card itself if header not found or not applicable.
            if (!targetElement) {
                targetElement = document.getElementById(`chore-${firstUncompletedChore.id}`);
            }
          
            const scrollContainer = mainScrollRef.current;
            if (!targetElement || !scrollContainer) return;

            if (firstUncompletedChoreIndex > 0) {
                const previousChore = filteredChores[firstUncompletedChoreIndex - 1];
                const previousElement = document.getElementById(`chore-${previousChore.id}`);
                
                if (previousElement) {
                    // Use full height of previous chore for offset.
                    const offset = previousElement.offsetHeight;
                    scrollContainer.scrollTo({
                        top: targetElement.offsetTop - offset,
                        behavior: 'smooth',
                    });
                } else {
                    // Fallback if previous element isn't found
                    scrollContainer.scrollTo({
                        top: targetElement.offsetTop,
                        behavior: 'smooth',
                    });
                }
            } else {
                // This is the first element in the list, scroll it to the top.
                scrollContainer.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth',
                });
            }
        }, 150);
      }
    }
  }, [isKidsMode, isToday, filteredChores, activeProfileId]);

  // Effect for fade on scroll
  useEffect(() => {
    const scrollContainer = mainScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
        if (!isKidsMode) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const showFade = scrollHeight - scrollTop - clientHeight > 20;
            setShowParentBottomFade(showFade);
        }
    };
    
    handleScroll(); // Initial check
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also re-check when content changes
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(scrollContainer);

    return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        resizeObserver.unobserve(scrollContainer);
    };
}, [isKidsMode, activeProfileId, chores, viewMode]);

// Effect for swiping between views in parent mode
useEffect(() => {
    if (isKidsMode || !isTouchDevice) return;

    const swipeTarget = mainScrollRef.current;
    if (!swipeTarget) return;

    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;

    const handleTouchStart = (e: TouchEvent) => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        handleSwipe();
    };

    const handleSwipe = () => {
        const deltaX = touchendX - touchstartX;
        const deltaY = touchendY - touchstartY;
        
        // We want horizontal swipes, so deltaX should be much larger than deltaY
        if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) {
            return; // Not a significant horizontal swipe
        }

        if (touchendX < touchstartX) { // Swiped left
            if (viewMode === 'weekly') {
                setViewMode('daily');
            }
        }

        if (touchendX > touchstartX) { // Swiped right
            if (viewMode === 'daily') {
                setViewMode('weekly');
            }
        }
    };

    swipeTarget.addEventListener('touchstart', handleTouchStart);
    swipeTarget.addEventListener('touchend', handleTouchEnd);

    return () => {
        swipeTarget.removeEventListener('touchstart', handleTouchStart);
        swipeTarget.removeEventListener('touchend', handleTouchEnd);
    };
}, [isKidsMode, isTouchDevice, viewMode, setViewMode]);

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

  const handleAddCustomCategory = useCallback((newCategory: string) => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory || parentSettings.customCategories.some(c => c.toLowerCase() === trimmedCategory.toLowerCase())) {
        return;
    }
    setParentSettings(prev => ({
        ...prev,
        customCategories: [...prev.customCategories, trimmedCategory]
    }));
  }, [parentSettings.customCategories, setParentSettings]);

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
  
  const isBlurActive = isWelcomeModalOpen || (isThemeModalOpen && isFirstTimeThemePrompt);

  if (!hasCompletedOnboarding) {
      return (
          <div className="min-h-screen text-[var(--text-primary)] relative bg-[var(--bg-primary)]">
             <ThemeStyles />
             <WelcomeModal isOpen={isWelcomeModalOpen} onSave={handleWelcomeSave} />
             {isBlurActive && (
                <div 
                    className="fixed inset-0 bg-transparent backdrop-blur-sm z-30"
                    aria-hidden="true"
                />
            )}
          </div>
      );
  }

  const showAddChorePulse = !isKidsMode && filteredChores.length === 0;
  
  let parentFadeClass = '';
  if (!isKidsMode) {
    if (viewMode === 'weekly') {
      parentFadeClass = 'parent-fade-mask-bottom-weekly';
    } else if (showParentBottomFade) {
      parentFadeClass = 'parent-fade-mask-bottom';
    }
  }

  return (
    <div className={`h-screen flex flex-col text-[var(--text-primary)] relative bg-[var(--bg-primary)]`}>
      <ThemeStyles />
      <header className="sticky top-0 z-30 glass-header-container">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4">
          <MenuBanner
            isKidsMode={isKidsMode} onSwitchToChild={handleSwitchToChild}
            onAttemptSwitchToParentMode={handleAttemptSwitchToParentMode}
            pendingCount={pendingCashOuts.length} onShowPending={handleOpenPendingModal}
            profiles={profiles} activeProfileId={activeProfileId}
            onEditProfile={handleOpenEditModalForProfile}
            onShowOptionsModal={() => setIsOptionsMenuOpen(true)}
            onShowAddChildModal={() => setIsAddChildModalOpen(true)} onShowThemeModal={() => setIsThemeModalOpen(true)}
            pastApprovalsCount={pastChoreApprovals.length} onShowPastApprovals={() => setIsPastApprovalModalOpen(true)}
            menuPulse={isThemeModalOpen && isFirstTimeThemePrompt}
            potentialEarnings={potentialEarnings} showPotentialEarnings={activeProfile?.showPotentialEarnings}
            todaysTotalChores={todaysChoresStats.total} todaysCompletedChores={todaysChoresStats.completed}
          />
          <Header
            earnings={earnings} isKidsMode={isKidsMode} profile={activeProfile}
            onCashOut={() => handleCashOut()} onShowHistory={handleShowHistory}
            isCashOutDisabled={isCashOutDisabled} showCashOutButton={showCashOutButton}
            viewMode={viewMode} setViewMode={setViewMode} weeklyTitle={weeklyTitle}
            isToday={isToday} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            currentWeekDays={currentWeekDays} handlePreviousWeek={handlePreviousWeek}
            handleNextWeek={handleNextWeek} isViewingCurrentWeek={isViewingCurrentWeek}
            handleGoToCurrentWeek={handleGoToCurrentWeek} onUpdateProfileImage={handleUpdateProfileImage}
            isTouchDevice={isTouchDevice}
            onEditCurrentProfile={handleOpenEditModalForProfile}
          />
        </div>
      </header>
      
      <main ref={mainScrollRef} className={`flex-1 overflow-y-auto relative ${parentFadeClass}`}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
            {!isKidsMode && profiles.length > 1 && (
                <div className="mb-6 mt-4 p-3 bg-[var(--bg-tertiary)] rounded-2xl">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 text-center">Managing Chores For</h3>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {profiles.map(p => (
                            <button key={p.id} onClick={() => setActiveProfileId(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${activeProfileId === p.id ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg' : 'bg-[var(--bg-secondary)] hover:opacity-80 text-[var(--text-primary)]'}`}>
                                {p.image ? <img src={p.image} alt={p.name} className="w-6 h-6 rounded-full object-cover"/> : <UserCircleIcon className="w-6 h-6" />}
                                <span>{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <ChoreList
              chores={filteredChores} currentWeekDays={currentWeekDays} onToggleCompletion={handleToggleCompletion}
              onEditChore={isKidsMode ? undefined : handleOpenEditModal} viewMode={displayMode} selectedDate={selectedDate}
              isKidsMode={isKidsMode} onReorderChores={handleReorderChores} pastChoreApprovals={pastChoreApprovals}
              onApprovePastChore={isKidsMode ? undefined : handleApprovePastChore} draggingChoreId={draggingChoreId}
              dragOverChoreId={dragOverChoreId} onDragStartTouch={handleDragStartTouch}
              areSoundsEnabled={parentSettings.areSoundsEnabled}
            />
            
            {/* Spacer for the parent action bar */}
            {!isKidsMode && <div className="h-24" />}
        </div>
      </main>

      {!isKidsMode && (
          <ActionBar 
            onAddChore={handleOpenAddModal} 
            onPayBonus={() => setIsBonusModalOpen(true)} 
            pulseAddChore={showAddChorePulse} 
            areSoundsEnabled={parentSettings.areSoundsEnabled}
          />
      )}

      <EarningsHistoryModal isOpen={isHistoryModalOpen} onClose={handleCloseHistoryModal} history={earningsHistory} onUpdateAmount={handleUpdateHistoryAmount} />
      <PendingCashOutsModal isOpen={isPendingModalOpen} onClose={handleClosePendingModal} pendingCashOuts={pendingCashOuts} onOpenReview={handleOpenReviewModal} />
      {recordToReview && <ReviewCashOutModal isOpen={!!recordToReview} onClose={() => setRecordToReview(null)} record={recordToReview} onApprove={handleApproveReviewedCashOut} profileName={activeProfile?.name || ''} />}
      <PastChoresApprovalModal isOpen={isPastApprovalModalOpen} onClose={() => setIsPastApprovalModalOpen(false)} approvals={pastChoreApprovals} onApprove={handleApprovePastChore} onDismiss={handleDismissPastChore} onApproveAll={handleApproveAllPastChores} onDismissAll={handleDismissAllPastChores} />
      <CashOutConfirmationModal isOpen={isCashOutConfirmOpen} onClose={() => setIsCashOutConfirmOpen(false)} amount={cashedOutAmount} areSoundsEnabled={parentSettings.areSoundsEnabled} />
      <AllChoresDoneModal isOpen={isAllChoresDoneModalOpen} onClose={() => setIsAllChoresDoneModalOpen(false)} dailyAmount={dailyEarningsForModal} areSoundsEnabled={parentSettings.areSoundsEnabled} />
      {isEditProfileModalOpen && profileToEdit && (<EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => { setIsEditProfileModalOpen(false); setProfileToEdit(null); }} onSave={handleUpdateProfile} onDelete={handleDeleteProfile} initialData={profileToEdit} />)}
      <PasscodeSetupModal isOpen={isPasscodeSetupModalOpen} onClose={() => setIsPasscodeSetupModalOpen(false)} onSave={handlePasscodeSetupSuccess} />
      <PasscodeEntryModal isOpen={isPasscodeEntryModalOpen} onClose={() => setIsPasscodeEntryModalOpen(false)} onSuccess={handlePasscodeEntrySuccess} passcodeToMatch={parentSettings.passcode} onForgotPassword={handleOpenForgotPassword} />
      <ForgotPasscodeModal isOpen={isForgotPasscodeModalOpen} onClose={() => setIsForgotPasscodeModalOpen(false)} onSuccess={handleForgotPasscodeSuccess} />
      <OptionsMenuModal isOpen={isOptionsMenuOpen} onClose={() => setIsOptionsMenuOpen(false)} settings={parentSettings} onUpdateSettings={handleUpdateParentSettings} profiles={profiles} onEditProfile={handleOpenProfileForEditing} />
      <AddChildModal isOpen={isAddChildModalOpen} onClose={() => setIsAddChildModalOpen(false)} onSave={handleAddChild} />
      <ThemeModal isOpen={isThemeModalOpen} onClose={handleCloseThemeModal} onSave={handleUpdateTheme} currentTheme={themeForModal} isFirstTime={isFirstTimeThemePrompt} />
      <BonusAwardModal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} onAward={handleAwardBonus} profiles={profiles} defaultBonusValue={parentSettings.defaultBonusValue} />
      {activeBonusNotification && <BonusAwardedNotificationModal isOpen={!!activeBonusNotification} onClose={() => setActiveBonusNotification(null)} bonus={activeBonusNotification} areSoundsEnabled={parentSettings.areSoundsEnabled} />}
      {!isKidsMode && (<ChoreFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveChore} initialData={choreToEdit} defaultChoreValue={parentSettings.defaultChoreValue} onDelete={handleDeleteChore} customCategories={parentSettings.customCategories || []} onAddCustomCategory={handleAddCustomCategory} />)}
      {isBlurActive && (
          <div 
              className="fixed inset-0 bg-transparent backdrop-blur-sm z-30"
              aria-hidden="true"
          />
      )}
    </div>
  );
};

export default App;
