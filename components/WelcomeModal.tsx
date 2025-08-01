import React, { useState } from 'react';
import { Day, Profile, PayDayConfig, PayDayMode } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon } from '../constants';

interface WelcomeModalProps {
  isOpen: boolean;
  onSave: (data: { name: string, image: string | null, payDayConfig: PayDayConfig, passcode: string | null }) => void;
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
                    <h4 className={`font-bold transition-colors ${isAnytimeSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>Cash Out Anytime</h4>
                    <p className={`text-xs mt-1 transition-colors ${isAnytimeSelected ? 'text-white opacity-90' : 'text-[var(--text-secondary)]'}`}>{profileName || 'They'} can request a cash out on any day at any time.</p>
                </button>
                <button type="button" onClick={() => onConfigChange({ mode: 'manual', day: config.day || Day.Sat })} className={`p-4 rounded-lg border-2 text-left transition-all ${isPayDaySelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'}`}>
                    <h4 className={`font-bold transition-colors ${isPayDaySelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>Set a Pay Day</h4>
                    <p className={`text-xs mt-1 transition-colors ${isPayDaySelected ? 'text-white opacity-90' : 'text-[var(--text-secondary)]'}`}>Designate a specific day for payments.</p>
                </button>
            </div>

            {(mode === 'manual' || mode === 'automatic') && (
                <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)] space-y-4 animate-fade-in-fast">
                    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-full">
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'manual' })} className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all ${mode === 'manual' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Manual</button>
                        <button type="button" onClick={() => onConfigChange({ ...config, mode: 'automatic', time: config.time || '18:00' })} className={`w-1/2 py-1.5 text-sm font-semibold rounded-full transition-all ${mode === 'automatic' ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md' : 'text-[var(--text-secondary)]'}`}>Automatic</button>
                    </div>
                    {mode === 'manual' && <p className="text-xs text-[var(--text-secondary)] text-center">{profileName} can only see the Cash Out button and request payment on this selected day.</p>}
                    {mode === 'automatic' && <p className="text-xs text-[var(--text-secondary)] text-center">Have a regular pay day already? No worries! Set it below and a request will be automatically sent each week telling you how much {profileName} has earned!</p>}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Pay Day of the Week</label>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {DAYS_OF_WEEK.map(d => (
                                <button key={d} type="button" onClick={() => onConfigChange({ ...config, day: d })} className={`py-2 rounded-lg font-bold text-sm transition-all ${day === d ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg' : 'bg-[var(--bg-secondary)] hover:opacity-80 border border-[var(--border-primary)]'}`}>
                                    {d.slice(0, 3)}
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

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onSave }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDayConfig, setPayDayConfig] = useState<PayDayConfig>({ mode: 'anytime' });
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (step === 2 && !name.trim()) {
      setError("Please enter your child's name.");
      return;
    }
    setStep(s => s + 1);
  };
  
  const handleFinish = () => {
    setError('');
    if (passcode) {
        if (!/^\d{4}$/.test(passcode)) {
            setError('Passcode must be exactly 4 digits.');
            return;
        }
        if (passcode !== confirmPasscode) {
            setError('Passcodes do not match.');
            return;
        }
    }
    onSave({ name: name.trim(), image, payDayConfig, passcode: passcode || null });
  };
  
  if (!isOpen) return null;
  
  const totalSteps = 4;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 leading-tight">Welcome to<br />Pocket Money Chores.</h2>
            <p className="text-[var(--text-secondary)] mb-8">Let's get everything set up for you. It'll only take a minute.</p>
            <button onClick={handleNextStep} className="w-full px-6 py-3 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">Get Started</button>
          </div>
        );
      case 2:
        return (
           <div className="animate-fade-in">
             <h3 className="text-xl font-bold mb-1">Your Child's Profile</h3>
             <p className="text-[var(--text-secondary)] mb-6">Let's start with the basics.</p>
             <div className="flex flex-col items-center space-y-4 mb-6">
                {image ? <img src={image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-[var(--border-secondary)] shadow-lg" /> : <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)]" />}
                <label htmlFor="welcome-profile-image-upload" className="cursor-pointer px-4 py-2 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all">Upload Picture</label>
                <input id="welcome-profile-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div>
                <label htmlFor="welcome-child-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Child's Name</label>
                <input id="welcome-child-name" type="text" value={name} autoFocus onChange={e => setName(e.target.value)} placeholder="e.g., Alex" className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"/>
              </div>
           </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-1">Pay Day Settings</h3>
            <PayDaySettingsEditor config={payDayConfig} onConfigChange={setPayDayConfig} profileName={name} />
          </div>
        );
      case 4:
          return (
             <div className="animate-fade-in">
                <h3 className="text-xl font-bold mb-1 text-center">Secure Your Account</h3>
                <p className="text-[var(--text-secondary)] mb-6 text-center">Set a passcode to protect parent-only features. This is optional.</p>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="welcome-passcode" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">4-Digit Passcode (Optional)</label>
                        <input id="welcome-passcode" type="password" inputMode="numeric" maxLength={4} value={passcode} onChange={e => setPasscode(e.target.value.replace(/\D/g, ''))} placeholder="••••" className="w-full px-4 py-3 text-center tracking-[1em] text-lg bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                    </div>
                    {passcode && (
                        <div className="animate-fade-in-fast">
                            <label htmlFor="welcome-confirm-passcode" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Confirm Passcode</label>
                            <input id="welcome-confirm-passcode" type="password" inputMode="numeric" maxLength={4} value={confirmPasscode} onChange={e => setConfirmPasscode(e.target.value.replace(/\D/g, ''))} placeholder="••••" className="w-full px-4 py-3 text-center tracking-[1em] text-lg bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                        </div>
                    )}
                </div>
             </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="mb-6"><div className="bg-[var(--bg-tertiary)] rounded-full h-2.5"><div className="bg-[var(--accent-primary)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div></div></div>
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)] text-sm animate-fade-in">{error}</p>}
        <div className="min-h-[320px] flex flex-col justify-center">{renderStep()}</div>
        {step > 1 && (
             <div className="flex justify-between items-center mt-8 pt-4 border-t border-[var(--border-primary)]">
                <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors">Back</button>
                {step < totalSteps ? (
                    <button onClick={handleNextStep} className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">Next</button>
                ) : (
                     <button onClick={handleFinish} className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">Finish Setup</button>
                )}
             </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0px); } }
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default WelcomeModal;