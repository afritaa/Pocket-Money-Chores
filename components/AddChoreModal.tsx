import React, { useState, useCallback, useEffect } from 'react';
import { Day, Chore } from '../types';
import { DAYS_OF_WEEK, DAY_SHORT_NAMES } from '../constants';

interface ChoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreData: Omit<Chore, 'id' | 'completions'>) => void;
  initialData: Chore | null;
}

const ChoreFormModal: React.FC<ChoreFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('50');
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [error, setError] = useState('');

  const isEditMode = !!initialData;

  const resetForm = useCallback(() => {
    setName('');
    setValue('50');
    setSelectedDays([]);
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setValue(String(initialData.value * 100));
        setSelectedDays(initialData.days);
      } else {
        resetForm();
      }
    } else {
        setError('');
    }
  }, [initialData, isOpen, resetForm]);

  const handleDayToggle = useCallback((day: Day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Chore name is required.');
      return;
    }

    const numericValueInCents = parseInt(value, 10);
    if (isNaN(numericValueInCents) || numericValueInCents <= 0) {
      setError('Chore value must be a positive number of cents.');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one day.');
      return;
    }

    const valueInDollars = numericValueInCents / 100;
    onSave({ name: name.trim(), value: valueInDollars, days: selectedDays });
  };

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
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Chore' : 'Add a New Chore'}
        </h2>
        
        {error && <p className="bg-red-500/30 text-red-900 dark:text-red-100 p-3 rounded-lg mb-4 border border-red-400/50">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="chore-name" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Chore Name</label>
            <input
              id="chore-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Make the bed"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="chore-value" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Value (cents)</label>
            <input
              id="chore-value"
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              min="1"
              step="1"
              placeholder="e.g., 50"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Repeat on</span>
            <div className="flex justify-between space-x-1">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`w-10 h-10 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-px ${
                    selectedDays.includes(day)
                      ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700'
                  }`}
                >
                  {DAY_SHORT_NAMES[day]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-slate-800 dark:text-gray-200 bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
            >
              {isEditMode ? 'Save Changes' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChoreFormModal;