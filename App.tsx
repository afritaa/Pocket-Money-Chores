

import React, { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Chore, Day, EarningsRecord, Profile, ParentSettings, PastChoreApproval, CompletionSnapshot, CompletionState, PayDayConfig, BonusNotification, BeforeInstallPromptEvent } from './types';
import Header from './components/Header';
import ChoreList from './components/ChoreList';
import ChoreFormModal from './components/AddChoreModal';
import { CHORE_CATEGORY_ORDER, DAYS_OF_WEEK, BanknotesIcon, DAY_SHORT_NAMES, ChevronLeftIcon, ChevronRightIcon, UserCircleIcon } from './constants';
import EarningsHistoryModal from './components/EarningsHistoryModal';
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
import FloatingActionButton from './components/FloatingActionButton';
import ProfileSelector from './components/ProfileSelector';
import DeviceSetupModal from './components/DeviceSetupModal';
import WelcomeModal from './components/WelcomeModal';
import CashOutRequestNotificationModal from './components/CashOutRequestNotificationModal';
import { SoundProvider } from './hooks/useSound';
import SideMenu from './components/SideMenu';
import BonusNotificationButton from './components/BonusNotificationButton';
import MotivationalBanner from './components/MotivationalBanner';
import PasscodeEntryModal from './components/PasscodeEntryModal';
import PasscodeManagementModal from './components/PasscodeManagementModal';
import NewDayLoader from './components/NewDayLoader';


