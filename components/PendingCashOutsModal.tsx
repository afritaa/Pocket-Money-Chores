





import React, { useEffect } from 'react';
import { EarningsRecord } from '../types';
import { XIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

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
                  <h2 className="text-2xl font-bold">Pending Cash Outs</h2>
                  <div className="w-10"></div>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                  {pendingCashOuts.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                      <p className="text-[var(--text-secondary)] text-center py-8">No pending cash outs to approve.</p>
                  </div>
                  ) : (
                  <div className="space-y-4">
                      <ul className="space-y-3">
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
              </div>
          </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PendingCashOutsModal;