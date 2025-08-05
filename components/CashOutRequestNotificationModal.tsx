import React, { useEffect } from 'react';
import { EarningsRecord } from '../types';
import { GreenDollarIcon } from '../constants';

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity animate-fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
          <GreenDollarIcon className="w-20 h-20 mx-auto" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Cash Out Request</h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8">
          <span className="font-bold text-[var(--text-primary)]">{profileName}</span> has submitted a cash out request for <span className="font-bold text-[var(--success)]">${(record.amount / 100).toFixed(2)}</span>.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onView}
            className="px-8 py-3 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
          >
            View
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CashOutRequestNotificationModal;