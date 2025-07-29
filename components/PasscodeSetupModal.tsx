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
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-sm transform transition-all text-center text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
            <KeyIcon className="h-12 w-12 text-[var(--accent-primary)]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Create Parent Passcode</h2>
        <p className="text-[var(--text-secondary)] mb-6">Create a 4-digit passcode to secure Parent Mode.</p>
        
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)]">{error}</p>}
        
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
              className="w-full px-4 py-3 text-center tracking-[1em] text-lg bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
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
              className="w-full px-4 py-3 text-center tracking-[1em] text-lg bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
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
