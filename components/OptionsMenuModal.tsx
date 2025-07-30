
import React, { useState, useEffect } from 'react';
import { ParentSettings, Profile } from '../types';
import { SettingsIcon, UserCircleIcon, PencilIcon } from '../constants';

interface OptionsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentSettings;
  onUpdateSettings: (newSettings: Partial<ParentSettings>) => void;
  profiles: Profile[];
  onEditProfile: (profileId: string) => void;
}

const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, profiles, onEditProfile }) => {
  const [defaultChoreValue, setDefaultChoreValue] = useState(String(settings.defaultChoreValue || 20));
  const [defaultChoreUnit, setDefaultChoreUnit] = useState<'cents' | 'dollars'>('cents');
  
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
      
      const currentValueInCents = settings.defaultChoreValue || 20;
      if (currentValueInCents >= 100) {
        setDefaultChoreUnit('dollars');
        setDefaultChoreValue((currentValueInCents / 100).toFixed(2).replace('.00', ''));
      } else {
        setDefaultChoreUnit('cents');
        setDefaultChoreValue(String(currentValueInCents));
      }
    }
  }, [isOpen, settings]);
  
  const handleSave = () => {
    setError('');
    setSuccess('');

    if (newPasscode) {
        if (settings.passcode && !currentPasscode) { setError("Please enter your current passcode to change it."); return; }
        if (settings.passcode && currentPasscode !== settings.passcode) { setError("Current passcode is incorrect."); return; }
        if (!/^\d{4}$/.test(newPasscode)) { setError("New passcode must be 4 digits."); return; }
        if (newPasscode !== confirmNewPasscode) { setError("New passcodes don't match."); return; }
    }

    const numericDefaultValueRaw = parseFloat(defaultChoreValue);
    if (isNaN(numericDefaultValueRaw) || numericDefaultValueRaw < 0) { setError("Default chore value must be a positive number."); return; }
    let numericDefaultValueInCents = defaultChoreUnit === 'dollars' ? Math.round(numericDefaultValueRaw * 100) : Math.round(numericDefaultValueRaw);
    if (isNaN(numericDefaultValueInCents) || numericDefaultValueInCents < 0) { setError("Invalid default chore value."); return; }
    
    const settingsUpdate: Partial<ParentSettings> = {};
    if (numericDefaultValueInCents !== settings.defaultChoreValue) settingsUpdate.defaultChoreValue = numericDefaultValueInCents;
    if (newPasscode) settingsUpdate.passcode = newPasscode;
    
    if (Object.keys(settingsUpdate).length > 0) {
        onUpdateSettings(settingsUpdate);
        setSuccess('Settings saved successfully!');
        setTimeout(() => onClose(), 1500);
    } else {
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-lg transform transition-all text-[var(--text-primary)] max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6 justify-center">
            <SettingsIcon className="h-8 w-8 text-[var(--accent-primary)]" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Options</h2>
        </div>
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 text-sm border border-[var(--danger-border)]">{error}</p>}
        {success && <p className="bg-[var(--success-bg-subtle)] text-[var(--success)] p-3 rounded-lg mb-4 text-sm border border-[var(--success-border)]">{success}</p>}
        <div className="space-y-6">
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
            </fieldset>

            <fieldset className="space-y-3 p-4 border border-[var(--border-secondary)] rounded-lg">
                <legend className="text-lg font-semibold px-2 text-[var(--text-secondary)]">Pay Day Settings</legend>
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