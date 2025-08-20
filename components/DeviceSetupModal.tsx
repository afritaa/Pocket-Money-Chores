
import React, { useState } from 'react';

interface DeviceSetupModalProps {
  hasProfiles: boolean;
  onSetParentDevice: () => void;
  onSetChildDevice: () => void;
  onAddFirstChild: () => void;
}

type Step = 'welcome' | 'child_needs_parent';

const DeviceSetupModal: React.FC<DeviceSetupModalProps> = ({ hasProfiles, onSetParentDevice, onSetChildDevice, onAddFirstChild }) => {
  const [step, setStep] = useState<Step>('welcome');

  const handleSelectParent = () => {
    onSetParentDevice();
    onAddFirstChild();
  };

  const handleSelectChild = () => {
    if (hasProfiles) {
      onSetChildDevice();
    } else {
      setStep('child_needs_parent');
    }
  };

  const handleBack = () => {
    setStep('welcome');
  };
  
  const cardClasses = "bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-8 md:p-12 text-center text-[var(--text-primary)] max-w-2xl w-full shadow-2xl";

  if (step === 'child_needs_parent') {
    return (
      <div className={`${cardClasses} animate-fade-in-fast`}>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Whoops!</h2>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10">
          A grown-up needs to set up the app first before a child can use it.
        </p>
        <button
          onClick={handleBack}
          className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] border border-[var(--border-secondary)] transition-all font-bold text-lg py-4 px-10 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`${cardClasses} animate-fade-in-fast`}>
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg">
            <span className="text-4xl text-shadow-sm text-[var(--accent-primary-text)] animate-wave">👋</span>
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to <span className="whitespace-nowrap">Pocket Money Chores.</span></h2>
      <p className="text-base md:text-lg text-[var(--text-secondary)] mb-8 max-w-prose mx-auto">
        Easily manage chores while teaching your kids accountability and the value of money in a fun, interactive way.
      </p>
      <p className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-8">
        Before we get started, are you...
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <button
          onClick={handleSelectParent}
          className="py-3 px-8 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:bg-[var(--accent-secondary)] transition-all group w-full sm:w-auto"
        >
          <h3 className="text-2xl font-bold">A Parent</h3>
        </button>
        <button
          onClick={handleSelectChild}
          className="py-3 px-8 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:bg-[var(--accent-secondary)] transition-all group w-full sm:w-auto"
        >
          <h3 className="text-2xl font-bold">A Child</h3>
        </button>
      </div>
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-fast { animation: fade-in-fast 0.4s ease-out forwards; }
        @keyframes wave {
            0% { transform: rotate( 0.0deg) }
            10% { transform: rotate(14.0deg) }
            20% { transform: rotate(-8.0deg) }
            30% { transform: rotate(14.0deg) }
            40% { transform: rotate(-4.0deg) }
            50% { transform: rotate(10.0deg) }
            60% { transform: rotate( 0.0deg) }
            100% { transform: rotate( 0.0deg) }
        }
        .animate-wave {
            animation-name: wave;
            animation-duration: 2.5s;
            animation-iteration-count: infinite;
            transform-origin: 70% 70%;
            display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default DeviceSetupModal;