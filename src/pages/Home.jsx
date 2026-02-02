import { useRef, useState, useEffect } from 'react';
import useAudioAnalyzer from '../hooks/useAudioAnalyzer';
import Visualizer from '../components/Visualizer';

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
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {audioAnalyzer && (
        <Visualizer frequencyData={audioAnalyzer.dataArrayRef.current} />
      )}
      <audio ref={audioRef} hidden />
      
      {/* Main Player Controls - Center Circle */}
      <div className="relative -mt-15">
        <div className="w-90 h-90 rounded-full bg-black/80 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-600/20 flex flex-col items-center justify-center p-6">
          
          {/* Upload Button */}
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-300 font-medium rounded-full cursor-pointer hover:bg-purple-600/30 transition border border-purple-500/30 text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Audio</span>
          </label>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="w-16 h-16 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-lg shadow-purple-600/50 hover:shadow-purple-600/70 mb-4"
          >
            {isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Time Display */}
          <div className="flex items-center gap-2 text-purple-300 text-xs font-medium mb-2">
            <span>{formatTime(currentTime)}</span>
            <span className="text-purple-500">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full mb-4">
            <div
              onClick={handleSeek}
              className="w-full h-1.5 bg-gray-800/50 rounded-full cursor-pointer relative overflow-hidden group"
            >
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-purple-500/50 opacity-0 group-hover:opacity-100 transition-all"
                style={{ left: `calc(${progress}% - 6px)` }}
              ></div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="w-full flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <div
              onClick={handleVolumeChange}
              className="flex-1 h-1.5 bg-gray-800/50 rounded-full cursor-pointer relative overflow-hidden group"
            >
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                style={{ width: `${volume * 100}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-purple-500/50 opacity-0 group-hover:opacity-100 transition-all"
                style={{ left: `calc(${volume * 100}% - 6px)` }}
              ></div>
            </div>
            <span className="text-xs text-purple-300 w-8 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
