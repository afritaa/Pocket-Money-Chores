
import { useCallback, useRef, useEffect } from 'react';

// Using a silent WAV file as a Base64 data URI to prevent "no supported source" errors.
// This ensures sounds work out-of-the-box and can be replaced later.
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAAAAAA==';

const SOUNDS = {
  'chore-complete': SILENT_AUDIO_URI,
  'bonus-notify': SILENT_AUDIO_URI,
};

type SoundName = keyof typeof SOUNDS;

const useSound = (soundName: SoundName, isSoundEnabled: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundUrl = SOUNDS[soundName];

  useEffect(() => {
    // Preload the audio element when the component mounts
    audioRef.current = new Audio(soundUrl);
    audioRef.current.preload = 'auto';
  }, [soundUrl]);

  const play = useCallback(() => {
    if (isSoundEnabled && audioRef.current) {
      // Resetting currentTime allows the sound to be replayed quickly
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Autoplay was prevented.
        console.error("Error playing sound:", error);
      });
    }
  }, [isSoundEnabled]);

  return play;
};

export default useSound;