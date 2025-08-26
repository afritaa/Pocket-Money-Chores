import React, { useEffect, useMemo } from 'react';
import { StarIcon } from '../constants';

interface BonusNotificationButtonProps {
  onClick: () => void;
}

const BonusNotificationButton: React.FC<BonusNotificationButtonProps> = ({ onClick }) => {
  const sparkles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 1 + 0.8}s`,
        animationDelay: `${Math.random() * 1.8}s`,
      }
    }));
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        {sparkles.map(sparkle => (
          <div key={sparkle.id} className="sparkle" style={sparkle.style}>
            <StarIcon className="w-full h-full text-yellow-300" />
          </div>
        ))}
      </div>
      <div className="relative px-4 pb-4 animate-fade-in-fast z-10">
        <button
          onClick={onClick}
          className="w-full bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900 font-bold py-3 px-4 rounded-lg transform transition-all animate-pulse-bonus-button border-2 border-yellow-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <StarIcon className="w-6 h-6" />
          You have a bonus!
        </button>
      </div>
      <style>{`
        @keyframes sparkle-anim {
          0% { transform: scale(0) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0.5; }
        }
        .sparkle {
          position: absolute;
          width: 25px;
          height: 25px;
          animation: sparkle-anim infinite ease-in-out;
          will-change: transform, opacity;
        }

        @keyframes pulse-bonus-button {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 10px 20px rgba(251, 191, 36, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        .animate-pulse-bonus-button {
          animation: pulse-bonus-button 2.5s infinite;
          will-change: transform, box-shadow;
        }
        
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default BonusNotificationButton;