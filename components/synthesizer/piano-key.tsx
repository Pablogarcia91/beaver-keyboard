'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PianoKeyProps {
  note: string;
  octave: number;
  isBlack: boolean;
  isActive: boolean;
  keyBinding?: string;
  onNoteOn: (note: string, octave: number) => void;
  onNoteOff: (note: string, octave: number) => void;
}

export function PianoKey({
  note,
  octave,
  isBlack,
  isActive,
  keyBinding,
  onNoteOn,
  onNoteOff,
}: PianoKeyProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onNoteOn(note, octave);
    },
    [note, octave, onNoteOn]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onNoteOff(note, octave);
    },
    [note, octave, onNoteOff]
  );

  const handleMouseLeave = useCallback(
    () => {
      if (isActive) {
        onNoteOff(note, octave);
      }
    },
    [note, octave, isActive, onNoteOff]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      onNoteOn(note, octave);
    },
    [note, octave, onNoteOn]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      onNoteOff(note, octave);
    },
    [note, octave, onNoteOff]
  );

  if (isBlack) {
    return (
      <button
        className={cn(
          'piano-key-black absolute z-10 w-full h-full rounded-b-md border border-[#333] cursor-pointer select-none',
          isActive && 'active'
        )}
        style={{ width: '60%' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`${note}${octave}`}
      >
        {keyBinding && (
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 font-mono uppercase">
            {keyBinding}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      className={cn(
        'piano-key-white relative flex-1 h-28 rounded-b-lg border border-gray-300 cursor-pointer select-none flex flex-col justify-end items-center pb-1.5',
        isActive && 'active'
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={`${note}${octave}`}
    >
      {keyBinding && (
        <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">
          {keyBinding}
        </span>
      )}
    </button>
  );
}
