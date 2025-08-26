

import React, { useState, useEffect, useCallback } from 'react';
import { ParentSettings, Profile } from '../types';
import { SettingsIcon, UserCircleIcon, PencilIcon, ArrowDownOnSquareIcon } from '../constants';

interface OptionsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentSettings;
  onUpdateSettings: (newSettings: Partial<ParentSettings>) => void;
  profiles: Profile[];
  onEditProfile: (profileId: string) => void;
  onInstallApp: () => void;
  canInstall: boolean;
}

const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, profiles, onEditProfile, onInstallApp, canInstall }) => {
  const [defaultChoreValue, setDefaultChoreValue] = useState(String(settings.defaultChoreValue || 20));
  const [defaultChoreUnit, setDefaultChoreUnit] = useState<'cents' | 'dollars'>('cents');
  const [defaultBonusValue, setDefaultBonusValue] = useState(String(settings.defaultBonusValue || 100));
  const [defaultBonusUnit, setDefaultBonusUnit] = useState<'cents' | 'dollars'>('cents');
  
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmNewPasscode, setConfirmNewPasscode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmNewPasscode('');
      
      const choreValueInCents = settings.defaultChoreValue || 20;
      if (choreValueInCents >= 100 && choreValueInCents % 100 === 0) {
        setDefaultChoreUnit('dollars');
        setDefaultChoreValue(String(choreValueInCents / 100));
      } else {
        setDefaultChoreUnit('cents');
        setDefaultChoreValue(String(choreValueInCents));
      }
      
      const bonusValueInCents = settings.defaultBonusValue || 100;
      if (bonusValueInCents >= 100 && bonusValueInCents % 100 === 0) {
        setDefaultBonusUnit('dollars');
        setDefaultBonusValue(String(bonusValueInCents / 100));
      } else {
        setDefaultBonusUnit('cents');
        setDefaultBonusValue(String(bonusValueInCents));
      }
    }
  }, [isOpen, settings]);
  
  const handleSave = useCallback(() => {
    setError('');
    setSuccess('');

    if (newPasscode) {
        if (settings.passcode && !currentPasscode) { setError("Please enter your current passcode to change it."); return; }
        if (settings.passcode && currentPasscode !== settings.passcode) { setError("Current passcode is incorrect."); return; }
        if (!/^\d{4}$/.test(newPasscode)) { setError("New passcode must be 4 digits."); return; }
        if (newPasscode !== confirmNewPasscode) { setError("New passcodes don't match."); return; }
    }

    const choreValueRaw = parseFloat(defaultChoreValue);
    if (isNaN(choreValueRaw) || choreValueRaw < 0) { setError("Default chore value must be a positive number."); return; }
    const choreValueInCents = defaultChoreUnit === 'dollars' ? Math.round(choreValueRaw * 100) : Math.round(choreValueRaw);

    const bonusValueRaw = parseFloat(defaultBonusValue);
    if (isNaN(bonusValueRaw) || bonusValueRaw < 0) { setError("Default bonus value must be a positive number."); return; }
    const bonusValueInCents = defaultBonusUnit === 'dollars' ? Math.round(bonusValueRaw * 100) : Math.round(bonusValueRaw);

    if (isNaN(choreValueInCents) || choreValueInCents < 0) { setError("Invalid default chore value."); return; }
    if (isNaN(bonusValueInCents) || bonusValueInCents < 0) { setError("Invalid default bonus value."); return; }
    
    const settingsUpdate: Partial<ParentSettings> = {};
    if (choreValueInCents !== settings.defaultChoreValue) settingsUpdate.defaultChoreValue = choreValueInCents;
    if (bonusValueInCents !== settings.defaultBonusValue) settingsUpdate.defaultBonusValue = bonusValueInCents;
    if (newPasscode) settingsUpdate.passcode = newPasscode;
    
    if (Object.keys(settingsUpdate).length > 0) {
        onUpdateSettings(settingsUpdate);
        setSuccess('Settings saved successfully!');
        setTimeout(() => onClose(), 1500);
    } else {
        onClose();
    }
  }, [newPasscode, settings, currentPasscode, confirmNewPasscode, defaultChoreValue, defaultChoreUnit, defaultBonusValue, defaultBonusUnit, onUpdateSettings, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && activeElement.tagName === 'INPUT' && activeElement.id.includes('passcode')) {
                // If on a passcode field, move to the next or save
                const allInputs = Array.from(document.querySelectorAll('input, button')).filter(el => (el as HTMLElement).offsetParent !== null) as HTMLElement[];
                const currentIndex = allInputs.indexOf(activeElement);
                if (currentIndex < allInputs.length - 1) {
                    allInputs[currentIndex + 1].focus();
                } else {
                    handleSave();
                }
            } else {
                handleSave();
            }
        }
    };
    if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleSave]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-lg transform transition-all text-[var(--text-primary)] max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6 justify-center">
            <SettingsIcon className="h-8 w-8 text-[var(--accent-primary)]" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h2>
        </div>
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 text-sm border border-[var(--danger-border)]">{error}</p>}
        {success && <p className="bg-[var(--success-bg-subtle)] text-[var(--success)] p-3 rounded-lg mb-4 text-sm border border-[var(--success-border)]">{success}</p>}
        <div className="space-y-6">
            {canInstall && (
                <div className="p-4 border border-[var(--border-secondary)] rounded-lg bg-[var(--accent-primary)] bg-opacity-10 animate-fade-in-fast">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold text-[var(--accent-primary)]">Install App</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">Get a native app experience by installing Pocket Money Chores on your device.</p>
                        </div>
                        <button 
                            onClick={onInstallApp}
                            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg transition-all"
                        >
                            <ArrowDownOnSquareIcon className="w-5 h-5" />
                            Install
                        </button>
                    </div>
                </div>
            )}
            <fieldset className="space-y-4 p-4 border border-[var(--border-secondary)] rounded-lg">
                <legend className="text-lg font-semibold px-2 text-[var(--text-secondary)]">General Settings</legend>
                <div>
                    <label htmlFor="default-chore-value" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Default Chore Value</label>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                            <button type="button" onClick={() => setDefaultChoreUnit('dollars')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${defaultChoreUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>$</button>
                            <button type="button" onClick={() => setDefaultChoreUnit('cents')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${defaultChoreUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>¢</button>
                        </div>
                        <input id="default-chore-value" type="number" value={defaultChoreValue} onChange={e => setDefaultChoreValue(e.target.value)} min="0" step={defaultChoreUnit === 'dollars' ? '0.01' : '1'} className="w-32 px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="default-bonus-value" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Default Bonus Amount</label>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg bg-[var(--bg-tertiary)] p-1 self-stretch border border-[var(--border-secondary)]">
                            <button type="button" onClick={() => setDefaultBonusUnit('dollars')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${defaultBonusUnit === 'dollars' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>$</button>
                            <button type="button" onClick={() => setDefaultBonusUnit('cents')} className={`px-4 py-2 text-base font-semibold rounded-md transition-all ${defaultBonusUnit === 'cents' ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>¢</button>
                        </div>
                        <input id="default-bonus-value" type="number" value={defaultBonusValue} onChange={e => setDefaultBonusValue(e.target.value)} min="0" step={defaultBonusUnit === 'dollars' ? '0.01' : '1'} className="w-32 px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-3 p-4 border border-[var(--border-secondary)] rounded-lg">
                <legend className="text-lg font-semibold px-2 text-[var(--text-secondary)]">Profiles & Pay Day</legend>
                {profiles.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded-lg">
                        <div className="flex items-center gap-3">
                            {p.image ? <img src={p.image} alt={p.name} className="w-8 h-8 rounded-full object-cover"/> : <UserCircleIcon className="w-8 h-8" />}
                            <span className="font-semibold">{p.name}</span>
                        </div>
                        <button onClick={() => onEditProfile(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-[var(--bg-secondary)] hover:opacity-80 border border-[var(--border-primary)] transition-all">
                            <PencilIcon />
                            <span>Edit</span>
                        </button>
                    </div>
                ))}
            </fieldset>

            <fieldset className="space-y-4 p-4 border border-[var(--border-secondary)] rounded-lg">
                 <legend className="px-2">
                    <div className="text-lg font-semibold text-[var(--text-secondary)]">Parent Lock</div>
                    <p className="text-sm text-[var(--text-secondary)] font-normal mt-1">This prevents your child from accessing Parent Mode.</p>
                 </legend>
                {settings.passcode && (<div><label htmlFor="current-passcode-options" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Current Passcode</label><input id="current-passcode-options" type="password" inputMode="numeric" autoFocus maxLength={4} value={currentPasscode} onChange={e => setCurrentPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/></div>)}
                <div><label htmlFor="new-passcode-options" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{settings.passcode ? 'New' : 'Set'} 4-Digit Passcode</label><input id="new-passcode-options" type="password" inputMode="numeric" maxLength={4} value={newPasscode} onChange={e => setNewPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/></div>
                {newPasscode && (<div className="animate-fade-in-fast"><label htmlFor="confirm-new-passcode-options" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Confirm New Passcode</label><input id="confirm-new-passcode-options" type="password" inputMode="numeric" maxLength={4} value={confirmNewPasscode} onChange={e => setConfirmNewPasscode(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/></div>)}
            </fieldset>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors">Cancel</button>
                <button type="button" onClick={handleSave} className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg transition-all">Save</button>
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 10px; }
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default OptionsMenuModal;