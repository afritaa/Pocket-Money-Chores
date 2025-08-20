

import React, { useEffect } from 'react';
import { useSound } from '../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

interface AllChoresDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyAmount: number;
}

const AllChoresDoneModal: React.FC<AllChoresDoneModalProps> = ({ isOpen, onClose, dailyAmount }) => {
  const { playAllDone, playButtonClick } = useSound();

  const handleClose = () => {
    playButtonClick();
    onClose();
  };
  
  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === 'Escape') {
              event.preventDefault();
              handleClose();
          }
      };

      if (isOpen) {
          playAllDone();
          document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
          document.removeEventListener('keydown', handleKeyDown);
      };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <style>
            {`
              @keyframes firework-fly {
                  0% {
                      transform: translateY(0) scale(1.5);
                      opacity: 1;
                  }
                  100% {
                      transform: translateY(-150px) scale(0);
                      opacity: 0;
                  }
              }

              .firework-particle-container {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  width: 5px;
                  height: 5px;
                  transform-origin: 0 0;
              }

              .firework-particle {
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  animation: firework-fly 1200ms ease-out forwards;
                  animation-delay: ${Math.random() * 0.5}s;
              }

              ${Array.from({ length: 30 }).map((_, i) => {
                const angle = (360 / 30) * i;
                const colors = ['var(--warning)', 'var(--success)', 'var(--accent-primary)', 'var(--danger)', '#a78bfa'];
                const color = colors[i % colors.length];
                return `.firework-particle-container-${i} { transform: rotate(${angle}deg); } .firework-particle-container-${i} .firework-particle { background-color: ${color}; }`;
              }).join(' ')}
            `}
          </style>

          <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={`firework-particle-container firework-particle-container-${i}`}>
                  <div className="firework-particle" />
                </div>
              ))}
          </div>
          
          <motion.div
            className="relative bg-[var(--card-bg)] rounded-3xl shadow-xl w-full max-w-md p-6 text-[var(--text-primary)] text-center"
            onClick={e => e.stopPropagation()}
            initial={{ y: '-100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } }}
            exit={{ y: '-100vh', opacity: 0, transition: { duration: 0.2 } }}
          >
            <div className="mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[var(--success)] flex items-center justify-center shadow-lg text-[var(--success-text)]">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Well Done!</h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              You’ve finished all of today’s chores! You have earned <span className="font-bold text-[var(--success)]">${(dailyAmount / 100).toFixed(2)}</span> today.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
            >
              Great!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AllChoresDoneModal;