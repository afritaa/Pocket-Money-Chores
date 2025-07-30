


import React, { useState } from 'react';
import { Chore, Day, PastChoreApproval } from '../types';
import { CheckIcon, PencilIcon, DragHandleIcon, ExclamationIcon, CoinIcon } from '../constants';
import DayButton from './DayButton';

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
  chore, currentWeekDays, onToggleCompletion, onEditChore, onReorderChores, viewMode, selectedDate, isKidsMode, pastChoreApprovals, onApprovePastChore, draggingChoreId, dragOverChoreId, onDragStartTouch
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isMouseDragOver, setIsMouseDragOver] = useState(false);
  
  const selectedDateString = formatDate(selectedDate);
  const completionState = chore.completions[selectedDateString];
  const isCompletedOnSelectedDate = completionState === 'completed';
  const isCashedOutOnSelectedDate = completionState === 'cashed_out';
  const isPendingCashOutOnSelectedDate = completionState === 'pending_cash_out';
  const pendingApproval = pastChoreApprovals.find(a => a.choreId === chore.id && a.date === selectedDateString);
  const isPendingOnSelectedDate = !!pendingApproval;

  const handleCompleteClick = () => {
    // Parent's one-click approval in daily view
    if (!isKidsMode && pendingApproval && onApprovePastChore) {
      onApprovePastChore(pendingApproval.id);
      return;
    }

    if (!isCompletedOnSelectedDate) {
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 800);
    }
    onToggleCompletion(chore.id, selectedDate);
  };

  const isSelectedDateInPast = new Date(selectedDate).setHours(0, 0, 0, 0) < today.getTime();

  // Drag handlers for mouse
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('choreId', chore.id);
    e.dataTransfer.effectAllowed = 'move';
    // Optional: you could call a function here to set a global dragging state
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsMouseDragOver(true);
  };
  const handleDragLeave = () => setIsMouseDragOver(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsMouseDragOver(false);
    const draggedChoreId = e.dataTransfer.getData('choreId');
    if (onReorderChores && draggedChoreId && draggedChoreId !== chore.id) {
      onReorderChores(draggedChoreId, chore.id);
    }
  };

  const isDraggable = !isKidsMode && !!onReorderChores && !!onDragStartTouch;
  const isDragging = chore.id === draggingChoreId;
  const isDragOver = isMouseDragOver || chore.id === dragOverChoreId;

  if (viewMode === 'weekly') {
    return (
      <div
        id={`chore-${chore.id}`}
        className={`bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-3 transition-all duration-300 flex items-center gap-3 shadow-lg 
            ${isDragging ? 'opacity-75 shadow-2xl z-20 scale-105' : 'z-10'} 
            ${isDragOver ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] ring-[var(--accent-primary)]' : ''}`}
        style={{'--shadow-color': 'var(--shadow-color)'} as React.CSSProperties}
        onDragOver={isDraggable ? handleDragOver : undefined}
        onDragLeave={isDraggable ? handleDragLeave : undefined}
        onDrop={isDraggable ? handleDrop : undefined}
        data-chore-id={chore.id}
      >
        {isDraggable && (
          <div
            className="p-2 -ml-2 text-slate-400 cursor-grab active:cursor-grabbing touch-none"
            draggable={true}
            onDragStart={handleDragStart}
            onTouchStart={(e) => onDragStartTouch && onDragStartTouch(e, chore.id)}
            aria-label="Reorder chore"
          >
            <DragHandleIcon />
          </div>
        )}
          {chore.icon && (
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-xl">
                {chore.icon.startsWith('data:image/') ? (
                    <img src={chore.icon} alt={chore.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <span className="text-3xl">{chore.icon}</span>
                )}
            </div>
          )}
          <div className="flex-grow text-[var(--text-primary)]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{chore.name}</h3>
                  <p className="text-base font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {onEditChore && (
                    <button onClick={() => onEditChore(chore)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-tertiary)]" aria-label={`Edit chore: ${chore.name}`}>
                      <PencilIcon />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between gap-1 bg-[var(--bg-tertiary)] p-1.5 rounded-xl">
                  {currentWeekDays.map(date => {
                  const dateString = formatDate(date);
                  const dayOfWeek = getDayFromDate(date);
                  const isAssigned = chore.days.includes(dayOfWeek);
                  const completionState = chore.completions[dateString];
                  const isPending = pastChoreApprovals.some(a => a.choreId === chore.id && a.date === dateString);
                  const isCurrent = date.getTime() === today.getTime();
                  const isPast = date.getTime() < today.getTime();

                  return (
                      <DayButton 
                        key={date.getTime()} 
                        day={dayOfWeek} 
                        isAssigned={isAssigned} 
                        isCompleted={completionState === 'completed'} 
                        isCashedOut={completionState === 'cashed_out'}
                        isPendingCashOut={completionState === 'pending_cash_out'}
                        isToday={isCurrent} 
                        isPast={isPast} 
                        isKidsMode={isKidsMode} 
                        isPendingApproval={isPending}
                        onClick={() => {
                            const approval = pastChoreApprovals.find(a => a.choreId === chore.id && a.date === dateString);
                            if (!isKidsMode && approval && onApprovePastChore) {
                                onApprovePastChore(approval.id);
                            } else if (isAssigned) {
                                onToggleCompletion(chore.id, date);
                            }
                        }}
                      />
                  );
                  })}
              </div>
          </div>
      </div>
    );
  }

  const CompletionButton = () => (
    <button
      onClick={handleCompleteClick}
      disabled={isKidsMode && (isCashedOutOnSelectedDate || isPendingCashOutOnSelectedDate)}
      className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:-translate-y-px active:scale-95 flex-shrink-0 ${
      isCompletedOnSelectedDate 
          ? 'bg-[var(--success)] text-[var(--success-text)] shadow-md'
          : isCashedOutOnSelectedDate
          ? 'bg-[var(--success-cashed-out-bg)] text-[var(--success-cashed-out-text)] shadow-inner'
          : isPendingOnSelectedDate
          ? 'bg-[var(--warning)] text-[var(--warning-text)] shadow-md'
          : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)]'
      } disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
      aria-label={isCompletedOnSelectedDate ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {isCompletedOnSelectedDate ? <CheckIcon className="w-7 h-7" /> : isCashedOutOnSelectedDate ? <CoinIcon className="w-8 h-8" /> : isPendingOnSelectedDate ? <ExclamationIcon className="w-7 h-7" /> : null}
      {isCelebrating && !isCashedOutOnSelectedDate && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
          {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className={`particle-container particle-container-${i}`}>
              <div className="particle" />
              </div>
          ))}
          </div>
      )}
    </button>
  );

  // Daily View
  return (
    <div
      id={`chore-${chore.id}`}
      className={`relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3 transition-all duration-300 
        ${isDragging ? 'opacity-75 shadow-2xl z-20 scale-105' : 'z-10'} 
        ${isDragOver ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] ring-[var(--accent-primary)]' : ''}`}
      style={{'--shadow-color': 'var(--shadow-color)'} as React.CSSProperties}
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragLeave={isDraggable ? handleDragLeave : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
      data-chore-id={chore.id}
    >
        {isDraggable && (
          <div
            className="p-2 -ml-2 text-slate-400 cursor-grab active:cursor-grabbing touch-none"
            draggable={true}
            onDragStart={handleDragStart}
            onTouchStart={(e) => onDragStartTouch && onDragStartTouch(e, chore.id)}
            aria-label="Reorder chore"
          >
            <DragHandleIcon />
          </div>
        )}

        {/* Left Section: Icon and Info */}
        <div className="flex-grow flex items-center gap-3 min-w-0">
            {chore.icon && (
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-xl">
                    {chore.icon.startsWith('data:image/') ? (
                        <img src={chore.icon} alt={chore.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <span className="text-3xl">{chore.icon}</span>
                    )}
                </div>
            )}
            <div className="flex-grow min-w-0">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">{chore.name}</h3>
                <p className="text-base font-bold text-[var(--success)]">${(chore.value / 100).toFixed(2)}</p>
            </div>
        </div>
        
        {/* Right Section: Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
            {isKidsMode ? (
              isPendingCashOutOnSelectedDate ? (
                <div className="flex items-center bg-[var(--bg-tertiary)] px-3 py-2 rounded-lg border border-[var(--border-primary)]">
                    <p className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
                        Cash Out Pending
                    </p>
                </div>
              ) : (
                <>
                    {isPendingOnSelectedDate && (
                        <div className="hidden sm:flex items-center bg-[var(--warning-bg-subtle)] px-2 py-1 rounded-lg animate-fade-in-fast border border-[var(--warning-border)]">
                            <p className="text-xs font-semibold text-[var(--warning)] tracking-wide">
                                Sent for Approval
                            </p>
                        </div>
                    )}
                    <CompletionButton />
                </>
              )
            ) : (
              <>
                {onEditChore && (
                    <button onClick={() => onEditChore(chore)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-tertiary)]" aria-label={`Edit chore: ${chore.name}`}>
                        <PencilIcon />
                    </button>
                )}
                <CompletionButton />
              </>
            )}
        </div>

       <style>
        {`
          .touch-none { touch-action: none; }
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