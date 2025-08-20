import React, { useMemo } from 'react';

const FullScreenConfetti = () => {
  const confettiPieces = useMemo(() => {
    const colors = ['#facc15', '#4ade80', '#38bdf8', '#f43f5e', '#a78bfa', '#f472b6'];
    return Array.from({ length: 150 }).map((_, index) => ({
      key: index,
      style: {
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 8 + 8}px`,
        height: `${Math.random() * 10 + 10}px`,
        backgroundColor: colors[index % colors.length],
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `fall ${4 + Math.random() * 3}s ${Math.random() * 2}s linear forwards`,
      } as React.CSSProperties,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      {confettiPieces.map(({ key, style }) => (
        <div key={key} className="absolute top-[-10%]" style={style} />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(720deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FullScreenConfetti;
