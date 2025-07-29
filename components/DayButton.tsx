import React from 'react';
import { Day } from '../types';
import { DAY_SHORT_NAMES, CheckIcon } from '../constants';

interface DayButtonProps {
  day: Day;
  isAssigned: boolean;
  isCompleted: boolean;
  isToday: boolean;
  isPast: boolean;
  onClick: () => void;
  isKidsMode: boolean;
}

const DayButton: React.FC<DayButtonProps> = ({ day, isAssigned, isCompleted, isToday, isPast, onClick, isKidsMode }) => {
  const baseClasses = "w-full h-9 sm:h-10 flex items-center justify-center rounded-full font-bold text-sm sm:text-base transition-all duration-300";
  let dynamicClasses = '';
  const isDisabled = !isAssigned || (isPast && isKidsMode);

  if (isCompleted) {
    dynamicClasses = 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg';
  } else if (isAssigned) {
    if (isPast && isKidsMode) {
      // Style for a "missed" chore on a past day, locked for kids.
      dynamicClasses = 'bg-[var(--bg-tertiary)] opacity-50 text-[var(--text-tertiary)]';
    } else {
      // Style for an editable chore (future day, or past day in parent mode).
      dynamicClasses = 'bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] cursor-pointer text-[var(--text-primary)]';
    }
  } else {
    dynamicClasses = 'text-[var(--text-tertiary)]';
  }

  if (isToday) {
    dynamicClasses += ' ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-primary)]';
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${dynamicClasses} disabled:cursor-not-allowed`}
      aria-label={`${day} - ${isAssigned ? 'Assigned' : 'Not assigned'}${isCompleted ? ', Completed' : ''}${isPast ? ', Past day' : ''}`}
    >
      {isCompleted ? <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5"/> : DAY_SHORT_NAMES[day]}
    </button>
  );
};

export default DayButton;
