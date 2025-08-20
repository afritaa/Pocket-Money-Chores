

import React from 'react';
import { PlusIcon, StarOutlineIcon } from '../constants';
import { useSound } from '../hooks/useSound';

interface ActionBarProps {
  onAddChore: () => void;
  onPayBonus: () => void;
  pulseAddChore: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({ onAddChore, onPayBonus, pulseAddChore }) => {
  const { playButtonClick } = useSound();

  const handleAddChore = () => {
    playButtonClick();
    onAddChore();
  };

  const handlePayBonus = () => {
    playButtonClick();
    onPayBonus();
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 action-bar-container"
    >
        <div className="container mx-auto p-4 flex items-stretch gap-4">
          <button
            onClick={handleAddChore}
            className={`flex-1 flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-primary-text)] font-bold py-3 px-5 rounded-lg transform hover:-translate-y-px transition-all ${pulseAddChore ? 'animate-pulse-add-chore' : ''}`}
          >
            <PlusIcon /><span>Add Chore</span>
          </button>
          <button
            onClick={handlePayBonus}
            className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 px-5 rounded-lg transform hover:-translate-y-px transition-all animate-pulse-bonus text-shadow-sm"
          >
            <StarOutlineIcon className="h-6 w-6" />
            <span>Pay Bonus</span>
          </button>
        </div>
        <style>{`
          .action-bar-container::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            top: -1.5rem; /* Start the effect 1.5rem (24px) above the bar */
            z-index: -1;
            /* A subtle background tint from the theme's primary color for better visual separation and a glassmorphism effect. */
            background: rgba(var(--bg-primary-values-rgb, 241, 245, 249), 0.6);
            /* The blur effect for the area behind the bar. */
            -webkit-backdrop-filter: blur(12px);
            backdrop-filter: blur(12px);
            /* Gradient mask: The blur fades in over the 1.5rem area above the bar and is solid over the bar itself. */
            -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 1.5rem);
            mask-image: linear-gradient(to bottom, transparent 0, black 1.5rem);
          }

          @keyframes pulse-add-chore {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-pulse-add-chore {
            background: linear-gradient(270deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary));
            background-size: 400% 400%;
            animation: pulse-add-chore 3.5s ease-in-out infinite;
          }
          @keyframes pulse-bonus {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-pulse-bonus {
            background: linear-gradient(270deg, #facc15, #f59e0b);
            background-size: 200% 200%;
            animation: pulse-bonus 4s ease-in-out infinite;
          }
        `}</style>
    </div>
  );
};

export default ActionBar;