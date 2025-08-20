

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Day, Chore } from '../types';
import { DAYS_OF_WEEK, DAY_SHORT_NAMES, DEFAULT_CHORE_CATEGORIES, TrashIcon, XIcon, PencilIcon, StarIcon, ImageIcon, compressImage, SmileyIcon, EMOJI_LIST, ChevronLeftIcon } from '../constants';
import { useSound } from '../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

const IconPickerView = ({ onSelectIcon, currentIcon, onClose }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiInputRef = useRef<HTMLInputElement>(null);
  const [customEmoji, setCustomEmoji] = useState('');
  const [isEmojiFieldVisible, setIsEmojiFieldVisible] = useState(false);

  useEffect(() => {
    if (isEmojiFieldVisible) {
      emojiInputRef.current?.focus();
    }
  }, [isEmojiFieldVisible]);

  const handleSelect = (icon: string | null) => {
    onSelectIcon(icon);
  };

  const handleCustomEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const emojis = value.match(emojiRegex);
    const lastEmoji = emojis ? emojis[emojis.length - 1] : '';
    setCustomEmoji(lastEmoji);
    if(lastEmoji) {
        handleSelect(lastEmoji);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedDataUrl = await compressImage(file, { maxWidth: 256, maxHeight: 256 });
        handleSelect(compressedDataUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during image processing.';
        alert(message);
      } finally {
        if (e.target) e.target.value = '';
      }
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: '0%' }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="absolute inset-0 bg-[var(--menu-bg)] z-10 flex flex-col"
    >
      <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 h-16 sm:h-20">
        <div className="flex items-center gap-2 sm:gap-4">
          <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <ChevronLeftIcon className="h-7 w-7" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold">Select an Icon</h2>
        </div>
      </div>

      <div className="flex-grow flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
          <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imageInputRef}
              onChange={handleImageUpload}
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full h-16 sm:h-20 flex items-center justify-center gap-3 bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded-xl transition-all"
            >
                <ImageIcon className="h-7 w-7 sm:h-8 sm:w-8"/>
                <span className="font-semibold text-sm sm:text-base">Upload Image</span>
            </button>
            <div className="w-full h-16 sm:h-20">
                {isEmojiFieldVisible ? (
                    <input
                        ref={emojiInputRef}
                        type="text"
                        value={customEmoji}
                        onChange={handleCustomEmojiChange}
                        onBlur={() => setIsEmojiFieldVisible(false)}
                        placeholder="Paste emoji"
                        className="w-full h-full text-center text-3xl bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--accent-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsEmojiFieldVisible(true)}
                        className="w-full h-16 sm:h-20 flex items-center justify-center gap-3 bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded-xl transition-all"
                    >
                        <SmileyIcon className="h-7 w-7 sm:h-8 sm:w-8"/>
                        <span className="font-semibold text-sm sm:text-base">Paste Emoji</span>
                    </button>
                )}
            </div>
          </div>

          <div className="flex-grow flex flex-col min-h-0">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Or choose one from the list</label>
              <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                    {EMOJI_LIST.map(emoji => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleSelect(emoji)}
                            className={`w-full aspect-square text-2xl flex items-center justify-center rounded-lg transition-all ${currentIcon === emoji ? 'bg-[var(--accent-primary)] text-white ring-2 ring-offset-2 ring-[var(--accent-primary)] ring-offset-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)]'}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
              </div>
          </div>
        </div>
    </motion.div>
  );
};


interface ChoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreData: Omit<Chore, 'id' | 'completions' | 'order' | 'createdAt'>) => void;
  onDelete?: (choreId: string) => void;
  initialData: Chore | null;
  defaultChoreValue: number;
  customCategories: string[];
  onAddCustomCategory: (newCategory: string) => void;
}

const formatDate = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ChoreFormModal: React.FC<ChoreFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, defaultChoreValue, customCategories, onAddCustomCategory }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [valueUnit, setValueUnit] = useState<'cents' | 'dollars'>('cents');
  const [days, setDays] = useState<Day[]>([]);
  const [icon, setIcon] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ name?: string; value?: string; days?: string; oneOffDate?: string; category?: string; }>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isOneOff, setIsOneOff] = useState(false);
  const [oneOffDate, setOneOffDate] = useState(formatDate(new Date()));

  const nameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { playButtonClick } = useSound();

  const isBonusEdit = initialData?.type === 'bonus';

  const resetForm = useCallback(() => {
    const isEditingOneOff = initialData?.isOneOff ?? false;
    setIsOneOff(isEditingOneOff);
    setOneOffDate(initialData?.oneOffDate || formatDate(new Date()));
    
    const initialValueInCents = initialData?.value ?? defaultChoreValue;
    if (initialValueInCents >= 100 && initialValueInCents % 100 === 0) {
        setValueUnit('dollars');
        setValue(String(initialValueInCents / 100));
    } else {
        setValueUnit('cents');
        setValue(String(initialValueInCents));
    }
    
    setName(initialData?.name || '');
    setDays(initialData?.days || (isEditingOneOff ? [] : [...DAYS_OF_WEEK]));
    setIcon(initialData?.icon || null);
    setCategory(initialData?.category || null);
    setNote(initialData?.note || '');
    setErrors({});
    setIsConfirmingDelete(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
  }, [initialData, defaultChoreValue]);

  // Effect to reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Effect to focus input when modal is ready
  useEffect(() => {
    if (isOpen && !isIconPickerOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [isOpen, isIconPickerOpen]);

  const handleDayToggle = (day: Day) => {
    setDays(prevDays => {
      const newDays = prevDays.includes(day)
        ? prevDays.filter(d => d !== day)
        : [...prevDays, day];
      if (errors.days) setErrors(prev => ({...prev, days: undefined}));
      return newDays;
    });
  };

  const handleSelectAllDays = () => {
    setDays([...DAYS_OF_WEEK]);
    if (errors.days) setErrors(prev => ({...prev, days: undefined}));
  };
  const handleDeselectAllDays = () => {
    setDays([]);
    if (errors.days) setErrors(prev => ({...prev, days: undefined}));
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

  const handleClose = () => {
    playButtonClick();
    onClose();
  }

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = 'Chore name is required.';
    if (isOneOff && !oneOffDate) newErrors.oneOffDate = 'Please select a date for the one-off chore.';
    if (!isBonusEdit && !isOneOff && days.length === 0) newErrors.days = 'Please select at least one day for the repeating chore.';
    
    const choreValueRaw = parseFloat(value);
    const choreValueInCents = valueUnit === 'dollars' ? Math.round(choreValueRaw * 100) : Math.round(choreValueRaw);
    if (isNaN(choreValueRaw) || choreValueRaw < 0 || isNaN(choreValueInCents) || choreValueInCents < 0) {
      newErrors.value = 'Chore value must be a valid, positive number.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    playButtonClick();
    onSave({
        name: name.trim(),
        value: choreValueInCents,
        days: isOneOff ? [] : days,
        icon,
        category,
        note,
        type: isBonusEdit ? 'bonus' : 'chore',
        isOneOff,
        oneOffDate: isOneOff ? oneOffDate : undefined,
    });
  }, [name, value, valueUnit, days, icon, category, note, isBonusEdit, onSave, playButtonClick, isOneOff, oneOffDate]);
  
  const handleDelete = () => {
    if (initialData?.id && onDelete) {
        playButtonClick();
        onDelete(initialData.id);
    }
  };

  const handleSaveNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
        setErrors(prev => ({ ...prev, category: 'Category name cannot be empty.'}));
        return;
    }
    const allCategories = [...DEFAULT_CHORE_CATEGORIES, ...customCategories];
    if (allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        setErrors(prev => ({ ...prev, category: 'This category already exists.'}));
        return;
    }
    onAddCustomCategory(trimmed);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
    setErrors(prev => ({ ...prev, category: undefined}));
  };

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
              @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
          `}</style>
          <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-[var(--card-bg)] rounded-t-3xl sm:rounded-3xl shadow-xl w-full max-w-md flex flex-col h-auto max-h-[90%] sm:max-h-[calc(100vh-4rem)] sm:my-8 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } }}
              exit={{ y: '100%', transition: { duration: 0.2 } }}
          >
              <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 h-16">
                  <div className="flex items-center gap-2 sm:gap-4">
                      <button type="button" onClick={handleClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          <XIcon className="h-6 sm:h-7 w-6 sm:w-7" />
                      </button>
                      <h2 className="text-xl sm:text-2xl font-bold">{isBonusEdit ? 'Edit Bonus' : initialData ? 'Edit Chore' : 'Add New Chore'}</h2>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                      {initialData && onDelete && !isBonusEdit && (
                          <button
                              type="button"
                              onClick={() => setIsConfirmingDelete(true)}
                              className="p-2.5 rounded-lg text-[var(--danger)] bg-transparent hover:bg-[var(--danger-bg-subtle)] transition-colors disabled:opacity-50"
                              aria-label="Delete chore"
                              disabled={isConfirmingDelete}
                          >
                              <TrashIcon className="h-5 w-5" />
                          </button>
                      )}
                      <button
                          type="submit"
                          className="px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base font-semibold text-[var(--success-text)] bg-[var(--success)] hover:opacity-90 transition-opacity disabled:opacity-50"
                          disabled={isConfirmingDelete}
                      >
                          {initialData ? 'Save' : '+ Add'}
                      </button>
                  </div>
              </div>
              
              <div className="flex-grow overflow-y-auto custom-scrollbar p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
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
                      <div className="space-y-3">
                          <div className="flex items-end gap-3">
                              {!isBonusEdit && (
                                  <div className="flex-shrink-0">
                                      <label className="block text-xs font-medium text-center text-[var(--text-secondary)] mb-1.5">Icon</label>
                                      <button
                                        type="button"
                                        onClick={() => setIsIconPickerOpen(true)}
                                        className="relative group w-12 h-12 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all flex items-center justify-center overflow-hidden"
                                      >
                                        {icon ? (
                                          icon.startsWith('data:image/') ? (
                                            <img src={icon} alt="Chore Icon" className="w-full h-full object-cover" />
                                          ) : (
                                            <span className="text-3xl">{icon}</span>
                                          )
                                        ) : (
                                          <StarIcon className="w-6 h-6 text-[var(--text-tertiary)] opacity-60" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <PencilIcon className="w-6 h-6 text-white" />
                                        </div>
                                      </button>
                                  </div>
                              )}
                              <div className="flex-grow">
                                  <label htmlFor="chore-name" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Chore Name</label>
                                  <input
                                    id="chore-name"
                                    ref={nameInputRef}
                                    type="text"
                                    value={name}
                                    onChange={e => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors(p => ({...p, name: undefined}));
                                    }}
                                    placeholder="e.g., Make the bed"
                                    disabled={isBonusEdit}
                                    className={`w-full px-3 py-2 text-base bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all placeholder:text-[var(--text-tertiary)] disabled:opacity-70 disabled:cursor-not-allowed ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                                  />
                                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                              </div>
                          </div>
                          <div>
                              <label htmlFor="chore-value" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Value</label>
                              <div className="flex items-center gap-2">
                                <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                                  <button type="button" onClick={() => handleUnitChange('dollars')} className={`px-2 text-sm font-semibold rounded-md transition-all ${valueUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>$</button>
                                  <button type="button" onClick={() => handleUnitChange('cents')} className={`px-2 text-sm font-semibold rounded-md transition-all ${valueUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>¢</button>
                                </div>
                                <input
                                  id="chore-value"
                                  type="number"
                                  value={value}
                                  onChange={e => {
                                      setValue(e.target.value);
                                      if (errors.value) setErrors(p => ({...p, value: undefined}));
                                  }}
                                  min="0"
                                  step={valueUnit === 'dollars' ? '0.01' : '1'}
                                  placeholder={valueUnit === 'dollars' ? '2.00' : '50'}
                                  className={`w-full px-3 py-2 bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all placeholder:text-[var(--text-tertiary)] ${errors.value ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                                />
                              </div>
                              {errors.value && <p className="text-red-500 text-xs mt-1.5">{errors.value}</p>}
                          </div>
                          {isBonusEdit ? (
                               <div>
                                  <label htmlFor="bonus-note" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Note</label>
                                  <textarea
                                    id="bonus-note"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    rows={2}
                                    placeholder="e.g., for excellent teamwork on the weekend"
                                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                                  />
                                </div>
                          ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Type</label>
                                    <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-full border border-[var(--border-secondary)]">
                                        <button type="button" onClick={() => setIsOneOff(false)} className={`w-1/2 py-1.5 text-xs font-semibold rounded-full transition-all ${!isOneOff ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow' : 'text-[var(--text-secondary)]'}`}>Repeating</button>
                                        <button type="button" onClick={() => setIsOneOff(true)} className={`w-1/2 py-1.5 text-xs font-semibold rounded-full transition-all ${isOneOff ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow' : 'text-[var(--text-secondary)]'}`}>One-off</button>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                {isOneOff ? (
                                    <motion.div key="one-off" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                        <label htmlFor="one-off-date" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Date</label>
                                        <input
                                            id="one-off-date"
                                            type="date"
                                            value={oneOffDate}
                                            min={!initialData ? formatDate(new Date()) : undefined}
                                            onChange={e => {
                                                setOneOffDate(e.target.value);
                                                if (errors.oneOffDate) setErrors(p => ({...p, oneOffDate: undefined}));
                                            }}
                                            className={`w-full px-3 py-2 bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all ${errors.oneOffDate ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                                        />
                                        {errors.oneOffDate && <p className="text-red-500 text-xs mt-1.5">{errors.oneOffDate}</p>}
                                    </motion.div>
                                ) : (
                                    <motion.div key="repeating" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                      <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Repeat on Days</span>
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                          <button type="button" onClick={handleSelectAllDays} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">Everyday</button>
                                          <button type="button" onClick={() => setDays([Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri])} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">Weekdays</button>
                                          <button type="button" onClick={() => setDays([Day.Sat, Day.Sun])} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">Weekends</button>
                                          <button type="button" onClick={handleDeselectAllDays} className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-primary)]">None</button>
                                      </div>
                                      <div className="grid grid-cols-7 gap-1">
                                        {DAYS_OF_WEEK.map(day => (
                                          <button
                                            key={day}
                                            type="button"
                                            onClick={() => handleDayToggle(day)}
                                            className={`h-9 w-9 flex items-center justify-center rounded-full font-bold transition-all duration-300 ${
                                              days.includes(day)
                                                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]'
                                                : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                                            }`}
                                          >
                                            {DAY_SHORT_NAMES[day]}
                                          </button>
                                        ))}
                                      </div>
                                      {errors.days && <p className="text-red-500 text-xs mt-1.5">{errors.days}</p>}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                                
                                <div>
                                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
                                  <div className="flex flex-wrap gap-2 items-center">
                                    {[...DEFAULT_CHORE_CATEGORIES, ...customCategories].map(cat => (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(prev => prev === cat ? null : cat)}
                                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs ${
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
                                              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] border border-[var(--border-secondary)] text-xl font-light text-[var(--text-secondary)] transition-colors"
                                              aria-label="Add new category"
                                          >
                                              +
                                          </button>
                                      ) : (
                                          <div className="flex gap-2 items-center animate-fade-in-fast p-1 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)]">
                                              <input 
                                                  type="text" 
                                                  value={newCategoryName}
                                                  onChange={(e) => {
                                                    setNewCategoryName(e.target.value);
                                                    if(errors.category) setErrors(p => ({...p, category: undefined}));
                                                  }}
                                                  placeholder="New Category"
                                                  className="px-2 py-1 text-sm bg-[var(--bg-secondary)] border-[var(--border-primary)] border rounded-md focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] w-32"
                                                  autoFocus
                                                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSaveNewCategory(); } }}
                                              />
                                              <button type="button" onClick={handleSaveNewCategory} className="px-2 py-1 rounded-md bg-[var(--success)] text-white text-xs font-semibold">Save</button>
                                              <button type="button" onClick={() => setIsAddingCategory(false)} className="px-2 py-1 rounded-md bg-[var(--bg-secondary)] text-xs font-semibold border border-[var(--border-primary)]">X</button>
                                          </div>
                                      )}
                                  </div>
                                   {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category}</p>}
                                </div>
                              </>
                            )}
                      </div>
                  )}
              </div>
              <AnimatePresence>
                {isIconPickerOpen && (
                  <IconPickerView
                    currentIcon={icon}
                    onSelectIcon={(selectedIcon) => {
                      setIcon(selectedIcon);
                      setIsIconPickerOpen(false);
                    }}
                    onClose={() => setIsIconPickerOpen(false)}
                  />
                )}
              </AnimatePresence>
          </motion.form>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChoreFormModal;
