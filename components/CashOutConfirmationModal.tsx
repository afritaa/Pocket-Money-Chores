import React, { useMemo } from 'react';

interface CashOutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const CashOutConfirmationModal: React.FC<CashOutConfirmationModalProps> = ({ isOpen, onClose, amount }) => {
  const confettiPieces = useMemo(() => {
    if (!isOpen) return [];
    const colors = ['var(--warning)', 'var(--success)', 'var(--accent-primary)', 'var(--danger)', '#a78bfa', '#f472b6'];
    return Array.from({ length: 150 }).map((_, index) => ({
      key: index,
      style: {
        left: `${Math.random() * 100}vw`,
        width: `${Math.random() * 6 + 8}px`,
        height: `${Math.random() * 8 + 12}px`,
        backgroundColor: colors[index % colors.length],
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `fall ${3 + Math.random() * 2}s ${Math.random() * 4}s linear forwards`,
      } as React.CSSProperties,
    }));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity overflow-hidden"
      onClick={onClose}
    >
      {/* Confetti particles container */}
      <div className="absolute inset-0 pointer-events-none">
        {confettiPieces.map(({ key, style }) => (
          <div key={key} className="absolute top-[-10vh]" style={style} />
        ))}
      </div>
      
      {/* Modal content, with relative positioning to sit on top of confetti */}
      <div
        className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--warning)] flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-[var(--warning-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
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
          @keyframes fall {
            to {
              transform: translateY(120vh) rotate(720deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default CashOutConfirmationModal;