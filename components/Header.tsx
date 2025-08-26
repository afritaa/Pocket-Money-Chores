


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CoinIcon, HistoryIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon, DAY_SHORT_NAMES, DAYS_OF_WEEK } from '../constants';
import { Profile, Day, BonusNotification } from '../types';
import BonusNotificationButton from './BonusNotificationButton';
import { useSound } from '../hooks/useSound';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // Normalize to the start of the day in local time
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayFromDate = (date: Date): Day => {
    const dayIndex = date.getDay();
    const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
    return days[dayIndex];
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};


interface HeaderProps {
  earnings: number;
  isKidsMode: boolean;
  profile: Profile | null | undefined;
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
  pendingBonuses: BonusNotification[];
  onShowBonusNotification: (bonus: BonusNotification) => void;
  profiles: Profile[];
  setActiveProfileId: (id: string) => void;
}

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const TickerDigit = React.memo(({ digit }: { digit: number }) => {
  const transformStyle = {
    transform: `translateY(-${digit * 10}%)`, // 10 digits in the column, so each is 10%
    transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
  };

  return (
    <span className="inline-block h-[1em] overflow-hidden leading-[1em] align-bottom">
      <span className="inline-block" style={transformStyle}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
});

const AnimatedNumber = React.memo(({ value, isKidsMode }: { value: number, isKidsMode: boolean }) => {
    const amountString = (value / 100).toFixed(2);

    if (!isKidsMode) {
      return (
        <>
          <span>$</span>
          {amountString}
        </>
      );
    }

    return (
      <>
        <span className="mr-1">$</span>
        {amountString.split('').map((char, index) => {
          if (char === '.') {
            return <span key={index}>.</span>;
          }
          const digit = parseInt(char, 10);
          return <TickerDigit key={index} digit={digit} />;
        })}
      </>
    );
});

const SwipableWeeklyNavigator = ({ 
    currentDate, 
    onWeekChange 
}: { 
    currentDate: Date, 
    onWeekChange: (date: Date) => void 
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<number | undefined>(undefined);

    const weeks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfThisWeek = getStartOfWeek(today);

        const pastWeeks = 4;
        const futureWeeks = 4;
        const totalWeeks = pastWeeks + 1 + futureWeeks;

        return Array.from({ length: totalWeeks }).map((_, index) => {
            const offset = index - pastWeeks; // Generates offsets from -4 to 4
            const weekStart = new Date(startOfThisWeek);
            weekStart.setDate(weekStart.getDate() + (offset * 7));
            return Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                return d;
            });
        });
    }, []);

    const activeWeekIndex = useMemo(() => {
        const startOfCurrentDateWeek = getStartOfWeek(currentDate);
        return weeks.findIndex(week => formatDate(week[0]) === formatDate(startOfCurrentDateWeek));
    }, [weeks, currentDate]);

    useEffect(() => {
        if (scrollContainerRef.current && activeWeekIndex >= 0) {
            const container = scrollContainerRef.current;
            if (Math.round(container.scrollLeft / container.offsetWidth) !== activeWeekIndex) {
                 setTimeout(() => {
                    container.scrollTo({
                        left: container.offsetWidth * activeWeekIndex,
                        behavior: 'auto'
                    });
                }, 50);
            }
        }
    }, [activeWeekIndex]);

    const handleScroll = () => {
        if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);

        scrollTimeout.current = window.setTimeout(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, offsetWidth } = scrollContainerRef.current;
                const newIndex = Math.round(scrollLeft / offsetWidth);
                if (newIndex >= 0 && newIndex < weeks.length) {
                   const newWeekStartDate = weeks[newIndex][0];
                   if (formatDate(newWeekStartDate) !== formatDate(getStartOfWeek(currentDate))) {
                       onWeekChange(newWeekStartDate);
                   }
                }
            }
        }, 150);
    };

    const todayString = formatDate(new Date());

    return (
        <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            onScroll={handleScroll}
        >
            {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col flex-[0_0_100%] snap-center">
                    <div className="grid grid-cols-7 gap-1 px-2 py-2 bg-[var(--bg-tertiary)] rounded-md mb-3">
                        {week.map(date => {
                            const dayOfWeek = getDayFromDate(date);
                            return (
                                <div key={date.toISOString()} className="text-center">
                                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                        {dayOfWeek.toUpperCase()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-7 gap-1 px-2">
                        {week.map(date => {
                            const isToday = formatDate(date) === todayString;
                            
                            return (
                                <div key={date.toISOString()} className="flex justify-center items-center">
                                    <div className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-200 font-bold text-sm ${
                                        isToday 
                                            ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]'
                                            : 'bg-transparent text-[var(--text-primary)]'
                                    }`}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ 
  earnings, 
  isKidsMode, 
  profile, 
  onCashOut, 
  onShowHistory, 
  isCashOutDisabled, 
  showCashOutButton, 
  weeklyTitle,
  isToday,
  selectedDate,
  setSelectedDate,
  isViewingCurrentWeek,
  handleGoToCurrentWeek,
  onUpdateProfileImage,
  onEditCurrentProfile,
  pendingBonuses,
  onShowBonusNotification,
  profiles,
  setActiveProfileId
}) => {
  const [showFireworks, setShowFireworks] = useState(false);
  const prevEarnings = usePrevious(earnings);
  const [isPulsing, setIsPulsing] = useState(false);
  const fireworksTimer = useRef<number | undefined>(undefined);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const otherProfiles = useMemo(() => profiles.filter(p => p.id !== profile?.id), [profiles, profile]);
  const { playCashOut } = useSound();

  const handleCashOutClick = () => {
    if (!isCashOutDisabled) {
      playCashOut();
      onCashOut();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsProfileSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Effect for fireworks. The key prop on the JSX element does the re-triggering.
  // This effect just manages the visibility window.
  useEffect(() => {
    if (isKidsMode && prevEarnings !== undefined && earnings > prevEarnings) {
      setShowFireworks(true);
      if (fireworksTimer.current) {
        clearTimeout(fireworksTimer.current);
      }
      fireworksTimer.current = window.setTimeout(() => {
        setShowFireworks(false);
      }, 1500); // Fireworks visible duration
    }
    return () => {
      if (fireworksTimer.current) {
        clearTimeout(fireworksTimer.current);
      }
    };
  }, [earnings, prevEarnings, isKidsMode]);

  // Effect for pulsing. This is now robust against rapid updates because
  // onAnimationEnd resets the state, allowing this effect to trigger a state
  // change (false -> true) on the next earnings increase.
  useEffect(() => {
    if (isKidsMode && prevEarnings !== undefined && earnings > prevEarnings) {
      setIsPulsing(true);
    }
  }, [earnings, prevEarnings, isKidsMode]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && profile?.id) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfileImage(profile.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input to allow re-uploading the same file
    if (e.target) e.target.value = '';
  };
  
  const earningsContent = (
    <div className="flex items-center space-x-4">
      <div className="relative flex-shrink-0">
          <button 
            onClick={() => profile && onEditCurrentProfile(profile)}
            className="block rounded-full focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-primary)] transition-all"
            aria-label={`Edit ${profile?.name}'s profile`}
          >
            {profile?.image ? (
              <img src={profile.image} alt={profile.name} className="w-14 h-14 rounded-full object-cover"/>
            ) : (
              <UserCircleIcon className="w-14 h-14 text-[var(--text-tertiary)]"/>
            )}
          </button>
          
          {profiles.length > 1 && (
            <button
                onClick={() => setIsProfileSelectorOpen(prev => !prev)}
                className="absolute -bottom-1 -left-1 w-7 h-7 flex items-center justify-center bg-[var(--bg-secondary)] rounded-full border-2 border-[var(--border-primary)] shadow-md hover:bg-[var(--bg-tertiary)] transition-colors"
                aria-label="Switch child profile"
            >
                <span className="text-lg font-bold text-[var(--text-secondary)] leading-none -mt-px select-none">⇄</span>
            </button>
          )}
        </div>

      <div className="relative" ref={selectorRef}>
        <div className="text-left">
          <div className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">
              {profile?.name ? `${profile.name}'s earnings` : 'earnings'}
          </div>
          <div className="flex items-center text-2xl sm:text-3xl font-bold text-[var(--text-primary)]" style={{ minWidth: '8ch', fontVariantNumeric: 'tabular-nums' }}>
            <AnimatedNumber value={earnings} isKidsMode={false} />
          </div>
        </div>
        
        {isProfileSelectorOpen && otherProfiles.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-60 bg-[var(--bg-secondary)]/80 backdrop-blur-lg border border-[var(--border-primary)] rounded-xl shadow-xl z-10 overflow-hidden py-1 animate-fade-in-fast">
              <div className="px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">Switch to:</div>
              {otherProfiles.map((p, index) => (
                <button 
                  key={p.id} 
                  onClick={() => { setActiveProfileId(p.id); setIsProfileSelectorOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-[var(--bg-tertiary)] transition-colors animate-slide-in-stagger"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {p.image ? <img src={p.image} alt={p.name} className="w-7 h-7 rounded-full object-cover"/> : <UserCircleIcon className="w-7 h-7"/>}
                  <span className="font-semibold">{p.name}</span>
                </button>
              ))}
            </div>
        )}
      </div>
    </div>
  );
 
  const kidsEarningsContent = (
    <div className="flex flex-col items-center space-y-2 py-3">
       {showFireworks && isKidsMode && (
         <div key={`fireworks-kid-${earnings}`} className="absolute inset-0 pointer-events-none flex items-center justify-center">
           {Array.from({ length: 15 }).map((_, i) => (
             <div
               key={i}
               className="absolute text-xl font-bold text-[var(--success)] animate-fireworks-burst"
               style={{
                 '--angle': `${Math.random() * 360}deg`,
                 '--distance': `${30 + Math.random() * 40}px`,
                 animationDelay: `${Math.random() * 0.2}s`,
               } as React.CSSProperties}
             >$</div>
           ))}
         </div>
       )}
       <div className="text-center">
           <div className="text-sm font-medium text-[var(--text-secondary)]">Earnings</div>
           <div className="flex justify-center items-center text-3xl font-bold text-[var(--text-primary)]" style={{ minWidth: '8ch', fontVariantNumeric: 'tabular-nums' }}>
              <AnimatedNumber value={earnings} isKidsMode={isKidsMode} />
           </div>
       </div>
   </div>
 );
  
  return (
    <>
      {isKidsMode ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center text-[var(--text-primary)] flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
              aria-label="Upload profile picture"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="rounded-full focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-primary)] transition-all"
              aria-label="Change profile picture"
            >
              {profile ? (
                profile.image ? (
                  <img src={profile.image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-white/30 hover:opacity-90 transition-opacity" />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)] hover:opacity-90 transition-opacity" />
                )
              ) : (
                <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)] hover:opacity-90 transition-opacity" />
              )}
            </button>
          </div>
          <div 
            className={`relative w-full max-w-xs rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.15)] 
                        ${isPulsing && isKidsMode ? 'animate-pulse-once' : ''}`}
            onAnimationEnd={() => setIsPulsing(false)}
          >
              <div className="animate-shimmer absolute inset-0"></div>
              <div className="relative z-10">
                {kidsEarningsContent}
                {pendingBonuses.length > 0 && (
                  <BonusNotificationButton 
                    onClick={() => onShowBonusNotification(pendingBonuses[0])}
                  />
                )}
                {showCashOutButton && pendingBonuses.length === 0 && (
                    <div className="px-4 pb-4 animate-fade-in-fast">
                      <button 
                          onClick={handleCashOutClick}
                          disabled={isCashOutDisabled}
                          className="w-full bg-[var(--success)] hover:opacity-80 text-[var(--success-text)] font-bold py-3 px-4 rounded-lg transform hover:-translate-y-px transition-all disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                      >
                          Cash Out
                      </button>
                    </div>
                )}
              </div>
          </div>
        </div>
      ) : (
        <>
            <div className="w-full flex justify-between items-start gap-4">
                <div className="flex-shrink-0">
                    {earningsContent}
                </div>
                
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-end gap-2">
                      {showCashOutButton && (
                          <button 
                              onClick={handleCashOutClick}
                              disabled={isCashOutDisabled}
                              className="w-[120px] flex justify-center bg-[var(--success)] hover:opacity-80 text-[var(--success-text)] font-bold py-2 px-4 rounded-lg transform hover:-translate-y-px transition-all disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                          >
                              Cash Out
                          </button>
                      )}
                      
                      <button 
                          onClick={onShowHistory}
                          className="w-[120px] bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] font-semibold py-2 px-4 rounded-lg border border-[var(--border-secondary)] transition-colors flex items-center gap-1.5 justify-center"
                      >
                          <HistoryIcon />
                          <span>History</span>
                      </button>
                  </div>
                </div>
            </div>
            
            <div className="mt-2">
              <div className="relative w-full animate-fade-in-fast select-none">
                <div className="text-center mb-3">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{weeklyTitle}</h3>
                  <div className="h-5">
                    <button
                      onClick={handleGoToCurrentWeek}
                      className={`text-sm font-semibold text-[var(--accent-primary)] hover:underline transition-opacity duration-300 ${isViewingCurrentWeek ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                      aria-hidden={isViewingCurrentWeek}
                      tabIndex={isViewingCurrentWeek ? -1 : 0}
                    >
                      Go to This Week
                    </button>
                  </div>
                </div>
                <SwipableWeeklyNavigator 
                  currentDate={selectedDate}
                  onWeekChange={setSelectedDate}
                />
              </div>
            </div>
        </>
      )}
      <style>{`
          @keyframes fireworks-burst {
              from {
                  transform: translate(0, 0) scale(0.5);
                  opacity: 1;
              }
              to {
                  transform: translate(calc(cos(var(--angle)) * var(--distance)), calc(sin(var(--angle)) * var(--distance))) scale(0);
                  opacity: 0;
              }
          }
          .animate-fireworks-burst {
              animation: fireworks-burst 0.8s ease-out forwards;
          }
          @keyframes fade-in-fast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          
          @keyframes slide-in-stagger {
            from { opacity: 0; transform: translateX(-15px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-stagger {
              animation: slide-in-stagger 0.3s ease-out forwards;
              opacity: 0;
          }

          @keyframes shimmer {
            0% { background-position: -200% -200%; }
            100% { background-position: 200% 200%; }
          }
          .animate-shimmer {
            background-image: linear-gradient(
              135deg,
              transparent 30%,
              rgba(252, 251, 222, 0.4) 45%,
              rgba(252, 251, 222, 0.6) 50%,
              rgba(252, 251, 222, 0.4) 55%,
              transparent 70%
            );
            background-size: 200% 200%;
            background-repeat: no-repeat;
            animation: shimmer 10s ease-in-out infinite;
            pointer-events: none;
          }
          @keyframes pulse-once {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .animate-pulse-once {
            animation: pulse-once 0.6s ease-in-out;
          }
      `}</style>
    </>
  );
};

export default Header;