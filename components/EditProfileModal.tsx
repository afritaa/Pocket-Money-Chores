import React, { useState, useEffect, useCallback } from 'react';
import { Profile, Day } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon, KeyIcon } from '../constants';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: Omit<Profile, 'passcode'>) => void;
  initialData: Profile;
  onUpdatePasscode: (current: string, newPasscode: string) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, initialData, onUpdatePasscode }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDay, setPayDay] = useState<Day | null>(null);
  const [error, setError] = useState('');

  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmNewPasscode, setConfirmNewPasscode] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  const resetForm = useCallback(() => {
    setName(initialData?.name || '');
    setImage(initialData?.image || null);
    setPayDay(initialData?.payDay || null);
    setError('');
    setSecurityError('');
    setSecuritySuccess('');
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmNewPasscode('');
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
    onSave({ name: name.trim(), image, payDay });
  };

  const handlePasscodeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!initialData.passcode) return; 

    if (!/^\d{4}$/.test(newPasscode)) {
      setSecurityError("New passcode must be 4 digits.");
      return;
    }
    if (newPasscode !== confirmNewPasscode) {
      setSecurityError("New passcodes don't match.");
      return;
    }

    try {
      await onUpdatePasscode(currentPasscode, newPasscode);
      setSecuritySuccess('Passcode updated successfully!');
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmNewPasscode('');
    } catch (error) {
      if (error instanceof Error) {
        setSecurityError(error.message);
      } else {
        setSecurityError("An unknown error occurred.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className='text-center mb-6'>
          <h2 className="text-2xl font-bold">Edit Kid's Profile</h2>
        </div>

        {error && <p className="bg-red-500/30 text-red-900 dark:text-red-100 p-3 rounded-lg mb-4 border border-red-400/50">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {image ? (
              <img src={image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-slate-300 dark:border-gray-700 shadow-lg" />
            ) : (
              <UserCircleIcon className="h-24 w-24 text-slate-300 dark:text-gray-600" />
            )}
            <label htmlFor="profile-image-upload" className="cursor-pointer px-4 py-2 rounded-lg text-sm text-slate-800 dark:text-gray-200 bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 font-semibold border border-slate-300 dark:border-gray-700 transition-all">
              Change Picture
            </label>
            <input id="profile-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div>
            <label htmlFor="child-name" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Child's Name</label>
            <input
              id="child-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Alex"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Pay Day</span>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setPayDay(day)}
                  className={`py-2 rounded-lg font-bold transition-all duration-300 ${
                    payDay === day
                      ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700'
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
                      ? 'bg-red-500 dark:bg-red-600 text-white shadow-lg'
                      : 'bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-300 dark:border-gray-700'
                  }`}
                >
                  None
                </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200 dark:border-gray-700">
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
              Save Profile
            </button>
          </div>
        </form>

        {initialData.passcode && (
          <div className="pt-6 border-t border-slate-200 dark:border-gray-700 mt-6">
            <div className="flex items-center gap-3 mb-4">
                <KeyIcon className="h-6 w-6 text-slate-500 dark:text-gray-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security</h3>
            </div>

            {securityError && <p className="bg-red-500/30 text-red-900 dark:text-red-100 p-3 rounded-lg mb-4 text-sm">{securityError}</p>}
            {securitySuccess && <p className="bg-green-500/30 text-green-800 dark:text-green-100 p-3 rounded-lg mb-4 text-sm">{securitySuccess}</p>}
            
            <form onSubmit={handlePasscodeChange} className="space-y-4">
                 <div>
                    <label htmlFor="current-passcode" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Current Passcode</label>
                    <input id="current-passcode" type="password" inputMode="numeric" maxLength={4} value={currentPasscode} onChange={e => setCurrentPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"/>
                </div>
                 <div>
                    <label htmlFor="new-passcode" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">New 4-Digit Passcode</label>
                    <input id="new-passcode" type="password" inputMode="numeric" maxLength={4} value={newPasscode} onChange={e => setNewPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"/>
                </div>
                 <div>
                    <label htmlFor="confirm-new-passcode" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Confirm New Passcode</label>
                    <input id="confirm-new-passcode" type="password" inputMode="numeric" maxLength={4} value={confirmNewPasscode} onChange={e => setConfirmNewPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"/>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="px-6 py-2 rounded-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold shadow-lg transition-all">
                        Change Passcode
                    </button>
                </div>
            </form>
          </div>
        )}
      </div>
       <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default EditProfileModal;