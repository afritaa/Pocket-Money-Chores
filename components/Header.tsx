import React from 'react';
import { CoinIcon, HistoryIcon, UserCircleIcon } from '../constants';
import { Profile } from '../types';

interface HeaderProps {
  weeklyTotal: number;
  isKidsMode: boolean;
  profile: Profile;
  onCashOut: () => void;
  onShowHistory: () => void;
  isCashOutDisabled: boolean;
  showCashOutButton: boolean;
}

const Header: React.FC<HeaderProps> = ({ weeklyTotal, isKidsMode, profile, onCashOut, onShowHistory, isCashOutDisabled, showCashOutButton }) => {
  const kidsTitle = profile?.name ? `${profile.name}'s Chores` : 'My Chores';
  
  return (
    <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
       <div className="flex items-center gap-4 text-slate-900 dark:text-white">
        {isKidsMode && (
            profile.image ? (
              <img src={profile.image} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-slate-300 dark:border-gray-700 shadow-lg" />
            ) : (
              <UserCircleIcon className="h-16 w-16 text-slate-400 dark:text-gray-500" />
            )
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {isKidsMode ? kidsTitle : "Pocket Money Chores"}
        </h1>
       </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-4 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 sm:px-6 border border-slate-200 dark:border-gray-800 shadow-lg">
                <CoinIcon />
                <div className="text-left">
                    <div className="text-sm font-medium text-slate-500 dark:text-gray-400">Weekly Earnings</div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    ${weeklyTotal.toFixed(2)}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {showCashOutButton && (
                    <button 
                        onClick={onCashOut}
                        disabled={isCashOutDisabled}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-px transition-all disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:text-slate-500 dark:disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Cash Out
                    </button>
                )}
                 {!isKidsMode && (
                    <button 
                        onClick={onShowHistory}
                        className="bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg shadow-md border border-slate-300 dark:border-gray-700 transition-colors flex items-center gap-1.5 justify-center"
                    >
                        <HistoryIcon />
                        <span>History</span>
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Header;