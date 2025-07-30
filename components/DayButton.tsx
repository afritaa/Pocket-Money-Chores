


import React from 'react';
import { Day } from '../types';
import { DAY_SHORT_NAMES, CheckIcon, ExclamationIcon, CoinIcon, HourglassIcon } from '../constants';

interface DayButtonProps {
  day: Day;
  isAssigned: boolean;
  isCompleted: boolean;
  isCashedOut: boolean;
  isPendingCashOut: boolean;
  isToday: boolean;
  isPast: boolean;
  onClick: () => void;
  isKidsMode: boolean;
  isPendingApproval: boolean;
}

const DayButton: React.FC<DayButtonProps> = ({ day, isAssigned, isCompleted, isCashedOut, isPendingCashOut, isToday, isPast, onClick, isKidsMode, isPendingApproval }) => {
  const baseClasses = "w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all duration-300";
  let dynamicClasses = '';
  const isDisabled = !isAssigned || (isKidsMode && (isCashedOut || isPendingCashOut));

  if (isCashedOut) {
    dynamicClasses = 'bg-[var(--success-cashed-out-bg)] text-[var(--success-cashed-out-text)] shadow-inner';
  } else if (isPendingCashOut) {
    dynamicClasses = 'bg-[var(--bg-tertiary)] opacity-70';
  } else if (isCompleted) {
    dynamicClasses = 'bg-[var(--success)] text-[var(--success-text)] shadow-lg';
  } else if (isPendingApproval) {
    dynamicClasses = `bg-[var(--warning)] text-[var(--warning-text)] shadow-lg ${!isKidsMode ? 'cursor-pointer' : ''}`;
  } else if (isAssigned) {
    dynamicClasses = 'bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] cursor-pointer text-[var(--text-primary)]';
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
      className={`${baseClasses} ${dynamicClasses} disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none`}
      aria-label={`${day} - ${isAssigned ? 'Assigned' : 'Not assigned'}${isCompleted ? ', Completed' : ''}${isPendingApproval ? ', Pending Approval' : ''}${isPast ? ', Past day' : ''}${isCashedOut ? ', Cashed Out' : ''}${isPendingCashOut ? ', Pending Cash Out' : ''}`}
    >
      {isCashedOut ? <CoinIcon className="w-6 h-6"/> : isPendingCashOut ? <HourglassIcon className="w-5 h-5 text-slate-500" /> : isCompleted ? <CheckIcon className="w-5 h-5"/> : isPendingApproval ? <ExclamationIcon className="w-5 h-5" /> : DAY_SHORT_NAMES[day]}
    </button>
  );
};

export default DayButton;