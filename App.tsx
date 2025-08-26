


import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Chore, Day, EarningsRecord, Profile, ParentSettings, PastChoreApproval, CompletionSnapshot, CompletionState, PayDayConfig, BonusNotification, BeforeInstallPromptEvent } from './types';
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
import ParentBonusConfirmationModal from './components/ParentBonusConfirmationModal';
import ActionBar from './components/ActionBar';
import ProfileSelector from './components/ProfileSelector';
import { useSound } from './hooks/useSound';


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
        --bg-image-overlay: none;
        --bg-image-opacity: 0.15;
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
        --bg-primary-gradient: linear-gradient(135deg, #6A0032, #A30D45);
        --bg-image-overlay: url("/images/lions_logo.png");
        --bg-image-opacity: 0.15;
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
        --bg-primary-gradient: var(--bg-primary);
        --bg-image-overlay: url("/images/Skateboard.png");
        --bg-image-opacity: 0.15;
    }
    
    body[data-theme='superhero'] {
        --bg-primary: #101828; --bg-primary-values-rgb: 16, 24, 40; --bg-secondary: #1e293b; --bg-tertiary: #334155; --bg-backdrop: rgba(16, 24, 40, 0.7);
        --text-primary: #f8fafc; --text-secondary: #cbd5e1; --text-tertiary: #94a3b8;
        --accent-primary: #ef4444; --accent-secondary: #dc2626; --accent-primary-text: #ffffff; --accent-primary-values: 239, 68, 68;
        --border-primary: #334155; --border-secondary: #475569;
        --success: #22c55e; --success-text: #ffffff; --success-bg-subtle: rgba(34, 197, 94, 0.2); --success-border: rgba(34,197,94,0.5); --success-cashed-out-bg: rgba(34, 197, 94, 0.1); --success-cashed-out-text: #4ade80;
        --danger: #ef4444; --danger-text: #ffffff; --danger-bg-subtle: rgba(239, 68, 68, 0.2); --danger-border: rgba(239,68,68,0.5);
        --warning: #f59e0b; --warning-text: #ffffff; --warning-bg-subtle: rgba(245, 158, 11, 0.15); --warning-border: rgba(245, 158, 11, 0.4);
    }
    body[data-theme='jungle'] {
        --bg-primary: #14532d; --bg-primary-values-rgb: 20, 83, 45; --bg-secondary: #166534; --bg-tertiary: #15803d; --bg-backdrop: rgba(20, 83, 45, 0.7);
        --text-primary: #f0fdf4; --text-secondary: #d1fae5; --text-tertiary: #a7f3d0;
        --accent-primary: #f97316; --accent-secondary: #ea580c; --accent-primary-text: #ffffff; --accent-primary-values: 249, 115, 22;
        --border-primary: #15803d; --border-secondary: #16a34a;
        --success: #14b8a6; --success-text: #ffffff; --success-bg-subtle: rgba(20, 184, 166, 0.2); --success-border: rgba(20, 184, 166, 0.5); --success-cashed-out-bg: rgba(20, 184, 166, 0.1); --success-cashed-out-text: #2dd4bf;
        --danger: #dc2626; --danger-text: #ffffff; --danger-bg-subtle: rgba(220, 38, 38, 0.2); --danger-border: rgba(220,38,38,0.5);
        --warning: #f59e0b; --warning-text: #ffffff; --warning-bg-subtle: rgba(245, 158, 11, 0.15); --warning-border: rgba(245, 158, 11, 0.4);
    }
    body[data-theme='galaxy'] {
        --bg-primary: #2b0b3f; --bg-primary-values-rgb: 43, 11, 63; --bg-secondary: #4c1d95; --bg-tertiary: #5b21b6; --bg-backdrop: rgba(43, 11, 63, 0.7);
        --text-primary: #f3e8ff; --text-secondary: #e9d5ff; --text-tertiary: #d8b4fe;
        --accent-primary: #ec4899; --accent-secondary: #db2777; --accent-primary-text: #ffffff; --accent-primary-values: 236, 72, 153;
        --border-primary: #5b21b6; --border-secondary: #7e22ce;
        --success: #a3e635; --success-text: #1e293b; --success-bg-subtle: rgba(163, 230, 53, 0.2); --success-border: rgba(163, 230, 53, 0.5); --success-cashed-out-bg: rgba(163, 230, 53, 0.1); --success-cashed-out-text: #bef264;
        --danger: #f43f5e; --danger-text: #ffffff; --danger-bg-subtle: rgba(244, 63, 94, 0.2); --danger-border: rgba(244,63,94,0.5);
        --warning: #facc15; --warning-text: #1e293b; --warning-bg-subtle: rgba(250, 204, 21, 0.15); --warning-border: rgba(250, 204, 21, 0.4);
    }
    body[data-theme='gaming'] {
        --bg-primary: #0a0a0a; --bg-primary-values-rgb: 10, 10, 10; --bg-secondary: #1a1a1a; --bg-tertiary: #2a2a2a; --bg-backdrop: rgba(10, 10, 10, 0.8);
        --text-primary: #39ff14; --text-secondary: #00ffff; --text-tertiary: #9ca3af;
        --accent-primary: #ff00ff; --accent-secondary: #c000c0; --accent-primary-text: #ffffff; --accent-primary-values: 255, 0, 255;
        --border-primary: #2a2a2a; --border-secondary: #444444;
        --success: #39ff14; --success-text: #0a0a0a; --success-bg-subtle: rgba(57, 255, 20, 0.2); --success-border: rgba(57, 255, 20, 0.5); --success-cashed-out-bg: rgba(57, 255, 20, 0.1); --success-cashed-out-text: #39ff14;
        --danger: #ff1818; --danger-text: #ffffff; --danger-bg-subtle: rgba(255, 24, 24, 0.2); --danger-border: rgba(255, 24, 24, 0.5);
        --warning: #ffff00; --warning-text: #0a0a0a; --warning-bg-subtle: rgba(255, 255, 0, 0.15); --warning-border: rgba(255, 255, 0, 0.4);
    }


    body::before { /* color layer */
      content: '';
      position: fixed;
      inset: 0;
      background: var(--bg-primary-gradient, var(--bg-primary));
      z-index: -2;
    }

    body::after { /* image layer */
        content: '';
        position: fixed;
        inset: 0;
        background-image: var(--bg-image-overlay);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        opacity: var(--bg-image-opacity);
        z-index: -1;
        pointer-events: none;
    }

    body {
      background: transparent;
    }

    html.no-scroll, body.dragging {
      overflow: hidden;
      overscroll-behavior-y: none;
    }

    .glass-header-container {
        background: transparent;
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
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
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
  'superhero': '#101828',
  'jungle': '#14532d',
  'galaxy': '#2b0b3f',
  'gaming': '#0a0a0a',
};


