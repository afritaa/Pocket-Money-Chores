import React, { useMemo, forwardRef, useRef } from 'react';
import { Chore, Day, PastChoreApproval } from '../types';
import { CheckIcon, PencilIcon, ExclamationIcon, CoinIcon, StarIcon, HourglassIcon } from '../constants';
import DayButton from './DayButton';
import { useSound } from '../hooks/useSound';
import { motion } from 'framer-motion';

export interface ChoreCardProps {
  chore: Chore;
  onToggleCompletion: (choreId: string, date: Date) => void;
  onEditChore?: (chore: Chore) => void;
  selectedDate: Date;
  currentDateForWeek: Date;
  isKidsMode: boolean;
  pastChoreApprovals: PastChoreApproval[];
  onApprovePastChore?: (approvalId: string) => void;
  isNewlyAcknowledgedBonus?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
}

const formatDate = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setHours(0, 0, 0, 0);
  return new Date(d.setDate(diff));
};

const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay();
  const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
  return days[dayIndex];
};


const IconDisplay = ({ icon, name }: { icon: string | null; name: string }) => {
  if (!icon) {
    return <StarIcon className="w-6 h-6 text-[var(--accent-primary)] opacity-40" />;
  }
  if (icon.startsWith('data:image/') || icon.startsWith('/images/')) {
    return <img src={icon} alt={name} className="w-full h-full object-cover" />;
  }
  return <span className="text-3xl">{icon}</span>;
};

