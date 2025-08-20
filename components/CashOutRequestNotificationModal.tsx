



import React, { useEffect } from 'react';
import { EarningsRecord } from '../types';
import { GreenDollarIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface CashOutRequestNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onView: () => void;
  record: EarningsRecord;
  profileName: string;
}

const CashOutRequestNotificationModal: React.FC<CashOutRequestNotificationModalProps> = ({
  isOpen,
  onClose,
  onView,
  record,
  profileName
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onView();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onView, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
        className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[var(--card-bg)] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center"
          onClick={e => e.stopPropagation()}
          initial={{ y: '-100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } }}
          exit={{ y: '-100vh', opacity: 0, transition: { duration: 0.2 } }}
        >
          <div className="flex flex-col items-center justify-center text-[var(--text-primary)]">
              <div className="mb-4">
                <GreenDollarIcon className="w-20 h-20 mx-auto" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Cash Out Request</h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8">
                <span className="font-bold text-[var(--text-primary)]">{profileName}</span> has submitted a cash out request for <span className="font-bold text-[var(--success)]">${(record.amount / 100).toFixed(2)}</span>.
              </p>
              <div className="flex justify-center gap-4 w-full">
                <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors"
                >
                    Dismiss
                </button>
                <button
                    onClick={onView}
                    className="flex-1 px-6 py-3 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
                >
                    View
                </button>
              </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CashOutRequestNotificationModal;