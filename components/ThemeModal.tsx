

import React from 'react';
import { XIcon } from '../constants';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: string) => void;
  currentTheme: string;
  isFirstTime?: boolean;
}

const themes = [
  { id: 'light', name: 'Default', colors: { bg: '#F5F5F5', header: '#E85C41', card: '#FFFFFF', accent: '#E85C41' } },
  { id: 'reef-green', name: 'Reef Green', colors: { bg: '#f8f9fa', header: '#00C9A7', card: '#ffffff', accent: '#00C9A7' } },
  { id: 'meadow-yellow', name: 'Meadow Yellow', colors: { bg: '#F5F5F5', header: '#FFD74A', card: '#ffffff', accent: '#FFD74A' } },
  { id: 'beach', name: 'Beach', colors: { bg: '#fefae0', header: '#faedcd', card: '#ffffff', accent: '#fb8500' } },
  { id: 'dark-blue', name: 'Cobalt Blue', colors: { bg: '#4364F7', header: '#3b59de', card: 'rgba(255, 255, 255, 0.1)', accent: '#f7b733' } },
  { id: 'dark', name: 'Dark', colors: { bg: '#020617', header: '#0f172a', card: '#1e2937', accent: '#38bdf8' } },
  { id: 'princess', name: 'Princess Pink', colors: { bg: '#fce4ec', header: '#f8bbd0', card: '#fff', accent: '#ff4081' } },
  { id: 'ocean', name: 'Ocean Blue', colors: { bg: '#e0f7fa', header: '#b2ebf2', card: 'rgba(255, 255, 255, 0.8)', accent: '#00b4d8' } },
  { id: 'lions', name: 'Brisbane Lions', colors: { bg: '#A30D45', header: '#6A0032', card: 'rgba(255, 215, 0, 0.08)', accent: '#00A2E8' } },
];

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, onSave, currentTheme, isFirstTime }) => {
  const handleSelectTheme = (themeId: string) => {
    onSave(themeId);
  };

  const topSlideVariants: Variants = {
    hidden: { y: '-100vh', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { y: '-100vh', opacity: 0, transition: { duration: 0.2 } }
  };

  const leftSlideVariants: Variants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 350, damping: 35 } },
    exit: { x: '-100%', transition: { type: 'spring', stiffness: 350, damping: 30 } }
  };
  
  const modalVariants = isFirstTime ? topSlideVariants : leftSlideVariants;
  const backdropClasses = `fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex ${isFirstTime ? 'items-start justify-center overflow-y-auto' : 'justify-start'}`;
  const modalContainerClasses = `bg-[var(--card-bg)] shadow-xl w-full flex flex-col ${isFirstTime ? 'rounded-b-3xl sm:rounded-3xl h-full sm:h-auto max-w-2xl sm:max-h-[calc(100vh-4rem)] sm:my-8' : 'max-w-lg h-full'}`;
  

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        className={backdropClasses}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 10px; }
        `}</style>
        <motion.div
          className={modalContainerClasses}
          onClick={e => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
              <div className="w-24">
                  {!isFirstTime && (
                      <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          <XIcon className="h-7 w-7" />
                      </button>
                  )}
              </div>
              <h2 className="text-2xl font-bold text-center">
                  {isFirstTime ? 'Select Your Theme!' : 'Choose a Theme'}
              </h2>
              <div className="w-24 text-right">
                  {/* Empty div to keep title centered */}
              </div>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
              {isFirstTime && (
                  <p className="text-center text-[var(--text-secondary)] mb-6 text-sm sm:text-base -mt-4">
                      Make the app your own! You can change it anytime from the Menu button.
                  </p>
              )}
              <div className="grid grid-cols-3 gap-3">
                {themes.map(theme => (
                  <div key={theme.id} className="text-center">
                    <button
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`w-full h-28 rounded-lg border-4 transition-all duration-300 flex flex-col overflow-hidden
                        ${currentTheme === theme.id ? 'border-[var(--accent-primary)] ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-primary)]' : 'border-transparent hover:border-[var(--text-muted)]'}`
                      }
                      style={{ background: theme.colors.bg }}
                      aria-label={`Select ${theme.name} theme`}
                    >
                      <div className="w-full h-1/3" style={{ background: theme.colors.header }}></div>
                      <div className="flex-grow p-2 flex items-end">
                        <div className="w-full h-1/2 rounded-md shadow-inner" style={{ background: theme.colors.card }}></div>
                      </div>
                    </button>
                    <p className="mt-2 font-semibold text-xs sm:text-sm text-[var(--text-muted)]">{theme.name}</p>
                  </div>
                ))}
              </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeModal;