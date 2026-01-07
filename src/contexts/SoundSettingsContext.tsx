import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface SoundSettingsContextType {
  timerSoundEnabled: boolean;
  toggleTimerSound: () => void;
  playTimerSound: () => void;
}

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

// Custom workout timer sound URL - using a royalty-free workout beep sound
const WORKOUT_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export function SoundSettingsProvider({ children }: { children: React.ReactNode }) {
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('timerSoundEnabled');
    return stored !== null ? stored === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('timerSoundEnabled', String(timerSoundEnabled));
  }, [timerSoundEnabled]);

  const toggleTimerSound = () => {
    setTimerSoundEnabled(prev => !prev);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(WORKOUT_SOUND_URL);
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playTimerSound = useCallback(() => {
    if (!timerSoundEnabled) return;
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
  }, [timerSoundEnabled]);

  return (
    <SoundSettingsContext.Provider value={{ timerSoundEnabled, toggleTimerSound, playTimerSound }}>
      {children}
    </SoundSettingsContext.Provider>
  );
}

export function useSoundSettings() {
  const context = useContext(SoundSettingsContext);
  if (!context) {
    throw new Error('useSoundSettings must be used within SoundSettingsProvider');
  }
  return context;
}
