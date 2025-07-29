

import React, { useState } from 'react';
import { KeyIcon } from '../constants';

interface ParentPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatePasscode: (current: string, newPasscode: string) => Promise<void>;
  hasPasscode: boolean;
}

const ParentPasscodeModal: React.FC<ParentPasscodeModalProps> = ({ isOpen, onClose, onUpdatePasscode, hasPasscode }) => {
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmNewPasscode, setConfirmNewPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasscodeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (hasPasscode && !currentPasscode) {
      setError("Please enter your current passcode.");
      return;
    }
    if (!/^\d{4}$/.test(newPasscode)) {
      setError("New passcode must be 4 digits.");
      return;
    }
    if (newPasscode !== confirmNewPasscode) {
      setError("New passcodes don't match.");
      return;
    }

    try {
      await onUpdatePasscode(currentPasscode, newPasscode);
      setSuccess('Passcode updated successfully!');
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmNewPasscode('');
      setTimeout(() => {
        setSuccess('');
        handleClose();
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };
  
  const handleClose = () => {
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmNewPasscode('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={handleClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-sm transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6 justify-center">
            <KeyIcon className="h-8 w-8 text-[var(--accent-primary)]" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Parent Passcode</h2>
        </div>

        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 text-sm border border-[var(--danger-border)]">{error}</p>}
        {success && <p className="bg-[var(--success-bg-subtle)] text-[var(--success)] p-3 rounded-lg mb-4 text-sm border border-[var(--success-border)]">{success}</p>}
        
        <form onSubmit={handlePasscodeChange} className="space-y-4">
            {hasPasscode && (
                 <div>
                    <label htmlFor="current-passcode-parent" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Current Passcode</label>
                    <input id="current-passcode-parent" type="password" inputMode="numeric" autoFocus maxLength={4} value={currentPasscode} onChange={e => setCurrentPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                </div>
            )}
             <div>
                <label htmlFor="new-passcode-parent" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">New 4-Digit Passcode</label>
                <input id="new-passcode-parent" type="password" inputMode="numeric" maxLength={4} value={newPasscode} onChange={e => setNewPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
            </div>
             <div>
                <label htmlFor="confirm-new-passcode-parent" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Confirm New Passcode</label>
                <input id="confirm-new-passcode-parent" type="password" inputMode="numeric" maxLength={4} value={confirmNewPasscode} onChange={e => setConfirmNewPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleClose} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors">
                    Close
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg transition-all">
                    {hasPasscode ? 'Change Passcode' : 'Set Passcode'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ParentPasscodeModal;
