import React, { useState } from 'react';
import { Chore, Day, PastChoreApproval } from '../types';
import { CheckIcon, PencilIcon, ExclamationIcon, CoinIcon, StarIcon, HourglassIcon } from '../constants';
import DayButton from './DayButton';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSound } from '../hooks/useSound';


interface ChoreCardProps {
  chore: Chore;
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onEditChore?: (chore: Chore) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
  isKidsMode: boolean;
  pastChoreApprovals: PastChoreApproval[];
  onApprovePastChore?: (approvalId: string) => void;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay();
  const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
  return days[dayIndex];
};

const ChoreCard: React.FC<ChoreCardProps> = ({ 
  chore, currentWeekDays, onToggleCompletion, onEditChore, viewMode, selectedDate, isKidsMode, pastChoreApprovals, onApprovePastChore
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isCelebrating, setIsCelebrating] = useState(false);
  const { playCompleteChore } = useSound();
  
  const isBonus = chore.type === 'bonus';
  const selectedDateString = formatDate(selectedDate);
  const completionState = chore.completions[selectedDateString];
  const isCompletedOnSelectedDate = completionState === 'completed';
  const isCashedOutOnSelectedDate = completionState === 'cashed_out';
  const isPendingCashOutOnSelectedDate = completionState === 'pending_cash_out';
  const pendingApproval = pastChoreApprovals.find(a => a.choreId === chore.id && a.date === selectedDateString);
  const isPendingOnSelectedDate = !!pendingApproval;
  const isPendingAcceptance = chore.type === 'bonus' && Object.values(chore.completions).includes('pending_acceptance');

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isKidsMode && pendingApproval && onApprovePastChore) {
      onApprovePastChore(pendingApproval.id);
      return;
    }
    
    if (isBonus) return;

    if (!isCompletedOnSelectedDate) {
        setIsCelebrating(true);
        playCompleteChore();
        setTimeout(() => setIsCelebrating(false), 800);
    }
    onToggleCompletion(chore.id, selectedDate);
  };

  const isDraggable = !isKidsMode;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chore.id,
    disabled: !isDraggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.95 : 1,
  };

  const CompletionButton = () => (
    <button
      onClick={handleCompleteClick}
      disabled={isKidsMode && (isCashedOutOnSelectedDate || isPendingCashOutOnSelectedDate)}
      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:-translate-y-px active:scale-95 flex-shrink-0 ${isCompletedOnSelectedDate ? 'bg-[var(--success)] text-[var(--success-text)]' : isCashedOutOnSelectedDate ? 'bg-[var(--success-cashed-out-bg)] text-[var(--success-cashed-out-text)]' : isPendingOnSelectedDate ? 'bg-[var(--warning)] text-[var(--warning-text)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)]'} disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
      aria-label={isCompletedOnSelectedDate ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {isCompletedOnSelectedDate ? <CheckIcon className="w-6 h-6 sm:w-7 sm:h-7" /> : isCashedOutOnSelectedDate ? <CoinIcon className="w-7 h-7 sm:w-8 sm:h-8" /> : isPendingOnSelectedDate ? <ExclamationIcon className="w-6 h-6 sm:w-7 sm:h-7" /> : null}
      {isCelebrating && !isCashedOutOnSelectedDate && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
          {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className={`particle-container particle-container-${i}`}><div className="particle" /></div>
          ))}
          </div>
      )}
    </button>
  );

  const ChoreIconButton = (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
      {!isKidsMode && onEditChore ? (
        <button 
          onClick={(e) => { e.stopPropagation(); onEditChore(chore); }}
          className="group w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)] rounded-xl transition-all duration-200 hover:bg-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-primary)]"
          aria-label={`Edit chore ${chore.name}`}
        >
          <div className="flex items-center justify-center w-full h-full">
            {chore.icon ? (
              chore.icon.startsWith('data:image/') ? (
                <img src={chore.icon} alt={chore.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-3xl">{chore.icon}</span>
              )
            ) : (
              <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--accent-primary)] opacity-40" />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
            <PencilIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--text-secondary)]" />
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-[var(--bg-tertiary)] rounded-xl">
          {chore.icon ? ( chore.icon.startsWith('data:image/') ? <img src={chore.icon} alt={chore.name} className="w-full h-full object-cover rounded-xl" /> : <span className="text-3xl">{chore.icon}</span> ) : ( <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--accent-primary)] opacity-40" /> )}
        </div>
      )}
    </div>
  );

  const bonusDateString = Object.keys(chore.completions)[0];

  const cardInnerContent = (
      isPendingAcceptance && !isKidsMode ? (
        <div className="bg-[var(--bg-tertiary)] opacity-80 p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3 border-2 border-dashed border-[var(--border-secondary)]">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-400/20 rounded-xl">
              <HourglassIcon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-500" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text-secondary)] truncate">Pending Bonus</h3>
              <p className="text-sm sm:text-base font-bold text-[var(--text-secondary)]">${(chore.value / 100).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center bg-[var(--bg-secondary)] px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-[var(--border-primary)]">
            <p className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Pending</p>
          </div>
        </div>
      ) : isBonus ? (
          <div className="relative bg-[var(--warning-bg-subtle)] border border-[var(--warning-border)] p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  {!isKidsMode && onEditChore ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditChore(chore); }}
                      className="group w-full h-full flex items-center justify-center bg-yellow-400/20 rounded-xl transition-all duration-200 hover:bg-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--warning)]"
                      aria-label="Edit bonus"
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        <StarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--warning)]" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
                        <PencilIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--text-secondary)]" />
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-yellow-400/20 rounded-xl">
                       <StarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--warning)]" />
                    </div>
                  )}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate">{chore.name}</h3>
                <div className="flex items-baseline gap-2">
                    <p className="text-sm sm:text-base font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
                    {bonusDateString && <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(bonusDateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-grow items-center justify-center text-center px-2">
                {chore.note && <p className="text-sm italic text-[var(--text-secondary)]">"{chore.note}"</p>}
            </div>
            <div className="flex-shrink-0 flex items-center">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--warning)] text-[var(--warning-text)]">
                <span className="text-2xl font-bold">$</span>
              </div>
            </div>
          </div>
      ) : viewMode === 'weekly' ? (
        <div className="p-2 sm:p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-grow flex items-center gap-2 sm:gap-3 min-w-0">
                  {ChoreIconButton}
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">{chore.name}</h3>
              </div>
              <div className="flex-shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
              </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
              {currentWeekDays.map((date, index) => {
                  const dayOfWeek = getDayFromDate(date);
                  const dateString = formatDate(date);
                  const completionState = chore.completions[dateString];
                  const isAssigned = chore.oneTimeDate ? chore.oneTimeDate === dateString : chore.days.includes(dayOfWeek);
                  const isPendingApproval = pastChoreApprovals.some(a => a.choreId === chore.id && a.date === dateString);
                  
                  return (
                      <DayButton 
                          key={index}
                          day={dayOfWeek}
                          isAssigned={isAssigned}
                          isCompleted={completionState === 'completed'}
                          isCashedOut={completionState === 'cashed_out'}
                          isPendingCashOut={completionState === 'pending_cash_out'}
                          isPendingAcceptance={false}
                          isToday={formatDate(date) === formatDate(new Date())}
                          isPast={date < today}
                          onClick={(e) => { e.stopPropagation(); onToggleCompletion(chore.id, date); }}
                          isKidsMode={isKidsMode}
                          isPendingApproval={isPendingApproval}
                          isBonus={false}
                      />
                  );
              })}
          </div>
        </div>
      ) : (
        <div className="p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0">
              {ChoreIconButton}
              <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">{chore.name}</h3>
                  <p className="text-sm sm:text-base font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
              </div>
          </div>
          <div className="flex-shrink-0">
              <CompletionButton />
          </div>
        </div>
      )
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`chore-${chore.id}`}
      className={`mb-4 transition-shadow duration-300 ${isDragging ? 'shadow-2xl' : ''} ${isBonus ? '' : 'bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-[var(--border-primary)]'}`}
    >
       <div {...attributes} {...(isDraggable ? listeners : undefined)} className={`${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}>
           {cardInnerContent}
       </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .particle-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          background-color: var(--success);
          border-radius: 50%;
          animation: pop-out 800ms ease-out forwards;
        }
        @keyframes pop-out {
          from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          to { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        ${Array.from({ length: 15 }).map((_, i) => {
          const angle = (360 / 15) * i;
          const distance = 40;
          return `.particle-container-${i} .particle { animation-name: pop-out-${i}; } @keyframes pop-out-${i} { from { transform: translate(-50%, -50%) scale(1); opacity: 1; } to { transform: translate(calc(-50% + ${Math.cos(angle * Math.PI / 180) * distance}px), calc(-50% + ${Math.sin(angle * Math.PI / 180) * distance}px)) scale(0); opacity: 0; } }`;
        }).join('')}
      `}</style>
    </div>
  );
};

export default ChoreCard;