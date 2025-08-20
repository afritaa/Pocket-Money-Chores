import React from 'react';

const SparkleEffect = () => {
  const particles = Array.from({ length: 15 });

  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 flex justify-center items-center">
        {particles.map((_, i) => (
          <div key={i} className={`particle-container particle-container-${i}`}><div className="particle" /></div>
        ))}
      </div>
      <style>{`
        @keyframes firework-fly { 0% { transform: translateY(0) scale(1); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-120px) scale(0); opacity: 0; } }
        .particle-container { position: absolute; width: 6px; height: 6px; transform-origin: 0 0; }
        .particle { width: 100%; height: 100%; border-radius: 50%; animation: firework-fly 1s ease-out forwards; }
        .particle-container-0 { transform: rotate(0deg); } .particle-container-0 .particle { background-color: var(--accent-primary); }
        .particle-container-1 { transform: rotate(24deg); } .particle-container-1 .particle { background-color: var(--success); }
        .particle-container-2 { transform: rotate(48deg); } .particle-container-2 .particle { background-color: var(--accent-secondary); }
        .particle-container-3 { transform: rotate(72deg); } .particle-container-3 .particle { background-color: var(--accent-primary); }
        .particle-container-4 { transform: rotate(96deg); } .particle-container-4 .particle { background-color: var(--success); }
        .particle-container-5 { transform: rotate(120deg); } .particle-container-5 .particle { background-color: var(--accent-secondary); }
        .particle-container-6 { transform: rotate(144deg); } .particle-container-6 .particle { background-color: var(--accent-primary); }
        .particle-container-7 { transform: rotate(168deg); } .particle-container-7 .particle { background-color: var(--success); }
        .particle-container-8 { transform: rotate(192deg); } .particle-container-8 .particle { background-color: var(--accent-secondary); }
        .particle-container-9 { transform: rotate(216deg); } .particle-container-9 .particle { background-color: var(--accent-primary); }
        .particle-container-10 { transform: rotate(240deg); } .particle-container-10 .particle { background-color: var(--success); }
        .particle-container-11 { transform: rotate(264deg); } .particle-container-11 .particle { background-color: var(--accent-secondary); }
        .particle-container-12 { transform: rotate(288deg); } .particle-container-12 .particle { background-color: var(--accent-primary); }
        .particle-container-13 { transform: rotate(312deg); } .particle-container-13 .particle { background-color: var(--success); }
        .particle-container-14 { transform: rotate(336deg); } .particle-container-14 .particle { background-color: var(--accent-secondary); }
      `}</style>
    </>
  );
};

export default SparkleEffect;
