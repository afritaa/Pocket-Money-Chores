import React, { useState } from 'react';
import { Chore, Day } from '../types';
import { TrashIcon, CheckIcon, PencilIcon, DragHandleIcon } from '../constants';
import DayButton from './DayButton';

interface ChoreCardProps {
  chore: Chore;
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onDeleteChore?: (choreId: string) => void;
  onEditChore?: (chore: Chore) => void;
  onReorderChores?: (draggedChoreId: string, targetChoreId: string) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
  isKidsMode: boolean;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay();
  const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
  return days[dayIndex];
};

const ChoreCard: React.FC<ChoreCardProps> = ({ 
  chore, currentWeekDays, onToggleCompletion, onDeleteChore, onEditChore, onReorderChores, viewMode, selectedDate, isKidsMode
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const isCompletedOnSelectedDate = chore.completions[formatDate(selectedDate)] === true;

  const handleCompleteClick = () => {
    if (!isCompletedOnSelectedDate) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 800);
    }
    onToggleCompletion(chore.id, selectedDate);
  };

  const isSelectedDateInPast = new Date(selectedDate).setHours(0, 0, 0, 0) < today.getTime();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('choreId', chore.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedChoreId = e.dataTransfer.getData('choreId');
    if (onReorderChores && draggedChoreId && draggedChoreId !== chore.id) {
      onReorderChores(draggedChoreId, chore.id);
    }
  };

  const isDraggable = !isKidsMode && !!onReorderChores;

  return (
    <div 
      className={`relative transition-all duration-200 ${isDragOver ? 'ring-2 ring-[var(--accent-primary)] rounded-2xl' : ''}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragLeave={isDraggable ? handleDragLeave : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
    >
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-4 sm:p-5 transition-all duration-300 flex items-center gap-4 shadow-lg" style={{'--shadow-color': 'var(--shadow-color)'} as React.CSSProperties}>
        
        {isDraggable && <DragHandleIcon />}

        {chore.icon && (
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-xl">
              {chore.icon.startsWith('data:image/') ? (
                  <img src={chore.icon} alt={chore.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                  <span className="text-4xl">{chore.icon}</span>
              )}
          </div>
        )}

        {viewMode === 'weekly' ? (
            <div className="flex-grow text-[var(--text-primary)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">{chore.name}</h3>
                    <p className="text-lg font-bold text-[var(--success)]">${chore.value.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {onEditChore && (
                      <button onClick={() => onEditChore(chore)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-tertiary)]" aria-label={`Edit chore: ${chore.name}`}>
                        <PencilIcon />
                      </button>
                    )}
                    {onDeleteChore && (
                      <button onClick={() => onDeleteChore(chore.id)} className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors p-2 rounded-full hover:bg-[var(--bg-tertiary)]" aria-label={`Delete chore: ${chore.name}`}>
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between gap-1 bg-[var(--bg-tertiary)] p-2 rounded-xl">
                    {currentWeekDays.map(date => {
                    const dayOfWeek = getDayFromDate(date);
                    const isAssigned = chore.days.includes(dayOfWeek);
                    const isCompleted = chore.completions[formatDate(date)] === true;
                    const isCurrent = date.getTime() === today.getTime();
                    const isPast = date.getTime() < today.getTime();

                    return (
                        <DayButton key={date.getTime()} day={dayOfWeek} isAssigned={isAssigned} isCompleted={isCompleted} isToday={isCurrent} isPast={isPast} isKidsMode={isKidsMode}
                        onClick={() => { if (isAssigned) onToggleCompletion(chore.id, date); }}
                        />
                    );
                    })}
                </div>
            </div>
        ) : (
            <>
                <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">{chore.name}</h3>
                    <p className="text-lg font-bold text-[var(--success)]">${chore.value.toFixed(2)}</p>
                </div>

                {!isKidsMode && (
                    <div className="flex-shrink-0 flex items-center space-x-1">
                        {onEditChore && (
                            <button onClick={() => onEditChore(chore)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-tertiary)]" aria-label={`Edit chore: ${chore.name}`}>
                                <PencilIcon />
                            </button>
                        )}
                        {onDeleteChore && (
                            <button onClick={() => onDeleteChore(chore.id)} className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors p-2 rounded-full hover:bg-[var(--bg-tertiary)]" aria-label={`Delete chore: ${chore.name}`}>
                                <TrashIcon />
                            </button>
                        )}
                    </div>
                )}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={handleCompleteClick}
                        disabled={isSelectedDateInPast && isKidsMode}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:-translate-y-px active:scale-95 ${
                        isCompletedOnSelectedDate 
                            ? 'bg-[var(--success)] text-[var(--success-text)] shadow-lg' 
                            : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)]'
                        } disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
                        aria-label={isCompletedOnSelectedDate ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        {isCompletedOnSelectedDate && <CheckIcon className="w-8 h-8" />}
                    </button>
                    {isCelebrating && (
                        <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className={`particle-container particle-container-${i}`}>
                            <div className="particle" />
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </>
        )}
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
        `}
      </style>
    </div>
  );
};

export default ChoreCard;