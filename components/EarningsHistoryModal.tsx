import React from 'react';
import { EarningsRecord } from '../types';

interface EarningsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: EarningsRecord[];
}

const EarningsHistoryModal: React.FC<EarningsHistoryModalProps> = ({ isOpen, onClose, history }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md transform transition-all text-slate-900 dark:text-white"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6">Earnings History</h2>

                {history.length === 0 ? (
                    <p className="text-slate-500 dark:text-gray-400 text-center py-8">No cash-out history yet.</p>
                ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                        {[...history].reverse().map((record) => (
                            <li key={record.id} className="flex justify-between items-center bg-slate-100 dark:bg-gray-800/80 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
                                <span className="font-medium text-slate-700 dark:text-gray-300">
                                    {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                </span>
                                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                    ${record.amount.toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                }
                 .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.4);
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </div>
    );
};

export default EarningsHistoryModal;