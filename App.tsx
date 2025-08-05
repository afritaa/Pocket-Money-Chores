

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Chore, Day, EarningsRecord, Profile, ParentSettings, PastChoreApproval, CompletionSnapshot, CompletionState, PayDayConfig, BonusNotification, BeforeInstallPromptEvent } from './types';
import Header from './components/Header';
import ChoreList from './components/ChoreList';
import ChoreFormModal from './components/AddChoreModal';
import { CHORE_CATEGORY_ORDER, DAYS_OF_WEEK } from './constants';
import EarningsHistoryModal from './components/EarningsHistoryModal';
import MenuBanner from './components/MenuBanner';
import PendingCashOutsModal from './components/PendingCashOutsModal';
import CashOutConfirmationModal from './components/CashOutConfirmationModal';
import EditProfileModal from './components/EditProfileModal';
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
import DeviceSetupModal from './components/DeviceSetupModal';
import WelcomeModal from './components/WelcomeModal';
import CashOutRequestNotificationModal from './components/CashOutRequestNotificationModal';
import FullScreenFireworks from './components/FullScreenFireworks';
import { SoundProvider } from './hooks/useSound';


// Helper functions for local storage
const getStoredData = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const setStoredData = <T,>(key: string, value: T): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
    }
};


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
};

interface ParentProfileViewProps {
  profile: Profile;
  chores: Chore[];
  earnings: number;
  pendingBonuses: BonusNotification[];
  onCashOut: () => void;
  onShowHistory: () => void;
  isCashOutDisabled: boolean;
  showCashOutButton: boolean;
  weeklyTitle: string;
  isToday: boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isViewingCurrentWeek: boolean;
  handleGoToCurrentWeek: () => void;
  onUpdateProfileImage: (profileId: string, image: string | null) => void;
  onEditCurrentProfile: (profile: Profile) => void;
  onShowBonusNotification: (bonus: BonusNotification) => void;
  profiles: Profile[];
  setActiveProfileId: (id: string) => void;
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onEditChore: (chore: Chore) => void;
  onReorderChores: (reorderedChores: Chore[], category: string | null) => void;
  onChoreDragStart: () => void;
  onChoreDragEnd: () => void;
  pastChoreApprovals: PastChoreApproval[];
  isKidsMode: boolean;
  onApprovePastChore?: (approvalId: string) => void;
  newlyAddedChoreId: string | null;
}

const ParentProfileView = React.memo(({
  profile, chores, earnings, pendingBonuses, onCashOut, onShowHistory, isCashOutDisabled,
  showCashOutButton, weeklyTitle, isToday, selectedDate, setSelectedDate, isViewingCurrentWeek,
  handleGoToCurrentWeek, onUpdateProfileImage, onEditCurrentProfile, onShowBonusNotification,
  profiles, setActiveProfileId, currentWeekDays, onToggleCompletion, onEditChore, onReorderChores,
  onChoreDragStart, onChoreDragEnd, pastChoreApprovals, isKidsMode, onApprovePastChore, newlyAddedChoreId
}: ParentProfileViewProps) => {
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
                  <Header
                    earnings={earnings} isKidsMode={isKidsMode} profile={profile} onCashOut={onCashOut}
                    onShowHistory={onShowHistory} isCashOutDisabled={isCashOutDisabled}
                    showCashOutButton={showCashOutButton} weeklyTitle={weeklyTitle} isToday={isToday}
                    selectedDate={selectedDate} setSelectedDate={setSelectedDate} isViewingCurrentWeek={isViewingCurrentWeek}
                    handleGoToCurrentWeek={handleGoToCurrentWeek} onUpdateProfileImage={onUpdateProfileImage}
                    onEditCurrentProfile={onEditCurrentProfile} pendingBonuses={pendingBonuses}
                    onShowBonusNotification={onShowBonusNotification} profiles={profiles}
                    setActiveProfileId={setActiveProfileId}
                  />
                </div>
            </header>
            
            <main ref={mainScrollRef} className={`flex-1 overflow-y-auto relative ${parentFadeClass} scrollbar-hide`}>
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <ChoreList
                        chores={chores} currentWeekDays={currentWeekDays}
                        onToggleCompletion={onToggleCompletion} onEditChore={onEditChore}
                        viewMode={displayMode} selectedDate={selectedDate} isKidsMode={isKidsMode}
                        pastChoreApprovals={pastChoreApprovals} onApprovePastChore={onApprovePastChore}
                        onReorderChores={onReorderChores}
                        onChoreDragStart={onChoreDragStart}
                        onChoreDragEnd={onChoreDragEnd}
                        newlyAddedChoreId={newlyAddedChoreId}
                    />
                    <div className="h-24" />
                </div>
            </main>
        </div>
    );
});

