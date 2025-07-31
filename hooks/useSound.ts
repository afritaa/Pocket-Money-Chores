
import { useCallback, useRef, useEffect } from 'react';

const useSound = (soundUrl: string, isSoundEnabled: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
