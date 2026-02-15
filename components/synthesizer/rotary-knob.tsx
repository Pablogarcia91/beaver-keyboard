'use client';

import { useRef, useCallback, useState } from 'react';

interface RotaryKnobProps {
  value: number;
  min: number;
  max: number;
  color: string;
  label: string;
  displayValue?: string;
  onChange: (value: number) => void;
}

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export function RotaryKnob({
  value,
  min,
  max,
  color,
  label,
  displayValue,
  onChange,
}: RotaryKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartValue = useRef(0);

  const normalizedValue = (value - min) / (max - min);
  const angle = MIN_ANGLE + normalizedValue * (MAX_ANGLE - MIN_ANGLE);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartY.current = e.clientY;
      dragStartValue.current = value;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = dragStartY.current - moveEvent.clientY;
        const sensitivity = (max - min) / 150;
        const newValue = Math.max(
          min,
          Math.min(max, dragStartValue.current + deltaY * sensitivity)
        );
        onChange(newValue);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [value, min, max, onChange]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      dragStartY.current = touch.clientY;
      dragStartValue.current = value;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const t = moveEvent.touches[0];
        const deltaY = dragStartY.current - t.clientY;
        const sensitivity = (max - min) / 150;
        const newValue = Math.max(
          min,
          Math.min(max, dragStartValue.current + deltaY * sensitivity)
        );
        onChange(newValue);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    },
    [value, min, max, onChange]
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`knob w-12 h-12 rounded-full relative cursor-pointer select-none ${isDragging ? 'scale-105' : ''}`}
        style={{ transition: isDragging ? 'none' : 'transform 0.1s' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Knob indicator line */}
        <div
          className="absolute w-[3px] h-3 rounded-full top-1 left-1/2 -translate-x-1/2 origin-[center_20px]"
          style={{
            backgroundColor: color,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            boxShadow: `0 0 4px ${color}`,
          }}
        />
        {/* Center dot */}
        <div
          className="absolute w-1.5 h-1.5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: color, opacity: 0.5 }}
        />
      </div>
      <span className="text-[9px] font-mono text-device-text-muted uppercase tracking-wider">
        {label}
      </span>
      {displayValue && (
        <span className="text-[8px] font-mono" style={{ color }}>
          {displayValue}
        </span>
      )}
    </div>
  );
}
