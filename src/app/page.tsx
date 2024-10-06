"use client";

import { useState } from "react";
import { AudioEditor } from "@/components/AudioEditor";
import LandingPage from "@/components/LandingPage/LandingPage";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
  };

  return audioFile ? (
    <div className="w-full">
      <AudioEditor audioFile={audioFile} />
    </div>
  ) : (
    <LandingPage onFileSelect={handleFileSelect} />
  );
}
