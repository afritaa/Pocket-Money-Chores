import React, { useState } from 'react';
import { KeyIcon } from '../constants';

interface PasscodeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passcode: string) => void;
}

const PasscodeSetupModal: React.FC<PasscodeSetupModalProps> = ({ isOpen, onClose, onSave }) => {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{4}$/.test(passcode)) {
      setError('Passcode must be exactly 4 digits.');
      return;
    }
    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match.');
      return;
    }
    onSave(passcode);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-sm transform transition-all text-center text-slate-900 dark:text-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
            <KeyIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Create Parent Passcode</h2>
        <p className="text-slate-600 dark:text-gray-300 mb-6">Create a 4-digit passcode to secure Parent Mode.</p>
        
        {error && <p className="bg-red-500/30 text-red-900 dark:text-red-100 p-3 rounded-lg mb-4 border border-red-400/50">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="passcode" className="sr-only">New Passcode</label>
            <input
              id="passcode"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={passcode}
              onChange={e => setPasscode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 text-center tracking-[1em] text-lg bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="confirm-passcode" className="sr-only">Confirm New Passcode</label>
            <input
              id="confirm-passcode"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPasscode}
              onChange={e => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 text-center tracking-[1em] text-lg bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            />
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
              className="px-6 py-2 rounded-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
            >
              Save Passcode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodeSetupModal;