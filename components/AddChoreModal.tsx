

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Day, Chore, ChoreCategory } from '../types';
import { DAYS_OF_WEEK, DAY_SHORT_NAMES, CHORE_CATEGORIES, CoinIcon } from '../constants';

interface ChoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreData: Omit<Chore, 'id' | 'completions' | 'order'>) => void;
  initialData: Chore | null;
}

const EMOJI_WITH_KEYWORDS: { emoji: string; keywords: string[] }[] = [
    // Existing with enhancements
    { emoji: '🧹', keywords: ['sweep', 'clean', 'broom', 'floor', 'dustpan'] },
    { emoji: '🧼', keywords: ['soap', 'wash', 'clean', 'dishes', 'hands', 'scrub', 'car', 'windows'] },
    { emoji: '🛏️', keywords: ['bed', 'make bed', 'bedroom', 'tidy', 'room', 'sheets', 'pillow'] },
    { emoji: '🗑️', keywords: ['trash', 'garbage', 'bin', 'waste', 'empty', 'recycling', 'take out'] },
    { emoji: '🍽️', keywords: ['dishes', 'plate', 'cutlery', 'kitchen', 'wash', 'table', 'silverware', 'dishwasher', 'load', 'unload'] },
    { emoji: '🧺', keywords: ['laundry', 'basket', 'clothes', 'wash', 'fold', 'hang', 'put away'] },
    { emoji: '🐾', keywords: ['pet', 'dog', 'cat', 'feed', 'walk', 'animal', 'care', 'poop'] },
    { emoji: '🌱', keywords: ['plant', 'water', 'garden', 'yard', 'weed', 'flower'] },
    { emoji: '📚', keywords: ['book', 'read', 'study', 'homework', 'school', 'library'] },
    { emoji: '🧸', keywords: ['toy', 'tidy', 'clean up', 'playroom', 'room', 'organize', 'put away'] },
    { emoji: '✨', keywords: ['sparkle', 'clean', 'tidy', 'dust', 'polish', 'shiny'] },
    { emoji: '💪', keywords: ['strong', 'exercise', 'help', 'carry', 'lift', 'chores'] },
    { emoji: '✅', keywords: ['done', 'check', 'task', 'complete', 'finish', 'todo'] },
    { emoji: '⭐', keywords: ['star', 'good', 'reward', 'special', 'excellent', 'job'] },
    { emoji: '❤️', keywords: ['love', 'help', 'kind', 'family', 'share', 'care'] },
    { emoji: '🐶', keywords: ['dog', 'pet', 'walk', 'feed', 'puppy', 'play'] },
    { emoji: '🐱', keywords: ['cat', 'pet', 'feed', 'kitten', 'litter'] },
    { emoji: '🤖', keywords: ['robot', 'tidy', 'future', 'automate'] },
    { emoji: '🚀', keywords: ['rocket', 'room', 'space', 'explore', 'fast'] },
    { emoji: '⚽️', keywords: ['ball', 'play', 'outside', 'sports', 'soccer'] },
    { emoji: '🚲', keywords: ['bike', 'bicycle', 'ride', 'put away', 'helmet'] },
    { emoji: '🎻', keywords: ['violin', 'music', 'practice', 'instrument', 'strings'] },
    { emoji: '🎨', keywords: ['art', 'paint', 'draw', 'create', 'craft', 'easel'] },
    { emoji: '📖', keywords: ['book', 'read', 'homework', 'story', 'library'] },
    { emoji: '🍴', keywords: ['set table', 'fork', 'knife', 'table', 'eat', 'dinner', 'silverware'] },
    { emoji: '🧽', keywords: ['sponge', 'clean', 'scrub', 'wash', 'counter', 'wipe'] },
    { emoji: '👕', keywords: ['clothes', 'laundry', 'fold', 'put away', 'shirt', 'dress'] },
    { emoji: '🧑‍🌾', keywords: ['garden', 'yard', 'weed', 'plant', 'rake', 'farm'] },
    { emoji: '🚗', keywords: ['car', 'wash', 'clean', 'vehicle', 'vacuum'] },
    { emoji: '👟', keywords: ['shoes', 'tidy', 'put away', 'sneakers', 'boots'] },

    // New additions
    // Household
    { emoji: '🚽', keywords: ['toilet', 'clean', 'bathroom', 'potty'] },
    { emoji: '🚿', keywords: ['shower', 'clean', 'bath', 'wash', 'bathroom'] },
    { emoji: '🛁', keywords: ['bathtub', 'clean', 'bath', 'wash', 'bathroom'] },
    { emoji: '🪟', keywords: ['window', 'clean', 'glass', 'windex'] },
    { emoji: '🚪', keywords: ['door', 'close', 'open', 'handle'] },
    { emoji: '📦', keywords: ['box', 'tidy', 'organize', 'pack', 'unpack', 'storage'] },
    { emoji: '🧻', keywords: ['toilet paper', 'roll', 'restock', 'bathroom'] },
    { emoji: '🪣', keywords: ['bucket', 'mop', 'water', 'clean', 'floor'] },
    { emoji: '🔨', keywords: ['hammer', 'fix', 'build', 'repair', 'tool'] },
    { emoji: '💡', keywords: ['light', 'bulb', 'lamp', 'turn off', 'energy'] },

    // Yard / Garden
    { emoji: '🌳', keywords: ['tree', 'yard', 'garden', 'plant'] },
    { emoji: '🍂', keywords: ['leaf', 'rake', 'yard', 'autumn', 'fall'] },
    { emoji: '💐', keywords: ['flowers', 'garden', 'plant', 'bouquet'] },
    { emoji: '💧', keywords: ['water', 'drop', 'plants', 'hydrate'] },
    { emoji: '🌿', keywords: ['herb', 'leaf', 'plant', 'garden'] },

    // Pet Care
    { emoji: '🦴', keywords: ['bone', 'dog', 'pet', 'treat'] },
    { emoji: '🐠', keywords: ['fish', 'feed', 'tank', 'pet', 'aquarium'] },
    { emoji: '🐇', keywords: ['rabbit', 'bunny', 'pet', 'feed', 'cage'] },
    { emoji: '💩', keywords: ['poop', 'scoop', 'dog', 'cat', 'pet', 'clean', 'yard'] },

    // Personal Care & Food
    { emoji: '💊', keywords: ['pill', 'medicine', 'vitamins', 'take', 'health'] },
    { emoji: '🪥', keywords: ['toothbrush', 'teeth', 'brush', 'dental', 'hygiene'] },
    { emoji: '🍎', keywords: ['apple', 'eat', 'fruit', 'healthy', 'snack'] },
    { emoji: '🥕', keywords: ['carrot', 'vegetable', 'eat', 'healthy', 'snack'] },
    { emoji: '🥦', keywords: ['broccoli', 'vegetable', 'eat', 'healthy', 'dinner'] },
    { emoji: '🥛', keywords: ['milk', 'drink', 'glass', 'cup', 'breakfast'] },
    { emoji: '🍕', keywords: ['pizza', 'food', 'eat', 'dinner', 'snack'] },
    { emoji: '🍔', keywords: ['burger', 'hamburger', 'food', 'eat', 'dinner'] },
    { emoji: '🍿', keywords: ['popcorn', 'movie', 'snack', 'food'] },
    { emoji: '🍦', keywords: ['ice cream', 'dessert', 'snack', 'food', 'sweet'] },
    { emoji: '😴', keywords: ['sleep', 'bed', 'nap', 'bedtime', 'rest'] },
    { emoji: '🧦', keywords: ['socks', 'laundry', 'put away', 'feet'] },

    // School / Learning
    { emoji: '🏫', keywords: ['school', 'building', 'learn', 'education'] },
    { emoji: '🎓', keywords: ['graduation', 'cap', 'school', 'learn', 'degree'] },
    { emoji: '🔬', keywords: ['microscope', 'science', 'school', 'study', 'lab'] },
    { emoji: '📏', keywords: ['ruler', 'measure', 'math', 'school', 'draw'] },
    { emoji: '✏️', keywords: ['pencil', 'write', 'homework', 'draw', 'study'] },
    { emoji: '🎒', keywords: ['backpack', 'school', 'bag', 'pack'] },
    { emoji: '💻', keywords: ['computer', 'study', 'code', 'learn', 'screen time'] },
    { emoji: '🧠', keywords: ['brain', 'learn', 'think', 'smart', 'study'] },

    // Sports & Instruments
    { emoji: '🏀', keywords: ['basketball', 'sports', 'play', 'ball'] },
    { emoji: '🏈', keywords: ['football', 'sports', 'play', 'ball'] },
    { emoji: '⚾️', keywords: ['baseball', 'sports', 'play', 'ball'] },
    { emoji: '🎾', keywords: ['tennis', 'sports', 'play', 'ball', 'racket'] },
    { emoji: '🏊', keywords: ['swim', 'pool', 'water', 'sports', 'lesson'] },
    { emoji: '🏊‍♀️', keywords: ['swim', 'pool', 'water', 'sports', 'lesson', 'woman'] },
    { emoji: '🏐', keywords: ['volleyball', 'sports', 'play', 'ball', 'team'] },
    { emoji: '🏒', keywords: ['hockey', 'ice', 'sports', 'puck', 'stick'] },
    { emoji: '🥊', keywords: ['boxing', 'glove', 'sports', 'fight', 'punch'] },
    { emoji: '🎹', keywords: ['piano', 'music', 'practice', 'instrument', 'keys'] },
    { emoji: '🎸', keywords: ['guitar', 'music', 'practice', 'instrument', 'strings', 'play'] },
    { emoji: '🎺', keywords: ['trumpet', 'music', 'practice', 'instrument', 'brass', 'play'] },
    { emoji: '🥁', keywords: ['drum', 'music', 'practice', 'instrument', 'percussion', 'play'] },
    { emoji: '🎷', keywords: ['saxophone', 'music', 'practice', 'instrument', 'brass', 'play'] },
    
    // General
    { emoji: '👍', keywords: ['thumbs up', 'good job', 'great', 'awesome'] },
    { emoji: '💯', keywords: ['hundred', 'perfect', 'a+', 'great', 'score'] },
    { emoji: '💰', keywords: ['money', 'earn', 'save', 'piggy bank', 'allowance'] },
    { emoji: '🎁', keywords: ['gift', 'present', 'reward', 'surprise', 'birthday'] },
    { emoji: '🎉', keywords: ['party', 'celebrate', 'tada', 'hooray', 'congratulations'] },
    { emoji: '😊', keywords: ['smile', 'happy', 'good', 'kind'] },
    { emoji: '🤗', keywords: ['hug', 'care', 'love', 'family'] },
    { emoji: '🙏', keywords: ['please', 'thank you', 'pray', 'grateful', 'manners'] }
];

