import { useRef, useState, useEffect } from 'react';
import useAudioAnalyzer from '../hooks/useAudioAnalyzer';

function Home() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioAnalyzer = useAudioAnalyzer(audioRef.current);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && audioRef.current) {
      const audioURL = URL.createObjectURL(file);
      audioRef.current.src = audioURL;
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const newTime = (clickPosition / progressBarWidth) * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const volumeBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const volumeBarWidth = volumeBar.offsetWidth;
    const newVolume = clickPosition / volumeBarWidth;
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <audio ref={audioRef} hidden />
      <div className="text-center max-w-2xl w-full px-8">
        <h1 className="text-6xl font-bold text-white">SoundScape</h1>
        
        <div className="mt-8">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg cursor-pointer hover:bg-purple-700 transition"
          >
            Upload Audio
          </label>
        </div>

        <div className="mt-4">
          <button
            onClick={togglePlayPause}
            className="px-8 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 text-purple-300 text-sm font-medium mb-2">
            <span>{formatTime(currentTime)}</span>
            <span className="flex-1"></span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            onClick={handleSeek}
            className="w-full h-2 bg-gray-800 rounded-full cursor-pointer relative overflow-hidden group"
          >
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full shadow-lg shadow-purple-500/50 transition-all group-hover:scale-110"
              style={{ left: `calc(${progress}% - 8px)` }}
            ></div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3 text-purple-300 text-sm font-medium mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <span>Volume</span>
            <span className="ml-auto">{Math.round(volume * 100)}%</span>
          </div>
          <div
            onClick={handleVolumeChange}
            className="w-full h-2 bg-gray-800 rounded-full cursor-pointer relative overflow-hidden group"
          >
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
              style={{ width: `${volume * 100}%` }}
            ></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full shadow-lg shadow-purple-500/50 transition-all group-hover:scale-110"
              style={{ left: `calc(${volume * 100}% - 8px)` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
