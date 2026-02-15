'use client';

import { useCallback } from 'react';

interface DrumPadProps {
  instrumentId: string;
  name: string;
  color: string;
  keyNumber: number;
  onHit: (instrumentId: string) => void;
}

export function DrumPad({ instrumentId, name, color, keyNumber, onHit }: DrumPadProps) {
  const handleClick = useCallback(() => {
    onHit(instrumentId);
  }, [instrumentId, onHit]);

  return (
    <button
      className="drum-pad w-full h-full rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none relative"
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}50`,
        boxShadow: `0 0 12px ${color}15, inset 0 0 8px ${color}10`,
      }}
      onMouseDown={handleClick}
      onTouchStart={(e) => {
        e.preventDefault();
        handleClick();
      }}
    >
      <span className="text-[10px] font-mono font-bold uppercase" style={{ color }}>
        {name}
      </span>
      <span className="text-[8px] font-mono" style={{ color, opacity: 0.4 }}>
        {keyNumber}
      </span>
    </button>
  );
}
