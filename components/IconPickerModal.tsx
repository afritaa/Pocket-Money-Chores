


import React, { useState, useRef } from 'react';
import { XIcon, ImageIcon, EMOJI_LIST, compressImage, SmileyIcon } from '../constants';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string | null) => void;
  currentIcon: string | null;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelectIcon, currentIcon }) => {
  const [customEmoji, setCustomEmoji] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (icon: string) => {
    onSelectIcon(icon);
    onClose();
  };
  
  const handleCustomEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // This regex is a simplified version and might not catch all edge cases, but is good for most.
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const emojis = value.match(emojiRegex);
    const lastEmoji = emojis ? emojis[emojis.length - 1] : '';
    setCustomEmoji(lastEmoji);
    if(lastEmoji) {
        handleSelect(lastEmoji);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedDataUrl = await compressImage(file, { maxWidth: 256, maxHeight: 256 });
        handleSelect(compressedDataUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during image processing.';
        alert(message);
      } finally {
        // Reset input to allow re-uploading the same file
        if (e.target) e.target.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-55 flex items-center justify-center p-4" onClick={onClose}>
          <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 8px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
          `}</style>
          <div
            className="bg-[var(--card-bg)] rounded-3xl shadow-xl w-full max-w-xl flex flex-col animate-slide-down-card max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
              <div className="flex-shrink-0 flex items-center justify-between p-4 h-16">
                  <div className="flex items-center gap-4">
                      <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          <XIcon className="h-7 w-7" />
                      </button>
                      <h2 className="text-2xl font-bold">Select an Icon</h2>
                  </div>
              </div>
              
              <div className="flex-grow flex flex-col p-4 space-y-4 min-h-0">
                  <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                  />
                   <input
                        id="custom-emoji-input"
                        ref={emojiInputRef}
                        type="text"
                        value={customEmoji}
                        onChange={handleCustomEmojiChange}
                        className="absolute -left-full"
                        aria-label="Paste emoji here after clicking the button"
                    />
                  <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full h-20 flex items-center justify-center gap-3 bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded-xl transition-all"
                    >
                        <ImageIcon className="h-8 w-8"/>
                        <span className="font-semibold">Upload Image</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => emojiInputRef.current?.focus()}
                        className="w-full h-20 flex items-center justify-center gap-3 bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded-xl transition-all"
                    >
                        <SmileyIcon className="h-8 w-8"/>
                        <span className="font-semibold">Paste Emoji</span>
                    </button>
                  </div>

                  <div className="flex-grow flex flex-col min-h-0">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Or choose one from the list</label>
                      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
                            {EMOJI_LIST.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleSelect(emoji)}
                                    className={`w-full aspect-square text-xl flex items-center justify-center rounded-lg transition-all ${currentIcon === emoji ? 'bg-[var(--accent-primary)] text-white ring-2 ring-offset-2 ring-[var(--accent-primary)] ring-offset-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)]'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default IconPickerModal;