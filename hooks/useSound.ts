import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Define the shape of the context
interface SoundContextType {
  isUnlocked: boolean;
  playCompleteChore: () => void;
  playCashOut: () => void;
  playAllDone: () => void;
  playBonusNotify: () => void;
  playButtonClick: () => void;
  playShimmerLoop: () => void;
  stopShimmerLoop: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_FILES = {
  shimmer: 'sounds/shimmer.mp3',
  completeChore: 'sounds/chore-complete.mp3',
  cashOut: 'sounds/cash-out.mp3',
  allDone: 'sounds/all-chores-done.mp3',
  bonusNotify: 'sounds/bonus-notify.mp3',
  buttonClick: 'sounds/button-click.mp3',
};
type SoundKeys = keyof typeof SOUND_FILES;

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Record<string, AudioBuffer | null>>({}).current;
  const shimmerSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const shimmerGainRef = useRef<GainNode | null>(null);

  const unlockAudio = useCallback(async () => {
    if (isUnlocked || audioContextRef.current) return;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      audioContextRef.current = ctx;

      const loadSound = async (url: string): Promise<AudioBuffer | null> => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          return await ctx.decodeAudioData(arrayBuffer);
        } catch (error) {
          console.error(`Error loading sound: ${url}`, error);
          return null;
        }
      };

      await Promise.all(
        Object.entries(SOUND_FILES).map(async ([key, path]) => {
          buffersRef[key] = await loadSound(path);
        })
      );

      setIsUnlocked(true);
      console.log('Audio unlocked and sounds loaded.');
    } catch (e) {
      console.error("Web Audio API is not supported or could not be initialized.", e);
    }
  }, [isUnlocked, buffersRef]);
  
  useEffect(() => {
    const handleFirstInteraction = () => { unlockAudio(); };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [unlockAudio]);

  const playSound = useCallback(async (key: SoundKeys, volume = 1) => {
    const audioContext = audioContextRef.current;
    if (!isUnlocked || !audioContext) return;
    
    if (audioContext.state === 'suspended') await audioContext.resume();
    
    const buffer = buffersRef[key];
    if (!buffer) return;
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0);
  }, [isUnlocked, buffersRef]);
  
  const playShimmerLoop = useCallback(async () => {
    const audioContext = audioContextRef.current;
    if (!isUnlocked || !audioContext || shimmerSourceRef.current) return;
    if (audioContext.state === 'suspended') await audioContext.resume();
    
    const buffer = buffersRef['shimmer'];
    if (!buffer) return;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.connect(audioContext.destination);
    shimmerGainRef.current = gain;
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    shimmerSourceRef.current = source;

    gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 1);
  }, [isUnlocked, buffersRef]);
  
  const stopShimmerLoop = useCallback(() => {
    const audioContext = audioContextRef.current;
    const source = shimmerSourceRef.current;
    const gain = shimmerGainRef.current;
    if (!audioContext || !gain || !source) return;

    const fadeOutTime = audioContext.currentTime + 1;
    gain.gain.linearRampToValueAtTime(0, fadeOutTime);
    source.stop(fadeOutTime);
    
    source.onended = () => {
      if (source.disconnect) source.disconnect();
      if (gain.disconnect) gain.disconnect();
    };

    shimmerSourceRef.current = null;
    shimmerGainRef.current = null;
  }, []);

  const value = useMemo(() => ({
    isUnlocked,
    playCompleteChore: () => playSound('completeChore', 0.7),
    playCashOut: () => playSound('cashOut'),
    playAllDone: () => playSound('allDone'),
    playBonusNotify: () => playSound('bonusNotify', 0.6),
    playButtonClick: () => playSound('buttonClick', 0.7),
    playShimmerLoop,
    stopShimmerLoop,
  }), [isUnlocked, playSound, playShimmerLoop, stopShimmerLoop]);

  return React.createElement(SoundContext.Provider, { value }, children);
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) throw new Error('useSound must be used within a SoundProvider');
  return context;
};