import React from 'react';
import { PastChoreApproval } from '../types';
import { CheckIcon, TrashIcon } from '../constants';

interface PastChoresApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvals: PastChoreApproval[];
  onApprove: (approvalId: string) => void;
  onDismiss: (approvalId: string) => void;
  onApproveAll: () => void;
  onDismissAll: () => void;
}

const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const PastChoresApprovalModal: React.FC<PastChoresApprovalModalProps> = ({
  isOpen,
  onClose,
  approvals,
  onApprove,
  onDismiss,
  onApproveAll,
  onDismissAll
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-lg transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Past Chores for Approval</h2>

        {approvals.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-8">No past chores awaiting approval.</p>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
              {approvals.map(approval => (
                <li key={approval.id} className="flex justify-between items-center bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-secondary)]">
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{approval.choreName}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {parseLocalDate(approval.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => onDismiss(approval.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--danger)] hover:bg-[var(--danger-bg-subtle)] transition-colors"
                        aria-label={`Dismiss request for ${approval.choreName}`}
                     >
                        <TrashIcon />
                    </button>
                    <button
                      onClick={() => onApprove(approval.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-md transition-all"
                      aria-label={`Approve request for ${approval.choreName}`}
                    >
                      <CheckIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {approvals.length > 1 && (
              <div className="flex justify-between pt-4 border-t border-[var(--border-primary)]">
                <button
                  onClick={onDismissAll}
                  className="px-4 py-2 rounded-lg font-semibold text-[var(--danger)] bg-transparent hover:bg-[var(--danger-bg-subtle)] border border-transparent hover:border-[var(--danger-border)] transition-colors"
                >
                  Dismiss All
                </button>
                <button
                  onClick={onApproveAll}
                  className="px-4 py-2 rounded-lg font-semibold text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 shadow-lg"
                >
                  Approve All
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
          >
            Close
          </button>
        </div>
      </div>
       <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
        `}</style>
    </div>
  );
};

export default PastChoresApprovalModal;
