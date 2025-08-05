


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Profile } from '../types';
import { StarIcon, UserCircleIcon, XIcon } from '../constants';

interface BonusAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAward: (profileIds: string[], amount: number, note: string) => void;
  profiles: Profile[];
  defaultBonusValue: number;
}

const BonusAwardModal: React.FC<BonusAwardModalProps> = ({ isOpen, onClose, onAward, profiles, defaultBonusValue }) => {
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [amount, setAmount] = useState('');
  const [amountUnit, setAmountUnit] = useState<'cents' | 'dollars'>('cents');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setNote('');
      
      const initialBonusValueInCents = defaultBonusValue || 100;
      if (initialBonusValueInCents >= 100 && initialBonusValueInCents % 100 === 0) {
        setAmountUnit('dollars');
        setAmount(String(initialBonusValueInCents / 100));
      } else {
        setAmountUnit('cents');
        setAmount(String(initialBonusValueInCents));
      }

      if (profiles.length === 1) {
        setSelectedProfileIds([profiles[0].id]);
      } else {
        setSelectedProfileIds([]);
      }
    }
  }, [isOpen, defaultBonusValue, profiles]);

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfileIds(prev =>
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedProfileIds.length === profiles.length) {
      setSelectedProfileIds([]);
    } else {
      setSelectedProfileIds(profiles.map(p => p.id));
    }
  };

  const handleUnitChange = (newUnit: 'cents' | 'dollars') => {
    if (newUnit === amountUnit) return;

    const numericValue = parseFloat(amount);
    if (!isNaN(numericValue)) {
      if (newUnit === 'dollars') {
        setAmount(String(numericValue / 100));
      } else {
        setAmount(String(numericValue * 100));
      }
    }
    setAmountUnit(newUnit);
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (selectedProfileIds.length === 0) {
      setError('Please select at least one child to award the bonus to.');
      return;
    }
    const bonusAmountRaw = parseFloat(amount);
    if (isNaN(bonusAmountRaw) || bonusAmountRaw <= 0) {
      setError('Bonus amount must be a valid, positive number.');
      return;
    }

    const bonusAmountInCents = amountUnit === 'dollars' ? Math.round(bonusAmountRaw * 100) : Math.round(bonusAmountRaw);

    if (isNaN(bonusAmountInCents) || bonusAmountInCents <= 0) {
        setError('Bonus amount must be a valid, positive number.');
        return;
    }

    onAward(selectedProfileIds, bonusAmountInCents, note.trim());
  }, [selectedProfileIds, amount, amountUnit, note, onAward]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-secondary)] z-50 animate-slide-up-full"
    >
      <style>{`
        @keyframes slide-up-full { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up-full { animation: slide-up-full 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
      `}</style>
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="h-full w-full max-w-3xl mx-auto flex flex-col"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <XIcon className="h-7 w-7" />
                    </button>
                    <div className="flex items-center gap-2">
                        <StarIcon className="h-7 w-7 text-yellow-400" />
                        <h2 className="text-2xl font-bold">Award a Bonus</h2>
                    </div>
                </div>
                <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-base font-semibold text-white bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
                >
                    Award
                </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-6">
                {error && <div className="flex-shrink-0"><p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg border border-[var(--danger-border)] text-sm">{error}</p></div>}
                
                {profiles.length > 1 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">For</label>
                        <button type="button" onClick={handleSelectAll} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">
                            {selectedProfileIds.length === profiles.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        {profiles.map(p => (
                            <button type="button" key={p.id} onClick={() => handleProfileToggle(p.id)} className={`w-full flex items-center gap-3 p-2 rounded-lg border-2 text-left transition-colors ${selectedProfileIds.includes(p.id) ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] bg-opacity-10' : 'border-transparent bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                               {p.image ? <img src={p.image} alt={p.name} className="w-8 h-8 rounded-full object-cover"/> : <UserCircleIcon className="w-8 h-8" />}
                               <span className="font-semibold">{p.name}</span>
                            </button>
                        ))}
                      </div>
                    </div>
                )}
                
                <div>
                  <label htmlFor="bonus-amount" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Amount</label>
                  <div className="flex items-center gap-2">
                      <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                          <button type="button" onClick={() => handleUnitChange('dollars')} className={`px-3 py-1 text-base font-semibold rounded-md transition-all ${amountUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>$</button>
                          <button type="button" onClick={() => handleUnitChange('cents')} className={`px-3 py-1 text-base font-semibold rounded-md transition-all ${amountUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>¢</button>
                      </div>
                      <input
                        id="bonus-amount"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        min="0"
                        step={amountUnit === 'dollars' ? '0.01' : '1'}
                        placeholder={amountUnit === 'dollars' ? '1.00' : '100'}
                        className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                      />
                  </div>
                </div>

                <div>
                  <label htmlFor="bonus-note" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Reason (Optional)</label>
                  <textarea
                    id="bonus-note"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder="e.g., for excellent teamwork on the weekend"
                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
            </div>
        </form>
    </div>
  );
};

export default BonusAwardModal;