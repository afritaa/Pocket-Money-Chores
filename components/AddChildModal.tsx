
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Day, Profile, PayDayConfig } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon, XIcon, compressImage } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Profile, 'id' | 'theme' | 'hasSeenThemePrompt' | 'showPotentialEarnings'>, passcode: string | null) => void;
  isInitialSetup?: boolean;
}

const PayDaySettingsEditor = ({ config, onConfigChange, profileName }: { config: PayDayConfig, onConfigChange: (newConfig: PayDayConfig) => void, profileName: string }) => {
    const { mode, day, time } = config;

    const isAnytimeSelected = mode === 'anytime';
    const isPayDaySelected = mode === 'manual' || mode === 'automatic';

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] -mt-2 mb-4">
              <p>When should {profileName || 'your child'} be paid their earnings?</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button type="button" onClick={() => onConfigChange({ mode: 'manual', day: config.day || Day.Sat })} className={`p-3 rounded-lg border-2 text-left transition-all ${isPayDaySelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                    <h4 className={`font-semibold text-sm sm:font-bold transition-colors ${isPayDaySelected ? 'text-[var(--accent-primary-text)]' : 'text-[var(--text-primary)]'}`}>Set a Pay Day</h4>
                    <p className={`text-xs mt-1 transition-colors ${isPayDaySelected ? 'text-[var(--accent-primary-text)] opacity-90' : 'text-[var(--text-secondary)]'}`}>Designate a specific day.</p>
                </button>
                <button type="button" onClick={() => onConfigChange({ mode: 'anytime' })} className={`p-3 rounded-lg border-2 text-left transition-all ${isAnytimeSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                    <h4 className={`font-semibold text-sm sm:font-bold transition-colors ${isAnytimeSelected ? 'text-[var(--accent-primary-text)]' : 'text-[var(--text-primary)]'}`}>Cash Out Anytime</h4>
                    <p className={`text-xs mt-1 transition-colors ${isAnytimeSelected ? 'text-[var(--accent-primary-text)] opacity-90' : 'text-[var(--text-secondary)]'}`}>Request a cash out on any day.</p>
                </button>
            </div>

            {(mode === 'manual' || mode === 'automatic') && (
                <div className="p-3 sm:p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)] space-y-3 sm:space-y-4 animate-fade-in-fast">
                    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-full">
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'manual' })} className={`w-1/2 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${mode === 'manual' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Manual</button>
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'automatic', time: config.time || '18:00' })} className={`w-1/2 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${mode === 'automatic' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Automatic</button>
                    </div>
                    {mode === 'manual' && <p className="text-xs text-[var(--text-secondary)] text-center">{profileName} will only see the Cash Out button on this day.</p>}
                    {mode === 'automatic' && <p className="text-xs text-[var(--text-secondary)] text-center">An automatic request for {profileName} to Cash Out will be sent at this time each week.</p>}
                    
                    <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Pay Day of the Week</label>
                        <div className="grid grid-cols-7 gap-1">
                            {DAYS_OF_WEEK.map(d => (
                                <button key={d} type="button" onClick={() => onConfigChange({ ...config, day: d })} className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${day === d ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg' : 'bg-[var(--bg-secondary)] hover:opacity-80 border border-[var(--border-primary)]'}`}>
                                    {d.slice(0, 1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {mode === 'automatic' && (
                        <div className="space-y-2 animate-fade-in-fast">
                           <label htmlFor="pay-time" className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Time for Automatic Request</label>
                           <input id="pay-time" type="time" value={time || '18:00'} onChange={e => onConfigChange({ ...config, time: e.target.value })} className="w-full px-3 py-2 sm:px-4 bg-[var(--bg-secondary)] border-[var(--border-primary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AddChildModal: React.FC<AddChildModalProps> = ({ isOpen, onClose, onSave, isInitialSetup = false }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDayConfig, setPayDayConfig] = useState<PayDayConfig>({ mode: 'manual', day: Day.Sat });
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = isInitialSetup ? 3 : 2;

  useEffect(() => {
    if (isOpen) {
        setStep(1);
        setName('');
        setImage(null);
        setPayDayConfig({ mode: 'manual', day: Day.Sat });
        setPasscode('');
        setConfirmPasscode('');
        setErrors({});
    }
  }, [isOpen]);
  
  useEffect(() => {
      if (isOpen && step === 1) {
          setTimeout(() => nameInputRef.current?.focus(), 150);
      }
  }, [isOpen, step]);

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
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleNextStep = useCallback(() => {
    const newErrors: typeof errors = {};
    if (step === 1 && !name.trim()) {
      newErrors.name = "Please enter your child's name.";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setStep(s => s + 1);
    }
  }, [step, name]);

  const handleSaveChild = useCallback((finalPasscode: string | null) => {
    if (!name.trim()) {
      setErrors({ name: "Child's name is required." });
      setStep(1);
      return;
    }
    setErrors({});
    onSave({ name: name.trim(), image, payDayConfig }, isInitialSetup ? finalPasscode : null);
  }, [name, image, payDayConfig, onSave, isInitialSetup]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      handleNextStep();
    } else {
      if (isInitialSetup) { // Step 3: Passcode
        const newErrors: typeof errors = {};
        if (passcode || confirmPasscode) {
            if (passcode.length !== 4) {
                newErrors.name = 'Passcode must be 4 digits.';
            } else if (passcode !== confirmPasscode) {
                newErrors.name = 'Passcodes do not match.';
            }
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        handleSaveChild(passcode || null);
      } else { // Step 2: Final step for non-initial setup
        handleSaveChild(null);
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
           <div className="animate-fade-in">
             <h3 className="text-lg sm:text-xl font-bold mb-1">Child's Profile</h3>
             <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 sm:mb-6">Let's start with the basics.</p>
             <div className="flex flex-col items-center space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {image ? <img src={image} alt="Profile" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-2 border-[var(--border-secondary)] shadow-lg" /> : <UserCircleIcon className="h-20 w-20 sm:h-24 sm:w-24 text-[var(--text-tertiary)]" />}
                <label htmlFor="add-child-image-upload" className="cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all">Upload Picture</label>
                <input id="add-child-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div>
                <label htmlFor="add-child-name" className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-2">Child's Name</label>
                <input
                  id="add-child-name"
                  type="text"
                  value={name}
                  ref={nameInputRef}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) setErrors(p => ({...p, name: undefined}));
                  }}
                  placeholder="e.g., Alex"
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all placeholder:text-[var(--text-tertiary)] ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
              </div>
           </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg sm:text-xl font-bold mb-1">Pay Day Settings</h3>
            <PayDaySettingsEditor config={payDayConfig} onConfigChange={setPayDayConfig} profileName={name} />
          </div>
        );
      case 3:
        return (
            <div className="animate-fade-in">
                <h3 className="text-lg sm:text-xl font-bold mb-1">Secure Parent Mode</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 sm:mb-6">
                    Set a 4-digit passcode to prevent children from accessing parent settings. This is optional.
                </p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="passcode" className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-2">4-Digit Passcode</label>
                        <input
                            id="passcode"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={passcode}
                            onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setPasscode(val);
                                if (errors.name) setErrors({});
                            }}
                            placeholder="••••"
                            className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all placeholder:text-[var(--text-tertiary)] ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-passcode" className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-2">Confirm Passcode</label>
                        <input
                            id="confirm-passcode"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={confirmPasscode}
                            onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setConfirmPasscode(val);
                                if (errors.name) setErrors({});
                            }}
                            placeholder="••••"
                            className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-[var(--bg-tertiary)] border rounded-lg focus:ring-2 transition-all placeholder:text-[var(--text-tertiary)] ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]'}`}
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 text-center">{errors.name}</p>}
                </div>
                 <button 
                    type="button" 
                    onClick={() => handleSaveChild(null)} 
                    className="w-full text-center mt-6 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                    Skip for now
                </button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={isInitialSetup ? undefined : onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
            @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0px); } }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          `}</style>
            <motion.form
                ref={formRef}
                onSubmit={handleFormSubmit}
                className="bg-[var(--card-bg)] rounded-3xl shadow-xl w-full max-w-lg flex flex-col h-auto max-h-[90vh] relative"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
                exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
            >
              <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 h-16">
                  <div className="w-20 sm:w-24 text-left">
                      {step > 1 && (
                          <button 
                              type="button"
                              onClick={() => setStep(s => s - 1)} 
                              className="px-4 py-2 rounded-lg text-sm sm:text-base text-[var(--text-primary)] bg-transparent hover:bg-[var(--bg-tertiary)] font-semibold transition-colors"
                          >
                              Back
                          </button>
                      )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">Add a New Child</h2>
                  <div className="w-20 sm:w-24 text-right">
                      <button 
                          type="submit"
                          className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all ${step < totalSteps ? 'text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]' : 'text-[var(--success-text)] bg-[var(--success)] hover:opacity-80'}`}
                      >
                          {step < totalSteps ? 'Next' : isInitialSetup ? 'Finish' : 'Add'}
                      </button>
                  </div>
              </div>
            
              <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                  <div className="max-w-md mx-auto">
                    <div className="mb-4 sm:mb-6">
                      <div className="bg-[var(--bg-tertiary)] rounded-full h-2.5">
                        <div className="bg-[var(--accent-primary)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                      </div>
                    </div>
                    {renderStepContent()}
                  </div>
              </div>
            </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddChildModal;
