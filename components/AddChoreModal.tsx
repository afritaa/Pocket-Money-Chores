
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Day, Chore } from '../types';
import { DAYS_OF_WEEK, DAY_SHORT_NAMES, DEFAULT_CHORE_CATEGORIES, TrashIcon } from '../constants';

interface ChoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreData: Omit<Chore, 'id' | 'completions' | 'order'>) => void;
  onDelete?: (choreId: string) => void;
  initialData: Chore | null;
  defaultChoreValue: number;
  customCategories: string[];
  onAddCustomCategory: (newCategory: string) => void;
}

const ChoreFormModal: React.FC<ChoreFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, defaultChoreValue, customCategories, onAddCustomCategory }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [valueUnit, setValueUnit] = useState<'cents' | 'dollars'>('cents');
  const [days, setDays] = useState<Day[]>([]);
  const [icon, setIcon] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  const isBonusEdit = initialData?.type === 'bonus';

  const resetForm = useCallback(() => {
    const initialValueInCents = initialData?.value ?? defaultChoreValue;
    if (initialValueInCents >= 100 && initialValueInCents % 100 === 0) {
        setValueUnit('dollars');
        setValue(String(initialValueInCents / 100));
    } else {
        setValueUnit('cents');
        setValue(String(initialValueInCents));
    }
    
    setName(initialData?.name || '');
    setDays(initialData?.days || [...DAYS_OF_WEEK]);
    setIcon(initialData?.icon || null);
    setCategory(initialData?.category || null);
    setNote(initialData?.note || '');
    setError('');
    setIsConfirmingDelete(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
  }, [initialData, defaultChoreValue]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, resetForm]);

  const handleDayToggle = (day: Day) => {
    setDays(prevDays =>
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day)
        : [...prevDays, day]
    );
  };

  const handleSelectAllDays = () => setDays([...DAYS_OF_WEEK]);
  const handleDeselectAllDays = () => setDays([]);
  
  const handleEmojiSelect = (selectedEmoji: string) => {
    // Basic emoji validation to grab the first valid emoji
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const emojis = selectedEmoji.match(emojiRegex);
    setIcon(emojis ? emojis[0] : '');
  };
  
  const handleUnitChange = (newUnit: 'cents' | 'dollars') => {
    if (newUnit === valueUnit) return;

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      if (newUnit === 'dollars') {
        setValue(String(numericValue / 100));
      } else {
        setValue(String(numericValue * 100));
      }
    }
    setValueUnit(newUnit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Chore name is required.');
      return;
    }
    if (!isBonusEdit && days.length === 0) {
      setError('Please select at least one day.');
      return;
    }
    
    const choreValueRaw = parseFloat(value);
    if (isNaN(choreValueRaw) || choreValueRaw < 0) {
      setError('Chore value must be a valid, positive number.');
      return;
    }
    
    const choreValueInCents = valueUnit === 'dollars' ? Math.round(choreValueRaw * 100) : Math.round(choreValueRaw);

    if (isNaN(choreValueInCents) || choreValueInCents < 0) {
      setError('Invalid chore value.');
      return;
    }

    onSave({ name: name.trim(), value: choreValueInCents, days, icon, category, note, type: isBonusEdit ? 'bonus' : 'chore' });
  };
  
  const handleDelete = () => {
    if (initialData?.id && onDelete) {
        onDelete(initialData.id);
    }
  };

  const handleSaveNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
        setError('Category name cannot be empty.');
        return;
    }
    const allCategories = [...DEFAULT_CHORE_CATEGORIES, ...customCategories];
    if (allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        setError('This category already exists.');
        return;
    }
    onAddCustomCategory(trimmed);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 sm:p-8 m-4 w-full max-w-lg transform transition-all text-[var(--text-primary)] max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">{isBonusEdit ? 'Edit Bonus' : initialData ? 'Edit Chore' : 'Add New Chore'}</h2>
        
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)]">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="chore-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Chore Name</label>
            <input
              id="chore-name"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Make the bed"
              disabled={isBonusEdit}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="chore-value" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Value</label>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                <button type="button" onClick={() => handleUnitChange('dollars')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${valueUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>$</button>
                <button type="button" onClick={() => handleUnitChange('cents')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${valueUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>¢</button>
              </div>
              <input
                id="chore-value"
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                min="0"
                step={valueUnit === 'dollars' ? '0.01' : '1'}
                placeholder={valueUnit === 'dollars' ? '2.00' : '50'}
                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
              />
            </div>
          </div>
          {isBonusEdit ? (
             <div>
                <label htmlFor="bonus-note" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Note</label>
                <textarea
                  id="bonus-note"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g., for excellent teamwork on the weekend"
                  className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={icon || ''}
                  onChange={e => handleEmojiSelect(e.target.value)}
                  placeholder="e.g., 🛏️"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Repeat on Days</span>
                 <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <button type="button" onClick={handleSelectAllDays} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">Everyday</button>
                    <button type="button" onClick={() => setDays([Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri])} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">Weekdays</button>
                    <button type="button" onClick={() => setDays([Day.Sat, Day.Sun])} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">Weekends</button>
                    <button type="button" onClick={handleDeselectAllDays} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">None</button>
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`py-2 rounded-lg font-bold transition-all duration-300 ${
                        days.includes(day)
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]'
                          : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                      }`}
                    >
                      {DAY_SHORT_NAMES[day]}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {[...DEFAULT_CHORE_CATEGORIES, ...customCategories].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(prev => prev === cat ? null : cat)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                        category === cat
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]'
                          : 'bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                   {!isAddingCategory ? (
                        <button 
                            type="button" 
                            onClick={() => setIsAddingCategory(true)} 
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] border border-[var(--border-secondary)] text-xl font-light text-[var(--text-secondary)] transition-colors"
                            aria-label="Add new category"
                        >
                            +
                        </button>
                    ) : (
                        <div className="flex gap-2 items-center animate-fade-in-fast p-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)]">
                            <input 
                                type="text" 
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="New Category"
                                className="px-3 py-1 bg-[var(--bg-secondary)] border-[var(--border-primary)] border rounded-md focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] w-36"
                                autoFocus
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSaveNewCategory(); } }}
                            />
                            <button type="button" onClick={handleSaveNewCategory} className="px-3 py-1 rounded-md bg-[var(--success)] text-white text-sm font-semibold">Save</button>
                            <button type="button" onClick={() => setIsAddingCategory(false)} className="px-2 py-1 rounded-md bg-[var(--bg-secondary)] text-sm font-semibold border border-[var(--border-primary)]">X</button>
                        </div>
                    )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-[var(--border-primary)]">
            <div>
              {initialData && onDelete && !isConfirmingDelete && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--danger)] bg-transparent hover:bg-[var(--danger-bg-subtle)] font-semibold transition-colors"
                >
                  <TrashIcon />
                  Delete
                </button>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold transform hover:-translate-y-px transition-all">{initialData ? 'Save Changes' : 'Add Chore'}</button>
            </div>
          </div>
        </form>

        {isConfirmingDelete && (
             <div className="text-center p-4 bg-[var(--danger-bg-subtle)] rounded-lg animate-fade-in-fast mt-4 border border-[var(--danger-border)]">
                <p className="font-semibold text-[var(--danger)]">Are you sure?</p>
                <p className="text-sm text-[var(--danger)] opacity-80 mt-1 mb-4">This will permanently delete this {isBonusEdit ? 'bonus' : 'chore'}. This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button type="button" onClick={() => setIsConfirmingDelete(false)} className="px-6 py-2 rounded-lg font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:opacity-80">Cancel</button>
                    <button type="button" onClick={handleDelete} className="px-6 py-2 rounded-lg font-semibold text-[var(--danger-text)] bg-[var(--danger)] hover:opacity-80">Yes, Delete</button>
                </div>
            </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ChoreFormModal;
