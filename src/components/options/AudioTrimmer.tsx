import React, { useState, useEffect } from "react";

interface AudioTrimmerProps {
  duration: number;
  containerWidth: number;
  onSelectionChange: (start: number, end: number) => void;
}

export function AudioTrimmer({
  duration,
  containerWidth,
  onSelectionChange,
}: AudioTrimmerProps) {
  const [leftHandle, setLeftHandle] = useState(0);
  const [rightHandle, setRightHandle] = useState(containerWidth);

  useEffect(() => {
    setLeftHandle(0);
    setRightHandle(containerWidth);
    onSelectionChange(0, duration);
  }, [containerWidth, duration, onSelectionChange]);

  const handleMouseDown = (e: React.MouseEvent, isLeft: boolean) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeft = leftHandle;
    const startRight = rightHandle;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      let newLeft = leftHandle;
      let newRight = rightHandle;

      if (isLeft) {
        newLeft = Math.max(0, Math.min(startLeft + diff, rightHandle - 10));
        setLeftHandle(newLeft);
      } else {
        newRight = Math.min(
          containerWidth,
          Math.max(leftHandle + 10, startRight + diff),
        );
        setRightHandle(newRight);
      }

      const startTime = (newLeft / containerWidth) * duration;
      const endTime = (newRight / containerWidth) * duration;
      onSelectionChange(startTime, endTime);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative mt-2 h-8 bg-slate-900">
      <div
        className="absolute left-0 top-0 h-full bg-blue-500 opacity-30"
        style={{ left: leftHandle, width: rightHandle - leftHandle }}
      />
      <div
        className="absolute top-0 h-full w-2 cursor-ew-resize bg-blue-600"
        style={{ left: leftHandle }}
        onMouseDown={(e) => handleMouseDown(e, true)}
      />
      <div
        className="absolute top-0 h-full w-2 cursor-ew-resize bg-blue-600"
        style={{ left: rightHandle - 8 }}
        onMouseDown={(e) => handleMouseDown(e, false)}
      />
    </div>
  );
}
