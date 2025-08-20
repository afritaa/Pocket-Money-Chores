
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Profile } from '../types';
import { StarIcon, UserCircleIcon, XIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [errors, setErrors] = useState<{ profiles?: string; amount?: string; }>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
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
    setSelectedProfileIds(prev => {
      const newSelection = prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId];
      if (errors.profiles) setErrors(p => ({...p, profiles: undefined}));
      return newSelection;
    });
  };
  
  const handleSelectAll = () => {
    if (selectedProfileIds.length === profiles.length) {
      setSelectedProfileIds([]);
    } else {
      setSelectedProfileIds(profiles.map(p => p.id));
    }
    if (errors.profiles) setErrors(p => ({...p, profiles: undefined}));
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
    const newErrors: typeof errors = {};

    if (selectedProfileIds.length === 0) {
      newErrors.profiles = 'Please select at least one child to award the bonus to.';
    }

    const bonusAmountRaw = parseFloat(amount);
    const bonusAmountInCents = amountUnit === 'dollars' ? Math.round(bonusAmountRaw * 100) : Math.round(bonusAmountRaw);
    if (isNaN(bonusAmountRaw) || bonusAmountRaw <= 0 || isNaN(bonusAmountInCents) || bonusAmountInCents <= 0) {
        newErrors.amount = 'Bonus amount must be a valid, positive number.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onAward(selectedProfileIds, bonusAmountInCents, note.trim());
  }, [selectedProfileIds, amount, amountUnit, note, onAward]);

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
        className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
        `}</style>
          <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-[var(--card-bg)] rounded-t-3xl sm:rounded-3xl shadow-xl w-full max-w-lg flex flex-col h-auto max-h-[90%] sm:max-h-[calc(100vh-4rem)] sm:my-8"
              onClick={e => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } }}
              exit={{ y: '100%', transition: { duration: 0.2 } }}
          >
              <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 h-16">
                  <div className="flex items-center gap-2 sm:gap-4">
                      <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          <XIcon className="h-6 sm:h-7 w-6 sm:w-7" />
                      </button>
                      <div className="flex items-center gap-2">
                          <StarIcon className="h-6 sm:h-7 w-6 sm:w-7 text-yellow-400" />
                          <h2 className="text-xl sm:text-2xl font-bold">Award a Bonus</h2>
                      </div>
                  </div>
                  <button
                      type="submit"
                      className="px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base font-semibold text-black bg-[var(--accent-secondary)] hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
                  >
                      Award
                  </button>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-4">
                  {profiles.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-medium text-[var(--text-secondary)]">For</label>
                          {profiles.length > 1 && (
                            <button type="button" onClick={handleSelectAll} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">
                                {selectedProfileIds.length === profiles.length ? 'Deselect All' : 'Select All'}
                            </button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                          {profiles.map(p => (
                              <button type="button" key={p.id} onClick={() => handleProfileToggle(p.id)} className={`w-full flex items-center gap-3 p-1.5 rounded-lg border-2 text-left transition-colors ${selectedProfileIds.includes(p.id) ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--accent-primary-text)]' : 'border-transparent bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                                 {p.image ? <img src={p.image} alt={p.name} className="w-8 h-8 rounded-full object-cover"/> : <UserCircleIcon className="w-8 h-8" />}
                                 <span className="font-semibold text-sm">{p.name}</span>
                              </button>
                          ))}
                        </div>
                         {errors.profiles && <p className="text-red-500 text-xs mt-1.5">{errors.profiles}</p>}
                      </div>
                  )}
                  
                  <div>
                    <label htmlFor="bonus-amount" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Amount</label>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                            <button type="button" onClick={() => handleUnitChange('dollars')} className={`px-2 text-sm font-semibold rounded-md transition-all ${amountUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>$</button>
                            <button type="button" onClick={() => handleUnitChange('cents')} className={`px-2 text-sm font-semibold rounded-md transition-all ${amountUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>¢</button>
                        </div>
                        <input
                          id="bonus-amount"
                          type="number"
                          value={amount}
                          onChange={e => {
                            setAmount(e.target.value);
                            if (errors.amount) setErrors(p => ({...p, amount: undefined}));
                          }}
                          min="0"
                          step={amountUnit === 'dollars' ? '0.01' : '1'}
                          placeholder={amountUnit === 'dollars' ? '1.00' : '100'}
                          className={`w-full px-3 py-2 bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all placeholder:text-[var(--text-tertiary)] ${errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                        />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-1.5">{errors.amount}</p>}
                  </div>

                  <div>
                    <label htmlFor="bonus-note" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Reason (Optional)</label>
                    <textarea
                      id="bonus-note"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={2}
                      placeholder="e.g., for excellent teamwork on the weekend"
                      className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                    />
                  </div>
              </div>
          </motion.form>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BonusAwardModal;