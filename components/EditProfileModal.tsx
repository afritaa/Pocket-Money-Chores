


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Profile, Day, PayDayConfig } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon, TrashIcon, compressImage, XIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: Profile) => void;
  onDelete: (profileId: string) => void;
  initialData: Profile;
}

const PayDaySettingsEditor = ({ config, onConfigChange, profileName }: { config: PayDayConfig, onConfigChange: (newConfig: PayDayConfig) => void, profileName: string }) => {
    const { mode, day, time } = config;

    const isAnytimeSelected = mode === 'anytime';
    const isPayDaySelected = mode === 'manual' || mode === 'automatic';

    return (
        <div className="space-y-4">
            <div className="text-sm text-[var(--text-secondary)] -mt-2 mb-4">
              <p>Each chore makes money! How should {profileName || 'your child'} be paid?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button type="button" onClick={() => onConfigChange({ mode: 'anytime' })} className={`p-4 rounded-lg border-2 text-left transition-all ${isAnytimeSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                    <h4 className={`font-bold transition-colors ${isAnytimeSelected ? 'text-[var(--accent-primary-text)]' : 'text-[var(--text-primary)]'}`}>Cash Out Anytime</h4>
                    <p className={`text-xs mt-1 transition-colors ${isAnytimeSelected ? 'text-[var(--accent-primary-text)] opacity-90' : 'text-[var(--text-secondary)]'}`}>{profileName || 'They'} can request a cash out on any day at any time.</p>
                </button>
                <button type="button" onClick={() => onConfigChange({ mode: 'manual', day: config.day || Day.Sat })} className={`p-4 rounded-lg border-2 text-left transition-all ${isPayDaySelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                    <h4 className={`font-bold transition-colors ${isPayDaySelected ? 'text-[var(--accent-primary-text)]' : 'text-[var(--text-primary)]'}`}>Set a Pay Day</h4>
                    <p className={`text-xs mt-1 transition-colors ${isPayDaySelected ? 'text-[var(--accent-primary-text)] opacity-90' : 'text-[var(--text-secondary)]'}`}>Designate a specific day for payments.</p>
                </button>
            </div>

            {(mode === 'manual' || mode === 'automatic') && (
                <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)] space-y-4 animate-fade-in-fast">
                    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-full">
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'manual' })} className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all ${mode === 'manual' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]' : 'text-[var(--text-secondary)]'}`}>Manual</button>
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'automatic', time: config.time || '18:00' })} className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all ${mode === 'automatic' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]' : 'text-[var(--text-secondary)]'}`}>Automatic</button>
                    </div>
                    {mode === 'manual' && <p className="text-xs text-[var(--text-secondary)] text-center">{profileName} will only see the Cash Out button on this day.</p>}
                    {mode === 'automatic' && <p className="text-xs text-[var(--text-secondary)] text-center">An automatic request for {profileName} to Cash Out will be sent at this time each week.</p>}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Pay Day of the Week</label>
                        <div className="grid grid-cols-7 gap-1">
                            {DAYS_OF_WEEK.map(d => (
                                <button key={d} type="button" onClick={() => onConfigChange({ ...config, day: d })} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${day === d ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]' : 'bg-[var(--bg-secondary)] hover:opacity-80 border border-[var(--border-primary)]'}`}>
                                    {d.slice(0, 1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {mode === 'automatic' && (
                        <div className="space-y-2 animate-fade-in-fast">
                           <label htmlFor="pay-time" className="text-sm font-medium text-[var(--text-secondary)]">Time for Automatic Request</label>
                           <input id="pay-time" type="time" value={time || '18:00'} onChange={e => onConfigChange({ ...config, time: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border-[var(--border-primary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDayConfig, setPayDayConfig] = useState<PayDayConfig>({ mode: 'anytime' });
  const [showPotentialEarnings, setShowPotentialEarnings] = useState(true);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = useCallback(() => {
    setName(initialData?.name || '');
    setImage(initialData?.image || null);
    setPayDayConfig(initialData?.payDayConfig || { mode: 'anytime' });
    setShowPotentialEarnings(initialData?.showPotentialEarnings ?? true);
    setErrors({});
    setIsConfirmingDelete(false);
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedDataUrl = await compressImage(file, { maxWidth: 512, maxHeight: 512 });
        setImage(compressedDataUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during image processing.';
        alert(message);
      } finally {
        // Reset input to allow re-uploading the same file
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Child's name is required.";
    }
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    onSave({ ...initialData, name: name.trim(), image, payDayConfig, showPotentialEarnings });
  }, [name, image, payDayConfig, showPotentialEarnings, onSave, initialData]);
  
  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-[var(--card-bg)] rounded-b-3xl sm:rounded-3xl shadow-xl w-full max-w-lg flex flex-col h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:my-8"
        onClick={e => e.stopPropagation()}
        initial={{ y: '-100vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } }}
        exit={{ y: '-100vh', opacity: 0, transition: { duration: 0.2 } }}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
            <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <XIcon className="h-7 w-7" />
            </button>
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button
                type="submit"
                className="px-6 py-2 rounded-lg text-base font-semibold text-[var(--success-text)] bg-[var(--success)] hover:opacity-90 transition-opacity"
            >
                Save
            </button>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
            <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    {image ? <img src={image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-[var(--border-secondary)]" /> : <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)]" />}
                    <label htmlFor="profile-image-upload" className="cursor-pointer px-4 py-2 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all">Change Picture</label>
                    <input id="profile-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
                
                <div>
                    <label htmlFor="child-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Child's Name</label>
                    <input
                      id="child-name"
                      type="text"
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (errors.name) setErrors(p => ({...p, name: undefined}));
                      }}
                      placeholder="e.g., Alex"
                      className={`w-full px-4 py-3 bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all placeholder:text-[var(--text-tertiary)] ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                </div>

                <fieldset className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                    <legend className="text-lg font-semibold text-[var(--text-secondary)] -mt-9 px-2 bg-[var(--card-bg)] w-auto mx-auto">Pay Day Settings</legend>
                    <PayDaySettingsEditor config={payDayConfig} onConfigChange={setPayDayConfig} profileName={name} />
                    {(payDayConfig.mode === 'manual' || payDayConfig.mode === 'automatic') && (
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-primary)] animate-fade-in-fast">
                            <label htmlFor="show-potential-toggle-profile" className="flex-grow cursor-pointer">
                                <span className="font-medium text-[var(--text-primary)]">Show Potential Earnings</span>
                                <p className="text-sm text-[var(--text-secondary)]">Display potential earnings until next pay day.</p>
                            </label>
                            <button
                                id="show-potential-toggle-profile"
                                type="button"
                                onClick={() => setShowPotentialEarnings(p => !p)}
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 items-center rounded-full transition-colors ${showPotentialEarnings ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPotentialEarnings ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}
                </fieldset>
                
                <div className="pt-6 mt-6 border-t border-red-500/30">
                    {!isConfirmingDelete ? (
                        <button type="button" onClick={() => setIsConfirmingDelete(true)} className="w-full flex items-center justify-center gap-2 text-[var(--danger)] bg-[var(--danger-bg-subtle)] hover:bg-opacity-80 font-semibold py-2 px-4 rounded-lg transition-colors">
                            <TrashIcon />Delete {initialData.name}'s Profile
                        </button>
                    ) : (
                        <div className="text-center p-4 bg-[var(--danger-bg-subtle)] rounded-lg animate-fade-in-fast">
                            <p className="font-semibold text-[var(--danger)]">Are you sure?</p>
                            <p className="text-sm text-[var(--danger)] opacity-80 mt-1 mb-4">This will permanently delete this profile and all associated data. This action cannot be undone.</p>
                            <div className="flex justify-center gap-4">
                                <button type="button" onClick={() => setIsConfirmingDelete(false)} className="px-6 py-2 rounded-lg font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:opacity-80">Cancel</button>
                                <button type="button" onClick={() => onDelete(initialData.id)} className="px-6 py-2 rounded-lg font-semibold text-[var(--danger-text)] bg-[var(--danger)] hover:opacity-80">Yes, Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </motion.form>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;