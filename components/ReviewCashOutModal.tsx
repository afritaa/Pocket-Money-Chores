
import React, { useState, useMemo, useEffect } from 'react';
import { EarningsRecord, CompletionSnapshot } from '../types';

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

  const handleApprove = () => {
    const finalRecord: EarningsRecord = {
      ...record,
      amount: newTotal,
      completionsSnapshot: completions.filter(c => c.isCompleted), // Store only what was actually approved
    };
    onApprove(finalRecord);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-2xl transform transition-all text-[var(--text-primary)] flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-1 text-center">Review Cash Out</h2>
        <p className="text-center text-[var(--text-secondary)] mb-6">For {profileName}</p>

        <div className="flex-grow overflow-y-auto -mx-2 px-2 space-y-2 custom-scrollbar">
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

        <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
          <div className="flex justify-between items-center mb-6 text-xl font-bold">
            <span className="text-[var(--text-secondary)]">New Total:</span>
            <span className="text-[var(--success)]">${(newTotal / 100).toFixed(2)}</span>
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleApprove} className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
              Approve ${newTotal > 0 ? (newTotal / 100).toFixed(2) : '0.00'}
            </button>
          </div>
        </div>
      </div>
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ReviewCashOutModal;