const ChoreCard = forwardRef<HTMLDivElement, ChoreCardProps>(({ 
  chore, onToggleCompletion, onEditChore, selectedDate, currentDateForWeek, isKidsMode, pastChoreApprovals, onApprovePastChore, isNewlyAcknowledgedBonus, onPointerDown, onPointerUp, onPointerMove
}, ref) => {
  const { playCompleteChore } = useSound();
  const lastSoundPlayTime = useRef(0);
  
  const isBonus = chore.type === 'bonus';
  const selectedDateString = formatDate(selectedDate);
  const completionState = chore.completions[selectedDateString];
  
  const isCompleted = completionState === 'completed';
  const isCashedOut = completionState === 'cashed_out';
  const isPendingCashOut = completionState === 'pending_cash_out';
  const pendingApprovalForSelectedDate = pastChoreApprovals.find(a => a.choreId === chore.id && a.date === selectedDateString);

  const weekDates = useMemo(() => {
      const start = getStartOfWeek(currentDateForWeek);
      return Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          return date;
      });
  }, [currentDateForWeek]);
  
  // Parent view weekly layout
  if (!isKidsMode) {
    if (isBonus) {
        // New Bonus Card Layout for Parent
        const awardDate = chore.createdAt ? new Date(chore.createdAt) : new Date();
        const localAwardDate = new Date(awardDate.getUTCFullYear(), awardDate.getUTCMonth(), awardDate.getUTCDate());
        const awardDateString = localAwardDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        const stateOnCreation = chore.completions[chore.createdAt || ''];
        const isPendingAcceptance = stateOnCreation === 'pending_acceptance';

        return (
            <div 
              ref={ref} 
              className="relative chore-card-sizing-target touch-none p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #fceabb, #f8b500)', color: '#382300' }}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerMove={onPointerMove}
            >
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                      <IconDisplay icon={chore.icon} name={chore.name} />
                  </div>
                  <div className="flex-grow min-w-0">
                      <h3 className="font-bold">${(chore.value / 100).toFixed(2)} Bonus</h3>
                      {chore.note && <p className="text-sm italic opacity-70 truncate">"{chore.note}" on {awardDateString}</p>}
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {isPendingAcceptance 
                          ? <HourglassIcon className="w-6 h-6 text-slate-600" />
                          : <CoinIcon className="w-8 h-8" />
                      }
                  </div>
              </div>
            </div>
        );
    }

    return (
      <div 
        ref={ref} 
        className="relative chore-card-sizing-target touch-none rounded-lg"
        style={{ backgroundColor: 'var(--card-bg)' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
      >
        <div className="flex items-center gap-4 p-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--page-bg)' }}
            >
              <IconDisplay icon={chore.icon} name={chore.name} />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{chore.name}</h3>
              <div 
                className="text-sm font-bold py-0.5 px-2 rounded-full inline-block mt-1" 
                style={{ backgroundColor: 'var(--page-bg)', color: 'var(--text-primary)' }}
              >
                ${(chore.value / 100).toFixed(2)}
              </div>
              {chore.note && (
                <p className="text-xs text-[var(--text-muted)] italic mt-1 truncate">{chore.note}</p>
              )}
            </div>
            {onEditChore && (
              <button onClick={() => onEditChore(chore)} className="p-2 -m-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                <PencilIcon className="w-5 h-5" />
              </button>
            )}
        </div>
        <div className="grid grid-cols-7 gap-1 px-4 pb-4">
          {weekDates.map(date => {
            const dateString = formatDate(date);
            const dayOfWeek = getDayFromDate(date);
            const isAssigned = chore.days.includes(dayOfWeek);
            const completionState = chore.completions[dateString];
            const isPendingApproval = pastChoreApprovals.some(a => a.choreId === chore.id && a.date === dateString);

            return (
                <div key={dateString} className="flex flex-col items-center">
                    <DayButton
                        day={dayOfWeek}
                        isAssigned={isAssigned}
                        isCompleted={completionState === 'completed'}
                        isCashedOut={completionState === 'cashed_out'}
                        isPendingCashOut={completionState === 'pending_cash_out'}
                        isPendingAcceptance={completionState === 'pending_acceptance'}
                        isToday={formatDate(new Date()) === dateString}
                        isPast={date < new Date() && formatDate(new Date()) !== dateString}
                        onClick={() => onToggleCompletion(chore.id, date)}
                        isKidsMode={isKidsMode}
                        isPendingApproval={isPendingApproval}
                        isBonus={isBonus}
                    />
                    {isPendingApproval && onApprovePastChore && (
                        <button onClick={() => { const approval = pastChoreApprovals.find(a => a.choreId === chore.id && a.date === dateString); if(approval) onApprovePastChore(approval.id); }} className="mt-1 text-xs text-[var(--success)] font-semibold">Approve</button>
                    )}
                </div>
            )
          })}
        </div>
      </div>
    );
  }

  // Kid's view from here on
  if (isBonus) {
    return (
      <motion.div
        id={`chore-${chore.id}`}
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className={`relative chore-card-sizing-target touch-none flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg ${isNewlyAcknowledgedBonus ? 'new-bonus-pulse' : ''}`}
        style={{ background: 'linear-gradient(135deg, #fceabb, #f8b500)', color: '#382300' }}
      >
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
        >
          <IconDisplay icon={chore.icon} name={chore.name} />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-extrabold truncate text-base sm:text-lg text-[#382300]">Bonus!</h3>
          {chore.note && (
            <p className="text-xs italic truncate text-[#382300] opacity-70">"{chore.note}"</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-lg sm:text-xl text-[#6e4900]">
            +${(chore.value / 100).toFixed(2)}
          </div>
        </div>
      </motion.div>
    );
  }

  const handleToggleCompletion = () => {
    const now = Date.now();
    if (now - lastSoundPlayTime.current > 5000) {
      if (!isCompleted) playCompleteChore();
      lastSoundPlayTime.current = now;
    }
    onToggleCompletion(chore.id, selectedDate);
  };
  
  const isDisabled = isCashedOut || isPendingCashOut;
  
  let buttonClasses = isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--bg-tertiary)] border-2 border-[var(--border-secondary)]';
  if (isDisabled) buttonClasses += ' opacity-50 cursor-not-allowed';
  
  let cardBaseClasses = 'border-transparent';
  if (isCompleted) cardBaseClasses = 'bg-green-100/50 border-green-200';
  if (isDisabled) cardBaseClasses += ' opacity-70';

  return (
    <motion.div
      id={`chore-${chore.id}`}
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`relative chore-card-sizing-target touch-none flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all duration-300 ${cardBaseClasses} ${isNewlyAcknowledgedBonus ? 'new-bonus-pulse' : ''}`}
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
        <div className="flex-grow flex items-center gap-3 sm:gap-4 min-w-0">
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border"
              style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-secondary)' }}
            >
              <IconDisplay icon={chore.icon} name={chore.name} />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold truncate text-base sm:text-lg text-[var(--text-primary)]">{chore.name}</h3>
              {chore.note && (
                <p className="text-xs italic truncate text-[var(--text-muted)]">"{chore.note}"</p>
              )}
            </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="font-bold text-lg sm:text-xl text-[var(--success)]">
                ${(chore.value / 100).toFixed(2)}
            </div>
            {pendingApprovalForSelectedDate ? (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-400 text-white">
                <ExclamationIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            ) : (
              <button
                onClick={handleToggleCompletion}
                disabled={isDisabled}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 transform active:scale-90 ${buttonClasses}`}
              >
                  {isCompleted && <CheckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
              </button>
            )}
        </div>
        <style>{`
          @keyframes pulse-new-bonus {
            0% { box-shadow: 0 0 0 0 var(--accent-primary); }
            70% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
            100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
          }
          .new-bonus-pulse {
            animation: pulse-new-bonus 2s ease-out;
          }
        `}</style>
    </motion.div>
  );
});

export default ChoreCard;
