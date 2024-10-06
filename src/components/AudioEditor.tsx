import React, { useCallback, useEffect, useState, useRef } from "react";
import { Button, Slider, Group, Text, RangeSlider, Stack } from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconDownload,
  IconVolume,
  IconCut,
} from "@tabler/icons-react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { formatTime } from "@/utils/functions";

interface AudioEditorProps {
  audioFile: File | null;
}

export function AudioEditor({ audioFile }: AudioEditorProps) {
  const [loadedFile, setLoadedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
  const recorderControls = useVoiceVisualizer();
  const {
    duration,
    currentAudioTime,
    setPreloadedAudioBlob,
    audioRef,
    clearCanvas,
    recordedBlob,
    togglePauseResume,
  } = recorderControls;

  const loadAudio = useCallback(
    async (file: File) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        await setPreloadedAudioBlob(blob);
        setLoadedFile(file);
        setTrimRange([0, 100]);
      } catch (err) {
        console.error("Error loading audio:", err);
      }
    },
    [setPreloadedAudioBlob],
  );

  useEffect(() => {
    if (audioFile && audioFile !== loadedFile) {
      loadAudio(audioFile);
    }
  }, [audioFile, loadAudio, loadedFile]);

  const handleTrimRangeChange = useCallback(
    (range: [number, number]) => {
      const minTrimDuration = 5; // 5 seconds minimum
      if (duration) {
        const minRangePercentage = (minTrimDuration / duration) * 100;
        const [start, end] = range;

        if (end - start < minRangePercentage) {
          if (end === trimRange[1]) {
            range[0] = Math.max(0, end - minRangePercentage);
          } else {
            range[1] = Math.min(100, start + minRangePercentage);
          }
        }
      }

      setTrimRange(range);
      if (audioRef.current && duration) {
        audioRef.current.currentTime = (range[0] / 100) * duration;
      }
    },
    [audioRef, duration, trimRange],
  );

  const togglePlayPause = useCallback(() => {
    if (audioRef.current && duration) {
      const startTime = (trimRange[0] / 100) * duration;
      audioRef.current.currentTime = startTime;
    }
    togglePauseResume();
    setIsPlaying((prev) => !prev);
  }, [audioRef, duration, togglePauseResume, trimRange]);

  useEffect(() => {
    if (audioRef.current && duration) {
      const endTime = (trimRange[1] / 100) * duration;
      const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.currentTime >= endTime) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      };
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [audioRef, duration, trimRange]);

  const handleTrim = async () => {
    if (!audioRef.current || !recordedBlob) return;

    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(
      await recordedBlob.arrayBuffer(),
    );

    const startTime = (trimRange[0] / 100) * audioBuffer.duration;
    const endTime = (trimRange[1] / 100) * audioBuffer.duration;

    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      Math.floor((endTime - startTime) * audioBuffer.sampleRate),
      audioBuffer.sampleRate,
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const trimmedData = trimmedBuffer.getChannelData(channel);
      for (let i = 0; i < trimmedBuffer.length; i++) {
        trimmedData[i] =
          channelData[i + Math.floor(startTime * audioBuffer.sampleRate)];
      }
    }

    const trimmedBlob = audioBufferToWav(trimmedBuffer);
    downloadBlob(trimmedBlob, "trimmed_audio.wav");
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const outputBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(outputBuffer);
    const sampleRate = buffer.sampleRate;

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, length, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i]),
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true,
        );
        offset += 2;
      }
    }

    return new Blob([outputBuffer], { type: "audio/wav" });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const formatRangeLabel = (value: number) => {
    if (!duration) return "0:00";
    const time = (value / 100) * duration;
    return formatTime(time);
  };

  const getTrimmedDuration = useCallback(() => {
    if (!duration) return 0;
    const [start, end] = trimRange;
    return (duration * (end - start)) / 100;
  }, [duration, trimRange]);

  return (
    <div className="gap-y-4">
      <div className="mx-24 mt-32">
        <VoiceVisualizer
          controls={recorderControls}
          height={200}
          width="100%"
          backgroundColor="transparent"
          mainBarColor="#FF6B00"
          secondaryBarColor="#994000"
          speed={3}
          barWidth={2}
          gap={1}
          rounded={5}
          isControlPanelShown={false}
          isDefaultUIShown={false}
        />
      </div>

      <div className="mx-24 space-y-2">
        <RangeSlider
          value={trimRange}
          onChange={handleTrimRangeChange}
          onChangeEnd={(range) => {
            if (audioRef.current && duration) {
              audioRef.current.currentTime = (range[0] / 100) * duration;
            }
          }}
          labelAlwaysOn
          label={formatRangeLabel}
          className="w-full"
          minRange={duration ? (5 / duration) * 100 : 0}
        />
        <Text className="text-center" size="sm">
          Trimmed Duration: {formatTime(getTrimmedDuration())}
        </Text>
      </div>

      <div className="controlpanel flex w-full items-center justify-center">
        <div className="mt-12 flex flex-col items-center justify-center space-y-8 rounded-lg border-[1px] border-orange-500/50 p-4">
          <div className="flex w-full items-center justify-between space-x-2">
            <Button
              onClick={togglePlayPause}
              variant="subtle"
              color="orange"
              className="border-[1px] border-orange-500/50 bg-orange-500/10"
            >
              {isPlaying ? (
                <IconPlayerPause size={20} />
              ) : (
                <IconPlayerPlay size={20} />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Text size="xs">
                {formatTime(currentAudioTime)} / {formatTime(duration)}
              </Text>
              <IconVolume size={20} />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                className="w-24"
              />
            </div>
          </div>
          <Button
            leftSection={<IconCut size={20} />}
            onClick={handleTrim}
            variant="subtle"
            //   w="100%"
            color="orange"
            disabled={!recordedBlob}
            className="w-full border-[1px] border-orange-500/50 bg-orange-500/10"
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
