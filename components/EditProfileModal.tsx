

import React, { useState, useEffect, useCallback } from 'react';
import { Profile, Day } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon, TrashIcon } from '../constants';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: Profile) => void;
  onDelete: (profileId: string) => void;
  initialData: Profile;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDay, setPayDay] = useState<Day | null>(null);
  const [error, setError] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const resetForm = useCallback(() => {
    setName(initialData?.name || '');
    setImage(initialData?.image || null);
    setPayDay(initialData?.payDay || null);
    setError('');
    setIsConfirmingDelete(false);
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

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
    if (!name.trim()) {
      setError("Child's name is required.");
      return;
    }
    onSave({ ...initialData, name: name.trim(), image, payDay });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto text-[var(--text-primary)] custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className='text-center mb-6'>
          <h2 className="text-2xl font-bold">Edit {initialData.name}'s Profile</h2>
        </div>

        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)]">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {image ? (
              <img src={image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-[var(--border-secondary)] shadow-lg" />
            ) : (
              <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)]" />
            )}
            <label htmlFor="profile-image-upload" className="cursor-pointer px-4 py-2 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all">
              Change Picture
            </label>
            <input id="profile-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div>
            <label htmlFor="child-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Child's Name</label>
            <input
              id="child-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Alex"
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
          
          <div className="pt-6 mt-6 border-t border-[var(--border-primary)] flex justify-end space-x-4">
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
              Save Profile
            </button>
          </div>
        </form>
        <div className="pt-6 mt-6 border-t border-red-500/30">
          {!isConfirmingDelete ? (
            <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="w-full flex items-center justify-center gap-2 text-[var(--danger)] bg-[var(--danger-bg-subtle)] hover:bg-opacity-80 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                <TrashIcon />
                Delete {initialData.name}'s Profile
            </button>
          ) : (
            <div className="text-center p-4 bg-[var(--danger-bg-subtle)] rounded-lg animate-fade-in-fast">
                <p className="font-semibold text-[var(--danger)]">Are you sure?</p>
                <p className="text-sm text-[var(--danger)] opacity-80 mt-1 mb-4">This will permanently delete this profile and all associated data. This action cannot be undone.</p>
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
                        onClick={() => onDelete(initialData.id)}
                        className="px-6 py-2 rounded-lg font-semibold text-[var(--danger-text)] bg-[var(--danger)] hover:opacity-80"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
       <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(128, 128, 128, 0.1);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.2);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(128, 128, 128, 0.4);
        }
        @keyframes fade-in-fast { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default EditProfileModal;
