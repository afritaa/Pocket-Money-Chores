import React, { useState, useEffect, useRef } from 'react';
import { CoinIcon, HistoryIcon, UserCircleIcon } from '../constants';
import { Profile } from '../types';

interface HeaderProps {
  earnings: number;
  isKidsMode: boolean;
  profile: Profile | null | undefined;
  onCashOut: () => void;
  onShowHistory: () => void;
  isCashOutDisabled: boolean;
  showCashOutButton: boolean;
  title?: string;
}

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const Header: React.FC<HeaderProps> = ({ earnings, isKidsMode, profile, onCashOut, onShowHistory, isCashOutDisabled, showCashOutButton, title }) => {
  const [showFireworks, setShowFireworks] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(earnings);
  const prevEarnings = usePrevious(earnings);

  const earningsRef = useRef<HTMLDivElement>(null);
  const [isEarningsFloating, setIsEarningsFloating] = useState(false);


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
               <span>$</span>{displayTotal.toFixed(2)}
           </div>
       </div>
   </div>
 );
  
  return (
    <>
      {isKidsMode ? (
        <div className="mb-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-[var(--text-primary)] flex-shrink-0">
            {profile && (
              profile.image ? (
                <img src={profile.image} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-[var(--border-secondary)] shadow-lg" />
              ) : (
                <UserCircleIcon className="h-16 w-16 text-[var(--text-tertiary)]" />
              )
            )}
            {title && (
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">{title}</h2>
            )}
          </div>
          <div 
            ref={earningsRef} 
            className={`relative transition-opacity duration-300 ${isEarningsFloating ? 'opacity-0' : 'opacity-100'} bg-[var(--bg-secondary)] backdrop-blur-sm shadow-xl border border-[var(--border-primary)] rounded-2xl`}
            >
              {earningsContent}
          </div>
        </div>
      ) : (
        <div className="w-full flex md:grid md:grid-cols-3 justify-between items-center gap-4 md:gap-6 mb-8">
            {/* Earnings Card Wrapper */}
            <div className="md:col-start-2 md:justify-self-center">
                <div 
                    ref={earningsRef} 
                    className={`relative transition-opacity duration-300 ${isEarningsFloating ? 'opacity-0' : 'opacity-100'} bg-[var(--bg-secondary)] backdrop-blur-sm shadow-xl border border-[var(--border-primary)] rounded-2xl`}
                >
                    {earningsContent}
                </div>
            </div>
            
            {/* Buttons Wrapper */}
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