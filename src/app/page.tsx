"use client";

import { useState } from "react";
import { AudioEditor } from "@/components/AudioEditor";
import Uploader from "@/components/Uploader";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
  };

  return audioFile ? (
    <div className="h-screen w-full">
      <AudioEditor audioFile={audioFile} />
    </div>
  ) : (
    <Uploader onFileSelect={handleFileSelect} />
  );
}