const AppContent: React.FC = () => {
  const [deviceType, setDeviceType] = useState<string | null>(() => localStorage.getItem('deviceType'));
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Data states from localStorage
  const [profiles, setProfiles] = useState<Profile[]>(() => getStoredData('profiles', []));
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => getStoredData('activeProfileId', null));
  const [parentSettings, setParentSettings] = useState<ParentSettings>(() => getStoredData('parentSettings', { 
    passcode: null, theme: 'light', defaultChoreValue: 20, defaultBonusValue: 100, customCategories: [],
  }));
  const [choresByProfile, setChoresByProfile] = useState<Record<string, Chore[]>>(() => getStoredData('choresByProfile', {}));
  const [earningsHistoryByProfile, setEarningsHistoryByProfile] = useState<Record<string, EarningsRecord[]>>(() => getStoredData('earningsHistoryByProfile', {}));
  const [pendingCashOutsByProfile, setPendingCashOutsByProfile] = useState<Record<string, EarningsRecord[]>>(() => getStoredData('pendingCashOutsByProfile', {}));
  const [pastChoreApprovalsByProfile, setPastChoreApprovalsByProfile] = useState<Record<string, PastChoreApproval[]>>(() => getStoredData('pastChoreApprovalsByProfile', {}));
  const [pendingBonusNotificationsByProfile, setPendingBonusNotificationsByProfile] = useState<Record<string, BonusNotification[]>>(() => getStoredData('pendingBonusNotificationsByProfile', {}));

  const mainScrollRef = useRef<HTMLElement>(null);

  const [mode, setMode] = useState<'kids' | 'parent' | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [activeBonusNotification, setActiveBonusNotification] = useState<BonusNotification | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  const [isParentBonusConfirmModalOpen, setIsParentBonusConfirmModalOpen] = useState(false);
  const [bonusAwardedToName, setBonusAwardedToName] = useState('');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isCashOutConfirmOpen, setIsCashOutConfirmOpen] = useState(false);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);
  const [cashOutRequestToNotify, setCashOutRequestToNotify] = useState<EarningsRecord | null>(null);
  const [notifyingProfile, setNotifyingProfile] = useState<Profile | null>(null);

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

  // New state for dnd-kit drag state
  const [isDraggingChore, setIsDraggingChore] = useState(false);

  // New states for animations
  const [newlyAddedChoreId, setNewlyAddedChoreId] = useState<string | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);

  // Effects to persist state changes to localStorage
  useEffect(() => { setStoredData('profiles', profiles); }, [profiles]);
  useEffect(() => { setStoredData('activeProfileId', activeProfileId); }, [activeProfileId]);
  useEffect(() => { setStoredData('parentSettings', parentSettings); }, [parentSettings]);
  useEffect(() => { setStoredData('choresByProfile', choresByProfile); }, [choresByProfile]);
  useEffect(() => { setStoredData('earningsHistoryByProfile', earningsHistoryByProfile); }, [earningsHistoryByProfile]);
  useEffect(() => { setStoredData('pendingCashOutsByProfile', pendingCashOutsByProfile); }, [pendingCashOutsByProfile]);
  useEffect(() => { setStoredData('pastChoreApprovalsByProfile', pastChoreApprovalsByProfile); }, [pastChoreApprovalsByProfile]);
  useEffect(() => { setStoredData('pendingBonusNotificationsByProfile', pendingBonusNotificationsByProfile); }, [pendingBonusNotificationsByProfile]);
  
  // Effect to set initial mode
  useEffect(() => {
    if (isDataLoading) {
      if (mode !== null) return;

      if (deviceType === 'parent') {
          setMode('parent');
      } else if (deviceType === 'child') {
          if (profiles.length > 1) {
              setMode(null); // Show profile selector
          } else if (profiles.length === 1) {
              if(!activeProfileId) setActiveProfileId(profiles[0].id);
              setMode('kids');
          } else {
              setMode('parent');
          }
      } else if(deviceType) {
          setMode('parent'); // Fallback for any other deviceType
      }
      
      if (profiles.length === 0 && deviceType && !isAddChildModalOpen && !isWelcomeModalOpen) {
          setIsAddChildModalOpen(true);
      }
      setIsDataLoading(false);
    }
  }, [deviceType, profiles, mode, isDataLoading, activeProfileId, isAddChildModalOpen, isWelcomeModalOpen]);

  const isKidsMode = useMemo(() => mode === 'kids', [mode]);

  // Listener for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
      if (!installPrompt) return;
      await installPrompt.prompt();
      setInstallPrompt(null);
      setIsOptionsMenuOpen(false);
  };
  
  const handleResetApp = () => {
    const confirmation = window.confirm("Are you sure you want to reset the app? This will delete all profiles, chores, and history permanently.");
    if (confirmation) {
      localStorage.clear();
      window.location.reload();
    }
  }

  // Derived state for the active profile
  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);
  const chores = useMemo(() => (activeProfileId ? choresByProfile[activeProfileId] : []) || [], [choresByProfile, activeProfileId]);
  const earningsHistory = useMemo(() => (activeProfileId ? earningsHistoryByProfile[activeProfileId] : []) || [], [earningsHistoryByProfile, activeProfileId]);
  const pendingCashOuts = useMemo(() => (activeProfileId ? pendingCashOutsByProfile[activeProfileId] : []) || [], [pendingCashOutsByProfile, activeProfileId]);
  const pastChoreApprovals = useMemo(() => (activeProfileId ? pastChoreApprovalsByProfile[activeProfileId] : []) || [], [pastChoreApprovalsByProfile, activeProfileId]);
  const pendingBonuses = useMemo(() => (activeProfileId ? pendingBonusNotificationsByProfile[activeProfileId] : []) || [], [pendingBonusNotificationsByProfile, activeProfileId]);
  
  // Effect to set the active theme on the body and update browser theme color
  useEffect(() => {
    let currentTheme = 'light';
    if (isKidsMode) {
        if (activeProfile) currentTheme = activeProfile.theme;
    } else {
        currentTheme = parentSettings.theme || 'light';
    }
    document.body.setAttribute('data-theme', currentTheme);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themeColors[currentTheme] || '#f1f5f9');
    }
  }, [isKidsMode, activeProfile, parentSettings.theme]);

  // Effect to automatically refresh the page when the date changes
  useEffect(() => {
    const mountedDateString = formatDate(new Date());
    const checkDateAndRefresh = () => { if (mountedDateString !== formatDate(new Date())) window.location.reload(); };
    const intervalId = setInterval(checkDateAndRefresh, 30000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkDateAndRefresh(); });
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
        const todaysChores = chores.filter(c => c.days.includes(todayDay));
        if (todaysChores.length === 0) return;
        const areAllDoneNow = todaysChores.every(c => c.completions[todayString]);
        if (areAllDoneNow) {
            const todayEarnings = todaysChores.reduce((sum, chore) => chore.completions[todayString] ? sum + chore.value : sum, 0);
            setDailyEarningsForModal(todayEarnings);
            setIsAllChoresDoneModalOpen(true);
        }
    }, [chores, prevChores, isAllChoresDoneModalOpen, isKidsMode]);

  const isFirstTimeThemePrompt = useMemo(() => isKidsMode && activeProfile && !activeProfile.hasSeenThemePrompt, [isKidsMode, activeProfile]);

  useEffect(() => {
    if (isFirstTimeThemePrompt) {
      setTimeout(() => setIsThemeModalOpen(true), 500);
    }
  }, [isFirstTimeThemePrompt]);

  const handleCloseThemeModal = () => {
    if (isFirstTimeThemePrompt && activeProfileId) {
        handleUpdateProfile({ ...activeProfile!, hasSeenThemePrompt: true });
    }
    setIsThemeModalOpen(false);
  };
  
  const handleAddChild = useCallback((data: Omit<Profile, 'id' | 'theme' | 'hasSeenThemePrompt' | 'showPotentialEarnings'>) => {
    const newProfile: Profile = {
      ...data,
      id: crypto.randomUUID(),
      theme: 'light', 
      hasSeenThemePrompt: false,
      showPotentialEarnings: true,
    };
    setProfiles(p => [...p, newProfile]);
    
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 5000);

    const deviceType = localStorage.getItem('deviceType');
    if (deviceType === 'child' && profiles.length === 0) {
        setActiveProfileId(newProfile.id);
        setMode('kids');
    } else {
        setActiveProfileId(newProfile.id);
        setMode('parent');
    }
    setIsAddChildModalOpen(false);
  }, [profiles]);

  const handleSwitchToChild = (profileId: string) => { setActiveProfileId(profileId); setMode('kids'); };
  
  const handleSwitchToParent = () => setMode('parent');

  const handleOpenEditModalForProfile = useCallback((profile: Profile) => { setProfileToEdit(profile); setIsEditProfileModalOpen(true); }, []);

  const handleUpdateProfile = useCallback((updatedProfileData: Profile) => {
    setProfiles(p => p.map(profile => profile.id === updatedProfileData.id ? updatedProfileData : profile));
    setIsEditProfileModalOpen(false);
    setProfileToEdit(null);
  }, []);
  
  const handleUpdateProfileImage = useCallback((profileId: string, image: string | null) => {
    setProfiles(p => p.map(profile => profile.id === profileId ? { ...profile, image } : profile));
  }, []);
  
  const handleUpdateTheme = useCallback((theme: string) => {
    if (isKidsMode) {
        if (!activeProfileId) return;
        setProfiles(p => p.map(profile => profile.id === activeProfileId ? { ...profile, theme } : profile));
    } else {
        setParentSettings(s => ({ ...s, theme }));
    }
  }, [isKidsMode, activeProfileId]);

  const handleDeleteProfile = useCallback((profileId: string) => {
    setProfiles(p => p.filter(profile => profile.id !== profileId));
    
    const cleanup = (data: Record<string, any>) => {
      const newData = { ...data };
      delete newData[profileId];
      return newData;
    };
    
    setChoresByProfile(cleanup);
    setEarningsHistoryByProfile(cleanup);
    setPendingCashOutsByProfile(cleanup);
    setPastChoreApprovalsByProfile(cleanup);
    setPendingBonusNotificationsByProfile(cleanup);

    if (activeProfileId === profileId) {
      setActiveProfileId(profiles.length > 1 ? profiles.filter(p => p.id !== profileId)[0].id : null);
    }
    
    setIsEditProfileModalOpen(false);
    setProfileToEdit(null);
  }, [activeProfileId, profiles]);

  const handleUpdateParentSettings = useCallback((newSettings: Partial<ParentSettings>) => {
    setParentSettings(s => ({...s, ...newSettings}));
  }, []);

  const handleAddCustomCategory = useCallback((newCategory: string) => {
    setParentSettings(s => ({...s, customCategories: [...(s.customCategories || []), newCategory]}));
  }, []);
  
  const currentWeekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => { const date = new Date(start); date.setDate(start.getDate() + i); return date; });
  }, [currentDate]);
  
  const calculateEarnings = useCallback((chores: Chore[]) => {
    return chores.reduce((total, chore) => {
      return total + Object.entries(chore.completions).reduce((sum, [, state]) => (state === 'completed' ? sum + chore.value : sum), 0);
    }, 0);
  }, []);

  const earnings = useMemo(() => calculateEarnings(chores), [chores, calculateEarnings]);

  const potentialEarnings = useMemo(() => {
    if (!activeProfile?.showPotentialEarnings || !activeProfile.payDayConfig.day) return 0;
    const { mode, day: payDayString } = activeProfile.payDayConfig;
    if (mode === 'anytime') return 0;
    const currentEarnings = calculateEarnings(chores);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const payDayIndex = DAYS_OF_WEEK.indexOf(payDayString);
    let daysUntilPayday = payDayIndex - today.getDay();
    if (daysUntilPayday < 0) daysUntilPayday += 7;
    const nextPayDate = new Date(today); nextPayDate.setDate(today.getDate() + daysUntilPayday);
    let futurePotential = 0;
    const loopDate = new Date(today);
    while(loopDate <= nextPayDate) {
        const dateString = formatDate(loopDate);
        const dailyChores = chores.filter(c => c.days.includes(getDayFromDate(loopDate)));
        for (const chore of dailyChores) {
            const completionState = chore.completions[dateString];
            if (completionState !== 'completed' && completionState !== 'cashed_out' && completionState !== 'pending_cash_out') futurePotential += chore.value;
        }
        loopDate.setDate(loopDate.getDate() + 1);
    }
    return currentEarnings + futurePotential;
  }, [chores, activeProfile, calculateEarnings]);


  const displayMode = isKidsMode ? 'daily' : 'weekly';

  useEffect(() => { if (isKidsMode) setSelectedDate(new Date()); }, [isKidsMode]);

   const filteredChores = useMemo(() => {
    if (!activeProfileId) return [];
    const choresToFilter = displayMode === 'daily'
        ? chores.filter(chore => chore.type === 'bonus' ? chore.completions[formatDate(selectedDate)] !== undefined : chore.days.includes(getDayFromDate(selectedDate)))
        : chores;

    return [...choresToFilter].sort((a, b) => {
        const aIsBonus = a.type === 'bonus';
        const bIsBonus = b.type === 'bonus';
        if (aIsBonus && !bIsBonus) return 1;
        if (!aIsBonus && bIsBonus) return -1;
        const aCategoryOrder = a.category ? (CHORE_CATEGORY_ORDER[a.category] ?? 100) : 99;
        const bCategoryOrder = b.category ? (CHORE_CATEGORY_ORDER[b.category] ?? 100) : 99;
        if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
        return (a.order || 0) - (b.order || 0);
    });
  }, [chores, displayMode, selectedDate, activeProfileId]);

  const todaysChoresStats = useMemo(() => {
    if (!activeProfileId || !isKidsMode) return { completed: 0, total: 0 };
    const todayString = formatDate(new Date());
    const todaysChores = chores.filter(c => c.days.includes(getDayFromDate(new Date())));
    const completedCount = todaysChores.filter(c => ['completed', 'cashed_out', 'pending_cash_out'].includes(c.completions[todayString])).length;
    return { completed: completedCount, total: todaysChores.length };
}, [chores, activeProfileId, isKidsMode]);
  
  const handleReorderChores = useCallback((reorderedChores: Chore[], category: string | null) => {
    if (!activeProfileId) return;
    setChoresByProfile(prev => {
        const currentChores = prev[activeProfileId] || [];
        const otherCategoryChores = currentChores.filter(c => c.category !== category);
        const updatedChores = [...otherCategoryChores, ...reorderedChores.map((c, i) => ({...c, order: i}))];
        return { ...prev, [activeProfileId]: updatedChores };
    });
  }, [activeProfileId]);


  const handleOpenAddModal = () => { setChoreToEdit(null); setIsModalOpen(true); };
  const handleOpenEditModal = (chore: Chore) => { setChoreToEdit(chore); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setChoreToEdit(null); };

  const handleSaveChore = useCallback((choreData: Omit<Chore, 'id' | 'completions' | 'order'> & { note?: string }) => {
    if (!activeProfileId) return;
    setChoresByProfile(prev => {
      const currentChores = prev[activeProfileId] || [];
      if (choreToEdit) {
        const updatedChores = currentChores.map(c => c.id === choreToEdit.id ? { ...c, ...choreData } : c);
        return { ...prev, [activeProfileId]: updatedChores };
      } else {
        const newChore: Chore = { ...choreData, id: crypto.randomUUID(), completions: {}, order: currentChores.filter(c => c.category === choreData.category).length };
        setNewlyAddedChoreId(newChore.id);
        setTimeout(() => setNewlyAddedChoreId(null), 2000);
        return { ...prev, [activeProfileId]: [...currentChores, newChore] };
      }
    });
    handleCloseModal();
  }, [choreToEdit, activeProfileId]);

  const handleDeleteChore = useCallback((choreId: string) => {
    if (!activeProfileId) return;
    setChoresByProfile(prev => ({...prev, [activeProfileId]: (prev[activeProfileId] || []).filter(c => c.id !== choreId)}));
    handleCloseModal();
  }, [activeProfileId]);

  const handleToggleCompletion = useCallback((choreId: string, date: Date) => {
    if (!activeProfileId) return;
    const dateString = formatDate(date);
    const chore = (choresByProfile[activeProfileId] || []).find(c => c.id === choreId);
    if (!chore || chore.type === 'bonus') return;
    
    const currentCompletionState = chore.completions[dateString];
    if (isKidsMode && (currentCompletionState === 'cashed_out' || currentCompletionState === 'pending_cash_out')) return;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isPast = date.getTime() < today.getTime();
    
    if (isKidsMode && isPast && !currentCompletionState) {
        const newApproval: PastChoreApproval = { id: crypto.randomUUID(), choreId, choreName: chore.name, date: dateString };
        setPastChoreApprovalsByProfile(p => ({...p, [activeProfileId]: [...(p[activeProfileId] || []), newApproval]}));
        return;
    }
    
    const newCompletions = { ...chore.completions };
    if (currentCompletionState) delete newCompletions[dateString];
    else newCompletions[dateString] = 'completed';
    setChoresByProfile(p => ({...p, [activeProfileId]: (p[activeProfileId] || []).map(c => c.id === choreId ? {...c, completions: newCompletions} : c)}));
}, [isKidsMode, activeProfileId, choresByProfile]);
  
  const handleCashOut = useCallback(async (targetProfileId?: string, targetChores?: Chore[]) => {
    const pId = targetProfileId || activeProfileId;
    if (!pId) return;
    const pChores = targetChores || chores;
    const currentEarnings = calculateEarnings(pChores);
    if (currentEarnings <= 0) return;

    const snapshot: CompletionSnapshot[] = [];
    pChores.forEach(chore => Object.entries(chore.completions).forEach(([dateString, state]) => {
      if (state === 'completed') {
          snapshot.push({ choreId: chore.id, choreName: chore.name, choreValue: chore.value, date: dateString, isCompleted: true });
      }
    }));

    const newRecord: EarningsRecord = { id: crypto.randomUUID(), date: formatDate(new Date()), amount: currentEarnings, completionsSnapshot: snapshot, type: 'chore', seenByParent: !isKidsMode };
    setPendingCashOutsByProfile(p => ({ ...p, [pId]: [...(p[pId] || []), newRecord] }));
    
    if (isKidsMode && pId === activeProfileId) { setCashedOutAmount(currentEarnings); setIsCashOutConfirmOpen(true); }
    
    setChoresByProfile(p => {
        const profileChores = p[pId] || [];
        const updatedChores = profileChores.map(chore => {
            const newCompletions = {...chore.completions};
            let updated = false;
            Object.keys(newCompletions).forEach(dateString => {
                if(newCompletions[dateString] === 'completed') {
                    newCompletions[dateString] = 'pending_cash_out';
                    updated = true;
                }
            });
            return updated ? {...chore, completions: newCompletions} : chore;
        });
        return {...p, [pId]: updatedChores};
    });

  }, [activeProfileId, chores, calculateEarnings, isKidsMode]);

  const handleAwardBonus = useCallback((selectedProfileIds: string[], amount: number, note: string) => {
    const bonusId = crypto.randomUUID();
    const choreId = `bonus_${bonusId}`;
    const todayDateString = formatDate(new Date());

    const newBonusChore: Chore = {
        id: choreId, name: 'Bonus', value: amount, days: [getDayFromDate(new Date())],
        completions: { [todayDateString]: 'pending_acceptance' },
        icon: 'star_icon', category: null, order: 9999, type: 'bonus', note: note,
    };
    
    selectedProfileIds.forEach(pId => {
      setChoresByProfile(p => ({...p, [pId]: [...(p[pId] || []), newBonusChore]}));
      const bonusNotif: BonusNotification = { id: bonusId, amount, note };
      setPendingBonusNotificationsByProfile(p => ({...p, [pId]: [...(p[pId] || []), bonusNotif]}));
    });

    const names = profiles.filter(p => selectedProfileIds.includes(p.id)).map(p => p.name).join(', ');
    setBonusAwardedToName(names);
    setIsParentBonusConfirmModalOpen(true);
    setIsBonusModalOpen(false);
  }, [profiles]);

  const handleShowBonusNotification = (bonus: BonusNotification) => {
      if (!activeProfileId) return;
      setActiveBonusNotification(bonus);
      setPendingBonusNotificationsByProfile(p => ({...p, [activeProfileId]: (p[activeProfileId] || []).filter(b => b.id !== bonus.id)}));
  };

  const handleAcknowledgeBonus = (bonus: BonusNotification) => {
      if (!activeProfileId) return;
      const choreIdToUpdate = `bonus_${bonus.id}`;
      setChoresByProfile(p => {
        const profileChores = p[activeProfileId] || [];
        const updatedChores = profileChores.map(c => {
          if (c.id === choreIdToUpdate) {
            const newCompletions = {...c.completions};
            const firstCompletionDate = Object.keys(newCompletions)[0];
            if (newCompletions[firstCompletionDate] === 'pending_acceptance') {
                newCompletions[firstCompletionDate] = 'completed';
                return {...c, completions: newCompletions};
            }
          }
          return c;
        });
        return {...p, [activeProfileId]: updatedChores};
      });
      setActiveBonusNotification(null);
  };

  const handleShowHistory = () => setIsHistoryModalOpen(true);
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);
  const handleOpenPendingModal = () => setIsPendingModalOpen(true);
  const handleClosePendingModal = () => setIsPendingModalOpen(false);
  
  const handleOpenReviewModal = (record: EarningsRecord) => { setRecordToReview(record); setIsPendingModalOpen(false); };

  const handleApproveReviewedCashOut = useCallback((reviewedRecord: EarningsRecord) => {
    if (!activeProfileId) return;
    
    setEarningsHistoryByProfile(p => ({...p, [activeProfileId]: [...(p[activeProfileId] || []), {...reviewedRecord, id: crypto.randomUUID()}]}));
    setPendingCashOutsByProfile(p => ({...p, [activeProfileId]: (p[activeProfileId] || []).filter(r => r.id !== reviewedRecord.id)}));

    const snapshotMap = new Map<string, Set<string>>();
    reviewedRecord.completionsSnapshot?.forEach(item => {
        if (item.isCompleted) {
            if (!snapshotMap.has(item.choreId)) snapshotMap.set(item.choreId, new Set());
            snapshotMap.get(item.choreId)!.add(item.date);
        }
    });

    setChoresByProfile(p => {
      const profileChores = p[activeProfileId] || [];
      const updatedChores = profileChores.map(chore => {
          if (snapshotMap.has(chore.id)) {
              const newCompletions = {...chore.completions};
              snapshotMap.get(chore.id)!.forEach(dateString => {
                  newCompletions[dateString] = 'cashed_out';
              });
              return {...chore, completions: newCompletions};
          }
          return chore;
      });
      return {...p, [activeProfileId]: updatedChores};
    });
    
    setRecordToReview(null);
  }, [activeProfileId]);
  
  const handleUpdateHistoryAmount = useCallback((recordId: string, newAmount: number) => {
    if (!activeProfileId) return;
    setEarningsHistoryByProfile(p => ({...p, [activeProfileId]: (p[activeProfileId] || []).map(r => r.id === recordId ? {...r, amount: newAmount} : r)}));
  }, [activeProfileId]);

  const handleApprovePastChore = useCallback((approvalId: string) => {
    if (!activeProfileId) return;
    const approval = pastChoreApprovals.find(a => a.id === approvalId);
    if (!approval) return;
    
    setChoresByProfile(p => ({...p, [activeProfileId]: (p[activeProfileId] || []).map(c => c.id === approval.choreId ? {...c, completions: {...c.completions, [approval.date]: 'completed'}} : c)}));
    setPastChoreApprovalsByProfile(p => ({...p, [activeProfileId]: (p[activeProfileId] || []).filter(a => a.id !== approvalId)}));
  }, [activeProfileId, pastChoreApprovals]);

  const handleDismissPastChore = useCallback((approvalId: string) => {
    if (!activeProfileId) return;
    setPastChoreApprovalsByProfile(p => ({...p, [activeProfileId]: (p[activeProfileId] || []).filter(a => a.id !== approvalId)}));
  }, [activeProfileId]);

  const handleApproveAllPastChores = useCallback(() => {
    if (!activeProfileId || pastChoreApprovals.length === 0) return;
    
    setChoresByProfile(p => {
        const choreUpdates: Record<string, any> = {};
        pastChoreApprovals.forEach(approval => {
            if (!choreUpdates[approval.choreId]) choreUpdates[approval.choreId] = {};
            choreUpdates[approval.choreId][approval.date] = 'completed';
        });
        const updatedChores = (p[activeProfileId] || []).map(c => choreUpdates[c.id] ? {...c, completions: {...c.completions, ...choreUpdates[c.id]}} : c);
        return {...p, [activeProfileId]: updatedChores};
    });

    setPastChoreApprovalsByProfile(p => ({...p, [activeProfileId]: []}));
  }, [activeProfileId, pastChoreApprovals]);

  const handleDismissAllPastChores = useCallback(() => {
    if (!activeProfileId) return;
    setPastChoreApprovalsByProfile(p => ({...p, [activeProfileId]: []}));
  }, [activeProfileId]);

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

  const handleGoToCurrentWeek = () => setCurrentDate(new Date());
  
  const isViewingCurrentWeek = useMemo(() => formatDate(getStartOfWeek(new Date())) === formatDate(getStartOfWeek(currentDate)), [currentDate]);

  const weeklyTitle = useMemo(() => {
    if (isViewingCurrentWeek) return new Date().toLocaleDateString('en-US', { month: 'long' });
    const start = getStartOfWeek(currentDate);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    if (startMonth === endMonth) return startMonth;
    return `${start.toLocaleDateString('en-US', { month: 'short' })} / ${end.toLocaleDateString('en-US', { month: 'short' })}`;
  }, [currentDate, isViewingCurrentWeek]);

  const handleOpenProfileForEditing = useCallback((profileId: string) => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
          setProfileToEdit(profile);
          setIsOptionsMenuOpen(false);
          setIsEditProfileModalOpen(true);
      }
  }, [profiles]);
  
  const sortedChoresByProfile = useMemo(() => {
    return Object.fromEntries(
        Object.entries(choresByProfile).map(([profileId, chores]) => {
            const sorted = [...(chores || [])].sort((a, b) => {
                const aIsBonus = a.type === 'bonus';
                const bIsBonus = b.type === 'bonus';
                if (aIsBonus && !bIsBonus) return 1;
                if (!aIsBonus && bIsBonus) return -1;
                const aCategoryOrder = a.category ? (CHORE_CATEGORY_ORDER[a.category] ?? 100) : 99;
                const bCategoryOrder = b.category ? (CHORE_CATEGORY_ORDER[b.category] ?? 100) : 99;
                if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
                return (a.order || 0) - (b.order || 0);
            });
            return [profileId, sorted];
        })
    );
  }, [choresByProfile]);

  const isBlurActive = isDataLoading || (isThemeModalOpen && isFirstTimeThemePrompt);

    // Find the index of the currently active profile
  const activeProfileIndex = useMemo(() => {
    if (!activeProfileId || !profiles.length) return 0;
    const index = profiles.findIndex(p => p.id === activeProfileId);
    return index === -1 ? 0 : index;
  }, [profiles, activeProfileId]);
  
  const handleChoreDragStart = useCallback(() => {
      setIsDraggingChore(true);
  }, []);

  const handleChoreDragEnd = useCallback(() => {
      setIsDraggingChore(false);
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDraggingChore || isModalOpen || isOptionsMenuOpen || isEditProfileModalOpen || isBonusModalOpen || isHistoryModalOpen || isPendingModalOpen || recordToReview || isPastApprovalModalOpen || isAddChildModalOpen || isThemeModalOpen) return;
    
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingChore) return;
    if (!touchStart) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const diffX = currentX - touchStart.x;
    
    if (!isSwiping) {
        if (Math.abs(diffX) > Math.abs(currentY - touchStart.y) && Math.abs(diffX) > 10) {
            setIsSwiping(true);
            document.body.classList.add('dragging');
        } else if (Math.abs(currentY - touchStart.y) > Math.abs(diffX)) { 
            setTouchStart(null); 
            return; 
        }
    }
    if (isSwiping) {
        e.preventDefault();
        const isFirstProfile = activeProfileIndex === 0;
        const isLastProfile = activeProfileIndex === profiles.length - 1;
        if ((isFirstProfile && diffX > 0) || (isLastProfile && diffX < 0)) {
            setSwipeOffset(diffX / (1 + (Math.abs(diffX) / window.innerWidth) * 2));
        } else {
            setSwipeOffset(diffX);
        }
    }
  };

  const handleTouchEnd = () => {
    document.body.classList.remove('dragging');
    if (isDraggingChore) {
        setIsSwiping(false);
        setTouchStart(null);
        setSwipeOffset(0);
        return;
    }
    if (!touchStart || !isSwiping) { 
        setTouchStart(null); 
        setSwipeOffset(0); 
        return; 
    }
    let newIndex = activeProfileIndex;
    if (Math.abs(swipeOffset) > window.innerWidth / 4) { 
        if (swipeOffset < 0 && activeProfileIndex < profiles.length - 1) newIndex++;
        else if (swipeOffset > 0 && activeProfileIndex > 0) newIndex--;
    }
    if (newIndex >= 0 && newIndex < profiles.length) setActiveProfileId(profiles[newIndex].id);
    setIsSwiping(false); 
    setTouchStart(null); 
    setSwipeOffset(0);
  };
  
  const parentContainerStyle = useMemo(() => {
    if (isKidsMode) return {};
    return {
        transform: `translateX(calc(${-activeProfileIndex * 100}vw + ${isSwiping ? swipeOffset : 0}px))`,
        transition: isSwiping ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        width: `${profiles.length * 100}vw`,
    };
  }, [activeProfileIndex, swipeOffset, isSwiping, isKidsMode, profiles.length]);
  
    useEffect(() => {
      if (mode === 'parent' && profiles.length > 0) {
        if (cashOutRequestToNotify) return;

        for (const profile of profiles) {
          const pendingRequests = pendingCashOutsByProfile[profile.id] || [];
          const unseenRequest = pendingRequests.find(r => !r.seenByParent);
          if (unseenRequest) {
            setCashOutRequestToNotify(unseenRequest);
            setNotifyingProfile(profile);
            break; 
          }
        }
      }
  }, [mode, profiles, pendingCashOutsByProfile, cashOutRequestToNotify]);
  
  const markCashOutRequestAsSeen = (profileId: string, recordId: string) => {
    setPendingCashOutsByProfile(p => {
        const profileCashouts = p[profileId] || [];
        const updatedCashouts = profileCashouts.map(r => r.id === recordId ? { ...r, seenByParent: true } : r);
        return { ...p, [profileId]: updatedCashouts };
    });
  };

  const handleDismissCashOutNotification = () => {
    if (cashOutRequestToNotify && notifyingProfile) {
        markCashOutRequestAsSeen(notifyingProfile.id, cashOutRequestToNotify.id);
    }
    setCashOutRequestToNotify(null);
    setNotifyingProfile(null);
  };

  const handleViewCashOutRequest = () => {
    if (cashOutRequestToNotify && notifyingProfile) {
        markCashOutRequestAsSeen(notifyingProfile.id, cashOutRequestToNotify.id);
        setActiveProfileId(notifyingProfile.id);
        setRecordToReview(cashOutRequestToNotify);
    }
    setCashOutRequestToNotify(null);
    setNotifyingProfile(null);
  };

  if (isDataLoading) {
    return (
        <div className="min-h-screen text-[var(--text-primary)] relative bg-[var(--bg-primary)] flex items-center justify-center">
           <ThemeStyles />
           <p>Loading...</p>
        </div>
    );
  }

  if (!deviceType) {
    return (
      <>
        <ThemeStyles />
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
          <DeviceSetupModal
            hasProfiles={profiles.length > 0}
            onSetParentDevice={() => {
              localStorage.setItem('deviceType', 'parent');
              setDeviceType('parent');
              setMode('parent');
            }}
            onSetChildDevice={() => {
              localStorage.setItem('deviceType', 'child');
              setDeviceType('child');
            }}
            onAddFirstChild={() => {
              setIsAddChildModalOpen(true);
            }}
          />
        </div>
      </>
    );
  }
  
  if (mode === null) {
    return (
        <>
          <ThemeStyles />
          <ProfileSelector 
            profiles={profiles}
            onSelectProfile={handleSwitchToChild}
            onAttemptSwitchToParentMode={() => setMode('parent')}
            lastActiveProfileId={activeProfileId}
          />
        </>
    );
  }

  const showAddChorePulse = !isKidsMode && filteredChores.length === 0;
  const themeForModal = isKidsMode ? (activeProfile?.theme || 'light') : (parentSettings.theme || 'light');

  return (
    <div className={`h-screen flex flex-col text-[var(--text-primary)] relative ${!isKidsMode ? 'overflow-hidden' : ''}`}>
      <ThemeStyles />
      {showFireworks && <FullScreenFireworks />}
      
      {isKidsMode ? (
          <div className="h-full flex flex-col">
              <header className="sticky top-0 z-30">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 md:py-4">
                  <MenuBanner
                    isKidsMode={isKidsMode} onSwitchToChild={handleSwitchToChild}
                    onSwitchToParent={handleSwitchToParent}
                    profiles={profiles} activeProfileId={activeProfileId}
                    onShowOptionsModal={() => setIsOptionsMenuOpen(true)}
                    onShowAddChildModal={() => setIsAddChildModalOpen(true)} onShowThemeModal={() => setIsThemeModalOpen(true)}
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
                      onChoreDragStart={handleChoreDragStart}
                      onChoreDragEnd={handleChoreDragEnd}
                    />
                    <div className="h-24" />
                </div>
              </main>
          </div>
      ) : (
          <>
            <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8">
              <MenuBanner 
                  isKidsMode={false} 
                  profiles={profiles} 
                  activeProfileId={activeProfileId}
                  onSwitchToChild={handleSwitchToChild}
                  onSwitchToParent={() => {}}
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
            </div>
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
                      const profilePendingBonuses = pendingBonusNotificationsByProfile[p.id] || [];
                      const profilePastApprovals = pastChoreApprovalsByProfile[p.id] || [];
                      const profileFilteredChores = sortedChoresByProfile[p.id] || [];
                      
                      const viewProps: ParentProfileViewProps = {
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
                          onUpdateProfileImage: handleUpdateProfileImage,
                          onEditCurrentProfile: handleOpenEditModalForProfile,
                          onShowBonusNotification: handleShowBonusNotification,
                          profiles,
                          setActiveProfileId,
                          currentWeekDays,
                          onToggleCompletion: handleToggleCompletion,
                          onEditChore: handleOpenEditModal,
                          onReorderChores: handleReorderChores,
                          onChoreDragStart: handleChoreDragStart,
                          onChoreDragEnd: handleChoreDragEnd,
                          pastChoreApprovals: profilePastApprovals,
                          isKidsMode: false,
                          onApprovePastChore: handleApprovePastChore,
                          newlyAddedChoreId,
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
      
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onGetStarted={() => {
            setIsWelcomeModalOpen(false);
            if (profiles.length === 0) {
                setIsAddChildModalOpen(true);
            }
        }}
        isNewUser={profiles.length === 0}
      />
      <EarningsHistoryModal isOpen={isHistoryModalOpen} onClose={handleCloseHistoryModal} history={earningsHistory} onUpdateAmount={handleUpdateHistoryAmount} />
      <PendingCashOutsModal isOpen={isPendingModalOpen} onClose={handleClosePendingModal} pendingCashOuts={pendingCashOuts} onOpenReview={handleOpenReviewModal} />
      {recordToReview && <ReviewCashOutModal isOpen={!!recordToReview} onClose={() => setRecordToReview(null)} record={recordToReview} onApprove={handleApproveReviewedCashOut} profileName={activeProfile?.name || ''} />}
      <PastChoresApprovalModal isOpen={isPastApprovalModalOpen} onClose={() => setIsPastApprovalModalOpen(false)} approvals={pastChoreApprovals} onApprove={handleApprovePastChore} onDismiss={handleDismissPastChore} onApproveAll={handleApproveAllPastChores} onDismissAll={handleDismissAllPastChores} />
      <CashOutConfirmationModal isOpen={isCashOutConfirmOpen} onClose={() => setIsCashOutConfirmOpen(false)} amount={cashedOutAmount} />
      {cashOutRequestToNotify && notifyingProfile && (
        <CashOutRequestNotificationModal
          isOpen={!!cashOutRequestToNotify}
          onClose={handleDismissCashOutNotification}
          onView={handleViewCashOutRequest}
          record={cashOutRequestToNotify}
          profileName={notifyingProfile.name}
        />
      )}
      <AllChoresDoneModal isOpen={isAllChoresDoneModalOpen} onClose={() => setIsAllChoresDoneModalOpen(false)} dailyAmount={dailyEarningsForModal} />
      {isEditProfileModalOpen && profileToEdit && (<EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => { setIsEditProfileModalOpen(false); setProfileToEdit(null); }} onSave={handleUpdateProfile} onDelete={handleDeleteProfile} initialData={profileToEdit} />)}
      <OptionsMenuModal isOpen={isOptionsMenuOpen} onClose={() => setIsOptionsMenuOpen(false)} settings={parentSettings} onUpdateSettings={handleUpdateParentSettings} profiles={profiles} onEditProfile={handleOpenProfileForEditing} onInstallApp={handleInstallApp} canInstall={!!installPrompt} onResetApp={handleResetApp} />
      <AddChildModal isOpen={isAddChildModalOpen} onClose={() => setIsAddChildModalOpen(false)} onSave={handleAddChild} isInitialSetup={profiles.length === 0} />
      <ThemeModal isOpen={isThemeModalOpen} onClose={handleCloseThemeModal} onSave={handleUpdateTheme} currentTheme={themeForModal} isFirstTime={isFirstTimeThemePrompt} />
      <BonusAwardModal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} onAward={handleAwardBonus} profiles={profiles} defaultBonusValue={parentSettings.defaultBonusValue} />
      {activeBonusNotification && <BonusAwardedNotificationModal isOpen={!!activeBonusNotification} onClose={() => setActiveBonusNotification(null)} bonus={activeBonusNotification} onAcknowledge={handleAcknowledgeBonus} />}
      {isParentBonusConfirmModalOpen && <ParentBonusConfirmationModal isOpen={isParentBonusConfirmModalOpen} onClose={() => setIsParentBonusConfirmModalOpen(false)} childName={bonusAwardedToName} />}
      {!isKidsMode && (<ChoreFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveChore} initialData={choreToEdit} defaultChoreValue={parentSettings.defaultChoreValue} onDelete={handleDeleteChore} customCategories={parentSettings.customCategories || []} onAddCustomCategory={handleAddCustomCategory} />)}
      {isBlurActive && <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-30" aria-hidden="true"/>}
    </div>
  );
};

const App: React.FC = () => (
  <SoundProvider>
    <AppContent />
  </SoundProvider>
);

export default App;