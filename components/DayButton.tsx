import React from 'react';
import { Day } from '../types';
import { DAY_SHORT_NAMES, CheckIcon, ExclamationIcon, CoinIcon, HourglassIcon } from '../constants';

interface DayButtonProps {
  day: Day;
  isAssigned: boolean;
  isCompleted: boolean;
  isCashedOut: boolean;
  isPendingCashOut: boolean;
  isPendingAcceptance: boolean;
  isToday: boolean;
  isPast: boolean;
  onClick: (e: React.MouseEvent) => void;
  isKidsMode: boolean;
  isPendingApproval: boolean;
  isBonus: boolean;
}

const DayButton: React.FC<DayButtonProps> = ({ day, isAssigned, isCompleted, isCashedOut, isPendingCashOut, isPendingAcceptance, isToday, isPast, onClick, isKidsMode, isPendingApproval, isBonus }) => {
  const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 mx-auto flex items-center justify-center rounded-full font-bold text-xs sm:text-sm transition-all duration-300";
  let dynamicClasses = '';
  let content: React.ReactNode = DAY_SHORT_NAMES[day];
  const isDisabled = isBonus || (isKidsMode && (isCashedOut || isPendingCashOut || isPendingAcceptance)) || (!isKidsMode && !isAssigned);

  if (isCashedOut) {
    dynamicClasses = 'bg-[var(--success-cashed-out-bg)] text-[var(--success-cashed-out-text)]';
    content = <CoinIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
  } else if (isPendingCashOut || isPendingAcceptance) {
    dynamicClasses = 'bg-[var(--bg-tertiary)] opacity-70';
    content = <HourglassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />;
  } else if (isCompleted) {
    dynamicClasses = 'bg-[var(--success)] text-[var(--success-text)]';
    content = <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
  } else if (isPendingApproval) {
    dynamicClasses = `bg-[var(--warning)] text-[var(--warning-text)] ${!isKidsMode ? 'cursor-pointer' : ''}`;
    content = <ExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
  } else if (isBonus && isAssigned) {
    dynamicClasses = 'bg-[var(--warning)] text-[var(--warning-text)]';
    content = <span className="text-sm sm:text-base font-bold">$</span>;
  } else if (isAssigned) {
    dynamicClasses = 'bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] cursor-pointer text-[var(--text-primary)]';
    // content is already DAY_SHORT_NAMES[day]
  } else {
    dynamicClasses = 'text-[var(--text-tertiary)] opacity-50';
  }

  if (isToday) {
    dynamicClasses += ' ring-2 ring-offset-2 ring-offset-[var(--card-bg)] ring-[var(--accent-primary)]';
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${dynamicClasses} disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none`}
      aria-label={`${day} - ${isAssigned ? 'Assigned' : 'Not assigned'}${isCompleted ? ', Completed' : ''}${isPendingApproval ? ', Pending Approval' : ''}${isPast ? ', Past day' : ''}${isCashedOut ? ', Cashed Out' : ''}${isPendingCashOut ? ', Pending Cash Out' : ''}${isBonus ? ', Bonus' : ''}`}
    >
      {content}
    </button>
  );
};

export default DayButton;