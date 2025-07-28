import React from 'react';
import { Day } from '../types';
import { DAY_SHORT_NAMES, CheckIcon } from '../constants';

interface DayButtonProps {
  day: Day;
  isAssigned: boolean;
  isCompleted: boolean;
  isToday: boolean;
  onClick: () => void;
}

const DayButton: React.FC<DayButtonProps> = ({ day, isAssigned, isCompleted, isToday, onClick }) => {
  const baseClasses = "w-full h-9 sm:h-10 flex items-center justify-center rounded-full font-bold text-sm sm:text-base transition-all duration-300";
  let dynamicClasses = '';

  if (isCompleted) {
    dynamicClasses = 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg';
  } else if (isAssigned) {
    dynamicClasses = 'bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 border border-slate-300 dark:border-gray-600 cursor-pointer text-slate-700 dark:text-gray-200';
  } else {
    dynamicClasses = 'text-slate-400 dark:text-gray-500';
  }

  if (isToday) {
    dynamicClasses += ' ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-gray-800 ring-blue-500';
  }

  return (
    <button
      onClick={onClick}
      disabled={!isAssigned}
      className={`${baseClasses} ${dynamicClasses} disabled:cursor-not-allowed`}
      aria-label={`${day} - ${isAssigned ? 'Assigned' : 'Not assigned'}${isCompleted ? ', Completed' : ''}`}
    >
      {isCompleted ? <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5"/> : DAY_SHORT_NAMES[day]}
    </button>
  );
};

export default DayButton;