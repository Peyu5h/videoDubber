import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Slider,
  Group,
  Text,
  Paper,
  Stack,
  Container,
  Loader,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconDownload,
  IconVolume,
  IconScissors,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { formatTime } from "@/utils/functions";
import { saveAs } from "file-saver";
import { showNotification } from "@mantine/notifications";
import { useResizeObserver } from "@mantine/hooks";
import { AudioVisualizer } from "./options/AudioVisualizer";
import { AudioControls } from "./options/AudioControls";
import { AudioTrimmer } from "./options/AudioTrimmer";

interface AudioEditorProps {
  audioFile: File | null;
}

export function AudioEditor({ audioFile }: AudioEditorProps) {
  const [loadedFile, setLoadedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volum, setVolum] = useState(100);
  const [trimRng, setTrimRng] = useState<[number, number]>([0, 100]);
  const recorderControls = useVoiceVisualizer();
  const {
    duration,
    setPreloadedAudioBlob,
    audioRef,
    recordedBlob,
    togglePauseResume,
  } = recorderControls;
  const [isDownloadin, setIsDownloadin] = useState(false);
  const [isTrimmin, setIsTrimmin] = useState(false);
  const [isRemovin, setIsRemovin] = useState(false);
  const [audioNam, setAudioNam] = useState<string>("");
  const [containerRef, rect] = useResizeObserver();
  const [resetTrimmerKey, setResetTrimmerKey] = useState(0);

  const loadAudio = useCallback(
    async (file: File) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        await setPreloadedAudioBlob(blob);
        setLoadedFile(file);
        setTrimRng([0, 100]);
      } catch (err) {
        console.error("Err:", err);
      }
    },
    [setPreloadedAudioBlob],
  );

  useEffect(() => {
    if (audioFile && audioFile !== loadedFile) {
      loadAudio(audioFile);
    }
  }, [audioFile, loadAudio, loadedFile]);

  useEffect(() => {
    if (audioFile) {
      setAudioNam(audioFile.name);
    }
  }, [audioFile]);

  const handleSelectionChange = useCallback(
    (start: number, end: number) => {
      if (duration) {
        setTrimRng([(start / duration) * 100, (end / duration) * 100]);
        if (audioRef.current) {
          audioRef.current.currentTime = start;
        }
      }
    },
    [duration, audioRef],
  );

  const togglePlayPause = useCallback(() => {
    if (audioRef.current && duration) {
      const startTime = (trimRng[0] / 100) * duration;
      audioRef.current.currentTime = startTime;
    }
    togglePauseResume();
    setIsPlaying((prev) => !prev);
  }, [audioRef, duration, togglePauseResume, trimRng]);

  useEffect(() => {
    if (audioRef.current && duration) {
      const endTime = (trimRng[1] / 100) * duration;
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
  }, [audioRef, duration, trimRng]);

  const handleTrim = async () => {
    if (!audioRef.current || !recordedBlob) return;
    setIsTrimmin(true);

    try {
      const audioBuffer = await getAudioBuffer();
      const audioContext = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();

      const startTime = (trimRng[0] / 100) * audioBuffer.duration;
      const endTime = (trimRng[1] / 100) * audioBuffer.duration;

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

      await updateAudioBuffer(trimmedBuffer);
      resetTrimmer();
    } catch (error) {
      console.error("Err:", error);
      showNotification({
        title: "Error",
        message: "Failed to trim",
        color: "red",
      });
    } finally {
      setIsTrimmin(false);
    }
  };

  const handleDownload = async () => {
    if (!recordedBlob) return;
    setIsDownloadin(true);

    try {
      const blob = await audioBufferToWav(await getAudioBuffer());
      saveAs(blob, "edited_audio.wav");
    } catch (error) {
      console.error("Err:", error);
      showNotification({
        title: "Error",
        message: "Failed to download",
        color: "red",
      });
    } finally {
      setIsDownloadin(false);
    }
  };

  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const worker = new Worker(
      new URL("../utils/audioBufferToWav.worker.ts", import.meta.url),
      { type: "module" },
    );

    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data);
        }
      };

      const channelData = [];
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        channelData.push(buffer.getChannelData(i));
      }

      worker.postMessage(
        {
          channels: channelData,
          sampleRate: buffer.sampleRate,
        },
        channelData.map((data) => data.buffer),
      );
    });
  };

  const handleVolumChange = (value: number) => {
    setVolum(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  const getTrimmedDuration = useCallback(() => {
    if (!duration) return 0;
    const [start, end] = trimRng;
    return (duration * (end - start)) / 100;
  }, [duration, trimRng]);

  const updateAudioBuffer = async (newBuffer: AudioBuffer) => {
    const blob = await audioBufferToWav(newBuffer);
    await setPreloadedAudioBlob(blob);
    setTrimRng([0, 100]);
  };

  const handleChangeAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadAudio(file);
      setAudioNam(file.name);
    }
  };

  const getAudioBuffer = async (): Promise<AudioBuffer> => {
    if (!recordedBlob) {
      throw new Error("NA data");
    }
    const arrayBuffer = await recordedBlob.arrayBuffer();
    const audioContext = new ((window as any).AudioContext ||
      (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  };

  const resetTrimmer = useCallback(() => {
    setTrimRng([0, 100]);
    setResetTrimmerKey((prev) => prev + 1);
  }, []);

  const handleRemove = async () => {
    if (!audioRef.current || !recordedBlob) return;
    setIsRemovin(true);

    try {
      const audioBuffer = await getAudioBuffer();
      const audioContext = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();

      const startTime = Math.max(0, (trimRng[0] / 100) * audioBuffer.duration);
      const endTime = Math.min(
        audioBuffer.duration,
        (trimRng[1] / 100) * audioBuffer.duration,
      );

      const startSample = Math.floor(startTime * audioBuffer.sampleRate);
      const endSample = Math.floor(endTime * audioBuffer.sampleRate);

      const newLength = audioBuffer.length - (endSample - startSample);

      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate,
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const newChannelData = newBuffer.getChannelData(channel);

        newChannelData.set(channelData.subarray(0, startSample), 0);

        const remainingData = channelData.subarray(endSample);
        newChannelData.set(remainingData, startSample);
      }

      await updateAudioBuffer(newBuffer);
      resetTrimmer();
    } catch (error) {
      console.error("Err:", error);
      showNotification({
        title: "Error",
        message: "Pls select a section first",
        color: "red",
      });
    } finally {
      setIsRemovin(false);
    }
  };

  return (
    <Container className="flex w-full items-center justify-center" size="lg">
      <Paper
        className="mt-24 w-full border-background-dark bg-black"
        shadow="md"
        p="md"
        withBorder
      >
        <Stack gap="md">
          <Group className="justify-between" align="center">
            <h1 className="text-sm font-thin">{audioNam}</h1>
            <AudioControls
              onChangeAudio={handleChangeAudio}
              onDownload={handleDownload}
              isDownloading={isDownloadin}
              recordedBlob={recordedBlob}
            />
          </Group>

          <Paper
            ref={containerRef}
            className="relative border-2 border-background-dark bg-black"
            p="md"
          >
            <AudioVisualizer
              recorderControls={recorderControls}
              containerWidth={rect.width}
            />
            <AudioTrimmer
              key={resetTrimmerKey}
              duration={duration || 0}
              containerWidth={rect.width}
              onSelectionChange={handleSelectionChange}
            />
          </Paper>

          <div className="flex flex-col gap-2">
            <Text size="sm">
              Trimmed Duration: {formatTime(getTrimmedDuration())}
            </Text>

            <Group className="w-48" align="center" gap="xs">
              <IconVolume size={20} />
              <Slider
                value={volum}
                onChange={handleVolumChange}
                min={0}
                max={100}
                step={1}
                style={{ flex: 1 }}
              />
            </Group>
          </div>

          <Group gap="md">
            <Button
              className="border-[1px] border-blue-500/20 focus:border-none"
              onClick={togglePlayPause}
              variant="light"
              color="blue"
            >
              {isPlaying ? (
                <IconPlayerPause size={20} />
              ) : (
                <IconPlayerPlay size={20} />
              )}
            </Button>

            <Button
              className="min-w-24 border-[1px] border-orange-500/20 bg-orange-500/10 focus:border-none"
              leftSection={isTrimmin ? null : <IconScissors size={20} />}
              onClick={handleTrim}
              variant="light"
              color="orange"
              disabled={!recordedBlob || isTrimmin}
            >
              {isTrimmin ? <Loader size={20} /> : "Trim"}
            </Button>

            <Button
              className="min-w-24 border-[1px] border-red-500/20 bg-red-500/10 focus:border-none"
              leftSection={isRemovin ? null : <IconTrash size={20} />}
              onClick={handleRemove}
              variant="light"
              color="red"
              disabled={!recordedBlob || isRemovin}
            >
              {isRemovin ? <Loader size={20} /> : "Remove"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
