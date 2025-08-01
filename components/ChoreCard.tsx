
import React, { useState } from 'react';
import { Chore, Day, PastChoreApproval } from '../types';
import { CheckIcon, PencilIcon, ExclamationIcon, CoinIcon, StarIcon } from '../constants';
import DayButton from './DayButton';
import useSound from '../hooks/useSound';
import { CHORE_COMPLETE_SOUND } from '../sounds';

interface ChoreCardProps {
  chore: Chore;
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onEditChore?: (chore: Chore) => void;
  onReorderChores?: (draggedChoreId: string, targetChoreId: string) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
  isKidsMode: boolean;
  pastChoreApprovals: PastChoreApproval[];
  onApprovePastChore?: (approvalId: string) => void;
  draggingChoreId: string | null;
  dragOverChoreId: string | null;
  onDragStartTouch?: (e: React.TouchEvent, choreId: string) => void;
  areSoundsEnabled: boolean;
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
  chore, currentWeekDays, onToggleCompletion, onEditChore, onReorderChores, viewMode, selectedDate, isKidsMode, pastChoreApprovals, onApprovePastChore, draggingChoreId, dragOverChoreId, onDragStartTouch, areSoundsEnabled
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isMouseDragOver, setIsMouseDragOver] = useState(false);
  const [dragOverDirection, setDragOverDirection] = useState<'up' | 'down' | null>(null);

  const playCompleteSound = useSound(CHORE_COMPLETE_SOUND, areSoundsEnabled);

  const isBonus = chore.type === 'bonus';
  const selectedDateString = formatDate(selectedDate);
  const completionState = chore.completions[selectedDateString];
  const isCompletedOnSelectedDate = completionState === 'completed';
  const isCashedOutOnSelectedDate = completionState === 'cashed_out';
  const isPendingCashOutOnSelectedDate = completionState === 'pending_cash_out';
  const pendingApproval = pastChoreApprovals.find(a => a.choreId === chore.id && a.date === selectedDateString);
  const isPendingOnSelectedDate = !!pendingApproval;

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isKidsMode && pendingApproval && onApprovePastChore) {
      onApprovePastChore(pendingApproval.id);
      return;
    }
    
    if (isBonus) return;

    if (!isCompletedOnSelectedDate) {
        playCompleteSound();
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 800);
    }
    onToggleCompletion(chore.id, selectedDate);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('choreId', chore.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingChoreId && draggingChoreId !== chore.id) {
        setIsMouseDragOver(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        setDragOverDirection(y > rect.height / 2 ? 'down' : 'up');
    }
  };
  
  const handleDragLeave = () => {
    setIsMouseDragOver(false);
    setDragOverDirection(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsMouseDragOver(false);
    setDragOverDirection(null);
    const draggedChoreId = e.dataTransfer.getData('choreId');
    if (onReorderChores && draggedChoreId && draggedChoreId !== chore.id) {
      onReorderChores(draggedChoreId, chore.id);
    }
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

  const isDraggable = !isKidsMode && !!onReorderChores && !!onDragStartTouch && !isBonus;
  const isDragging = chore.id === draggingChoreId;
  const isDragOver = isMouseDragOver || (chore.id === dragOverChoreId && dragOverChoreId !== draggingChoreId);
  const slideDirection = dragOverDirection || 'up'; // Default to sliding up for touch where direction isn't tracked

  const ChoreIconButton = (
    <button
      onClick={() => onEditChore?.(chore)}
      disabled={isKidsMode || !onEditChore}
      className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-xl transition-all duration-200 disabled:cursor-default"
      aria-label={isKidsMode ? `Chore icon` : `Edit chore icon for ${chore.name}`}
    >
      {!isKidsMode && onEditChore ? (
        <>
          {/* Base Layer: Pencil Icon */}
          <PencilIcon className="absolute inset-0 m-auto w-6 h-6 sm:w-7 sm:h-7 text-[var(--text-secondary)]" />
          
          {/* Top Layer: Chore Image/Emoji with opacity */}
          <div className="w-full h-full flex items-center justify-center opacity-50">
            {chore.icon ? (
              chore.icon.startsWith('data:image/') ? (
                <img src={chore.icon} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-3xl">{chore.icon}</span>
              )
            ) : null}
          </div>
        </>
      ) : (
        /* Original Kids Mode / No Edit view */
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
      )}
    </button>
  );

  const cardContent = (
    <div
      className={`relative transition-transform duration-300 ease-in-out ${isDragOver ? (slideDirection === 'down' ? 'translate-y-full' : '-translate-y-full') : ''}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onTouchStart={isDraggable ? (e) => onDragStartTouch?.(e, chore.id) : undefined}
      style={{ cursor: isDraggable ? 'grab' : 'default' }}
    >
      {isBonus ? (
          // Bonus Card Layout
          <div className="bg-[var(--warning-bg-subtle)] border-[var(--warning-border)] rounded-2xl p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
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
        // Weekly View Layout
        <div className="bg-[var(--bg-secondary)] p-2 sm:p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-grow flex items-center gap-2 sm:gap-3 min-w-0">
                  {ChoreIconButton}
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">{chore.name}</h3>
              </div>
              <div className="flex-shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
              </div>
          </div>
          <div className="flex justify-between gap-0.5 sm:gap-1">
              {currentWeekDays.map(date => {
              const dateString = formatDate(date);
              const dayOfWeek = getDayFromDate(date);
              return (
                  <DayButton 
                    key={date.getTime()} 
                    day={dayOfWeek} 
                    isAssigned={chore.days.includes(dayOfWeek)} 
                    isCompleted={chore.completions[dateString] === 'completed'} 
                    isCashedOut={chore.completions[dateString] === 'cashed_out'}
                    isPendingCashOut={chore.completions[dateString] === 'pending_cash_out'}
                    isToday={formatDate(date) === formatDate(new Date())}
                    isPast={date.getTime() < today.getTime()} 
                    isKidsMode={isKidsMode} 
                    isPendingApproval={pastChoreApprovals.some(a => a.choreId === chore.id && a.date === dateString)}
                    isBonus={false}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (chore.days.includes(dayOfWeek)) {
                          onToggleCompletion(chore.id, date);
                        }
                    }}
                  />
              );
              })}
          </div>
        </div>
      ) : (
        // Daily View Layout
        <div className="bg-[var(--bg-secondary)] p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
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
              <>
                <CompletionButton />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      id={`chore-${chore.id}`}
      className={`relative bg-transparent rounded-2xl transition-all duration-300 
        ${isDragging ? 'opacity-50 z-0' : 'z-10'}
        ${isBonus ? 'pointer-events-none' : ''}`}
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragLeave={isDraggable ? handleDragLeave : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
      data-chore-id={chore.id}
    >
      <div className={`bg-[var(--bg-secondary)] rounded-2xl ${isDragging ? 'shadow-2xl' : ''}`}>
        {cardContent}
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
