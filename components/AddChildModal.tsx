import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Day, Profile, PayDayConfig } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon } from '../constants';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Profile, 'id' | 'theme' | 'hasSeenThemePrompt' | 'showPotentialEarnings'>) => void;
  isInitialSetup?: boolean;
}

const PayDaySettingsEditor = ({ config, onConfigChange, profileName }: { config: PayDayConfig, onConfigChange: (newConfig: PayDayConfig) => void, profileName: string }) => {
    const { mode, day, time } = config;

    const isAnytimeSelected = mode === 'anytime';
    const isPayDaySelected = mode === 'manual' || mode === 'automatic';

    return (
        <div className="space-y-4">
            <div className="text-sm text-[var(--text-secondary)] -mt-2 mb-4">
              <p>When should {profileName || 'your child'} be paid their earnings?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => onConfigChange({ mode: 'manual', day: config.day || Day.Sat })} className={`p-4 rounded-lg border-2 text-left transition-all ${isPayDaySelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                    <h4 className={`font-bold transition-colors ${isPayDaySelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>Set a Pay Day</h4>
                    <p className={`text-xs mt-1 transition-colors ${isPayDaySelected ? 'text-white opacity-90' : 'text-[var(--text-secondary)]'}`}>Designate a specific day for payments.</p>
                </button>
                <button type="button" onClick={() => onConfigChange({ mode: 'anytime' })} className={`p-4 rounded-lg border-2 text-left transition-all ${isAnytimeSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                    <h4 className={`font-bold transition-colors ${isAnytimeSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>Cash Out Anytime</h4>
                    <p className={`text-xs mt-1 transition-colors ${isAnytimeSelected ? 'text-white opacity-90' : 'text-[var(--text-secondary)]'}`}>{profileName || 'They'} can request a cash out on any day at any time.</p>
                </button>
            </div>

            {(mode === 'manual' || mode === 'automatic') && (
                <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)] space-y-4 animate-fade-in-fast">
                    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-full">
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'manual' })} className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all ${mode === 'manual' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Manual</button>
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'automatic', time: config.time || '18:00' })} className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all ${mode === 'automatic' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Automatic</button>
                    </div>
                    {mode === 'manual' && <p className="text-xs text-[var(--text-secondary)] text-center">{profileName} will only see the Cash Out button on this day.</p>}
                    {mode === 'automatic' && <p className="text-xs text-[var(--text-secondary)] text-center">An automatic request for {profileName} to Cash Out will be sent at this time each week.</p>}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Pay Day of the Week</label>
                        <div className="grid grid-cols-7 gap-1">
                            {DAYS_OF_WEEK.map(d => (
                                <button key={d} type="button" onClick={() => onConfigChange({ ...config, day: d })} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${day === d ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg' : 'bg-[var(--bg-secondary)] hover:opacity-80 border border-[var(--border-primary)]'}`}>
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

const AddChildModal: React.FC<AddChildModalProps> = ({ isOpen, onClose, onSave, isInitialSetup = false }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDayConfig, setPayDayConfig] = useState<PayDayConfig>({ mode: 'manual', day: Day.Sat });
  const [error, setError] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setStep(1);
        setName('');
        setImage(null);
        setPayDayConfig({ mode: 'manual', day: Day.Sat });
        setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== 1) return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const checkKeyboard = () => {
        // Heuristic: if viewport height is less than window height by a margin, keyboard is likely open.
        const isVisible = visualViewport.height < window.innerHeight - 150;
        setIsKeyboardVisible(isVisible);
    };

    visualViewport.addEventListener('resize', checkKeyboard);
    checkKeyboard();

    return () => {
        visualViewport.removeEventListener('resize', checkKeyboard);
    };
  }, [isOpen, step]);


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

  const handleNextStep = useCallback(() => {
    setError('');
    if (step === 1 && !name.trim()) {
      setError("Please enter your child's name.");
      return;
    }
    setStep(s => s + 1);
  }, [step, name]);

  const handleSaveChild = useCallback(() => {
    if (!name.trim()) {
      setError("Child's name is required.");
      setStep(1);
      return;
    }
    onSave({ name: name.trim(), image, payDayConfig });
  }, [name, image, payDayConfig, onSave]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const modal = modalRef.current;
      if (!modal) return;
  
      const activeElement = document.activeElement as HTMLElement;
  
      const focusable = Array.from(
        modal.querySelectorAll('input, button')
      ).filter(el => !(el as HTMLElement).hasAttribute('disabled') && (el as HTMLElement).offsetParent !== null) as HTMLElement[];
      
      const currentIndex = focusable.indexOf(activeElement);
      const isLastFocusable = currentIndex === focusable.length - 1;
  
      const primaryButton = focusable.find(
        b => b.textContent?.includes('Next') || b.textContent?.includes('Add Child')
      );
  
      if (activeElement.tagName === 'INPUT' && !isLastFocusable) {
        const nextElement = focusable[currentIndex + 1];
        if (nextElement) {
          nextElement.focus();
          return;
        }
      }
  
      if (primaryButton) {
        primaryButton.click();
      }
    }
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const totalSteps = 2;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
           <div className={`animate-fade-in ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
             <h3 className="text-xl font-bold mb-1">Child's Profile</h3>
             <p className="text-[var(--text-secondary)] mb-6">Let's start with the basics.</p>
             <div className="flex flex-col items-center space-y-4 mb-6">
                {image ? <img src={image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-[var(--border-secondary)] shadow-lg" /> : <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)]" />}
                <label htmlFor="add-child-image-upload" className="cursor-pointer px-4 py-2 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all">Upload Picture</label>
                <input id="add-child-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div>
                <label htmlFor="add-child-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Child's Name</label>
                <input id="add-child-name" type="text" value={name} ref={nameInputRef} autoFocus onChange={e => setName(e.target.value)} placeholder="e.g., Alex" className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"/>
              </div>
           </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-1">Pay Day Settings</h3>
            <PayDaySettingsEditor config={payDayConfig} onConfigChange={setPayDayConfig} profileName={name} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={isInitialSetup ? undefined : onClose}
    >
      <div 
        ref={modalRef}
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Add a New Child</h2>
          <div className="bg-[var(--bg-tertiary)] rounded-full h-2.5">
            <div className="bg-[var(--accent-primary)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
          </div>
        </div>
        
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 text-sm border border-[var(--danger-border)] animate-fade-in">{error}</p>}

        <div className="min-h-[350px] flex flex-col justify-center">
            {renderStep()}
        </div>
        
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-[var(--border-primary)]">
            <div>
              {!(step === 1 && isInitialSetup) && (
                <button 
                    onClick={step === 1 ? onClose : () => setStep(s => s - 1)} 
                    className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors"
                >
                    {step === 1 ? 'Cancel' : 'Back'}
                </button>
              )}
            </div>
            {step < totalSteps ? (
                <button onClick={handleNextStep} className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">Next</button>
            ) : (
                <button onClick={handleSaveChild} className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">Add Child</button>
            )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0px); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }

        /* Transitions for smooth resizing */
        .animate-fade-in > h3,
        .animate-fade-in > p,
        .animate-fade-in .h-24,
        .animate-fade-in .mb-6 {
          transition: all 0.2s ease-out;
        }

        /* Compact styles for when keyboard is visible */
        .keyboard-visible > h3 {
            font-size: 1.25rem; /* 20px */
            margin-bottom: 0.25rem;
        }
        .keyboard-visible > p {
            display: none;
        }
        .keyboard-visible .h-24.w-24 {
            height: 4.5rem; /* 72px */
            width: 4.5rem;
        }
        .keyboard-visible .mb-6 {
            margin-bottom: 1rem;
        }
        .keyboard-visible .space-y-4 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
        }
      `}</style>
    </div>
  );
};

export default AddChildModal;