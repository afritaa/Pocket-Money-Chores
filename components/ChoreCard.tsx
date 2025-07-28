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
  onReorderChores?: (draggedId: string, targetId: string) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
  draggingChoreId: string | null;
  setDraggingChoreId: (id: string | null) => void;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay();
  const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
  return days[dayIndex];
};

const ChoreCard: React.FC<ChoreCardProps> = ({ 
  chore, 
  currentWeekDays, 
  onToggleCompletion, 
  onDeleteChore, 
  onEditChore, 
  onReorderChores,
  viewMode, 
  selectedDate,
  draggingChoreId,
  setDraggingChoreId
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const isCompletedOnSelectedDate = chore.completions[formatDate(selectedDate)] === true;
  const isDraggable = !!onReorderChores;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', chore.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      setDraggingChoreId(chore.id);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggingChoreId(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (chore.id !== draggingChoreId) {
      setIsDropTarget(true);
    }
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (onReorderChores && draggedId && draggedId !== chore.id) {
      onReorderChores(draggedId, chore.id);
    }
    setIsDropTarget(false);
    setDraggingChoreId(null);
  };

  const handleCompleteClick = () => {
    // Only celebrate when going from incomplete to complete
    if (!isCompletedOnSelectedDate) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 800); // Animation duration
    }
    onToggleCompletion(chore.id, selectedDate);
  };


  return (
    <div 
      className="relative"
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragLeave={isDraggable ? handleDragLeave : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
    >
      {isDropTarget && <div className="absolute -top-1 left-5 right-5 h-1.5 bg-blue-500 rounded-full z-10" />}

      <div className={`bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 transition-all duration-300 flex items-center gap-4 shadow-lg ${draggingChoreId === chore.id ? 'opacity-30' : 'opacity-100'}`}>
        
        {isDraggable && (
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing p-2 -ml-2"
          >
            <DragHandleIcon />
          </div>
        )}

        <div className="flex-grow text-slate-900 dark:text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{chore.name}</h3>
                <p className="text-lg font-bold text-green-500 dark:text-green-400">${chore.value.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-1">
                {onEditChore && (
                  <button
                    onClick={() => onEditChore(chore)}
                    className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                    aria-label={`Edit chore: ${chore.name}`}
                  >
                    <PencilIcon />
                  </button>
                )}
                {onDeleteChore && (
                  <button
                    onClick={() => onDeleteChore(chore.id)}
                    className="text-slate-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                    aria-label={`Delete chore: ${chore.name}`}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </div>

            {viewMode === 'weekly' ? (
              <div className="flex justify-between gap-1 bg-slate-100 dark:bg-gray-800 p-2 rounded-xl">
                {currentWeekDays.map(date => {
                  const dayOfWeek = getDayFromDate(date);
                  const isAssigned = chore.days.includes(dayOfWeek);
                  const isCompleted = chore.completions[formatDate(date)] === true;
                  const isCurrent = date.getTime() === today.getTime();

                  return (
                    <DayButton
                      key={date.getTime()}
                      day={dayOfWeek}
                      isAssigned={isAssigned}
                      isCompleted={isCompleted}
                      isToday={isCurrent}
                      onClick={() => {
                        if (isAssigned) {
                          onToggleCompletion(chore.id, date);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="mt-4">
                <div className="relative">
                  <button 
                    onClick={handleCompleteClick}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-px ${
                      isCompletedOnSelectedDate 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white'
                    }`}
                  >
                    <CheckIcon className="h-5 w-5"/>
                    {isCompletedOnSelectedDate ? 'Completed!' : 'Mark as Done'}
                  </button>
                   {isCelebrating && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className={`particle-container particle-container-${i}`}>
                          <div className="particle" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
       <style>
        {`
          @keyframes firework-fly {
              0% {
                  transform: translateY(0) scale(1);
                  opacity: 1;
              }
              80% {
                  opacity: 1;
              }
              100% {
                  transform: translateY(-80px) scale(0);
                  opacity: 0;
              }
          }

          .particle-container {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 4px;
              height: 4px;
              transform-origin: 0 0;
          }

          .particle {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              animation: firework-fly 800ms ease-out forwards;
          }

          /* Define particle colors and rotation */
          .particle-container-0 { transform: rotate(0deg); } .particle-container-0 .particle { background-color: #facc15; }
          .particle-container-1 { transform: rotate(24deg); } .particle-container-1 .particle { background-color: #4ade80; }
          .particle-container-2 { transform: rotate(48deg); } .particle-container-2 .particle { background-color: #60a5fa; }
          .particle-container-3 { transform: rotate(72deg); } .particle-container-3 .particle { background-color: #facc15; }
          .particle-container-4 { transform: rotate(96deg); } .particle-container-4 .particle { background-color: #4ade80; }
          .particle-container-5 { transform: rotate(120deg); } .particle-container-5 .particle { background-color: #60a5fa; }
          .particle-container-6 { transform: rotate(144deg); } .particle-container-6 .particle { background-color: #facc15; }
          .particle-container-7 { transform: rotate(168deg); } .particle-container-7 .particle { background-color: #4ade80; }
          .particle-container-8 { transform: rotate(192deg); } .particle-container-8 .particle { background-color: #60a5fa; }
          .particle-container-9 { transform: rotate(216deg); } .particle-container-9 .particle { background-color: #facc15; }
          .particle-container-10 { transform: rotate(240deg); } .particle-container-10 .particle { background-color: #4ade80; }
          .particle-container-11 { transform: rotate(264deg); } .particle-container-11 .particle { background-color: #60a5fa; }
          .particle-container-12 { transform: rotate(288deg); } .particle-container-12 .particle { background-color: #facc15; }
          .particle-container-13 { transform: rotate(312deg); } .particle-container-13 .particle { background-color: #4ade80; }
          .particle-container-14 { transform: rotate(336deg); } .particle-container-14 .particle { background-color: #60a5fa; }
        `}
      </style>
    </div>
  );
};

export default ChoreCard;