const ParentProfileView = React.memo(({
    profile, chores, earnings, pendingBonuses, ...props 
}: any) => {
    const mainScrollRef = useRef<HTMLElement>(null);
    const [showParentBottomFade, setShowParentBottomFade] = useState(false);

    useEffect(() => {
        const scrollContainer = mainScrollRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const showFade = scrollHeight - scrollTop - clientHeight > 20;
            setShowParentBottomFade(showFade);
        };
        
        handleScroll();
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        
        const resizeObserver = new ResizeObserver(handleScroll);
        resizeObserver.observe(scrollContainer);

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            resizeObserver.unobserve(scrollContainer);
        };
    }, [chores]);

    const parentFadeClass = showParentBottomFade ? 'parent-fade-mask-bottom-weekly' : '';
    const displayMode = 'weekly';

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-4 md:py-4">
                  <Header {...props} profile={profile} earnings={earnings} pendingBonuses={pendingBonuses} />
                </div>
            </header>
            
            <main ref={mainScrollRef} className={`flex-1 overflow-y-auto relative ${parentFadeClass} scrollbar-hide`}>
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <ChoreList {...props} chores={chores} viewMode={displayMode} />
                    <div className="h-24" />
                </div>
            </main>
        </div>
    );
});


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
  });
  const [choresByProfile, setChoresByProfile] = usePersistentState<Record<string, Chore[]>>('choresByProfile', {});
  const [earningsHistoryByProfile, setEarningsHistoryByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('earningsHistoryByProfile', {});
  const [pendingCashOutsByProfile, setPendingCashOutsByProfile] = usePersistentState<Record<string, EarningsRecord[]>>('pendingCashOutsByProfile', {});
  const [pastChoreApprovalsByProfile, setPastChoreApprovalsByProfile] = usePersistentState<Record<string, PastChoreApproval[]>>('pastChoreApprovalsByProfile', {});
  const [lastAutoCashOut, setLastAutoCashOut] = usePersistentState<Record<string, string>>('lastAutoCashOut', {});
  const [pendingBonusNotificationsByProfile, setPendingBonusNotificationsByProfile] = usePersistentState<Record<string, BonusNotification[]>>('pendingBonusNotificationsByProfile', {});

  const mainScrollRef = useRef<HTMLElement>(null);
  const { playAllDone, playBonusNotify } = useSound();

  const hasCompletedOnboarding = useMemo(() => profiles.length > 0, [profiles]);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(!hasCompletedOnboarding);
  const [mode, setMode] = useState<'kids' | 'parent' | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isPasscodeSetupModalOpen, setIsPasscodeSetupModalOpen] = useState(false);
  const [isPasscodeEntryModalOpen, setIsPasscodeEntryModalOpen] = useState(false);
  const [isForgotPasscodeModalOpen, setIsForgotPasscodeModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [activeBonusNotification, setActiveBonusNotification] = useState<BonusNotification | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [isParentBonusConfirmModalOpen, setIsParentBonusConfirmModalOpen] = useState(false);
  const [bonusAwardedToName, setBonusAwardedToName] = useState('');


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

  // New state for swipe navigation
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  const isTouchDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }, []);

  // Effect to decide initial mode or show selector
  useEffect(() => {
    if (profiles.length === 0) {
      setIsWelcomeModalOpen(true);
      setMode(null);
    } else {
      setIsWelcomeModalOpen(false);
      if (mode === null) { // Only decide mode if it's not already set (e.g., from an internal switch)
        if (profiles.length === 1) {
          // Auto-login to the single child's view
          if (activeProfileId !== profiles[0].id) {
            setActiveProfileId(profiles[0].id);
          }
          setMode('kids');
        }
        // If > 1 profile, mode remains null to trigger the selector
      }
    }
  }, [profiles, activeProfileId, mode, setActiveProfileId]);

  const isKidsMode = useMemo(() => mode === 'kids', [mode]);
  const pendingBonuses = useMemo(() => (activeProfileId ? pendingBonusNotificationsByProfile[activeProfileId] : []) || [], [pendingBonusNotificationsByProfile, activeProfileId]);

  useEffect(() => {
      const isBonusFlowActive = isKidsMode && (pendingBonuses.length > 0 || !!activeBonusNotification);
      if (isBonusFlowActive) {
          document.documentElement.classList.add('no-scroll');
      } else {
          document.documentElement.classList.remove('no-scroll');
      }
      return () => {
          document.documentElement.classList.remove('no-scroll');
      };
  }, [isKidsMode, pendingBonuses, activeBonusNotification]);

  // Listener for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
      if (!installPrompt) {
          return;
      }
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setInstallPrompt(null);
      setIsOptionsMenuOpen(false); // Close the modal after action
  };

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
                        const categoryKey = chore.category || 'Anytime';
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
                        } else if (value === 'completed' || value === 'cashed_out' || value === 'pending_cash_out' || value === 'pending_acceptance') {
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
        if (!isKidsMode || !prevChores || !chores.length || isAllChoresDoneModalOpen) return;
        const todayString = formatDate(new Date());
        const wasCompletionJustAddedForToday = chores.some(chore => {
            const prevChore = prevChores.find(p => p.id === chore.id);
            if (!prevChore) return false;
            return chore.completions[todayString] === 'completed' && prevChore.completions[todayString] !== 'completed';
        });
        if (!wasCompletionJustAddedForToday) return;
        const todayDay = getDayFromDate(new Date());
        const todaysChores = chores.filter(c => c.days.includes(todayDay) || c.oneTimeDate === todayString);
        if (todaysChores.length === 0) return;
        const areAllDoneNow = todaysChores.every(c => c.completions[todayString]);
        if (areAllDoneNow) {
            const todayEarnings = todaysChores.reduce((sum, chore) => chore.completions[todayString] ? sum + chore.value : sum, 0);
            setDailyEarningsForModal(todayEarnings);
            setIsAllChoresDoneModalOpen(true);
            playAllDone();
        }
    }, [chores, prevChores, isAllChoresDoneModalOpen, isKidsMode, playAllDone]);

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
    setParentSettings(prev => ({ ...prev, passcode: data.passcode, defaultBonusValue: prev.defaultBonusValue || 100, customCategories: prev.customCategories || [] }));
    setActiveProfileId(newProfileId);
    setChoresByProfile({ [newProfileId]: [] });
    setEarningsHistoryByProfile({ [newProfileId]: [] });
    setPendingCashOutsByProfile({ [newProfileId]: [] });
    setPastChoreApprovalsByProfile({ [newProfileId]: [] });
    setIsWelcomeModalOpen(false);
    setMode('parent');
  }, [setProfiles, setParentSettings, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile]);
  
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
    setMode('parent'); // Go to parent mode to manage the new child
    setIsAddChildModalOpen(false);
  }, [setProfiles, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setPendingBonusNotificationsByProfile]);


  const handleSwitchToChild = (profileId: string) => {
    setActiveProfileId(profileId);
    setMode('kids');
  };
  
  const handleSwitchToParent = () => setMode('parent');

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
            setParentSettings({ passcode: null, theme: 'light', defaultChoreValue: 20, defaultBonusValue: 100, customCategories: [] });
            setMode(null);
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
    if(profiles.filter(p => p.id !== profileId).length <= 1) {
        setMode(profiles.filter(p => p.id !== profileId).length === 1 ? 'kids' : null);
    } else {
        setMode(null); // Show selector after delete if more than one profile remains
    }
  }, [activeProfileId, setProfiles, setActiveProfileId, setChoresByProfile, setEarningsHistoryByProfile, setPendingCashOutsByProfile, setPastChoreApprovalsByProfile, setParentSettings, setLastAutoCashOut, setPendingBonusNotificationsByProfile, profiles]);

  const handleUpdateParentSettings = useCallback((newSettings: Partial<ParentSettings>) => {
    setParentSettings(prev => ({...prev, ...newSettings}));
  }, [setParentSettings]);

  const handleAttemptSwitchToParentMode = useCallback(() => {
    if (parentSettings.passcode) {
      setIsPasscodeEntryModalOpen(true);
    } else {
      setMode('parent');
    }
  }, [parentSettings.passcode]);

  const handlePasscodeSetupSuccess = (passcode: string) => {
    handleUpdateParentSettings({ passcode });
    setMode('parent');
    setIsPasscodeSetupModalOpen(false);
  };

  const handlePasscodeEntrySuccess = () => {
    setMode('parent');
    setIsPasscodeEntryModalOpen(false);
  };

  const handleOpenForgotPassword = () => {
    setIsPasscodeEntryModalOpen(false);
    setIsForgotPasscodeModalOpen(true);
  };

  const handleForgotPasscodeSuccess = () => {
    handleUpdateParentSettings({ passcode: null });
    setMode('parent');
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
        const dailyChores = chores.filter(c => c.days.includes(dayOfWeek) || c.oneTimeDate === dateString);

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


  const displayMode = isKidsMode ? 'daily' : 'weekly';

  useEffect(() => { if (isKidsMode) setSelectedDate(new Date()); }, [isKidsMode]);

   const filteredChores = useMemo(() => {
    if (!activeProfileId) return [];
    
    const baseChores = (chores.filter(chore => {
        if (displayMode === 'daily') {
            if (chore.type === 'bonus') {
                return chore.completions[formatDate(selectedDate)] !== undefined;
            }
            if (chore.oneTimeDate) {
                return chore.oneTimeDate === formatDate(selectedDate);
            }
            return chore.days.includes(getDayFromDate(selectedDate));
        }
        return true; // Parent weekly view filtering is handled later
    })).sort((a, b) => {
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
    const todaysChores = chores.filter(c => c.days.includes(todayDay) || c.oneTimeDate === todayString);
    const completedCount = todaysChores.filter(c => {
        const state = c.completions[todayString];
        return state === 'completed' || state === 'cashed_out' || state === 'pending_cash_out';
    }).length;
    return { completed: completedCount, total: todaysChores.length };
}, [chores, activeProfileId, isKidsMode]);
  
  const handleReorderChores = useCallback((reorderedChores: Chore[], category: string | null) => {
    if (!activeProfileId) return;

    setChoresByProfile(prev => {
        const currentChores = prev[activeProfileId] || [];
        const otherCategoryChores = currentChores.filter(c => c.category !== category);
        
        const updatedChoresForCategory = reorderedChores.map((chore, index) => ({
            ...chore,
            order: index,
        }));

        return {
            ...prev,
            [activeProfileId]: [...otherCategoryChores, ...updatedChoresForCategory],
        };
    });
  }, [activeProfileId, setChoresByProfile]);


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
    const bonusId = Date.now().toString();
    const choreId = `bonus_${bonusId}`;
    const today = new Date();
    const todayDateString = formatDate(today);

    // Create a pending chore for each selected profile
    setChoresByProfile(prev => {
        const newState = { ...prev };
        selectedProfileIds.forEach(pId => {
            const currentChores = newState[pId] || [];
            const newBonusChore: Chore = {
                id: choreId,
                name: 'Bonus',
                value: amount,
                days: [],
                completions: { [todayDateString]: 'pending_acceptance' as CompletionState },
                icon: 'star_icon',
                category: null,
                order: 99999 + currentChores.length,
                type: 'bonus',
                note: note,
            };
            newState[pId] = [...currentChores, newBonusChore];
        });
        return newState;
    });

    // Cue up notification for child
    const newBonusNotification: BonusNotification = { id: bonusId, amount, note };
    setPendingBonusNotificationsByProfile(prev => {
        const newState = { ...prev };
        selectedProfileIds.forEach(pId => {
            newState[pId] = [...(newState[pId] || []), newBonusNotification];
        });
        return newState;
    });

    // Show confirmation for parent
    const names = profiles.filter(p => selectedProfileIds.includes(p.id)).map(p => p.name).join(', ');
    setBonusAwardedToName(names);
    setIsParentBonusConfirmModalOpen(true);
    
    setIsBonusModalOpen(false);
  }, [profiles, setChoresByProfile, setPendingBonusNotificationsByProfile]);

  const handleShowBonusNotification = (bonus: BonusNotification) => {
      if (!activeProfileId) return;
      playBonusNotify();
      setActiveBonusNotification(bonus);
      setPendingBonusNotificationsByProfile(prev => {
          const newState = { ...prev };
          newState[activeProfileId] = (newState[activeProfileId] || []).filter(b => b.id !== bonus.id);
          return newState;
      });
  };

  const handleAcknowledgeBonus = (bonus: BonusNotification) => {
      if (!activeProfileId) return;
      const choreIdToUpdate = `bonus_${bonus.id}`;
      const todayDateString = formatDate(new Date());

      setChoresByProfile(prev => {
          const profileChores = prev[activeProfileId] || [];
          const updatedChores = profileChores.map(chore => {
              if (chore.id === choreIdToUpdate) {
                  const firstCompletionDate = Object.keys(chore.completions)[0];
                  if (chore.completions[firstCompletionDate] === 'pending_acceptance') {
                      const newCompletions = { ...chore.completions, [firstCompletionDate]: 'completed' as CompletionState };
                      return { ...chore, completions: newCompletions };
                  }
              }
              return chore;
          });
          return { ...prev, [activeProfileId]: updatedChores };
      });

      setActiveBonusNotification(null);
  };


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
  
  const handleGoToCurrentWeek = () => setCurrentDate(new Date());
  
  const isViewingCurrentWeek = useMemo(() => formatDate(getStartOfWeek(new Date())) === formatDate(getStartOfWeek(currentDate)), [currentDate]);

  const weeklyTitle = useMemo(() => {
    // When viewing the current week, the title should reflect the current actual month.
    if (isViewingCurrentWeek) {
      const today = new Date();
      return today.toLocaleDateString('en-US', { month: 'long' });
    }

    // For past weeks, show the month(s) of the week being viewed.
    const start = getStartOfWeek(currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    
    if (startMonth === endMonth) {
        return startMonth;
    }
    
    const startMonthShort = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonthShort = end.toLocaleDateString('en-US', { month: 'short' });

    return `${startMonthShort} / ${endMonthShort}`;
  }, [currentDate, isViewingCurrentWeek]);

  const handleOpenProfileForEditing = useCallback((profileId: string) => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
          setProfileToEdit(profile);
          setIsOptionsMenuOpen(false);
          setIsEditProfileModalOpen(true);
      }
  }, [profiles]);
  
  const isBlurActive = isWelcomeModalOpen || (isThemeModalOpen && isFirstTimeThemePrompt) || mode === null;

    // Find the index of the currently active profile
  const activeProfileIndex = useMemo(() => {
    if (!activeProfileId || !profiles.length) return 0;
    const index = profiles.findIndex(p => p.id === activeProfileId);
    return index === -1 ? 0 : index;
  }, [profiles, activeProfileId]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Ignore swipe if a modal is open or if dragging a chore
    if (isModalOpen || isOptionsMenuOpen || isEditProfileModalOpen || isPasscodeSetupModalOpen || isPasscodeEntryModalOpen || isForgotPasscodeModalOpen || isBonusModalOpen || isHistoryModalOpen || isPendingModalOpen || recordToReview || isPastApprovalModalOpen || isAddChildModalOpen || isThemeModalOpen) {
        return;
    }
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const diffX = currentX - touchStart.x;
    
    if (!isSwiping) {
        const diffY = Math.abs(currentY - touchStart.y);
        if (Math.abs(diffX) > diffY && Math.abs(diffX) > 10) {
            setIsSwiping(true);
        } else if (diffY > Math.abs(diffX)) {
            setTouchStart(null);
            return;
        }
    }
    
    if (isSwiping) {
        e.preventDefault();
        const isFirstProfile = activeProfileIndex === 0;
        const isLastProfile = activeProfileIndex === profiles.length - 1;

        // Dampen the swipe when at the edges
        if ((isFirstProfile && diffX > 0) || (isLastProfile && diffX < 0)) {
            const resistance = 1 + (Math.abs(diffX) / window.innerWidth) * 2;
            setSwipeOffset(diffX / resistance);
            return;
        }

        setSwipeOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !isSwiping) {
        setTouchStart(null);
        setSwipeOffset(0);
        return;
    }

    const diffX = swipeOffset;
    const containerWidth = window.innerWidth;
    
    let newIndex = activeProfileIndex;
    if (Math.abs(diffX) > containerWidth / 4) { 
        if (diffX < 0 && activeProfileIndex < profiles.length - 1) { 
            newIndex++;
        } else if (diffX > 0 && activeProfileIndex > 0) {
            newIndex--;
        }
    }
    
    if (newIndex >= 0 && newIndex < profiles.length) {
        setActiveProfileId(profiles[newIndex].id);
    }

    setIsSwiping(false);
    setTouchStart(null);
    setSwipeOffset(0);
  };
  
  const parentContainerStyle = useMemo(() => {
    if (isKidsMode) return {};
    const baseOffset = -activeProfileIndex * 100;
    const additionalOffset = isSwiping ? swipeOffset : 0;
    
    return {
        transform: `translateX(calc(${baseOffset}vw + ${additionalOffset}px))`,
        transition: isSwiping ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        width: `${profiles.length * 100}vw`,
    };
  }, [activeProfileIndex, swipeOffset, isSwiping, isKidsMode, profiles.length]);


  if (isWelcomeModalOpen) {
      return (
          <div className="min-h-screen text-[var(--text-primary)] relative bg-[var(--bg-primary)]">
             <ThemeStyles />
             <WelcomeModal isOpen={isWelcomeModalOpen} onSave={handleWelcomeSave} />
          </div>
      );
  }
  
  if (mode === null) {
      return (
          <>
            <ThemeStyles />
            <ProfileSelector 
              profiles={profiles}
              onSelectProfile={handleSwitchToChild}
              onAttemptSwitchToParentMode={handleAttemptSwitchToParentMode}
              lastActiveProfileId={activeProfileId}
            />
          </>
      );
  }

  const showAddChorePulse = !isKidsMode && filteredChores.length === 0;

  return (
    <div className={`h-screen flex flex-col text-[var(--text-primary)] relative ${!isKidsMode ? 'overflow-hidden' : ''}`}>
      <ThemeStyles />
      
      {isKidsMode ? (
          <div className="h-full flex flex-col">
              <header className="sticky top-0 z-30 glass-header-container">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 md:py-4">
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
                  <div className="pt-6 md:pt-4">
                    <Header
                      earnings={earnings} isKidsMode={isKidsMode} profile={activeProfile}
                      onCashOut={() => handleCashOut()} onShowHistory={handleShowHistory}
                      isCashOutDisabled={isCashOutDisabled} showCashOutButton={showCashOutButton}
                      weeklyTitle={weeklyTitle}
                      isToday={isToday} selectedDate={currentDate} setSelectedDate={setCurrentDate}
                      isViewingCurrentWeek={isViewingCurrentWeek}
                      handleGoToCurrentWeek={handleGoToCurrentWeek} onUpdateProfileImage={handleUpdateProfileImage}
                      onEditCurrentProfile={handleOpenEditModalForProfile}
                      pendingBonuses={pendingBonuses}
                      onShowBonusNotification={handleShowBonusNotification}
                      profiles={profiles}
                      setActiveProfileId={setActiveProfileId}
                    />
                  </div>
                </div>
              </header>
              <main ref={mainScrollRef} className="flex-1 overflow-y-auto relative scrollbar-hide">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-4">
                    <ChoreList
                      chores={filteredChores}
                      currentWeekDays={currentWeekDays}
                      onToggleCompletion={handleToggleCompletion}
                      onEditChore={isKidsMode ? undefined : handleOpenEditModal}
                      viewMode={displayMode}
                      selectedDate={selectedDate}
                      isKidsMode={isKidsMode}
                      pastChoreApprovals={pastChoreApprovals}
                      onApprovePastChore={isKidsMode ? undefined : handleApprovePastChore}
                      onReorderChores={handleReorderChores}
                    />
                    <div className="h-24" />
                </div>
              </main>
          </div>
      ) : (
          <>
            <MenuBanner 
                isKidsMode={false} 
                profiles={profiles} 
                activeProfileId={activeProfileId}
                onSwitchToChild={handleSwitchToChild}
                onAttemptSwitchToParentMode={handleAttemptSwitchToParentMode}
                pendingCount={pendingCashOuts.length}
                pastApprovalsCount={pastChoreApprovals.length}
                onShowPending={handleOpenPendingModal}
                onShowPastApprovals={() => setIsPastApprovalModalOpen(true)}
                onEditProfile={(p) => handleOpenEditModalForProfile(p)}
                onShowOptionsModal={() => setIsOptionsMenuOpen(true)}
                onShowAddChildModal={() => setIsAddChildModalOpen(true)}
                onShowThemeModal={() => setIsThemeModalOpen(true)}
                potentialEarnings={0}
                showPotentialEarnings={false}
                todaysTotalChores={0}
                todaysCompletedChores={0}
            />
            <div 
                className="flex-grow w-full min-h-0"
                onTouchStart={profiles.length > 1 ? handleTouchStart : undefined}
                onTouchMove={profiles.length > 1 ? handleTouchMove : undefined}
                onTouchEnd={profiles.length > 1 ? handleTouchEnd : undefined}
            >
              <div className="h-full flex" style={parentContainerStyle}>
                  {profiles.map(p => {
                      const profileChores = choresByProfile[p.id] || [];
                      const profileEarnings = calculateEarnings(profileChores);
                      const profilePendingCashOuts = pendingCashOutsByProfile[p.id] || [];
                      const profilePastApprovals = pastChoreApprovalsByProfile[p.id] || [];
                      const profilePendingBonuses = pendingBonusNotificationsByProfile[p.id] || [];
                      
                      const startOfWeek = getStartOfWeek(currentDate);
                      const currentWeekDayStrings = Array.from({ length: 7 }).map((_, i) => {
                          const d = new Date(startOfWeek);
                          d.setDate(startOfWeek.getDate() + i);
                          return formatDate(d);
                      });

                      const profileFilteredChores = profileChores.filter(chore => {
                          if (chore.type === 'bonus') {
                              // For bonuses, check if their completion date is in the currently viewed week
                              const bonusDateString = Object.keys(chore.completions)[0];
                              return bonusDateString ? currentWeekDayStrings.includes(bonusDateString) : false;
                          }
                          if (chore.oneTimeDate) {
                              // For one-time chores, check if their date is in the currently viewed week
                              return currentWeekDayStrings.includes(chore.oneTimeDate);
                          }
                          // It's a recurring chore, always show
                          return true;
                      }).sort((a, b) => {
                          const aIsBonus = a.type === 'bonus'; const bIsBonus = b.type === 'bonus';
                          if (aIsBonus && !bIsBonus) return 1; if (!aIsBonus && bIsBonus) return -1;
                          const aCategoryOrder = a.category ? (CHORE_CATEGORY_ORDER[a.category] ?? 100) : 99;
                          const bCategoryOrder = b.category ? (CHORE_CATEGORY_ORDER[b.category] ?? 100) : 99;
                          if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
                          return (a.order || 0) - (b.order || 0);
                      });

                      const viewProps = {
                          // Props for Header, ChoreList inside ParentProfileView
                          profile: p,
                          chores: profileFilteredChores,
                          earnings: profileEarnings,
                          pendingBonuses: profilePendingBonuses,
                          onCashOut: () => handleCashOut(p.id, profileChores),
                          onShowHistory: handleShowHistory,
                          isCashOutDisabled: profileEarnings <= 0,
                          showCashOutButton: true,
                          weeklyTitle,
                          isToday,
                          selectedDate: currentDate,
                          setSelectedDate: setCurrentDate,
                          isViewingCurrentWeek,
                          handleGoToCurrentWeek,
                          onUpdateProfileImage: (id: string, img: string | null) => handleUpdateProfileImage(id, img),
                          onEditCurrentProfile: (prof: Profile) => handleOpenEditModalForProfile(prof),
                          onShowBonusNotification: handleShowBonusNotification,
                          profiles,
                          setActiveProfileId,
                          currentWeekDays,
                          onToggleCompletion: handleToggleCompletion,
                          onEditChore: handleOpenEditModal,
                          onReorderChores: handleReorderChores,
                          pastChoreApprovals: profilePastApprovals,
                          
                          // Props passed through ParentProfileView to MenuBanner
                          isKidsMode: false,
                          activeProfileId: p.id,
                          onSwitchToChild: handleSwitchToChild,
                          onAttemptSwitchToParentMode: handleAttemptSwitchToParentMode,
                          pendingCount: profilePendingCashOuts.length,
                          pastApprovalsCount: profilePastApprovals.length,
                          onShowPending: handleOpenPendingModal,
                          onShowPastApprovals: () => setIsPastApprovalModalOpen(true),
                          onEditProfile: handleOpenProfileForEditing,
                          onShowOptionsModal: () => setIsOptionsMenuOpen(true),
                          onShowAddChildModal: () => setIsAddChildModalOpen(true),
                          onShowThemeModal: () => setIsThemeModalOpen(true),
                          potentialEarnings: 0,
                          showPotentialEarnings: false,
                          todaysTotalChores: 0,
                          todaysCompletedChores: 0
                      };
                      return (
                        <div key={p.id} className="h-full w-screen flex-shrink-0">
                            <ParentProfileView {...viewProps} />
                        </div>
                      );
                  })}
              </div>
            </div>
          </>
      )}

      {!isKidsMode && (
          <ActionBar 
            onAddChore={handleOpenAddModal} 
            onPayBonus={() => setIsBonusModalOpen(true)} 
            pulseAddChore={showAddChorePulse} 
          />
      )}

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
      <OptionsMenuModal isOpen={isOptionsMenuOpen} onClose={() => setIsOptionsMenuOpen(false)} settings={parentSettings} onUpdateSettings={handleUpdateParentSettings} profiles={profiles} onEditProfile={handleOpenProfileForEditing} onInstallApp={handleInstallApp} canInstall={!!installPrompt} />
      <AddChildModal isOpen={isAddChildModalOpen} onClose={() => setIsAddChildModalOpen(false)} onSave={handleAddChild} />
      <ThemeModal isOpen={isThemeModalOpen} onClose={handleCloseThemeModal} onSave={handleUpdateTheme} currentTheme={themeForModal} isFirstTime={isFirstTimeThemePrompt} />
      <BonusAwardModal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} onAward={handleAwardBonus} profiles={profiles} defaultBonusValue={parentSettings.defaultBonusValue} />
      {activeBonusNotification && <BonusAwardedNotificationModal isOpen={!!activeBonusNotification} onClose={() => setActiveBonusNotification(null)} bonus={activeBonusNotification} onAcknowledge={handleAcknowledgeBonus} />}
      {isParentBonusConfirmModalOpen && <ParentBonusConfirmationModal isOpen={isParentBonusConfirmModalOpen} onClose={() => setIsParentBonusConfirmModalOpen(false)} childName={bonusAwardedToName} />}
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