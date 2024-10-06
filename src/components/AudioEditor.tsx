import React, { useState, useCallback, useEffect } from "react";
import { AppShell, Button, Slider, Text, Group, Box } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconUpload,
} from "@tabler/icons-react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { formatTime } from "@/utils/functions";

interface AudioEditorProps {
  audioFile: File | null;
}

export function AudioEditor({ audioFile }: AudioEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const recorderControls = useVoiceVisualizer();
  const {
    isRecordingInProgress,
    isPausedRecording,
    startRecording,
    stopRecording,
    togglePauseResume,
    duration,
    currentAudioTime,
    isPausedRecordedAudio,
    setPreloadedAudioBlob,
    audioRef,
    clearCanvas,
  } = recorderControls;

  const loadAudio = useCallback(
    async (file: File) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        await setPreloadedAudioBlob(blob);
      } catch (err) {
        console.error("Error loading audio:", err);
        setError("Failed to load audio file. Please try again.");
      }
    },
    [setPreloadedAudioBlob],
  );

  useEffect(() => {
    if (audioFile) {
      loadAudio(audioFile);
    }
  }, [audioFile, loadAudio]);

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length > 0) {
        setError(null);
        clearCanvas();
        await loadAudio(files[0]);
      }
    },
    [loadAudio, clearCanvas],
  );

  const togglePlayPause = useCallback(() => {
    if (isPausedRecordedAudio) {
      togglePauseResume();
    } else {
      if (isRecordingInProgress) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }, [
    isRecordingInProgress,
    isPausedRecordedAudio,
    startRecording,
    stopRecording,
    togglePauseResume,
  ]);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <AppShell className="bg-background-dark text-text-light">
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between p-4">
          <Text size="xl">Designing to Digital</Text>
          <Button
            variant="filled"
            color="orange"
            rightSection={<IconPlayerPlay size={14} />}
          >
            Publish
          </Button>
        </header>

        <main className="flex-grow p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Box mb="md">
                <Dropzone
                  onDrop={handleFileUpload}
                  accept={["audio/mpeg", "audio/wav"]}
                  maxSize={30 * 1024 ** 2}
                >
                  <Group
                    p="center"
                    style={{ minHeight: 100, pointerEvents: "none" }}
                  >
                    <IconUpload size={30} stroke={1.5} />
                    <div>
                      <Text size="md" inline>
                        Drag audio files here or click to select files
                      </Text>
                      <Text size="xs" color="dimmed" inline mt={7}>
                        Attach one audio file, file should not exceed 30mb
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
              </Box>
              {error && <Text color="red">{error}</Text>}
              <VoiceVisualizer
                controls={recorderControls}
                height={200}
                width="100%"
                backgroundColor="transparent"
                mainBarColor="#FF6B00"
                secondaryBarColor="#7000FF"
                speed={3}
                barWidth={2}
                gap={1}
                rounded={5}
                isControlPanelShown={false}
                isDefaultUIShown={false}
              />
            </div>
            <div className="col-span-1">{/* toDoo: general controls */}</div>
          </div>
        </main>

        <footer className="p-4">
          <Slider
            value={currentAudioTime}
            onChange={handleSeek}
            max={duration}
            className="mb-2"
          />
          <div className="flex items-center justify-between">
            <Text>
              {formatTime(currentAudioTime)} / {formatTime(duration)}
            </Text>
            <div className="flex items-center">
              <Button
                variant="subtle"
                className="mx-2"
                onClick={togglePlayPause}
              >
                {isRecordingInProgress || !isPausedRecordedAudio ? (
                  <IconPlayerPause size={20} />
                ) : (
                  <IconPlayerPlay size={20} />
                )}
              </Button>
              {/* toDoo: volume slider */}
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
