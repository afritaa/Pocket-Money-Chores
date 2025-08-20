

import React, { useState, useEffect, useCallback } from 'react';
import { ParentSettings, Profile } from '../types';
import { SettingsIcon, UserCircleIcon, PencilIcon, ArrowDownOnSquareIcon, LockClosedIcon, XIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface OptionsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentSettings;
  onUpdateSettings: (newSettings: Partial<ParentSettings>) => void;
  profiles: Profile[];
  onEditProfile: (profileId: string) => void;
  onInstallApp: () => void;
  canInstall: boolean;
  onManagePasscode: () => void;
}

const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, profiles, onEditProfile, onInstallApp, canInstall, onManagePasscode }) => {
  const [defaultChoreValue, setDefaultChoreValue] = useState(String(settings.defaultChoreValue || 20));
  const [defaultChoreUnit, setDefaultChoreUnit] = useState<'cents' | 'dollars'>('cents');
  const [defaultBonusValue, setDefaultBonusValue] = useState(String(settings.defaultBonusValue || 100));
  const [defaultBonusUnit, setDefaultBonusUnit] = useState<'cents' | 'dollars'>('cents');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      
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
    
    if (Object.keys(settingsUpdate).length > 0) {
        onUpdateSettings(settingsUpdate);
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 2000);
    }
  }, [defaultChoreValue, defaultChoreUnit, defaultBonusValue, defaultBonusUnit, onUpdateSettings, settings]);
  

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex justify-start"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 10px; }
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
        `}</style>
        <motion.div
          className="bg-[var(--card-bg)] shadow-xl w-full max-w-lg flex flex-col h-full"
          onClick={e => e.stopPropagation()}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        >
          <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
              <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <XIcon className="h-7 w-7" />
              </button>
              <div className="flex items-center gap-3">
                  <SettingsIcon className="h-8 w-8 text-[var(--accent-primary)]" />
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h2>
              </div>
              <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 rounded-lg text-base font-semibold text-[var(--success-text)] bg-[var(--success)] hover:opacity-90 transition-opacity"
              >
                  Save
              </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
              <div className="space-y-6">
                  {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg text-sm border border-[var(--danger-border)]">{error}</p>}
                  {success && <p className="bg-[var(--success-bg-subtle)] text-[var(--success)] p-3 rounded-lg text-sm border border-[var(--success-border)]">{success}</p>}
                  
                  {canInstall && (
                      <div className="p-4 border border-[var(--border-secondary)] rounded-lg bg-[var(--accent-primary)] bg-opacity-10 animate-fade-in-fast">
                          <div className="flex justify-between items-center gap-4">
                              <div className="flex-grow">
                                  <h3 className="text-lg font-semibold text-[var(--accent-primary)]">Install App</h3>
                                  <p className="text-sm text-[var(--text-secondary)] mt-1">Get a native app experience by installing <span className="whitespace-nowrap">Pocket Money Chores.</span> on your device.</p>
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
                              <button onClick={() => { onEditProfile(p.id); onClose(); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-[var(--bg-secondary)] hover:opacity-80 border border-[var(--border-primary)] transition-all">
                                  <PencilIcon />
                                  <span>Edit</span>
                              </button>
                          </div>
                      ))}
                  </fieldset>
                  
                  <fieldset className="space-y-3 p-4 border border-[var(--border-secondary)] rounded-lg">
                      <legend className="text-lg font-semibold px-2 text-[var(--text-secondary)]">Security</legend>
                      <button onClick={onManagePasscode} className="w-full flex items-center justify-center gap-2 text-[var(--text-primary)] bg-transparent hover:bg-[var(--bg-tertiary)] font-semibold py-3 px-4 rounded-lg transition-colors border border-[var(--border-secondary)]">
                          <LockClosedIcon className="w-5 h-5" />
                          <span>Manage Passcode</span>
                      </button>
                  </fieldset>

              </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OptionsMenuModal;