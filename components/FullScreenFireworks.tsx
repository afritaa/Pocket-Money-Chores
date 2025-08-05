import React, { useMemo } from 'react';

const FireworkBurst = ({ style, count = 15, colors }: { style: React.CSSProperties, count?: number, colors: string[] }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      key: i,
      style: {
        transform: `rotate(${(360 / count) * i}deg)`,
      },
      particleStyle: {
        backgroundColor: colors[i % colors.length],
        animationDelay: `${Math.random() * 0.2}s`,
      }
    }));
  }, [count, colors]);

  return (
    <div className="absolute" style={style}>
      {particles.map(p => (
        <div key={p.key} className="firework-particle-container" style={p.style}>
          <div className="firework-particle" style={p.particleStyle} />
        </div>
      ))}
    </div>
  );
};

const FullScreenFireworks = () => {
  const bursts = useMemo(() => {
    const colors = ['#facc15', '#4ade80', '#38bdf8', '#f43f5e', '#a78bfa', '#f472b6'];
    return Array.from({ length: 12 }).map((_, index) => ({
      key: index,
      style: {
        top: `${10 + Math.random() * 80}%`,
        left: `${10 + Math.random() * 80}%`,
        animation: `fade-out 2s ${index * 0.2 + 0.5}s forwards`,
      },
      colors,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      {bursts.map(burst => (
        <FireworkBurst key={burst.key} style={burst.style} colors={burst.colors} />
      ))}
      <style>{`
        @keyframes firework-fly {
          0% { transform: translateY(0) scale(1.2); opacity: 1; }
          100% { transform: translateY(90px) scale(0); opacity: 0; }
        }
        .firework-particle-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 4px;
          transform-origin: 0 0;
        }
        .firework-particle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: firework-fly 1s ease-out forwards;
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FullScreenFireworks;
