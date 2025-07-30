

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CoinIcon, HistoryIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon, DAY_SHORT_NAMES, DAYS_OF_WEEK } from '../constants';
import { Profile, Day } from '../types';

interface HeaderProps {
  earnings: number;
  isKidsMode: boolean;
  profile: Profile | null | undefined;
  onCashOut: () => void;
  onShowHistory: () => void;
  isCashOutDisabled: boolean;
  showCashOutButton: boolean;
  viewMode: 'weekly' | 'daily';
  setViewMode: (mode: 'weekly' | 'daily') => void;
  weeklyTitle: string;
  isToday: boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentWeekDays: Date[];
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  isViewingCurrentWeek: boolean;
  handleGoToCurrentWeek: () => void;
  onUpdateProfileImage: (profileId: string, image: string | null) => void;
}

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};


const WeeklyDatePicker = ({ selectedDate, onDateSelect }: { selectedDate: Date, onDateSelect: (date: Date) => void }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(1); // 0: prev, 1: current, 2: next

  const allDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDayOfWeek = today.getDay(); // Sunday - 0
    
    // Start of the previous week (Sunday)
    const startOfLastWeek = new Date(today);
    startOfLastWeek.setDate(today.getDate() - currentDayOfWeek - 7);
    
    const dateArray = Array.from({ length: 21 }).map((_, i) => {
      const d = new Date(startOfLastWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
    return dateArray;
  }, []);
  
  const weeks = useMemo(() => {
    return [allDates.slice(0, 7), allDates.slice(7, 14), allDates.slice(14, 21)];
  }, [allDates]);
  
  // Set initial scroll position to the current week
  useEffect(() => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        setTimeout(() => {
            container.scrollLeft = container.offsetWidth; // Start on the second week (current week)
        }, 0);
    }
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, offsetWidth } = scrollContainerRef.current;
      const newIndex = Math.round(scrollLeft / offsetWidth);
      if (newIndex !== currentWeekIndex) {
        setCurrentWeekIndex(newIndex);
      }
    }
  };

  const scrollToWeek = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        left: container.offsetWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const formatDateString = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const todayString = formatDateString(new Date());

  return (
    <div className="relative w-full mt-4 p-2 rounded-xl bg-[var(--bg-tertiary)] select-none">
       {currentWeekIndex > 0 && (
          <button 
              onClick={() => scrollToWeek(currentWeekIndex - 1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors z-10"
              aria-label="Previous week"
          >
              <ChevronLeftIcon className="h-6 w-6 text-[var(--text-secondary)]"/>
          </button>
      )}
      {currentWeekIndex < weeks.length - 1 && (
          <button 
              onClick={() => scrollToWeek(currentWeekIndex + 1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors z-10"
              aria-label="Next week"
          >
              <ChevronRightIcon className="h-6 w-6 text-[var(--text-secondary)]"/>
          </button>
      )}

      <div className="w-full max-w-[calc(100%-5rem)] mx-auto">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--text-secondary)] mb-2 px-1">
          {DAYS_OF_WEEK.map(day => (
              <div key={day}>{DAY_SHORT_NAMES[day]}</div>
          ))}
        </div>
        <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide"
            onScroll={handleScroll}
            style={{ scrollSnapType: 'x mandatory' }}
        >
            {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1 flex-[0_0_100%]" style={{ scrollSnapAlign: 'start' }}>
                    {week.map((date) => {
                      const isSelected = formatDateString(date) === formatDateString(selectedDate);
                      const isToday = formatDateString(date) === todayString;
                      return (
                        <div key={formatDateString(date)} className="flex justify-center">
                          <button
                            onClick={() => onDateSelect(date)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 font-bold text-sm ${
                              isSelected
                                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg'
                                : isToday
                                ? 'bg-[var(--accent-primary)] bg-opacity-20 text-[var(--text-primary)]'
                                : 'bg-transparent hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                            }`}
                            aria-label={`Select date ${date.toLocaleDateString()}`}
                          >
                            {date.getDate()}
                          </button>
                        </div>
                      );
                    })}
                </div>
            ))}
        </div>
      </div>

       <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .select-none { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
      `}</style>
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
  viewMode,
  setViewMode,
  weeklyTitle,
  isToday,
  selectedDate,
  setSelectedDate,
  currentWeekDays,
  handlePreviousWeek,
  handleNextWeek,
  isViewingCurrentWeek,
  handleGoToCurrentWeek,
  onUpdateProfileImage
}) => {
  const [showFireworks, setShowFireworks] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(earnings);
  const prevEarnings = usePrevious(earnings);

  const earningsRef = useRef<HTMLDivElement>(null);
  const [isEarningsFloating, setIsEarningsFloating] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (prevEarnings !== undefined && earnings > prevEarnings) {
      setShowFireworks(true);
      // Animate the number
      const diff = earnings - prevEarnings;
      const duration = 500; // ms
      const stepTime = 20; // ms
      const steps = duration / stepTime;
      const increment = diff / steps;
      
      let current = prevEarnings;
      const timer = setInterval(() => {
        current += increment;
        if (current >= earnings) {
          setDisplayTotal(earnings);
          clearInterval(timer);
        } else {
          setDisplayTotal(current);
        }
      }, stepTime);

      setTimeout(() => {
        setShowFireworks(false);
      }, 1500); // Fireworks duration
      
      return () => clearInterval(timer);
    } else {
      // No animation, just update the number
      setDisplayTotal(earnings);
    }
  }, [earnings, prevEarnings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set floating when the element is NOT intersecting with the viewport
        setIsEarningsFloating(!entry.isIntersecting);
      },
      { 
        rootMargin: '0px',
        threshold: 0, // Callback fires when element is completely out of view
      }
    );

    const currentRef = earningsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isKidsMode]);

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
    <div className="flex items-center space-x-4 px-4 py-3 sm:px-6">
       {showFireworks && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
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
       <CoinIcon />
       <div className="text-left">
           <div className="text-sm font-medium text-[var(--text-secondary)]">Earnings</div>
           <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
               <span>$</span>{(displayTotal / 100).toFixed(2)}
           </div>
       </div>
   </div>
 );
 
 const kidsEarningsContent = (
    <div className="flex flex-col items-center space-y-1 py-3">
       {showFireworks && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
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
       <CoinIcon className="h-8 w-8" />
       <div className="text-center">
           <div className="text-sm font-medium text-[var(--text-secondary)]">Earnings</div>
           <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
               <span>$</span>{(displayTotal / 100).toFixed(2)}
           </div>
       </div>
   </div>
 );
  
  const WeekNavigator = () => {
    return (
      <div className="w-full flex items-center justify-between p-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] mt-4 animate-fade-in-fast">
        <button onClick={handlePreviousWeek} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors" aria-label="Previous week">
          <ChevronLeftIcon />
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-x-4">
          <div className='text-center'>
            <div className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {weeklyTitle}
            </div>
          </div>
          {!isViewingCurrentWeek && (
            <button onClick={handleGoToCurrentWeek} className="text-xs sm:text-sm font-semibold text-[var(--accent-primary)] hover:underline">
              Go to This Week
            </button>
          )}
        </div>
        <button onClick={handleNextWeek} disabled={isViewingCurrentWeek} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next week">
          <ChevronRightIcon />
        </button>
      </div>
    );
  };
  
  return (
    <>
      {isKidsMode ? (
        <div className="mb-4 flex flex-col items-center gap-4">
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
                  <img src={profile.image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-[var(--border-primary)] shadow-lg hover:opacity-90 transition-opacity" />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)] hover:opacity-90 transition-opacity" />
                )
              ) : (
                <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)] hover:opacity-90 transition-opacity" />
              )}
            </button>
          </div>
          <div 
            ref={earningsRef} 
            className={`relative w-full max-w-xs transition-opacity duration-300 ${isEarningsFloating ? 'opacity-0' : 'opacity-100'} bg-[var(--bg-secondary)] backdrop-blur-sm shadow-xl border border-[var(--border-primary)] rounded-2xl overflow-hidden`}
          >
              {kidsEarningsContent}
              {showCashOutButton && (
                  <div className="px-4 pb-4 animate-fade-in-fast">
                    <button 
                        onClick={onCashOut}
                        disabled={isCashOutDisabled}
                        className="w-full bg-[var(--success)] hover:opacity-80 text-[var(--success-text)] font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-px transition-all disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Cash Out
                    </button>
                  </div>
              )}
          </div>
        </div>
      ) : (
        <>
            <div className="w-full flex md:grid md:grid-cols-3 justify-between items-center gap-4 md:gap-6">
                <div className="md:col-start-2 md:justify-self-center">
                    <div 
                        ref={earningsRef} 
                        className={`relative transition-opacity duration-300 ${isEarningsFloating ? 'opacity-0' : 'opacity-100'} bg-[var(--bg-secondary)] backdrop-blur-sm shadow-xl border border-[var(--border-primary)] rounded-2xl`}
                    >
                        {earningsContent}
                    </div>
                </div>
                
                <div className="md:col-start-3 md:justify-self-end">
                    <div className="flex flex-col items-end gap-2">
                        {showCashOutButton && (
                            <button 
                                onClick={onCashOut}
                                disabled={isCashOutDisabled}
                                className="min-w-[150px] flex justify-center bg-[var(--success)] hover:opacity-80 text-[var(--success-text)] font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-px transition-all disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Cash Out
                            </button>
                        )}
                        
                        <button 
                            onClick={onShowHistory}
                            className="min-w-[150px] bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] font-semibold py-2 px-4 rounded-lg shadow-md border border-[var(--border-secondary)] transition-colors flex items-center gap-1.5 justify-center"
                        >
                            <HistoryIcon />
                            <span>History</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 mb-8">
              <div className="flex items-baseline justify-between gap-4">
                 {viewMode === 'weekly' ? (
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] whitespace-nowrap">
                    Weekly Chores
                  </h2>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] whitespace-nowrap">
                    {isToday ? "Today's Chores" : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </h2>
                )}

                <div className="bg-[var(--bg-tertiary)] rounded-full p-1 flex items-center">
                  <button onClick={() => setViewMode('weekly')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${viewMode === 'weekly' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Weekly</button>
                  <button onClick={() => setViewMode('daily')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${viewMode === 'daily' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Daily</button>
                </div>
              </div>
              
              {viewMode === 'weekly' && (
                <WeekNavigator />
              )}
              {viewMode === 'daily' && !isKidsMode && (
                <WeeklyDatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate} />
              )}
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
           @keyframes fade-in-fast { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
       {isEarningsFloating && (
        <div className="fixed top-4 right-4 sm:right-6 md:right-8 z-30 bg-[var(--bg-secondary)] backdrop-blur-sm shadow-xl border border-[var(--border-primary)] rounded-2xl animate-fade-in-fast">
          {earningsContent}
        </div>
      )}
    </>
  );
};

export default Header;