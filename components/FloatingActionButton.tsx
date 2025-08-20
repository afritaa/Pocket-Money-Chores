

import React from 'react';
import { PlusIcon, StarIcon, TrashIcon } from '../constants';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSound } from '../hooks/useSound';

interface FloatingActionButtonProps {
  onAddChore: () => void;
  onPayBonus: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddChore,
  onPayBonus,
  isOpen,
  onToggle,
  onClose,
}) => {
  const { playButtonClick } = useSound();

  const handleToggle = () => {
    playButtonClick();
    onToggle();
  };

  const handleActionClick = (action: () => void) => {
    playButtonClick();
    onClose();
    action();
  };

  const subButtonVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 400,
        damping: 15,
      },
    }),
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.9,
      transition: { duration: 0.1 },
    },
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-20"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-6 right-6 z-30">
        <div className="relative flex flex-col items-center gap-4">
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div custom={1} variants={subButtonVariants} initial="hidden" animate="visible" exit="exit" className="flex items-center gap-3">
                  <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">Pay Bonus</span>
                  <button
                    onClick={() => handleActionClick(onPayBonus)}
                    className="w-14 h-14 rounded-full bg-[var(--accent-secondary)] text-black flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                    aria-label="Pay Bonus"
                  >
                    <StarIcon className="w-7 h-7" />
                  </button>
                </motion.div>
                <motion.div custom={0} variants={subButtonVariants} initial="hidden" animate="visible" exit="exit" className="flex items-center gap-3">
                    <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">Add Chore</span>
                    <button
                    onClick={() => handleActionClick(onAddChore)}
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                    aria-label="Add Chore"
                  >
                    <PlusIcon className="w-7 h-7" />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <button
            onClick={handleToggle}
            className="w-16 h-16 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform"
            aria-label={isOpen ? 'Close actions' : 'Open actions'}
            aria-expanded={isOpen}
          >
            <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <PlusIcon className="w-8 h-8" />
            </motion.div>
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingActionButton;