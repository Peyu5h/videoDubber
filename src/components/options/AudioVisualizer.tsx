import React from "react";
import { VoiceVisualizer } from "react-voice-visualizer";

interface AudioVisualizerProps {
  recorderControls: any;
  containerWidth: number;
}

export function AudioVisualizer({
  recorderControls,
  containerWidth,
}: AudioVisualizerProps) {
  return (
    <VoiceVisualizer
      controls={recorderControls}
      height={200}
      width={containerWidth}
      backgroundColor="transparent"
      mainBarColor="#FF6B00"
      secondaryBarColor="#994000"
      barWidth={2}
      gap={1}
      rounded={5}
      isControlPanelShown={false}
      isDefaultUIShown={false}
    />
  );
}
