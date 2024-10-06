import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  Slider,
  Group,
  Text,
  FileButton,
  ActionIcon,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconUpload,
  IconDownload,
  IconTrash,
  IconVolume,
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

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length > 0) {
        clearCanvas();
        await loadAudio(files[0]);
      }
    },
    [loadAudio, clearCanvas],
  );

  const togglePlayPause = useCallback(() => {
    togglePauseResume();
    setIsPlaying((prev) => !prev);
  }, [togglePauseResume]);

  const handleDownload = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "audio_clip.wav";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [togglePlayPause]);

  return (
    <div>
      <header>
        <Group>
          <FileButton
            onChange={(file) => file && handleFileUpload([file])}
            accept="audio/*"
          >
            {(props) => (
              <Button
                {...props}
                leftSection={<IconUpload size={14} />}
                variant="subtle"
                className="bg-primary text-text-light hover:bg-primary-hover"
              >
                Upload Audio
              </Button>
            )}
          </FileButton>
          <Button
            leftSection={<IconDownload size={14} />}
            onClick={handleDownload}
            disabled={!recordedBlob}
          >
            Download
          </Button>
        </Group>
      </header>

      <main className="flex-grow p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
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
        </div>
      </main>

      <footer className="p-4">
        <Group align="center">
          <Text>
            {formatTime(currentAudioTime)} / {formatTime(duration)}
          </Text>
          <Group>
            <Button
              className="border-orange-500/50 bg-orange-500/10"
              variant="subtle"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <IconPlayerPause size={20} />
              ) : (
                <IconPlayerPlay size={20} />
              )}
            </Button>
            <Group>
              <IconVolume size={20} />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                styles={{ root: { width: 100 } }}
              />
            </Group>
          </Group>
        </Group>
      </footer>
    </div>
  );
}
