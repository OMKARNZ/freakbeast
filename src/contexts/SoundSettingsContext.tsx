import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SoundSettingsContextType {
  timerSoundEnabled: boolean;
  toggleTimerSound: () => void;
  playTimerSound: () => void;
}

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

// Create audio context for generating sounds
const createBeepSound = (frequency: number, duration: number, volume: number = 0.3) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

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

  const playTimerSound = useCallback(() => {
    if (!timerSoundEnabled) return;
    
    // Play a pleasant workout start sound (3 ascending beeps)
    setTimeout(() => createBeepSound(523.25, 0.15, 0.2), 0);      // C5
    setTimeout(() => createBeepSound(659.25, 0.15, 0.25), 200);   // E5
    setTimeout(() => createBeepSound(783.99, 0.3, 0.3), 400);     // G5 - longer final beep
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