const ChoreFormModal: React.FC<ChoreFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('20'); // Default to 20 cents
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [icon, setIcon] = useState<string | null>(null);
  const [category, setCategory] = useState<ChoreCategory | null>(null);
  const [error, setError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const iconContainerRef = useRef<HTMLDivElement>(null);
  const [emojiSearch, setEmojiSearch] = useState('');

  const isEditMode = !!initialData;

  const resetForm = useCallback(() => {
    setName('');
    setValue('20');
    setSelectedDays([]);
    setIcon(null);
    setCategory(null);
    setError('');
    setIsIconMenuOpen(false);
    setIsEmojiPickerOpen(false);
    setEmojiSearch('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setValue(String(initialData.value * 100));
        setSelectedDays(initialData.days);
        setIcon(initialData.icon);
        setCategory(initialData.category);
      } else {
        resetForm();
      }
    } else {
        setError('');
    }
  }, [initialData, isOpen, resetForm]);

  // Click outside handler for menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconContainerRef.current && !iconContainerRef.current.contains(event.target as Node)) {
        setIsIconMenuOpen(false);
        if (isEmojiPickerOpen) {
          setEmojiSearch('');
        }
        setIsEmojiPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

  const filteredEmojis = useMemo(() => {
    const emojiSearchTerm = emojiSearch.trim().toLowerCase();
    
    if (emojiSearchTerm) {
        const results = EMOJI_WITH_KEYWORDS.filter(emojiData => 
            emojiData.keywords.some(kw => kw.includes(emojiSearchTerm)) || emojiData.emoji === emojiSearchTerm
        );
        return [...new Set(results.map(e => e.emoji))];
    }
    
    const choreNameTerms = name.toLowerCase().split(/\s+/).filter(term => term.length >= 2);
    if (choreNameTerms.length > 0) {
        const matchedEmojis = EMOJI_WITH_KEYWORDS.filter(emojiData => {
            return choreNameTerms.some(term => emojiData.keywords.some(kw => kw.includes(term)));
        }).map(e => e.emoji);
        
        const uniqueMatched = [...new Set(matchedEmojis)];
        if (uniqueMatched.length > 0) return uniqueMatched;
    }

    return EMOJI_WITH_KEYWORDS.map(e => e.emoji);
}, [name, emojiSearch]);


  const handleDayToggle = useCallback((day: Day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };
  
  const handleEmojiSelect = (selectedEmoji: string) => {
    setIcon(selectedEmoji);
    setIsEmojiPickerOpen(false);
    setEmojiSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Chore name is required.');
      return;
    }

    const numericValueInCents = parseInt(value, 10);
    if (isNaN(numericValueInCents) || numericValueInCents <= 0) {
      setError('Chore value must be a positive number of cents.');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one day.');
      return;
    }

    const valueInDollars = numericValueInCents / 100;
    onSave({ name: name.trim(), value: valueInDollars, days: selectedDays, icon, category });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 sm:p-8 m-4 w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto custom-scrollbar text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Chore' : 'Add a New Chore'}
        </h2>
        
        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)]">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col items-start gap-2">
             <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 w-full">Image</label>
              <div ref={iconContainerRef} className="relative">
                <button
                    type="button"
                    onClick={() => setIsIconMenuOpen(o => !o)}
                    className="w-20 h-20 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-2xl border-2 border-dashed border-[var(--border-secondary)] cursor-pointer hover:border-[var(--accent-primary)] transition-all"
                    aria-label="Choose chore icon"
                >
                    {icon ? (
                    icon.startsWith('data:image/') ? (
                        <img src={icon} alt="Chore Icon" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <span className="text-5xl">{icon}</span>
                    )
                    ) : <span className="text-4xl text-[var(--text-tertiary)] font-light">+</span>}
                </button>
                {isIconMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-2xl border border-[var(--border-primary)] z-10 py-1 animate-fade-in-fast">
                        <button type="button" onClick={() => { setIsEmojiPickerOpen(true); setIsIconMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] flex items-center gap-2">
                           <span className="text-lg">😀</span> Use Emoji
                        </button>
                        <button type="button" onClick={() => { imageInputRef.current?.click(); setIsIconMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Upload Image
                        </button>
                    </div>
                )}
                {isEmojiPickerOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-secondary)] rounded-lg shadow-2xl border border-[var(--border-primary)] z-20 p-3 animate-fade-in-fast flex flex-col gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Search emojis..."
                      value={emojiSearch}
                      onChange={(e) => setEmojiSearch(e.target.value)}
                      autoFocus
                      className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-md focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] text-sm"
                    />
                    <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {filteredEmojis.length > 0 ? (
                        <div className="grid grid-cols-6 gap-2">
                          {filteredEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleEmojiSelect(emoji)}
                              className="flex items-center justify-center p-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
                              aria-label={emoji}
                            >
                              <span className="text-2xl">{emoji}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-[var(--text-secondary)] py-4">
                          No emojis found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
          </div>
          <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
          
          <div>
            <label htmlFor="chore-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Chore Name</label>
            <input
              id="chore-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Make the bed"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
             <label htmlFor="chore-value" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Value</label>
             <div className="flex items-center gap-2">
                <div className="relative">
                    <input
                        id="chore-value"
                        type="number"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        min="1"
                        step="1"
                        placeholder="20"
                        className="w-32 pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                    />
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <CoinIcon className="h-6 w-6" />
                    </div>
                </div>
                <span className="text-[var(--text-secondary)]">cents</span>
             </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Time of Day</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CHORE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    category === cat
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg'
                      : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
               <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className={`py-2 px-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    category === null
                      ? 'bg-[var(--danger)] text-[var(--danger-text)] shadow-lg'
                      : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                  }`}
                >
                  None
                </button>
            </div>
          </div>
          
          <div>
            <span className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Repeat on</span>
            <div className="flex justify-between space-x-1">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`w-10 h-10 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-px ${
                    selectedDays.includes(day)
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg'
                      : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                  }`}
                >
                  {DAY_SHORT_NAMES[day]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-[var(--success-text)] bg-[var(--success)] hover:opacity-80 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
            >
              {isEditMode ? 'Save Changes' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.3);
            border-radius: 10px;
        }
        @keyframes fade-in-fast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ChoreFormModal;