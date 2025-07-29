
import React, { useState } from 'react';
import { Day } from '../types';
import { DAYS_OF_WEEK, UserCircleIcon, KeyIcon } from '../constants';

interface WelcomeModalProps {
  isOpen: boolean;
  onSave: (data: { name: string, image: string | null, payDay: Day | null, passcode: string | null }) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onSave }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [payDay, setPayDay] = useState<Day | null>(Day.Sat); // Default to Saturday
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');

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
    onSave({ name: name.trim(), image, payDay, passcode: passcode || null });
  };
  
  if (!isOpen) return null;
  
  const totalSteps = 4;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Welcome to<br />Pocket Money Chores!
            </h2>
            <p className="text-[var(--text-secondary)] mb-8">Let's get everything set up for you. It'll only take a minute.</p>
            <button onClick={handleNextStep} className="w-full px-6 py-3 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
              Get Started
            </button>
          </div>
        );
      case 2:
        return (
           <div className="animate-fade-in">
             <h3 className="text-xl font-bold mb-1">Kid's Profile</h3>
             <p className="text-[var(--text-secondary)] mb-6">Let's start with the basics.</p>
             <div className="flex flex-col items-center space-y-4 mb-6">
                {image ? (
                  <img src={image} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-[var(--border-secondary)] shadow-lg" />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-[var(--text-tertiary)]" />
                )}
                <label htmlFor="welcome-profile-image-upload" className="cursor-pointer px-4 py-2 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold border border-[var(--border-secondary)] transition-all">
                  Upload Picture
                </label>
                <input id="welcome-profile-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div>
                <label htmlFor="welcome-child-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Child's Name</label>
                <input
                  id="welcome-child-name"
                  type="text"
                  value={name}
                  autoFocus
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Alex"
                  className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>
           </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-1">Set a Pay Day</h3>
            <p className="text-[var(--text-secondary)] mb-6">Choose a day to cash out weekly earnings. You can change this later.</p>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button key={day} type="button" onClick={() => setPayDay(day)} className={`py-2 rounded-lg font-bold transition-all duration-300 ${payDay === day ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg' : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'}`}>
                  {day.slice(0, 3)}
                </button>
              ))}
               <button type="button" onClick={() => setPayDay(null)} className={`py-2 rounded-lg font-bold transition-all duration-300 col-span-4 sm:col-span-1 ${payDay === null ? 'bg-[var(--bg-tertiary)] opacity-60 text-[var(--text-secondary)] shadow-lg' : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'}`}>
                  None
                </button>
            </div>
          </div>
        );
      case 4:
          return (
             <div className="animate-fade-in">
                <div className="text-center mb-4">
                   <KeyIcon className="h-10 w-10 text-[var(--accent-primary)] inline-block" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-center">Set Up Parent Mode</h3>
                <p className="text-[var(--text-secondary)] mb-6 text-center">Create a 4-digit passcode to protect parent-only features. You can skip this for now.</p>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="welcome-passcode" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">4-Digit Passcode (Optional)</label>
                        <input id="welcome-passcode" type="password" inputMode="numeric" maxLength={4} value={passcode} onChange={e => setPasscode(e.target.value.replace(/\D/g, ''))} placeholder="••••" className="w-full px-4 py-3 text-center tracking-[1em] text-lg bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"/>
                    </div>
                    {passcode && (
                        <div className="animate-fade-in">
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
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-6">
            <div className="bg-[var(--bg-tertiary)] rounded-full h-2.5">
                <div className="bg-[var(--accent-primary)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
            </div>
        </div>

        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)] text-sm animate-fade-in">{error}</p>}

        <div className="min-h-[320px] flex flex-col justify-center">
            {renderStep()}
        </div>

        {step > 1 && (
             <div className="flex justify-between items-center mt-8 pt-4 border-t border-[var(--border-primary)]">
                <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors">
                    Back
                </button>
                {step < totalSteps ? (
                    <button onClick={handleNextStep} className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
                        Next
                    </button>
                ) : (
                     <button onClick={handleFinish} className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
                        Finish Setup
                    </button>
                )}
             </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0px); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default WelcomeModal;
