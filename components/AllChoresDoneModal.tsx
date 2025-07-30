
import React from 'react';

interface AllChoresDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyAmount: number;
}

const AllChoresDoneModal: React.FC<AllChoresDoneModalProps> = ({ isOpen, onClose, dailyAmount }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center transform transition-all text-[var(--text-primary)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={`firework-particle-container firework-particle-container-${i}`}>
              <div className="firework-particle" />
            </div>
          ))}
        </div>
        
        <div className="mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--success)] flex items-center justify-center shadow-lg text-[var(--success-text)]">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Well Done!</h2>
        <p className="text-lg text-[var(--text-secondary)] mb-6">
          You’ve finished all of today’s chores! You have earned <span className="font-bold text-[var(--success)]">${(dailyAmount / 100).toFixed(2)}</span> today.
        </p>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
        >
          Great!
        </button>
      </div>
      <style>
        {`
          @keyframes firework-fly {
              0% {
                  transform: translateY(0) scale(1.5);
                  opacity: 1;
              }
              100% {
                  transform: translateY(-150px) scale(0);
                  opacity: 0;
              }
          }

          .firework-particle-container {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 5px;
              height: 5px;
              transform-origin: 0 0;
          }

          .firework-particle {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              animation: firework-fly 1200ms ease-out forwards;
              animation-delay: ${Math.random() * 0.5}s;
          }

          ${Array.from({ length: 30 }).map((_, i) => {
            const angle = (360 / 30) * i;
            const colors = ['var(--warning)', 'var(--success)', 'var(--accent-primary)', 'var(--danger)', '#a78bfa'];
            const color = colors[i % colors.length];
            return `.firework-particle-container-${i} { transform: rotate(${angle}deg); } .firework-particle-container-${i} .firework-particle { background-color: ${color}; }`;
          }).join(' ')}
        `}
      </style>
    </div>
  );
};

export default AllChoresDoneModal;
