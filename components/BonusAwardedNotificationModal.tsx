

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { BonusNotification } from '../types';

interface BonusAwardedNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonus: BonusNotification;
  onAcknowledge: (bonus: BonusNotification) => void;
}

const BonusAwardedNotificationModal: React.FC<BonusAwardedNotificationModalProps> = ({ isOpen, onClose, bonus, onAcknowledge }) => {
  const { amount, note } = bonus;
  
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [buttonText, setButtonText] = useState("Yesss!!!!");

  useEffect(() => {
    if (isOpen) {
      setIsButtonVisible(false); // Reset on open
      const texts = ["Yesss!!!!", "Woohoo!", "Cha-Ching!!", "Excellent!! 🎸"];
      setButtonText(texts[Math.floor(Math.random() * texts.length)]);
      
      const timer = setTimeout(() => {
        setIsButtonVisible(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    onAcknowledge(bonus);
    onClose();
  }, [bonus, onAcknowledge, onClose]);

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
              event.preventDefault();
              if (isButtonVisible) {
                handleConfirm();
              }
          }
      };
      if (isOpen) {
          document.addEventListener('keydown', handleKeyDown);
      }
      return () => {
          document.removeEventListener('keydown', handleKeyDown);
      };
  }, [isOpen, isButtonVisible, handleConfirm]);

  const coinParticles = useMemo(() => {
    if (!isOpen) return [];
    return Array.from({ length: 100 }).map((_, index) => ({
      key: index,
      style: {
        left: `${Math.random() * 100}vw`,
        animation: `fall ${3 + Math.random() * 4}s ${Math.random() * 5}s linear forwards`,
      } as React.CSSProperties,
    }));
  }, [isOpen]);

  const message = useMemo(() => {
    const formattedAmount = `$${(amount / 100).toFixed(2)}`;
    if (note?.trim()) {
      let processedNote = note.trim();
      
      if (processedNote.toLowerCase().startsWith('for ')) {
        processedNote = processedNote.substring(4).trim();
      }
      
      if (processedNote) {
          processedNote = processedNote.charAt(0).toLowerCase() + processedNote.slice(1);
          const noteText = `for ${processedNote}`;

          return (
            <>
              You've earned an extra <span className="font-bold text-white">{formattedAmount}</span> {noteText}. Keep up the good work!
            </>
          );
      }
    }
    return `You've earned an extra ${formattedAmount}!`;
  }, [amount, note]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[100] transition-opacity overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        {coinParticles.map(({ key, style }) => (
          <div key={key} className="coin-particle" style={style}>
            <div className="coin-inner" />
          </div>
        ))}
      </div>
      
      <div
        className="relative bg-gradient-to-br from-yellow-400 to-amber-500 border-4 border-yellow-300 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center transform transition-all text-yellow-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
            <div className="relative w-20 h-20 mx-auto">
                <span className="dollar-sign style-1">$</span>
                <span className="dollar-sign style-2">$</span>
                <span className="dollar-sign style-3">$</span>
            </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">You've been awarded a bonus!</h2>
        <p className="text-lg text-white/90 mb-8 drop-shadow-md min-h-[72px]">
          {message}
        </p>
        <div className="h-[62px]">
            {isButtonVisible && (
              <button
                onClick={handleConfirm}
                className="w-full px-6 py-3 rounded-lg text-amber-800 bg-yellow-300 hover:bg-yellow-200 font-extrabold text-xl tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all border-2 border-yellow-200 animate-fade-in"
              >
                {buttonText}
              </button>
            )}
        </div>
      </div>
      <style>
        {`
          @keyframes fall {
            from { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            to { transform: translateY(120vh) rotate(720deg); opacity: 0; }
          }
          .coin-particle {
            position: absolute;
            top: -10vh;
            width: 30px;
            height: 30px;
            pointer-events: none;
          }
          .coin-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #ffd700;
            border: 3px solid #e6a23c;
            box-shadow: inset 0 -3px 0 rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.2);
            position: relative;
          }
          .coin-inner::before {
            content: '$';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 14px;
            font-weight: bold;
            color: #b36b00;
            text-shadow: 1px 1px 0 rgba(255,255,255,0.4);
          }

          @keyframes float-up {
            0% { transform: translateY(10px) scale(0.8); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
          }
          .dollar-sign {
            position: absolute;
            font-size: 2.5rem;
            font-weight: bold;
            color: white;
            opacity: 0;
            animation: float-up 2.5s ease-out infinite;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .dollar-sign.style-1 { left: 50%; top: 50%; transform: translate(-50%, -50%); animation-delay: 0s; font-size: 3rem; }
          .dollar-sign.style-2 { left: 20%; top: 40%; animation-delay: 0.6s; }
          .dollar-sign.style-3 { left: 80%; top: 60%; transform: translateX(-80%); animation-delay: 1.2s; }
          
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}
      </style>
    </div>
  );
};

export default BonusAwardedNotificationModal;