


import React from 'react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: string) => void;
  currentTheme: string;
  isFirstTime?: boolean;
}

const themes = [
  { id: 'light', name: 'Light', colors: { bg: '#f1f5f9', card: '#ffffff', accent: '#3b82f6', text: '#1e293b' } },
  { id: 'dark', name: 'Dark', colors: { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc' } },
  { id: 'action', name: 'Action Sports', colors: { bg: '#f8f9fa', card: '#ffffff', accent: '#00C9A7', text: '#212529' } },
  { id: 'dark-blue', name: 'Cobalt Blue', colors: { bg: 'linear-gradient(135deg, #0052D4, #4364F7, #6FB1FC)', card: '#3b59de', accent: '#f7b733', text: '#ffffff' } },
  { id: 'ocean', name: 'Ocean Blue', colors: { bg: 'linear-gradient(to bottom, #e0f7fa, #ade8f4)', card: 'rgba(255, 255, 255, 0.8)', accent: '#00b4d8', text: '#005f73' } },
  { id: 'beach', name: 'Beach', colors: { bg: 'linear-gradient(to bottom, #fefae0, #e0f7fa)', card: '#ffffff', accent: '#fb8500', text: '#023047' } },
  { id: 'princess', name: 'Princess Pink', colors: { bg: 'linear-gradient(135deg, #fce4ec, #f8eaf2)', card: '#fff', accent: '#ff4081', text: '#4a148c' } },
  { id: 'lions', name: 'Brisbane Lions', colors: { bg: 'linear-gradient(135deg, #6A0032, #A30D45)', card: '#8E2A50', accent: '#00A2E8', text: '#FFD700' } },
];

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, onSave, currentTheme, isFirstTime }) => {
  if (!isOpen) return null;

  const handleSelectTheme = (themeId: string) => {
    onSave(themeId);
    // Don't close immediately if it's the first time, let them admire their choice
    if (!isFirstTime) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-2xl transform transition-all text-[var(--text-primary)] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2 text-center">
          {isFirstTime ? 'Select Your Theme!' : 'Choose a Theme'}
        </h2>
        {isFirstTime && (
            <p className="text-center text-[var(--text-secondary)] mb-6 text-sm sm:text-base">
                Make the app your own! You can change it anytime from the Menu button.
            </p>
        )}
        
        <div className="flex-grow overflow-y-auto custom-scrollbar -mr-3 pr-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {themes.map(theme => (
                <div key={theme.id} className="text-center">
                  <button
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`w-full h-28 rounded-lg border-4 transition-all duration-300 ${currentTheme === theme.id ? 'border-[var(--accent-primary)] ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-primary)]' : 'border-transparent hover:border-[var(--text-secondary)]'}`}
                    style={{ background: theme.colors.bg }}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <div className="w-full h-full p-2 flex flex-col justify-between items-start">
                      <div className="w-full h-3 rounded" style={{ backgroundColor: theme.colors.card }}></div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 rounded" style={{ backgroundColor: theme.colors.accent }}></div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                      </div>
                      <div className="w-4/5 h-2 rounded" style={{ backgroundColor: theme.colors.text, opacity: 0.7 }}></div>
                    </div>
                  </button>
                  <p className="mt-2 font-semibold text-xs sm:text-sm text-[var(--text-secondary)]">{theme.name}</p>
                </div>
              ))}
            </div>
        </div>
        
        <div className="flex justify-end mt-8 pt-4 border-t border-[var(--border-primary)]">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all">
            {isFirstTime ? 'Done!' : 'Close'}
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ThemeModal;