
import { useCallback, useRef, useEffect } from 'react';

const useSound = (soundUrl: string, isSoundEnabled: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create the Audio object once when the component mounts or soundUrl changes.
    // This is more efficient than creating it on every play call.
    if (soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
    }
  }, [soundUrl]);

  const play = useCallback(() => {
    if (isSoundEnabled && audioRef.current) {
      // Resetting currentTime allows the sound to be replayed from the beginning
      // if it's triggered again before it finishes.
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Log errors, e.g., if autoplay is blocked by the browser or file is invalid.
        console.error(`Error playing sound from ${soundUrl}:`, error.message);
      });
    }
  }, [isSoundEnabled, soundUrl]);

  return play;
};

export default useSound;
