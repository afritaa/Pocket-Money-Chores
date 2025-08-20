





import React, { useEffect } from 'react';
import { PastChoreApproval } from '../types';
import { CheckIcon, TrashIcon, XIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
        `}</style>
        <motion.div
          className="bg-[var(--card-bg)] rounded-b-3xl sm:rounded-3xl shadow-xl w-full max-w-lg flex flex-col h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:my-8"
          onClick={e => e.stopPropagation()}
          initial={{ y: '-100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } }}
          exit={{ y: '-100vh', opacity: 0, transition: { duration: 0.2 } }}
        >
          <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
              <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <XIcon className="h-7 w-7" />
              </button>
              <h2 className="text-xl font-bold text-center">Past Chores Approval</h2>
              {approvals.length > 1 ? (
                  <div className="flex items-center gap-2">
                      <button
                          onClick={onDismissAll}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--danger)] bg-transparent hover:bg-[var(--danger-bg-subtle)] border border-transparent hover:border-[var(--danger-border)] transition-colors"
                      >
                          Dismiss All
                      </button>
                      <button
                          onClick={onApproveAll}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 shadow-lg"
                      >
                          Approve All
                      </button>
                  </div>
              ) : (
                  <div className="w-10"></div>
              )}
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
              {approvals.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                      <p className="text-[var(--text-secondary)] text-center py-8">No past chores awaiting approval.</p>
                  </div>
              ) : (
                  <ul className="space-y-3">
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
              )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PastChoresApprovalModal;