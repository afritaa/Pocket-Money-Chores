import React, { useState, useMemo } from 'react';
import { EarningsRecord, GraphDataPoint } from '../types';
import LineGraph from './LineGraph';

interface EarningsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: EarningsRecord[];
}

type Tab = 'History' | 'Totals' | 'Graph';
type GraphPeriod = 'Month' | '3 Months' | '6 Months' | 'Year';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const EarningsHistoryModal: React.FC<EarningsHistoryModalProps> = ({ isOpen, onClose, history }) => {
    const [activeTab, setActiveTab] = useState<Tab>('History');
    const [graphPeriod, setGraphPeriod] = useState<GraphPeriod>('Month');

    // Memoized calculation for the "Totals" tab
    const totals = useMemo(() => {
        const now = new Date();
        const totalsData = {
            week: 0,
            month: 0,
            threeMonths: 0,
            sixMonths: 0,
            year: 0
        };

        // Start of week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Start of month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Start of 3/6/12 months ago
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        for (const record of history) {
            const recordDate = new Date(record.date);
            
            if (recordDate >= startOfWeek) totalsData.week += record.amount;
            if (recordDate >= startOfMonth) totalsData.month += record.amount;
            if (recordDate >= threeMonthsAgo) totalsData.threeMonths += record.amount;
            if (recordDate >= sixMonthsAgo) totalsData.sixMonths += record.amount;
            if (recordDate >= startOfYear) totalsData.year += record.amount;
        }

        return totalsData;
    }, [history]);

    // Memoized data processing for the graph
    const graphData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (graphPeriod) {
            case 'Month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3 Months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6 Months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'Year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        const filteredHistory = history.filter(record => new Date(record.date) >= startDate);
        
        const dailyTotals: Record<string, number> = {};
        for (const record of filteredHistory) {
            const dateStr = formatDate(new Date(record.date)); // Ensure date is formatted correctly
            dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + record.amount;
        }

        const dataPoints: GraphDataPoint[] = Object.entries(dailyTotals)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
        return dataPoints;

    }, [history, graphPeriod]);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'History':
                return (
                    <div className="animate-fade-in-fast">
                        {history.length === 0 ? (
                            <p className="text-[var(--text-secondary)] text-center py-8">No cash-out history yet.</p>
                        ) : (
                            <ul className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                                {[...history].reverse().map((record) => (
                                    <li key={record.id} className="flex justify-between items-center bg-[var(--bg-tertiary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                                        <span className="font-medium text-[var(--text-secondary)]">
                                            {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                        </span>
                                        <span className="font-bold text-lg text-[var(--success)]">
                                            ${record.amount.toFixed(2)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            case 'Totals':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center animate-fade-in-fast">
                        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">This Week</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">${totals.week.toFixed(2)}</p>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">This Month</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">${totals.month.toFixed(2)}</p>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">Last 3 Months</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">${totals.threeMonths.toFixed(2)}</p>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">Last 6 Months</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">${totals.sixMonths.toFixed(2)}</p>
                        </div>
                         <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg sm:col-span-2">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">This Year</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">${totals.year.toFixed(2)}</p>
                        </div>
                    </div>
                );
            case 'Graph':
                const periods: GraphPeriod[] = ['Month', '3 Months', '6 Months', 'Year'];
                return (
                    <div className="animate-fade-in-fast">
                        <div className="flex justify-center gap-1 p-1 bg-[var(--bg-tertiary)] rounded-lg mb-4">
                            {periods.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setGraphPeriod(p)}
                                    className={`w-full px-3 py-1 text-xs sm:text-sm font-semibold rounded-md transition-all duration-300 ${graphPeriod === p ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <div className="h-64">
                            {graphData.length > 1 ? (
                                <LineGraph data={graphData} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                                    <p>{history.length === 0 ? "No earnings data to display." : "Not enough data to draw a graph for this period."}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div
            className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-2xl transform transition-all text-[var(--text-primary)]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Earnings Analysis</h2>

                <div className="flex justify-center border-b border-[var(--border-primary)] mb-6">
                    {(['History', 'Totals', 'Graph'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === tab ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="min-h-[250px]">
                    {renderContent()}
                </div>

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
                @keyframes fade-in-fast { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default EarningsHistoryModal;
