import { useEffect, useRef, useState } from "react";
import { Audio } from 'expo-av';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/calm_fitness.mp3'),
          { shouldPlay: false, isLooping: true }
        );
        
        if (isMounted) {
          setSound(sound);
        }
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling sound:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-4 mb-6">
      <button
        onClick={togglePlay}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition duration-300 flex items-center justify-center"
      >
        {isPlaying ? "⏸ Pause Music" : "🎵 Play Music"}
      </button>
    </div>
  );
}
