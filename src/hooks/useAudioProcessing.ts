import { useCallback, useState, useRef } from "react";

interface AudioProcessingResult {
  audioBuffer: AudioBuffer;
  duration: number;
  sampleRate: number;
}

const useAudioProcessing = () => {
  const [audioContext] = useState(
    () => new (window.AudioContext || (window as any).webkitAudioContext)(),
  );
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const processAudio = useCallback(
    async (file: File): Promise<AudioProcessingResult> => {
      const validAudioTypes = [
        "audio/wav",
        "audio/mpeg",
        "audio/mp3",
        "audio/ogg",
      ];
      if (!validAudioTypes.includes(file.type)) {
        throw new Error(
          `Unsupported audio format: ${file.type}. Please use WAV, MP3, or OGG files.`,
        );
      }

      return new Promise((resolve, reject) => {
        const audioElement = new Audio();
        audioElement.preload = "auto";

        audioElement.onloadedmetadata = () => {
          const source = audioContext.createMediaElementSource(audioElement);
          const analyser = audioContext.createAnalyser();
          source.connect(analyser);
          analyser.connect(audioContext.destination);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Float32Array(bufferLength);

          analyser.getFloatTimeDomainData(dataArray);

          const audioBuffer = audioContext.createBuffer(
            1,
            dataArray.length,
            audioContext.sampleRate,
          );
          audioBuffer.copyToChannel(dataArray, 0);

          resolve({
            audioBuffer,
            duration: audioElement.duration,
            sampleRate: audioContext.sampleRate,
          });
        };

        audioElement.onerror = (error) => {
          reject(new Error(`Error loading audio: ${error}`));
        };

        audioElement.src = URL.createObjectURL(file);
      });
    },
    [audioContext],
  );

  const cleanup = useCallback(() => {
    if (audioElementRef.current) {
      URL.revokeObjectURL(audioElementRef.current.src);
      audioElementRef.current = null;
    }
  }, []);

  return { processAudio, audioContext, cleanup };
};

export default useAudioProcessing;