// Helper functions for local storage
const getStoredData = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        // If no item exists, or it's an empty string, return the default.
        if (!item) {
            return defaultValue;
        }

        const parsed = JSON.parse(item);

        // If the stored value is null (e.g., the string "null" was stored),
        // it's almost always safer to fall back to the default value.
        if (parsed === null) {
            return defaultValue;
        }

        // Add a basic type check to prevent crashes from malformed data.
        // If the default is an array, we must return an array.
        if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
            console.warn(`Data for key "${key}" is not an array, returning default.`);
            return defaultValue;
        }

        return parsed;
    } catch (error) {
        // If parsing fails for any reason, fall back to the default.
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
  d.setHours(0,0,0,0);
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

// Hook to detect screen orientation
const useOrientation = (): 'portrait' | 'landscape' => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    () => window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleResize = () => {
      const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return orientation;
};


const AnimatedNumber = React.memo(({ value }: { value: number }) => {
    const count = useMotionValue(value);
    const rounded = useTransform(count, (latest) => (latest / 100).toFixed(2));

    useEffect(() => {
        const controls = animate(count, value, { duration: 0.8, ease: "easeOut" });
        return controls.stop;
    }, [value, count]);
    
    return <motion.span>{rounded}</motion.span>;
});

const ParentWeeklyNavigator = ({ currentDateForWeek, setCurrentDateForWeek, selectedDate, setSelectedDate, handleGoToCurrentWeek }) => {
    const [direction, setDirection] = useState(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = formatDate(today);

    const weekDates = useMemo(() => {
        const start = getStartOfWeek(currentDateForWeek);
        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });
    }, [currentDateForWeek]);

    const paginate = (newDirection: number) => {
        const newDate = new Date(currentDateForWeek);
        newDate.setDate(currentDateForWeek.getDate() + 7 * newDirection);
        setCurrentDateForWeek(newDate);
        setSelectedDate(newDate);
        setDirection(newDirection);
    };

    const handleDragEnd = (event, info) => {
        const dragThreshold = 50;
        if (info.offset.x < -dragThreshold) paginate(1);
        else if (info.offset.x > dragThreshold) paginate(-1);
    };

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    const isCurrentWeek = getStartOfWeek(currentDateForWeek).getTime() === getStartOfWeek(new Date()).getTime();

    return (
        <div className="relative h-auto overflow-hidden flex items-center justify-between">
            <button onClick={() => paginate(-1)} className="p-2 rounded-full hover:bg-black/10 hidden [@media(hover:hover)]:block"><ChevronLeftIcon className="h-5 w-5" /></button>
            <div className="flex-grow relative h-16 overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={getStartOfWeek(currentDateForWeek).toISOString()}
                        className="grid grid-cols-7 absolute inset-0 cursor-grab active:cursor-grabbing"
                        variants={variants}
                        custom={direction}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                    >
                        {weekDates.map(date => (
                            <div key={date.toString()} className="flex flex-col items-center justify-center">
                                <span className="text-xs uppercase opacity-70">{DAY_SHORT_NAMES[Object.values(Day)[date.getDay()]]}</span>
                                <button
                                    onClick={() => setSelectedDate(date)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm transition-all
                                        ${formatDate(date) === todayString ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]' : ''}
                                    `}
                                >
                                    {date.getDate()}
                                </button>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
            <button onClick={() => paginate(1)} className="p-2 rounded-full hover:bg-black/10 hidden [@media(hover:hover)]:block"><ChevronRightIcon className="h-5 w-5" /></button>
            {!isCurrentWeek && (
                <button onClick={handleGoToCurrentWeek} className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30">
                    Today
                </button>
            )}
        </div>
    );
};

const ThemeStyles = () => (
  <style>{`
    :root {
      /* Design System Tokens */
      --radius-sm: 8px; --radius-md: 16px; --radius-lg: 24px; --radius-pill: 999px;
      --shadow-sm: 0 2px 4px rgba(0,0,0,0.05); --shadow-md: 0 4px 8px rgba(0,0,0,0.1);
      
      /* Base variables derived from the new design system */
      --header-bg: #E85C41; --header-text: #FFFFFF;
      --page-bg: #F5F5F5;
      --card-bg: #FFFFFF;
      --menu-bg: #FFFFFF;
      --info-card-bg: #fffaf8;
      --text-primary: #000000;
      --text-secondary: #555555;
      --text-muted: #C4C4C4;
      --accent-primary: #E85C41;
      --accent-primary-text: #FFFFFF;
      --accent-secondary: #FFD74A;
      --border-primary: #e2e8f0; --border-secondary: #cbd5e1;
      --success: #16a34a; --success-text: #ffffff;
      --danger: #dc2626; --danger-text: #ffffff;
      --warning: #d97706; --warning-text: #ffffff;
      --bg-backdrop: rgba(20, 20, 20, 0.6);
      --bg-image-overlay: none;
      --bg-image-opacity: 0.15;
    }

    html {
      overflow-y: scroll;
      scrollbar-gutter: stable;
    }
    
    body[data-theme='light'] {
      --header-bg: #E85C41; --header-text: #FFFFFF;
      --page-bg: #F5F5F5;
      --card-bg: #FFFFFF;
      --menu-bg: #FFFFFF;
      --info-card-bg: #fffaf8;
      --text-primary: #000000;
      --text-secondary: #555555;
      --text-muted: #C4C4C4;
      --accent-primary: #E85C41;
      --accent-primary-text: #FFFFFF;
      --accent-secondary: #FFD74A;
    }
    
    body[data-theme='dark'] {
      --header-bg: #0f172a; --header-text: #f8fafc;
      --page-bg: #020617;
      --card-bg: #1e2937;
      --menu-bg: #1e2937;
      --info-card-bg: #334155;
      --text-primary: #f8fafc; --text-secondary: #94a3b8; --text-muted: #64748b;
      --accent-primary: #38bdf8; --accent-primary-text: #020617;
      --accent-secondary: #facc15;
      --border-primary: #1e2937; --border-secondary: #334155;
    }

    body[data-theme='dark-blue'] {
      --header-bg: #3b59de; --header-text: #ffffff;
      --page-bg: #4364F7;
      --card-bg: rgba(255, 255, 255, 0.1);
      --menu-bg: #2c40a5;
      --info-card-bg: rgba(0,0,0,0.1);
      --text-primary: #ffffff; --text-secondary: #e0eaff; --text-muted: #c0cfff;
      --accent-primary: #f7b733; --accent-primary-text: #0b153e;
      --accent-secondary: #fc4a1a;
      --border-primary: #324ecc; --border-secondary: #5374ff;
    }

    body[data-theme='lions'] {
      --header-bg: #6A0032; --header-text: #FFD700;
      --page-bg: #A30D45;
      --card-bg: rgba(255, 255, 255, 0.15);
      --menu-bg: #520026;
      --info-card-bg: rgba(255, 215, 0, 0.15);
      --text-primary: #FFD700; --text-secondary: #00A2E8; --text-muted: #94a3b8;
      --accent-primary: #00A2E8; --accent-primary-text: #ffffff;
      --accent-secondary: #FFD700;
      --border-primary: #6A0032; --border-secondary: #FFD700;
      --bg-image-overlay: url("/images/lions_logo.png");
    }
    
    body[data-theme='princess'] {
      --header-bg: #f8bbd0; --header-text: #4a148c;
      --page-bg: #fce4ec;
      --card-bg: #ffffff;
      --menu-bg: #ffffff;
      --info-card-bg: #fff1f2;
      --text-primary: #4a148c; --text-secondary: #8e24aa; --text-muted: #c158dc;
      --accent-primary: #ff4081; --accent-primary-text: #ffffff;
      --accent-secondary: #ff80ab;
      --border-primary: #f8bbd0; --border-secondary: #f48fb1;
    }
    
    body[data-theme='ocean'] {
      --header-bg: #b2ebf2; --header-text: #005f73;
      --page-bg: #e0f7fa;
      --card-bg: rgba(255, 255, 255, 0.8);
      --menu-bg: #ffffff;
      --info-card-bg: #ffffff;
      --text-primary: #005f73; --text-secondary: #0077b6; --text-muted: #0096c7;
      --accent-primary: #00b4d8; --accent-primary-text: #ffffff;
      --accent-secondary: #90e0ef;
      --border-primary: #b2ebf2; --border-secondary: #80deea;
    }

    body[data-theme='beach'] {
      --header-bg: #faedcd; --header-text: #023047;
      --page-bg: #fefae0;
      --card-bg: #ffffff;
      --menu-bg: #ffffff;
      --info-card-bg: #f0f9ff;
      --text-primary: #023047; --text-secondary: #219ebc; --text-muted: #8ecae6;
      --accent-primary: #fb8500; --accent-primary-text: #ffffff;
      --accent-secondary: #ffb703;
      --border-primary: #faedcd; --border-secondary: #d4a373;
    }
    
    body[data-theme='reef-green'] {
      --header-bg: #00C9A7; --header-text: #ffffff;
      --page-bg: #f8f9fa;
      --card-bg: #ffffff;
      --menu-bg: #ffffff;
      --info-card-bg: #f8f9fa;
      --text-primary: #212529; --text-secondary: #6c757d; --text-muted: #adb5bd;
      --accent-primary: #00C9A7; --accent-primary-text: #ffffff;
      --accent-secondary: #84DCC6;
      --border-primary: #dee2e6; --border-secondary: #ced4da;
      --bg-image-overlay: none;
    }
    
    body[data-theme='meadow-yellow'] {
      --header-bg: #FFD74A; --header-text: #000000;
      --page-bg: #F5F5F5;
      --card-bg: #ffffff;
      --menu-bg: #ffffff;
      --info-card-bg: #FFFCF0;
      --text-primary: #000000; --text-secondary: #555555; --text-muted: #C4C4C4;
      --accent-primary: #FFD74A; --accent-primary-text: #000000;
      --accent-secondary: #E85C41;
      --border-primary: #e2e8f0; --border-secondary: #cbd5e1;
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
      background-color: var(--page-bg);
      color: var(--text-primary);
    }
    html.no-scroll, body.dragging {
      overflow: hidden;
      overscroll-behavior-y: none;
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const themeColors: { [key: string]: string } = {
  'light': '#E85C41',
  'dark': '#0f172a',
  'dark-blue': '#3b59de',
  'lions': '#6A0032',
  'princess': '#f8bbd0',
  'ocean': '#b2ebf2',
  'beach': '#faedcd',
  'reef-green': '#00C9A7',
  'meadow-yellow': '#FFD74A',
};

const themeCycle = [
  'light',
  'reef-green',
  'meadow-yellow',
  'beach',
  'dark-blue',
  'dark',
  'princess',
  'ocean',
  'lions',
];

const AppContent: React.FC = () => {
  const [deviceType, setDeviceType] = useState<string | null>(() => localStorage.getItem('deviceType'));
  const [isLoading, setIsLoading] = useState(true);
  
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
  const fixedHeaderRef = useRef<HTMLDivElement>(null);
  const [fixedHeaderHeight, setFixedHeaderHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const orientation = useOrientation();

  const [mode, setMode] = useState<'kids' | 'parent' | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);
  
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
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
  const [currentDateForWeek, setCurrentDateForWeek] = useState(new Date());


  const [isAllChoresDoneModalOpen, setIsAllChoresDoneModalOpen] = useState(false);
  const [dailyEarningsForModal, setDailyEarningsForModal] = useState(0);
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isPastApprovalModalOpen, setIsPastApprovalModalOpen] = useState(false);
  const [recordToReview, setRecordToReview] = useState<EarningsRecord | null>(null);
  const [isPasscodeEntryOpen, setIsPasscodeEntryOpen] = useState(false);
  const [isPasscodeManagementModalOpen, setIsPasscodeManagementModalOpen] = useState(false);
  
  // Smart scrolling states
  const [scrollToChoreId, setScrollToChoreId] = useState<string | null>(null);
  const [newlyAcknowledgedBonusId, setNewlyAcknowledgedBonusId] = useState<string | null>(null);
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  
  // Derived state to check if any modal or side menu is open
  const isAnyModalOpen = useMemo(() => {
    return isModalOpen ||
           isAddChildModalOpen ||
           isEditProfileModalOpen ||
           isOptionsMenuOpen ||
           isSideMenuOpen ||
           isBonusModalOpen ||
           !!activeBonusNotification ||
           isWelcomeModalOpen ||
           isParentBonusConfirmModalOpen ||
           isHistoryModalOpen ||
           isPendingModalOpen ||
           isCashOutConfirmOpen ||
           !!cashOutRequestToNotify ||
           isAllChoresDoneModalOpen ||
           isThemeModalOpen ||
           isPastApprovalModalOpen ||
           !!recordToReview ||
           isPasscodeEntryOpen ||
           isPasscodeManagementModalOpen;
  }, [
    isModalOpen, isAddChildModalOpen, isEditProfileModalOpen, isOptionsMenuOpen, isSideMenuOpen,
    isBonusModalOpen, activeBonusNotification, isWelcomeModalOpen, isParentBonusConfirmModalOpen,
    isHistoryModalOpen, isPendingModalOpen, isCashOutConfirmOpen, cashOutRequestToNotify,
    isAllChoresDoneModalOpen, isThemeModalOpen, isPastApprovalModalOpen, recordToReview, isPasscodeEntryOpen,
    isPasscodeManagementModalOpen
  ]);

  // Global scroll lock effect
  useEffect(() => {
    const shouldLock = isAnyModalOpen || isFabMenuOpen || isProfileMenuOpen;
    if (shouldLock) {
      document.documentElement.classList.add('no-scroll');
    } else {
      document.documentElement.classList.remove('no-scroll');
    }
  }, [isAnyModalOpen, isFabMenuOpen, isProfileMenuOpen]);


  // Effects to persist state changes to localStorage
  useEffect(() => { setStoredData('profiles', profiles); }, [profiles]);
  useEffect(() => { setStoredData('activeProfileId', activeProfileId); }, [activeProfileId]);
  useEffect(() => { setStoredData('parentSettings', parentSettings); }, [parentSettings]);
  useEffect(() => { setStoredData('choresByProfile', choresByProfile); }, [choresByProfile]);
  useEffect(() => { setStoredData('earningsHistoryByProfile', earningsHistoryByProfile); }, [earningsHistoryByProfile]);
  useEffect(() => { setStoredData('pendingCashOutsByProfile', pendingCashOutsByProfile); }, [pendingCashOutsByProfile]);
  useEffect(() => { setStoredData('pastChoreApprovalsByProfile', pastChoreApprovalsByProfile); }, [pastChoreApprovalsByProfile]);
  useEffect(() => { setStoredData('pendingBonusNotificationsByProfile', pendingBonusNotificationsByProfile); }, [pendingBonusNotificationsByProfile]);
  
  // Effect to set initial mode AND handle new day loading screen
  useEffect(() => {
    // --- New Day Check ---
    const todayString = formatDate(new Date());
    const lastSeenDate = localStorage.getItem('lastSeenDate');
    if (lastSeenDate !== todayString) {
      localStorage.setItem('lastSeenDate', todayString);
    }

    // --- Initial Mode Setup ---
    if (mode === null) {
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
      } else if (deviceType) {
        setMode('parent');
      }
    }

    if (profiles.length === 0 && deviceType && !isAddChildModalOpen && !isWelcomeModalOpen) {
      setIsAddChildModalOpen(true);
    }

    // --- End Loading ---
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [deviceType]);

  // Effect for handling date change while app is in background
  useEffect(() => {
      const checkDateAndReload = () => {
          const todayString = formatDate(new Date());
          if (localStorage.getItem('lastSeenDate') !== todayString) {
              window.location.reload();
          }
      };

      document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
              checkDateAndReload();
          }
      });

      const intervalId = setInterval(checkDateAndReload, 60 * 1000);
      return () => clearInterval(intervalId);
  }, []);

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
  
  const handleUpdatePasscode = useCallback((newPasscode: string | null) => {
    setParentSettings(s => ({ ...s, passcode: newPasscode }));
    setIsPasscodeManagementModalOpen(false);
  }, []);

  // Derived state for the active profile
  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);
  const chores = useMemo(() => (activeProfileId ? choresByProfile[activeProfileId] : []) || [], [choresByProfile, activeProfileId]);
  const earningsHistory = useMemo(() => (activeProfileId ? earningsHistoryByProfile[activeProfileId] : []) || [], [earningsHistoryByProfile, activeProfileId]);
  const pendingCashOuts = useMemo(() => (activeProfileId ? pendingCashOutsByProfile[activeProfileId] : []) || [], [pendingCashOutsByProfile, activeProfileId]);
  const pastChoreApprovals = useMemo(() => (activeProfileId ? pastChoreApprovalsByProfile[activeProfileId] : []) || [], [pastChoreApprovalsByProfile, activeProfileId]);
  const pendingBonuses = useMemo(() => (activeProfileId ? pendingBonusNotificationsByProfile[activeProfileId] : []) || [], [pendingBonusNotificationsByProfile, activeProfileId]);
  
  const pendingCount = useMemo(() => (pendingCashOuts || []).length, [pendingCashOuts]);
  const pastApprovalsCount = useMemo(() => (pastChoreApprovals || []).length, [pastChoreApprovals]);

  // Effect to set the active theme on the body and update browser theme color
  useEffect(() => {
    let currentTheme = 'light';
    if (isKidsMode) {
        if (activeProfile) {
            currentTheme = activeProfile.theme;
        }
    } else { // Parent mode
        if (activeProfile) {
            currentTheme = activeProfile.parentViewTheme || activeProfile.theme;
        } else {
            currentTheme = parentSettings.theme;
        }
    }
    
    document.body.setAttribute('data-theme', currentTheme);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themeColors[currentTheme] || '#E85C41');
    }
  }, [isKidsMode, activeProfile, parentSettings.theme]);
  
    const prevChores = usePrevious(chores);
    
    useEffect(() => {
        if (!isKidsMode || !prevChores || !chores.length || isAllChoresDoneModalOpen) return;
        
        const todayString = formatDate(new Date());
        
        const wasCompletionJustAddedForToday = chores.some(chore => {
            if (chore.type === 'bonus') return false; // Ignore bonuses for this check
            const prevChore = prevChores.find(p => p.id === chore.id);
            if (!prevChore) return false;
            return chore.completions[todayString] === 'completed' && prevChore.completions[todayString] !== 'completed';
        });

        if (!wasCompletionJustAddedForToday) return;

        const todayDay = getDayFromDate(new Date());
        const todaysChores = chores.filter(c => c.type !== 'bonus' && c.days.includes(todayDay));
        
        if (todaysChores.length === 0) return;

        const areAllDoneNow = todaysChores.every(c => ['completed', 'cashed_out', 'pending_cash_out'].includes(c.completions[todayString]));
        
        if (areAllDoneNow) {
            const todayEarnings = todaysChores.reduce((sum, chore) => (chore.completions[todayString] ? sum + chore.value : sum), 0);
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

  const handleThemeSave = (theme: string) => {
    if (activeProfileId) {
      setProfiles(p => p.map(profile => {
        if (profile.id === activeProfileId) {
          const updatedProfile = { ...profile };
          if (isKidsMode) {
            // In kids mode, we are setting the child's personal theme.
            updatedProfile.theme = theme;
            if (isFirstTimeThemePrompt) {
              updatedProfile.hasSeenThemePrompt = true;
            }
          } else {
            // In parent mode, we are setting the theme for viewing this child.
            updatedProfile.parentViewTheme = theme;
          }
          return updatedProfile;
        }
        return profile;
      }));
    } else if (!isKidsMode) {
      // Fallback for parent mode with no active profile: update the parent's base theme.
      setParentSettings(s => ({ ...s, theme }));
    }
    setIsThemeModalOpen(false);
  };
  
  const handleAddChild = useCallback((data: Omit<Profile, 'id' | 'theme' | 'hasSeenThemePrompt' | 'showPotentialEarnings'>, passcode: string | null) => {
    const nextTheme = themeCycle[profiles.length % themeCycle.length];
    const newProfile: Profile = {
      ...data,
      id: crypto.randomUUID(),
      theme: nextTheme, 
      parentViewTheme: nextTheme,
      hasSeenThemePrompt: false,
      showPotentialEarnings: true,
    };
    setProfiles(p => [...p, newProfile]);

    if (passcode) {
        setParentSettings(s => ({ ...s, passcode }));
    }
    
    // Set the new profile as active. The theme will update automatically via the useEffect.
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
  
  const handleSwitchToParent = () => {
    if (parentSettings.passcode && mode === 'kids') {
      setIsPasscodeEntryOpen(true);
    } else {
      setMode('parent');
    }
  };

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
  
  const calculateEarnings = useCallback((chores: Chore[]) => {
    return chores.reduce((total, chore) => {
      return total + Object.entries(chore.completions).reduce((sum, [, state]) => (state === 'completed' ? sum + chore.value : sum), 0);
    }, 0);
  }, []);

  const earnings = useMemo(() => calculateEarnings(chores), [chores, calculateEarnings]);
  
  const dateForKidsView = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const filteredChores = useMemo(() => {
    if (!activeProfileId) return [];
    
    const sortLogic = (a: Chore, b: Chore) => {
      if (!a || !b) return 0;
      const aIsBonus = a.type === 'bonus';
      const bIsBonus = b.type === 'bonus';
      if (aIsBonus && !bIsBonus) return 1;
      if (!aIsBonus && bIsBonus) return -1;
      const aCategoryOrder = a.category ? (CHORE_CATEGORY_ORDER[a.category] ?? 100) : 99;
      const bCategoryOrder = b.category ? (CHORE_CATEGORY_ORDER[b.category] ?? 100) : 99;
      if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
      return (a.order || 0) - (b.order || 0);
    };

    if (!isKidsMode) {
      // Parent mode: filter chores.
      const startOfWeek = getStartOfWeek(currentDateForWeek);
      const startOfWeekString = formatDate(startOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const endOfWeekString = formatDate(endOfWeek);
      
      const choresForWeek = chores.filter(chore => {
        // For bonuses, only show if created within the currently viewed week.
        if (chore.type === 'bonus') {
            if (!chore.createdAt) return false;
            return chore.createdAt >= startOfWeekString && chore.createdAt <= endOfWeekString;
        }

        // For regular chores, they appear if they were created before the end of the week.
        if (chore.createdAt) {
            return chore.createdAt <= endOfWeekString;
        }

        return true; // For older chores without a creation date, always show them.
      });
      return [...choresForWeek].sort(sortLogic);
    }
    
    // Kids mode: filter chores for the selected day.
    const dateToView = isKidsMode ? dateForKidsView : selectedDate;
    const dateToViewString = formatDate(dateToView);
    const choresForDay = chores.filter(chore => {
        if (!chore) return false;

        if (chore.type === 'bonus') {
            // A bonus should only appear on the day it was accepted by the child.
            return chore.completions[dateToViewString] && chore.completions[dateToViewString] !== 'pending_acceptance';
        }

        // Chores shouldn't appear before they are created.
        if (chore.createdAt && dateToViewString < chore.createdAt) {
            return false;
        }

        if (chore.isOneOff) {
            return chore.oneOffDate === dateToViewString;
        }
        
        return Array.isArray(chore.days) && chore.days.includes(getDayFromDate(dateToView));
    });

    return [...choresForDay].sort(sortLogic);
  }, [chores, selectedDate, activeProfileId, isKidsMode, dateForKidsView, currentDateForWeek]);
  
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

  const handleSaveChore = useCallback((choreData: Omit<Chore, 'id' | 'completions' | 'order' | 'createdAt'>) => {
    if (!activeProfileId) return;
    
    setChoresByProfile(prev => {
        const currentChores = prev[activeProfileId] || [];

        if (choreToEdit) {
            const updatedChores = currentChores.map(c => 
                c.id === choreToEdit.id ? { ...c, ...choreData } : c
            );
            return { ...prev, [activeProfileId]: updatedChores };
        } else {
            const newChore: Chore = {
                id: crypto.randomUUID(),
                name: choreData.name,
                value: choreData.value,
                icon: choreData.icon,
                category: choreData.category,
                note: choreData.note || '',
                days: choreData.days || [], 
                type: choreData.type || 'chore',
                completions: {},
                order: currentChores.filter(c => c.category === choreData.category).length,
                createdAt: formatDate(new Date()),
                isOneOff: choreData.isOneOff,
                oneOffDate: choreData.oneOffDate,
            };
            return { ...prev, [activeProfileId]: [...currentChores, newChore] };
        }
    });

    handleCloseModal();
  }, [choreToEdit, activeProfileId]);

  const handleDeleteChore = useCallback((choreIdToDelete: string) => {
    if (!activeProfileId) return;
    
    setChoresByProfile(prev => ({
      ...prev,
      [activeProfileId]: (prev[activeProfileId] || []).filter(c => c.id !== choreIdToDelete)
    }));
    
    handleCloseModal();
  }, [activeProfileId, handleCloseModal]);


  const handleToggleCompletion = useCallback((choreId: string, date: Date) => {
    if (!activeProfileId) return;
    
    const dateString = formatDate(date);
    const chore = (choresByProfile[activeProfileId] || []).find(c => c.id === choreId);
    if (!chore || chore.type === 'bonus') return;

    const currentCompletionState = chore.completions[dateString];

    if (isKidsMode) {
      // --- Kids Mode Logic ---
      if (currentCompletionState === 'cashed_out' || currentCompletionState === 'pending_cash_out') {
        return; // Kids cannot change chores that are part of a payout.
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = date.getTime() < today.getTime();

      if (isPast && !currentCompletionState) {
        // Kids completing past chores creates an approval request.
        const newApproval: PastChoreApproval = { id: crypto.randomUUID(), choreId, choreName: chore.name, date: dateString };
        setPastChoreApprovalsByProfile(p => ({ ...p, [activeProfileId]: [...(p[activeProfileId] || []), newApproval] }));
        return;
      }
      
      // For current or future chores, or un-ticking a completed past chore.
      const newCompletions = { ...chore.completions };
      if (currentCompletionState) {
        delete newCompletions[dateString];
      } else {
        newCompletions[dateString] = 'completed';
      }

      setChoresByProfile(p => ({ ...p, [activeProfileId]: (p[activeProfileId] || []).map(c => c.id === choreId ? { ...c, completions: newCompletions } : c) }));
      
      // Smart scrolling for kids
      if (!currentCompletionState) {
        setScrollToChoreId(choreId);
      }
    } else {
      // --- Parent Mode Logic ---
      // Parents can directly toggle any chore, past or present, unless it's cashed out.
      if (currentCompletionState === 'cashed_out' || currentCompletionState === 'pending_cash_out') {
        // A safety check to prevent altering history that's part of a cash-out flow.
        return; 
      }

      const newCompletions = { ...chore.completions };
      if (currentCompletionState) {
        delete newCompletions[dateString];
      } else {
        newCompletions[dateString] = 'completed';
      }

      setChoresByProfile(p => ({ ...p, [activeProfileId]: (p[activeProfileId] || []).map(c => c.id === choreId ? { ...c, completions: newCompletions } : c) }));
    }
  }, [isKidsMode, activeProfileId, choresByProfile]);
  
  const handleCashOut = useCallback(async (targetProfileId?: string, targetChores?: Chore[]) => {
    const pId = targetProfileId || activeProfileId;
    if (!pId) return;
    const pChores = targetChores || chores;
    const currentEarnings = calculateEarnings(pChores);
    if (currentEarnings <= 0 && !isKidsMode) return; // Allow cashing out $0 in kids mode if allowed, but not parent

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
        id: choreId, name: 'Bonus', value: amount, days: [],
        completions: { [todayDateString]: 'pending_acceptance' },
        icon: '⭐', category: 'Bonus', order: 9999, type: 'bonus', note: note,
        createdAt: todayDateString,
    };
    
    selectedProfileIds.forEach(pId => {
      setChoresByProfile(p => ({...p, [pId]: [...(p[pId] || []), newBonusChore]}));
      const bonusNotif: BonusNotification = { id: bonusId, amount, note, createdAt: todayDateString };
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
      const todayString = formatDate(new Date());

      setChoresByProfile(p => {
        const profileChores = p[activeProfileId] || [];
        const updatedChores = profileChores.map(c => {
          if (c.id === choreIdToUpdate) {
            // Move the completion from the creation date to today's date
            const newCompletions: { [date: string]: CompletionState } = {};
            newCompletions[todayString] = 'completed';
            return {...c, completions: newCompletions};
          }
          return c;
        });
        return {...p, [activeProfileId]: updatedChores};
      });
      
      // After acknowledging, check if there are more bonuses in the queue
      const remainingBonuses = pendingBonusNotificationsByProfile[activeProfileId] || [];
      if (remainingBonuses.length > 0) {
          // Show the next bonus notification immediately, which will also remove it from the pending list.
          handleShowBonusNotification(remainingBonuses[0]);
      } else {
          // No more bonuses left in the queue.
          setActiveBonusNotification(null);
      }
      
      // Trigger scroll animation for the new bonus card, which will now appear today
      setNewlyAcknowledgedBonusId(choreIdToUpdate);
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

  const handleGoToCurrentWeek = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDateForWeek(today);
  };
  
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

  const handleEnterKidsMode = useCallback(() => {
    setIsSideMenuOpen(false);
    if (profiles.length > 1) {
      setMode(null);
    } else if (profiles.length === 1) {
      setActiveProfileId(profiles[0].id);
      setMode('kids');
    }
  }, [profiles]);

  const canCashOutToday = useMemo(() => {
    if (!isKidsMode || !activeProfile || earnings <= 0) return false;

    const { mode, day } = activeProfile.payDayConfig;
    if (mode === 'anytime') return true;

    if (mode === 'manual' || mode === 'automatic') {
      const todayDay = getDayFromDate(new Date());
      return day === todayDay;
    }

    return false;
  }, [isKidsMode, activeProfile, earnings]);

  // Smart scrolling effect
  useEffect(() => {
    const mainEl = mainScrollRef.current;
    if (!mainEl || !isKidsMode) return;
  
    // --- Bonus acknowledgement scroll ---
    if (newlyAcknowledgedBonusId) {
      setTimeout(() => {
        const bonusEl = document.getElementById(`chore-${newlyAcknowledgedBonusId}`);
        if (bonusEl) {
          // Center the new bonus card first
          mainEl.scrollTo({ top: bonusEl.offsetTop + bonusEl.offsetHeight / 2 - mainEl.clientHeight / 2, behavior: 'smooth' });
          const timer = setTimeout(() => {
            const todayString = formatDate(dateForKidsView);
            // After showing bonus, scroll to the first available chore
            const nextIncompleteChore = filteredChores.find(c => c.type !== 'bonus' && !['completed', 'cashed_out', 'pending_cash_out'].includes(c.completions[todayString]));
            if (nextIncompleteChore) {
              const nextEl = document.getElementById(`chore-${nextIncompleteChore.id}`);
              if (nextEl) {
                const scrollTarget = nextEl.offsetTop + (nextEl.offsetHeight / 2) - (mainEl.clientHeight / 2);
                mainEl.scrollTo({ top: scrollTarget, behavior: 'smooth' });
              }
            }
            setNewlyAcknowledgedBonusId(null);
          }, 1300); // Wait for user to see the bonus
          return () => clearTimeout(timer);
        } else {
          setNewlyAcknowledgedBonusId(null);
        }
      }, 100); // Delay for DOM update
      return;
    }
  
    // --- Scroll to next chore on completion ---
    if (scrollToChoreId) {
      const completedChoreIndex = filteredChores.findIndex(c => c.id === scrollToChoreId);
      if (completedChoreIndex !== -1) {
        const dateString = formatDate(dateForKidsView);
        
        // Find the next incomplete chore after the one just completed
        const nextIncompleteChore = filteredChores.find((c, index) =>
          index > completedChoreIndex &&
          c.type !== 'bonus' &&
          !['completed', 'cashed_out', 'pending_cash_out'].includes(c.completions[dateString])
        );
  
        if (nextIncompleteChore) {
          setTimeout(() => {
            const nextChoreEl = document.getElementById(`chore-${nextIncompleteChore.id}`);
            if (nextChoreEl) {
              const scrollTarget = nextChoreEl.offsetTop + (nextChoreEl.offsetHeight / 2) - (mainEl.clientHeight / 2);
              mainEl.scrollTo({ top: scrollTarget, behavior: 'smooth' });
            }
          }, 100); // Small delay for UI to settle
        }
      }
      setScrollToChoreId(null);
    }
  }, [newlyAcknowledgedBonusId, scrollToChoreId, filteredChores, isKidsMode, dateForKidsView]);

  const dateToView = isKidsMode ? dateForKidsView : selectedDate;
  const todayStringForKids = formatDate(dateForKidsView);

  const todaysChoresForStats = useMemo(() => {
      if (!isKidsMode) return [];
      return filteredChores.filter(c => c.type !== 'bonus');
  }, [isKidsMode, filteredChores]);

  const todaysTotalChores = todaysChoresForStats.length;
  
  const todaysCompletedChores = useMemo(() => {
    if (!isKidsMode) return 0;
    return todaysChoresForStats.filter(c => 
      ['completed', 'cashed_out', 'pending_cash_out'].includes(c.completions[todayStringForKids])
    ).length;
  }, [isKidsMode, todaysChoresForStats, todayStringForKids]);

  const { potentialEarnings, isPaydayToday } = useMemo(() => {
    if (!isKidsMode || !activeProfile) return { potentialEarnings: 0, isPaydayToday: false };

    const { payDayConfig } = activeProfile;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If anytime, potential earnings are just for today's remaining chores
    if (payDayConfig.mode === 'anytime') {
        const todayString = formatDate(today);
        const todaysUncompletedValue = chores
            .filter(c => {
                if (c.type === 'bonus') return false;
                
                const isScheduledToday = c.isOneOff ? c.oneOffDate === todayString : c.days.includes(getDayFromDate(today));
                const isCompleted = ['completed', 'cashed_out', 'pending_cash_out'].includes(c.completions[todayString]);

                return isScheduledToday && !isCompleted;
            })
            .reduce((sum, chore) => sum + chore.value, 0);
        return { potentialEarnings: todaysUncompletedValue, isPaydayToday: false };
    }

    // For manual/automatic, calculate until next payday
    const dayIndexMap: { [key in Day]: number } = { [Day.Sun]: 0, [Day.Mon]: 1, [Day.Tue]: 2, [Day.Wed]: 3, [Day.Thu]: 4, [Day.Fri]: 5, [Day.Sat]: 6 };
    const targetDayIndex = dayIndexMap[payDayConfig.day || Day.Sat];
    const todayDayIndex = today.getDay();
    
    const daysUntilPayday = (targetDayIndex - todayDayIndex + 7) % 7;
    
    let potentialSum = 0;
    const dateCursor = new Date(today);

    for (let i = 0; i <= daysUntilPayday; i++) {
        const currentDateString = formatDate(dateCursor);
        const dayOfWeek = getDayFromDate(dateCursor);

        chores.forEach(chore => {
            if (chore.type === 'bonus') return;

            const isScheduled = chore.isOneOff ? chore.oneOffDate === currentDateString : chore.days.includes(dayOfWeek);
            const isCompleted = ['completed', 'cashed_out', 'pending_cash_out'].includes(chore.completions[currentDateString]);
            
            if (isScheduled && !isCompleted) {
                potentialSum += chore.value;
            }
        });
        
        dateCursor.setDate(dateCursor.getDate() + 1);
    }
    
    return { potentialEarnings: potentialSum, isPaydayToday: daysUntilPayday === 0 };

  }, [isKidsMode, activeProfile, chores]);
  
  const showPotentialEarnings = activeProfile?.showPotentialEarnings ?? false;
  
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (fixedHeaderRef.current) {
        setFixedHeaderHeight(fixedHeaderRef.current.offsetHeight);
      }
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (fixedHeaderRef.current) {
      resizeObserver.observe(fixedHeaderRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [mode, activeProfileId, pendingCount, pastApprovalsCount, orientation]);

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (event.currentTarget.scrollTop > 5) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };


  if (!deviceType) {
    return (
      <>
        <ThemeStyles />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
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
            onAttemptSwitchToParentMode={handleSwitchToParent}
            lastActiveProfileId={activeProfileId}
          />
        </>
    );
  }

  const themeForModal = activeProfile?.theme || parentSettings.theme || 'light';


  return (
    <div className="h-screen flex flex-col relative">
      <ThemeStyles />
      <NewDayLoader isLoading={isLoading} />
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        isKidsMode={isKidsMode}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={(id) => {
            setActiveProfileId(id);
            setIsSideMenuOpen(false);
        }}
        onAddChild={() => {
            setIsAddChildModalOpen(true);
            setIsSideMenuOpen(false);
        }}
        onEnterKidsMode={handleEnterKidsMode}
        onSwitchToParent={() => {
            handleSwitchToParent();
            setIsSideMenuOpen(false);
        }}
        onShowSettings={() => {
            setIsOptionsMenuOpen(true);
            setIsSideMenuOpen(false);
        }}
        onShowTheme={() => {
            setIsThemeModalOpen(true);
            setIsSideMenuOpen(false);
        }}
        onEditProfile={(p) => {
          handleOpenEditModalForProfile(p);
          setIsSideMenuOpen(false);
        }}
        onCashOut={handleCashOut}
        onShowHistory={handleShowHistory}
      />
      
      <div ref={fixedHeaderRef} className="fixed-header-container fixed top-0 left-0 right-0 z-10">
        <Header
          earnings={earnings}
          isKidsMode={isKidsMode}
          profile={activeProfile}
          onOpenMenu={() => setIsSideMenuOpen(true)}
          pendingCount={pendingCount}
          pastApprovalsCount={pastApprovalsCount}
          onShowPending={handleOpenPendingModal}
          onShowPastApprovals={() => setIsPastApprovalModalOpen(true)}
          isProfileMenuOpen={isProfileMenuOpen}
          onProfileMenuToggle={() => {
            setIsFabMenuOpen(false);
            setIsProfileMenuOpen(p => !p);
          }}
          onProfileMenuClose={() => setIsProfileMenuOpen(false)}
          onEditProfile={handleOpenEditModalForProfile}
          onCashOut={() => handleCashOut(activeProfileId)}
          onShowHistory={handleShowHistory}
        />
        
        {(!isKidsMode || (isKidsMode && orientation === 'portrait')) && (
          <div className={`info-card-container bg-[var(--page-bg)] bg-opacity-80 backdrop-blur-sm transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
            {isKidsMode ? (
              <div className="py-4">
                {activeProfile && (
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="flex-shrink-0">
                      {activeProfile.image ? (
                        <img src={activeProfile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-[var(--page-bg)] shadow-md"/>
                      ) : (
                        <UserCircleIcon className="w-20 h-20 text-slate-300"/>
                      )}
                    </div>
                    <div className="font-bold text-4xl leading-none text-[var(--text-primary)] text-center">
                      <span>$</span><AnimatedNumber value={earnings} />
                    </div>
                    <div className="h-12 flex flex-col items-center justify-center">
                      {pendingBonuses.length > 0 ? (
                        <BonusNotificationButton onClick={() => handleShowBonusNotification(pendingBonuses[0])} />
                      ) : canCashOutToday && (
                        <button onClick={() => handleCashOut(activeProfileId)} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-full text-base transition-colors shadow-lg">
                          <BanknotesIcon className="w-6 h-6" />
                          <span>Cash Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[var(--text-primary)] px-2 sm:px-4 py-2">
                <ParentWeeklyNavigator 
                  currentDateForWeek={currentDateForWeek} 
                  setCurrentDateForWeek={setCurrentDateForWeek}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  handleGoToCurrentWeek={handleGoToCurrentWeek}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {isKidsMode ? (
        <div 
          className="absolute left-0 right-0"
          style={{ top: fixedHeaderHeight, bottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
        >
            {orientation === 'landscape' ? (
              <div className="flex w-full h-full">
                <div className={`w-1/4 h-full flex flex-col items-center justify-center p-4 border-r border-[var(--border-primary)] bg-[var(--page-bg)]/80 backdrop-blur-sm`}>
                  {activeProfile && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex-shrink-0">
                        {activeProfile.image ? (
                          <img src={activeProfile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-[var(--page-bg)] shadow-md"/>
                        ) : (
                          <UserCircleIcon className="w-20 h-20 text-slate-300"/>
                        )}
                      </div>
                      <div className="font-bold text-4xl leading-none text-[var(--text-primary)] text-center">
                        <span>$</span><AnimatedNumber value={earnings} />
                      </div>
                      <div className="h-12 flex flex-col items-center justify-center">
                        {pendingBonuses.length > 0 ? (
                          <BonusNotificationButton onClick={() => handleShowBonusNotification(pendingBonuses[0])} />
                        ) : canCashOutToday && (
                          <button onClick={() => handleCashOut(activeProfileId)} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-full text-base transition-colors shadow-lg">
                            <BanknotesIcon className="w-6 h-6" />
                            <span>Cash Out</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <main ref={mainScrollRef} onScroll={handleScroll} className="w-3/4 h-full overflow-y-auto scrollbar-hide">
                  <div className="p-2 sm:p-4 space-y-4">
                    <ChoreList
                      chores={filteredChores}
                      onToggleCompletion={handleToggleCompletion}
                      onEditChore={isKidsMode ? undefined : handleOpenEditModal}
                      selectedDate={dateToView}
                      currentDateForWeek={currentDateForWeek}
                      isKidsMode={isKidsMode}
                      pastChoreApprovals={pastChoreApprovals}
                      onApprovePastChore={isKidsMode ? undefined : handleApprovePastChore}
                      onReorderChores={handleReorderChores}
                      newlyAcknowledgedBonusId={newlyAcknowledgedBonusId}
                      scrollRef={mainScrollRef}
                    />
                  </div>
                </main>
              </div>
            ) : (
              <main 
                ref={mainScrollRef} 
                onScroll={handleScroll}
                className="w-full h-full overflow-y-auto scrollbar-hide"
              >
                <div className="p-2 sm:p-4 space-y-4">
                    <ChoreList
                      chores={filteredChores}
                      onToggleCompletion={handleToggleCompletion}
                      onEditChore={isKidsMode ? undefined : handleOpenEditModal}
                      selectedDate={dateToView}
                      currentDateForWeek={currentDateForWeek}
                      isKidsMode={isKidsMode}
                      pastChoreApprovals={pastChoreApprovals}
                      onApprovePastChore={isKidsMode ? undefined : handleApprovePastChore}
                      onReorderChores={handleReorderChores}
                      newlyAcknowledgedBonusId={newlyAcknowledgedBonusId}
                      scrollRef={mainScrollRef}
                    />
                </div>
              </main>
            )}
        </div>
      ) : (
        <main 
          ref={mainScrollRef} 
          onScroll={handleScroll}
          className="absolute left-0 right-0 overflow-y-auto scrollbar-hide"
          style={{ top: fixedHeaderHeight, bottom: 0 }}
        >
          <div className="p-2 sm:p-4 space-y-4">
              <ChoreList
                chores={filteredChores}
                onToggleCompletion={handleToggleCompletion}
                onEditChore={isKidsMode ? undefined : handleOpenEditModal}
                selectedDate={dateToView}
                currentDateForWeek={currentDateForWeek}
                isKidsMode={isKidsMode}
                pastChoreApprovals={pastChoreApprovals}
                onApprovePastChore={isKidsMode ? undefined : handleApprovePastChore}
                onReorderChores={handleReorderChores}
                newlyAcknowledgedBonusId={newlyAcknowledgedBonusId}
                scrollRef={mainScrollRef}
              />
          </div>
        </main>
      )}

      {isKidsMode && activeProfile && (
        <MotivationalBanner
          todaysCompletedChores={todaysCompletedChores}
          todaysTotalChores={todaysTotalChores}
          potentialEarnings={potentialEarnings}
          showPotentialEarnings={showPotentialEarnings}
          isPaydayToday={isPaydayToday}
          payDayMode={activeProfile.payDayConfig.mode}
          earnings={earnings}
        />
      )}

      {!isKidsMode && (
          <FloatingActionButton 
            onAddChore={handleOpenAddModal} 
            onPayBonus={() => setIsBonusModalOpen(true)} 
            isOpen={isFabMenuOpen}
            onToggle={() => {
                setIsProfileMenuOpen(false);
                setIsFabMenuOpen(f => !f);
            }}
            onClose={() => setIsFabMenuOpen(false)}
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
      <OptionsMenuModal isOpen={isOptionsMenuOpen} onClose={() => setIsOptionsMenuOpen(false)} settings={parentSettings} onUpdateSettings={handleUpdateParentSettings} profiles={profiles} onEditProfile={(id) => { const p = profiles.find(p=>p.id===id); if(p) handleOpenEditModalForProfile(p); }} onInstallApp={handleInstallApp} canInstall={!!installPrompt} onManagePasscode={() => { setIsOptionsMenuOpen(false); setTimeout(() => setIsPasscodeManagementModalOpen(true), 250); }} />
      <AddChildModal isOpen={isAddChildModalOpen} onClose={() => setIsAddChildModalOpen(false)} onSave={handleAddChild} isInitialSetup={profiles.length === 0} />
      <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} onSave={handleThemeSave} currentTheme={themeForModal} isFirstTime={isFirstTimeThemePrompt} />
      <BonusAwardModal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} onAward={handleAwardBonus} profiles={profiles} defaultBonusValue={parentSettings.defaultBonusValue} />
      {activeBonusNotification && <BonusAwardedNotificationModal isOpen={!!activeBonusNotification} onClose={() => setActiveBonusNotification(null)} bonus={activeBonusNotification} onAcknowledge={handleAcknowledgeBonus} />}
      {isParentBonusConfirmModalOpen && <ParentBonusConfirmationModal isOpen={isParentBonusConfirmModalOpen} onClose={() => setIsParentBonusConfirmModalOpen(false)} childName={bonusAwardedToName} />}
      {!isKidsMode && (<ChoreFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveChore} onDelete={handleDeleteChore} initialData={choreToEdit} defaultChoreValue={parentSettings.defaultChoreValue} customCategories={parentSettings.customCategories || []} onAddCustomCategory={handleAddCustomCategory} />)}
      <PasscodeEntryModal
        isOpen={isPasscodeEntryOpen}
        onClose={() => setIsPasscodeEntryOpen(false)}
        correctPasscode={parentSettings.passcode}
        onSuccess={() => {
          setIsPasscodeEntryOpen(false);
          setMode('parent');
        }}
      />
      <PasscodeManagementModal
        isOpen={isPasscodeManagementModalOpen}
        onClose={() => setIsPasscodeManagementModalOpen(false)}
        currentPasscode={parentSettings.passcode}
        onSave={handleUpdatePasscode}
      />
    </div>
  );
};

const App: React.FC = () => (
  <SoundProvider>
    <AppContent />
  </SoundProvider>
);

export default App;