

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Day, Chore } from '../types';
import { DAYS_OF_WEEK, DAY_SHORT_NAMES, DEFAULT_CHORE_CATEGORIES, TrashIcon, XIcon, PencilIcon, StarIcon } from '../constants';
import IconPickerModal from './IconPickerModal';
import { useSound } from '../hooks/useSound';

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
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { playButtonClick } = useSound();

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
      setTimeout(() => nameInputRef.current?.focus(), 150);
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

  const handleClose = () => {
    playButtonClick();
    onClose();
  }

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

    playButtonClick();
    onSave({ name: name.trim(), value: choreValueInCents, days, icon, category, note, type: isBonusEdit ? 'bonus' : 'chore' });
  }, [name, value, valueUnit, days, icon, category, note, isBonusEdit, onSave, playButtonClick]);
  
  const handleDelete = () => {
    if (initialData?.id && onDelete) {
        playButtonClick();
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
      className="fixed inset-0 bg-[var(--bg-secondary)] z-50 animate-slide-up-full"
    >
        <style>{`
            @keyframes slide-up-full { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up-full { animation: slide-up-full 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
            @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
        `}</style>
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="h-full w-full max-w-3xl mx-auto flex flex-col"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={handleClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <XIcon className="h-7 w-7" />
                    </button>
                    <h2 className="text-2xl font-bold">{isBonusEdit ? 'Edit Bonus' : initialData ? 'Edit Chore' : 'Add New Chore'}</h2>
                </div>
                <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-base font-semibold text-[var(--success-text)] bg-[var(--success)] hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={isConfirmingDelete}
                >
                    {initialData ? 'Save' : '+ Add'}
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                {isConfirmingDelete ? (
                     <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-fast">
                        <div className="p-6 bg-[var(--danger-bg-subtle)] rounded-xl border border-[var(--danger-border)] max-w-sm">
                            <p className="font-semibold text-lg text-[var(--danger)]">Are you sure?</p>
                            <p className="text-sm text-[var(--danger)] opacity-80 mt-1 mb-4">This will permanently delete this {isBonusEdit ? 'bonus' : 'chore'}. This action cannot be undone.</p>
                            <div className="flex justify-center gap-4 mt-6">
                                <button type="button" onClick={() => setIsConfirmingDelete(false)} className="px-6 py-2 rounded-lg font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:opacity-80">Cancel</button>
                                <button type="button" onClick={handleDelete} className="px-6 py-2 rounded-lg font-semibold text-[var(--danger-text)] bg-[var(--danger)] hover:opacity-80">Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {error && <div className="flex-shrink-0"><p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg border border-[var(--danger-border)] text-sm">{error}</p></div>}
                        <div className="flex items-start gap-3">
                            {!isBonusEdit && (
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-center text-[var(--text-secondary)] mb-1.5">Icon</label>
                                    <button
                                      type="button"
                                      onClick={() => setIsIconPickerOpen(true)}
                                      className="relative group w-16 h-14 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all flex items-center justify-center overflow-hidden"
                                    >
                                      {icon ? (
                                        icon.startsWith('data:image/') ? (
                                          <img src={icon} alt="Chore Icon" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="text-3xl">{icon}</span>
                                        )
                                      ) : (
                                        <StarIcon className="w-8 h-8 text-[var(--text-tertiary)] opacity-60" />
                                      )}
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <PencilIcon className="w-6 h-6 text-white" />
                                      </div>
                                    </button>
                                </div>
                            )}
                            <div className="flex-grow">
                                <label htmlFor="chore-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Chore Name</label>
                                <input
                                  id="chore-name"
                                  ref={nameInputRef}
                                  type="text"
                                  value={name}
                                  onChange={e => setName(e.target.value)}
                                  placeholder="e.g., Make the bed"
                                  disabled={isBonusEdit}
                                  className="w-full h-14 px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="chore-value" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Value</label>
                            <div className="flex items-center gap-2">
                              <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                                <button type="button" onClick={() => handleUnitChange('dollars')} className={`px-3 py-1 text-base font-semibold rounded-md transition-all ${valueUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>$</button>
                                <button type="button" onClick={() => handleUnitChange('cents')} className={`px-3 py-1 text-base font-semibold rounded-md transition-all ${valueUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>¢</button>
                              </div>
                              <input
                                id="chore-value"
                                type="number"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                min="0"
                                step={valueUnit === 'dollars' ? '0.01' : '1'}
                                placeholder={valueUnit === 'dollars' ? '2.00' : '50'}
                                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                              />
                            </div>
                        </div>
                        {isBonusEdit ? (
                             <div>
                                <label htmlFor="bonus-note" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Note</label>
                                <textarea
                                  id="bonus-note"
                                  value={note}
                                  onChange={e => setNote(e.target.value)}
                                  rows={2}
                                  placeholder="e.g., for excellent teamwork on the weekend"
                                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                                />
                              </div>
                        ) : (
                            <>
                              <div>
                                <span className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Repeat on Days</span>
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
                                      className={`h-10 w-10 flex items-center justify-center rounded-full font-bold transition-all duration-300 ${
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
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                  {[...DEFAULT_CHORE_CATEGORIES, ...customCategories].map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => setCategory(prev => prev === cat ? null : cat)}
                                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-sm ${
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
                                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] border border-[var(--border-secondary)] text-xl font-light text-[var(--text-secondary)] transition-colors"
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
                           {initialData && onDelete && !isBonusEdit && (
                                <div className="pt-6 border-t border-[var(--danger)]/30">
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmingDelete(true)}
                                        className="w-full flex items-center justify-center gap-2 text-[var(--danger)] bg-transparent hover:bg-[var(--danger-bg-subtle)] font-semibold py-3 px-4 rounded-lg transition-colors border border-transparent hover:border-[var(--danger-border)]"
                                    >
                                        <TrashIcon />
                                        Delete Chore
                                    </button>
                                </div>
                           )}
                    </div>
                )}
            </div>
        </form>
        <IconPickerModal
            isOpen={isIconPickerOpen}
            onClose={() => setIsIconPickerOpen(false)}
            onSelectIcon={setIcon}
            currentIcon={icon}
        />
    </div>
  );
};

export default ChoreFormModal;