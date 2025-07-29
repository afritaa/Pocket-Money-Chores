import React from 'react';

interface CashOutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const CashOutConfirmationModal: React.FC<CashOutConfirmationModalProps> = ({ isOpen, onClose, amount }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--warning)] flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-[var(--warning-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </div>
             <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={`cash-out-particle-container cash-out-particle-container-${i}`}>
                  <div className="cash-out-particle" />
                </div>
              ))}
            </div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Well Done!</h2>
        <p className="text-lg text-[var(--text-secondary)] mb-6">
          You've cashed out <span className="font-bold text-[var(--success)]">${amount.toFixed(2)}</span>!
        </p>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">
            Your earnings are now waiting for approval.
        </p>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
        >
          Okay
        </button>
      </div>
      <style>
        {`
          @keyframes cash-out-firework-fly {
              0% {
                  transform: translateY(0) scale(1.5);
                  opacity: 1;
              }
              100% {
                  transform: translateY(-150px) scale(0);
                  opacity: 0;
              }
          }

          .cash-out-particle-container {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 5px;
              height: 5px;
              transform-origin: 0 0;
          }

          .cash-out-particle {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              animation: cash-out-firework-fly 1200ms ease-out forwards;
          }

          /* Define particle colors and rotation */
          ${Array.from({ length: 30 }).map((_, i) => {
            const angle = (360 / 30) * i;
            const colors = ['var(--warning)', 'var(--success)', 'var(--accent-primary)', 'var(--danger)'];
            const color = colors[i % colors.length];
            return `.cash-out-particle-container-${i} { transform: rotate(${angle}deg); } .cash-out-particle-container-${i} .cash-out-particle { background-color: ${color}; }`;
          }).join(' ')}
        `}
      </style>
    </div>
  );
};

export default CashOutConfirmationModal;