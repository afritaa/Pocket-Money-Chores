import React, { useState } from 'react';
import { Day, Profile } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon } from '../constants';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Profile, 'id' | 'theme'>) => void;
}

const AddChildModal: React.FC<AddChildModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDay, setPayDay] = useState<Day | null>(Day.Sat);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError("Child's name is required.");
      return;
    }
    onSave({ name: name.trim(), image, payDay });
    // Reset form for next time
    setName('');
    setImage(null);
    setPayDay(Day.Sat);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add a New Child</h2>

        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)]">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {image ? (
              <img src={image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-[var(--border-secondary)] shadow-lg" />
            ) : (
              <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)]" />
            )}
            <label htmlFor="add-child-image-upload" className="cursor-pointer px-4 py-2 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all">
              Upload Picture
            </label>
            <input id="add-child-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div>
            <label htmlFor="add-child-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Child's Name</label>
            <input
              id="add-child-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Jamie"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Pay Day</span>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setPayDay(day)}
                  className={`py-2 rounded-lg font-bold transition-all duration-300 ${
                    payDay === day
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg'
                      : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPayDay(null)}
                className={`py-2 rounded-lg font-bold transition-all duration-300 col-span-4 sm:col-span-1 ${
                  payDay === null
                    ? 'bg-[var(--danger)] text-[var(--danger-text)] shadow-lg'
                    : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                }`}
              >
                None
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--border-primary)]">
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
              Add Child
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChildModal;
