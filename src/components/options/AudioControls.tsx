import React from "react";
import { Button, Loader } from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";

interface AudioControlsProps {
  onChangeAudio: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
  isDownloading: boolean;
  recordedBlob: Blob | null;
}

export function AudioControls({
  onChangeAudio,
  onDownload,
  isDownloading,
  recordedBlob,
}: AudioControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        className="min-w-32 border-[1px] border-blue-500/20 bg-blue-500/10 focus:border-none"
        leftSection={<IconUpload size={20} />}
        onClick={() => document.getElementById("fileInput")?.click()}
        variant="light"
        color="blue"
      >
        Change Audio
      </Button>
      <Button
        className="min-w-32 border-[1px] border-green-500/20 bg-green-500/10 focus:border-none"
        leftSection={
          isDownloading ? null : <IconDownload color="green" size={20} />
        }
        onClick={onDownload}
        variant="light"
        color="green"
        disabled={!recordedBlob || isDownloading}
      >
        {isDownloading ? <Loader size={20} /> : "Download"}
      </Button>
      <input
        id="fileInput"
        type="file"
        accept="audio/*"
        onChange={onChangeAudio}
        style={{ display: "none" }}
      />
    </div>
  );
}
