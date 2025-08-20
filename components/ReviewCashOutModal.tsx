





import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { EarningsRecord, CompletionSnapshot } from '../types';
import { XIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewCashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EarningsRecord;
  onApprove: (reviewedRecord: EarningsRecord) => void;
  profileName: string;
}

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const ReviewCashOutModal: React.FC<ReviewCashOutModalProps> = ({ isOpen, onClose, record, onApprove, profileName }) => {
  const [completions, setCompletions] = useState<CompletionSnapshot[]>([]);

  useEffect(() => {
    if (record?.completionsSnapshot) {
      const sortedCompletions = [...record.completionsSnapshot].sort((a, b) => {
        return parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime();
      });
      setCompletions(sortedCompletions);
    }
  }, [record]);

  const newTotal = useMemo(() => {
    return completions.reduce((sum, item) => (item.isCompleted ? sum + item.choreValue : sum), 0);
  }, [completions]);

  const handleToggleCompletion = (index: number) => {
    setCompletions(prev => {
      const newCompletions = [...prev];
      newCompletions[index] = { ...newCompletions[index], isCompleted: !newCompletions[index].isCompleted };
      return newCompletions;
    });
  };

  const handleApprove = useCallback(() => {
    const finalRecord: EarningsRecord = {
      ...record,
      amount: newTotal,
      completionsSnapshot: completions.filter(c => c.isCompleted), // Store only what was actually approved
    };
    onApprove(finalRecord);
  }, [record, newTotal, completions, onApprove]);

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
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 10px; }
      `}</style>
      <motion.div
        className="bg-[var(--card-bg)] rounded-b-3xl sm:rounded-3xl shadow-xl w-full max-w-2xl flex flex-col h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:my-8"
        onClick={e => e.stopPropagation()}
        initial={{ y: '-100vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } }}
        exit={{ y: '-100vh', opacity: 0, transition: { duration: 0.2 } }}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
            <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <XIcon className="h-7 w-7" />
            </button>
            <h2 className="text-2xl font-bold">Review Cash Out</h2>
            <button onClick={handleApprove} className="px-4 py-2 text-sm rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
              Approve ${newTotal > 0 ? (newTotal / 100).toFixed(2) : '0.00'}
            </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
            <p className="text-center text-[var(--text-secondary)] mb-4 -mt-2">For {profileName}</p>
            <div className="space-y-2">
              {completions.length > 0 ? (
                completions.map((item, index) => (
                  <div key={`${item.choreId}-${item.date}-${index}`} className="flex items-center gap-4 bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-primary)]">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggleCompletion(index)}
                      className="h-6 w-6 rounded text-[var(--accent-primary)] bg-[var(--bg-secondary)] border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-[var(--text-primary)]">{item.choreName}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {parseLocalDate(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="font-bold text-[var(--success)]">${(item.choreValue / 100).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-[var(--text-secondary)]">No completed chores in this cash-out request.</p>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-[var(--text-secondary)]">New Total:</span>
                <span className="text-[var(--success)]">${(newTotal / 100).toFixed(2)}</span>
              </div>
            </div>
        </div>
      </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewCashOutModal;