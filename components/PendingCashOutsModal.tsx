import React from 'react';
import { EarningsRecord } from '../types';

interface PendingCashOutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCashOuts: EarningsRecord[];
  onApprove: (recordId: string) => void;
  onApproveAll: () => void;
}

const PendingCashOutsModal: React.FC<PendingCashOutsModalProps> = ({
  isOpen,
  onClose,
  pendingCashOuts,
  onApprove,
  onApproveAll
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-lg transform transition-all text-slate-900 dark:text-white"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">Pending Cash Outs</h2>

        {pendingCashOuts.length === 0 ? (
          <p className="text-slate-500 dark:text-gray-400 text-center py-8">No pending cash outs to approve.</p>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 -mr-2">
              {pendingCashOuts.map(record => (
                <li key={record.id} className="flex justify-between items-center bg-slate-100 dark:bg-gray-800/80 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-gray-300">
                      {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400 ml-4">
                      ${record.amount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => onApprove(record.id)}
                    className="px-4 py-1 rounded-lg text-sm text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 font-semibold shadow-md transition-all"
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
            {pendingCashOuts.length > 1 && (
              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-gray-700">
                <button
                  onClick={onApproveAll}
                  className="px-6 py-2 rounded-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold shadow-lg transition-all"
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
            className="px-6 py-2 rounded-lg text-slate-800 dark:text-gray-200 bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingCashOutsModal;