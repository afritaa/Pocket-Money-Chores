
import React, { useEffect } from 'react';
import { EarningsRecord } from '../types';

interface PendingCashOutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCashOuts: EarningsRecord[];
  onOpenReview: (record: EarningsRecord) => void;
}

const PendingCashOutsModal: React.FC<PendingCashOutsModalProps> = ({
  isOpen,
  onClose,
  pendingCashOuts,
  onOpenReview,
}) => {
  // Close on Enter key press
  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-8 m-4 w-full max-w-lg transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">Pending Cash Outs</h2>

        {pendingCashOuts.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-8">No pending cash outs to approve.</p>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 -mr-2">
              {pendingCashOuts.map(record => (
                <li key={record.id} className="flex justify-between items-center bg-[var(--bg-tertiary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                  <div>
                    <span className="font-medium text-[var(--text-secondary)]">
                      {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </span>
                    <span className="font-bold text-lg text-[var(--success)] ml-4">
                      ${(record.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenReview(record)}
                    className="px-4 py-1 rounded-lg text-sm text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold transition-all"
                  >
                    Review & Approve
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingCashOutsModal;