import React, { useEffect } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
  isNewUser: boolean;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onGetStarted, isNewUser }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onGetStarted();
        } else if (event.key === 'Escape') {
            if (!isNewUser) {
                event.preventDefault();
                onClose();
            }
        }
    };
    if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onGetStarted, onClose, isNewUser]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!isNewUser) {
        onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      style={{ animation: 'fade-in-fast 0.3s ease-out forwards' }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg">
                <span className="text-4xl text-shadow-sm text-[var(--accent-primary-text)] animate-wave">👋</span>
            </div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Welcome to <span className="whitespace-nowrap">Pocket Money Chores.</span></h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8">
          Easily manage chores while teaching your kids accountability and the value of money in a fun, interactive way.
        </p>
        <button
          onClick={onGetStarted}
          className="w-full px-6 py-3 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
        >
          {isNewUser ? "Let's Add Your First Child" : "Let's Go!"}
        </button>
      </div>
      <style>{`
        @keyframes fade-in-fast { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }
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

export default WelcomeModal;