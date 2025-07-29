import React from 'react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: string) => void;
  currentTheme: string;
}

const themes = [
  { id: 'light', name: 'Light', colors: { bg: '#f1f5f9', card: '#ffffff', accent: '#3b82f6', text: '#1e293b' } },
  { id: 'dark', name: 'Dark', colors: { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc' } },
  { id: 'neon', name: 'Neon Glow', colors: { bg: '#0d0221', card: '#261447', accent: '#ff00ff', text: '#f0f8ff' } },
  { id: 'princess', name: 'Princess Pink', colors: { bg: 'linear-gradient(135deg, #fce4ec, #f3e5f5)', card: '#fff', accent: '#ff4081', text: '#4a148c' } },
  { id: 'ocean', name: 'Ocean Blue', colors: { bg: 'linear-gradient(to bottom, #ade8f4, #90e0ef)', card: 'rgba(255, 255, 255, 0.8)', accent: '#00b4d8', text: '#005f73' } },
];

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, onSave, currentTheme }) => {
  if (!isOpen) return null;

  const handleSelectTheme = (themeId: string) => {
    onSave(themeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-2xl transform transition-all text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {themes.map(theme => (
            <div key={theme.id} className="text-center">
              <button
                onClick={() => handleSelectTheme(theme.id)}
                className={`w-full h-32 rounded-lg border-4 transition-all duration-300 ${currentTheme === theme.id ? 'border-[var(--accent-primary)]' : 'border-transparent hover:border-[var(--text-secondary)]'}`}
                style={{ background: theme.colors.bg }}
                aria-label={`Select ${theme.name} theme`}
              >
                <div className="w-full h-full p-4 flex flex-col justify-between items-start">
                  <div className="w-full h-5 rounded" style={{ backgroundColor: theme.colors.card }}></div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-5 rounded" style={{ backgroundColor: theme.colors.accent }}></div>
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                  </div>
                  <div className="w-4/5 h-3 rounded" style={{ backgroundColor: theme.colors.text, opacity: 0.7 }}></div>
                </div>
              </button>
              <p className="mt-2 font-semibold text-sm text-[var(--text-secondary)]">{theme.name}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-8">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 font-semibold transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
