
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { BonusCoinIcon, UserCircleIcon } from '../constants';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-lg transform transition-all text-[var(--text-primary)] max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
            <BonusCoinIcon className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">
              {profiles.length === 1 ? `Award a Bonus to ${profiles[0].name}!` : 'Award a Bonus!'}
            </h2>
        </div>
        
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)]">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    <button type="button" key={p.id} onClick={() => handleProfileToggle(p.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors ${selectedProfileIds.includes(p.id) ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] bg-opacity-10' : 'border-transparent bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                       {p.image ? <img src={p.image} alt={p.name} className="w-8 h-8 rounded-full object-cover"/> : <UserCircleIcon className="w-8 h-8" />}
                       <span className="font-semibold">{p.name}</span>
                    </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="bonus-amount" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Amount</label>
            <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                    <button type="button" onClick={() => handleUnitChange('dollars')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${amountUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>$</button>
                    <button type="button" onClick={() => handleUnitChange('cents')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${amountUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>¢</button>
                </div>
                <input
                  id="bonus-amount"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="0"
                  step={amountUnit === 'dollars' ? '0.01' : '1'}
                  placeholder={amountUnit === 'dollars' ? '1.00' : '100'}
                  className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                />
            </div>
          </div>

          <div>
            <label htmlFor="bonus-note" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Reason (Optional)</label>
            <textarea
              id="bonus-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="e.g., for excellent teamwork on the weekend"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-[var(--border-primary)]">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">Award Bonus</button>
          </div>
        </form>
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

export default BonusAwardModal;
