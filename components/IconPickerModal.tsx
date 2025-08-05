import React, { useState, useRef } from 'react';
import { XIcon, ImageIcon, EMOJI_LIST } from '../constants';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string | null) => void;
  currentIcon: string | null;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelectIcon, currentIcon }) => {
  const [customEmoji, setCustomEmoji] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            alert('Could not process image.');
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to JPEG
          handleSelect(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-secondary)] z-[60] animate-slide-up-full"
    >
        <style>{`
            @keyframes slide-up-full { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up-full { animation: slide-up-full 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.4); }
        `}</style>
        <div className="h-full w-full max-w-3xl mx-auto flex flex-col">
            <div className="flex-shrink-0 flex items-center justify-between p-4 h-20">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <XIcon className="h-7 w-7" />
                    </button>
                    <h2 className="text-2xl font-bold">Select an Icon</h2>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-6">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                />
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded-xl transition-all"
                >
                    <ImageIcon className="h-6 w-6"/>
                    <span className="font-semibold">Upload an Image from your Device</span>
                </button>
                
                <div>
                    <label htmlFor="custom-emoji-input" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Or paste an emoji</label>
                    <input
                        id="custom-emoji-input"
                        type="text"
                        value={customEmoji}
                        onChange={handleCustomEmojiChange}
                        placeholder="Paste emoji here..."
                        className="w-full h-14 px-4 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] text-center text-3xl"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Or choose one from the list</label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {EMOJI_LIST.map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => handleSelect(emoji)}
                                className={`w-full aspect-square text-3xl flex items-center justify-center rounded-lg transition-all ${currentIcon === emoji ? 'bg-[var(--accent-primary)] text-white ring-2 ring-offset-2 ring-[var(--accent-primary)] ring-offset-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)]'}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default IconPickerModal;