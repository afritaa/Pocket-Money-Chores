

import React, { useState } from 'react';
import { Chore, Day, PastChoreApproval } from '../types';
import { CheckIcon, PencilIcon, ExclamationIcon, CoinIcon, StarIcon, HourglassIcon } from '../constants';
import DayButton from './DayButton';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SparkleEffect from './SparkleEffect';
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
  isNewlyAdded?: boolean;
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

const IconDisplay = ({ icon, name }: { icon: string | null; name: string }) => {
  if (!icon) {
    return <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--accent-primary)] opacity-40" />;
  }
  if (icon.startsWith('data:image/') || icon.startsWith('/images/')) {
    return <img src={icon} alt={name} className="w-full h-full object-cover rounded-xl" />;
  }
  // Assume emoji if it's not a data URI or a path
  return <span className="text-3xl">{icon}</span>;
};

const ChoreCard: React.FC<ChoreCardProps> = ({ 
  chore, currentWeekDays, onToggleCompletion, onEditChore, viewMode, selectedDate, isKidsMode, pastChoreApprovals, onApprovePastChore, isNewlyAdded
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

  const isDraggable = !isKidsMode && !isBonus;
  
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
          <div className="flex items-center justify-center w-full h-full overflow-hidden rounded-xl">
            <IconDisplay icon={chore.icon} name={chore.name} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <PencilIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-[var(--bg-tertiary)] rounded-xl overflow-hidden">
          <IconDisplay icon={chore.icon} name={chore.name} />
        </div>
      )}
    </div>
  );

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
          <div className="bg-[var(--warning-bg-subtle)] border-[var(--warning-border)] p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-yellow-400/20 rounded-xl">
                <StarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--warning)]" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate">{chore.name}</h3>
                <p className="text-sm sm:text-base font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
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
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {currentWeekDays.map(date => {
                const dateString = formatDate(date);
                const dayOfWeek = getDayFromDate(date);
                return (
                  <div key={date.getTime()} className="flex justify-center">
                    <DayButton day={dayOfWeek} isAssigned={chore.days.includes(dayOfWeek)} isCompleted={chore.completions[dateString] === 'completed'} isCashedOut={chore.completions[dateString] === 'cashed_out'} isPendingCashOut={chore.completions[dateString] === 'pending_cash_out'} isPendingAcceptance={chore.completions[dateString] === 'pending_acceptance'} isToday={formatDate(date) === formatDate(new Date())} isPast={date.getTime() < today.getTime()} isKidsMode={isKidsMode} isPendingApproval={pastChoreApprovals.some(a => a.choreId === chore.id && a.date === dateString)} isBonus={false} onClick={(e) => { e.stopPropagation(); if (chore.days.includes(dayOfWeek)) { onToggleCompletion(chore.id, date); } }} />
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex-grow flex items-center gap-2 sm:gap-3 min-w-0">
            {ChoreIconButton}
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">{chore.name}</h3>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
             <p className="text-xl sm:text-2xl font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
            {isKidsMode ? (
              isPendingCashOutOnSelectedDate ? (
                <div className="flex items-center bg-[var(--bg-tertiary)] px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-[var(--border-primary)]"><p className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Pending</p></div>
              ) : (
                <>
                  {isPendingOnSelectedDate && <div className="flex items-center bg-[var(--warning-bg-subtle)] px-1.5 sm:px-2 py-1 rounded-lg animate-fade-in-fast border border-[var(--warning-border)]"><p className="text-[11px] sm:text-xs font-semibold text-[var(--warning)] tracking-wide">Approval Sent</p></div>}
                  <CompletionButton />
                </>
              )
            ) : (
              <CompletionButton />
            )}
          </div>
        </div>
      )
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`chore-${chore.id}`}
      className={`${isDraggable ? 'cursor-grab' : ''} mb-3`}
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
    >
      <div className={`relative bg-[var(--bg-secondary)] rounded-xl overflow-hidden transition-all duration-200 ${isDragging ? 'ring-2 ring-offset-2 ring-[var(--accent-primary)] ring-offset-[var(--bg-primary)]' : ''}`}>
        {isNewlyAdded && <SparkleEffect />}
        {cardInnerContent}
      </div>

       <style>
        {`
          @keyframes firework-fly { 0% { transform: translateY(0) scale(1); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-80px) scale(0); opacity: 0; } }
          .particle-container { position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; transform-origin: 0 0; }
          .particle { width: 100%; height: 100%; border-radius: 50%; animation: firework-fly 800ms ease-out forwards; }
          .particle-container-0 { transform: rotate(0deg); } .particle-container-0 .particle { background-color: var(--accent-primary); }
          .particle-container-1 { transform: rotate(24deg); } .particle-container-1 .particle { background-color: var(--success); }
          .particle-container-2 { transform: rotate(48deg); } .particle-container-2 .particle { background-color: var(--accent-secondary); }
          .particle-container-3 { transform: rotate(72deg); } .particle-container-3 .particle { background-color: var(--accent-primary); }
          .particle-container-4 { transform: rotate(96deg); } .particle-container-4 .particle { background-color: var(--success); }
          .particle-container-5 { transform: rotate(120deg); } .particle-container-5 .particle { background-color: var(--accent-secondary); }
          .particle-container-6 { transform: rotate(144deg); } .particle-container-6 .particle { background-color: var(--accent-primary); }
          .particle-container-7 { transform: rotate(168deg); } .particle-container-7 .particle { background-color: var(--success); }
          .particle-container-8 { transform: rotate(192deg); } .particle-container-8 .particle { background-color: var(--accent-secondary); }
          .particle-container-9 { transform: rotate(216deg); } .particle-container-9 .particle { background-color: var(--accent-primary); }
          .particle-container-10 { transform: rotate(240deg); } .particle-container-10 .particle { background-color: var(--success); }
          .particle-container-11 { transform: rotate(264deg); } .particle-container-11 .particle { background-color: var(--accent-secondary); }
          .particle-container-12 { transform: rotate(288deg); } .particle-container-12 .particle { background-color: var(--accent-primary); }
          .particle-container-13 { transform: rotate(312deg); } .particle-container-13 .particle { background-color: var(--success); }
          .particle-container-14 { transform: rotate(336deg); } .particle-container-14 .particle { background-color: var(--accent-secondary); }
          
          @keyframes fade-in-fast { from { opacity: 0; transform: translateX(5px); } to { opacity: 1; transform: translateX(0); } }
          .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
        `}
      </style>
    </div>
  );
};

export default ChoreCard;