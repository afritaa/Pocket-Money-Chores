
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Day, Chore, ChoreCategory } from '../types';
import { DAYS_OF_WEEK, DAY_SHORT_NAMES, CHORE_CATEGORIES, TrashIcon } from '../constants';

interface ChoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreData: Omit<Chore, 'id' | 'completions' | 'order'>) => void;
  onDelete?: (choreId: string) => void;
  initialData: Chore | null;
  defaultChoreValue: number;
}

const ChoreFormModal: React.FC<ChoreFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, defaultChoreValue }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState(String(defaultChoreValue));
  const [unit, setUnit] = useState<'cents' | 'dollars'>('cents');
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [icon, setIcon] = useState<string | null>(null);
  const [category, setCategory] = useState<ChoreCategory | null>(null);
  const [error, setError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isEditMode = !!initialData;

  const resetForm = useCallback(() => {
    setName('');
    setUnit('cents');
    setValue(String(defaultChoreValue));
    setSelectedDays([]);
    setIcon(null);
    setCategory(null);
    setError('');
    setIsConfirmingDelete(false);
  }, [defaultChoreValue]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        
        if (initialData.value >= 100) {
            setUnit('dollars');
            setValue((initialData.value / 100).toFixed(2).replace('.00', ''));
        } else {
            setUnit('cents');
            setValue(String(initialData.value));
        }
        
        setSelectedDays(initialData.days);
        setIcon(initialData.icon);
        setCategory(initialData.category);
      } else {
        resetForm();
      }
    } else {
        setError('');
        setIsConfirmingDelete(false);
    }
  }, [initialData, isOpen, resetForm]);

  const handleDayToggle = useCallback((day: Day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Chore name is required.');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Chore value must be a positive number.');
      return;
    }
    
    let valueInCents: number;
    if (unit === 'dollars') {
        valueInCents = Math.round(numericValue * 100);
    } else {
        valueInCents = Math.round(numericValue); // ensure it's an integer
    }

    if (isNaN(valueInCents) || valueInCents < 0) {
        setError('Invalid chore value.');
        return;
    }

    if (selectedDays.length === 0) {
      setError('Please select at least one day.');
      return;
    }
    
    onSave({ name: name.trim(), value: valueInCents, days: selectedDays, icon, category });
  };
  
  const handleDeleteConfirm = () => {
    if (onDelete && initialData) {
        onDelete(initialData.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto custom-scrollbar text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Chore' : 'Add a New Chore'}
        </h2>
        
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)]">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Icon</label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={icon && !icon.startsWith('data:image/') ? icon : ''}
                onChange={e => setIcon(e.target.value.slice(0, 2))}
                placeholder="😀"
                maxLength={2}
                className="w-16 h-12 text-3xl text-center px-2 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
              />
              <span className="text-[var(--text-secondary)]">or</span>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all"
              >
                Upload Image
              </button>
              {icon && icon.startsWith('data:image/') && (
                <img src={icon} alt="Preview" className="w-12 h-12 object-cover rounded-lg border-2 border-[var(--border-secondary)]"/>
              )}
            </div>
          </div>
          <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
          
          <div>
            <label htmlFor="chore-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Chore Name</label>
            <input
              id="chore-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Make the bed"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
             <label htmlFor="chore-value" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Value</label>
             <div className="flex items-center gap-2">
                 <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                    <button type="button" onClick={() => setUnit('dollars')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${unit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>$</button>
                    <button type="button" onClick={() => setUnit('cents')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${unit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>¢</button>
                 </div>
                <input
                    id="chore-value"
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    min="0"
                    step={unit === 'dollars' ? '0.01' : '1'}
                    placeholder={unit === 'dollars' ? '1.50' : '50'}
                    className="w-32 pl-4 pr-2 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                />
             </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Time of Day</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CHORE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat === category ? null : cat)}
                  className={`py-2 px-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    category === cat
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg'
                      : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
               <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className={`py-2 px-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    category === null
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] opacity-60'
                      : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                  }`}
                >
                  None
                </button>
            </div>
          </div>
          
          <div>
            <span className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Repeat on</span>
            <div className="flex justify-between space-x-1">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`w-10 h-10 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-px ${
                    selectedDays.includes(day)
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg'
                      : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                  }`}
                >
                  {DAY_SHORT_NAMES[day]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div>
              {isEditMode && onDelete && !isConfirmingDelete && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-2 text-[var(--danger)] hover:bg-[var(--danger-bg-subtle)] rounded-full transition-colors"
                  aria-label="Delete chore"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 flex-grow">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
              >
                {isEditMode ? 'Save Changes' : 'Add Chore'}
              </button>
            </div>
          </div>
        </form>
         {isEditMode && isConfirmingDelete && (
             <div className="mt-4 pt-4 border-t border-[var(--danger-border)] text-center animate-fade-in-fast bg-[var(--danger-bg-subtle)] p-4 rounded-lg">
                <p className="font-semibold text-[var(--danger)]">Are you sure?</p>
                <p className="text-sm text-[var(--danger)] opacity-80 mt-1 mb-4">This will permanently delete this chore. This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-6 py-2 rounded-lg font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:opacity-80"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteConfirm}
                        className="px-6 py-2 rounded-lg font-semibold text-[var(--danger-text)] bg-[var(--danger)] hover:opacity-80"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.3);
            border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ChoreFormModal;
