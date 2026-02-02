import { useRef, useEffect } from 'react';

const useAudioAnalyzer = (audioElement) => {
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!audioElement) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioElement);

    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyzer);
    analyzer.connect(audioContext.destination);

    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;

    const updateFrequencyData = () => {
      if (analyzerRef.current && dataArrayRef.current) {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        console.log('Frequency Data:', dataArrayRef.current);
      }
      animationIdRef.current = requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      source.disconnect();
      analyzer.disconnect();
      audioContext.close();
    };
  }, [audioElement]);

  if (!audioElement) return null;

  return { analyzerRef, dataArrayRef };
};

export default useAudioAnalyzer;
