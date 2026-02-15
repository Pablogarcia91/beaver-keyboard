'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MelodyPreset } from '@/lib/types';

interface MelodyPlayerCallbacks {
  noteOn: (note: string, octave: number) => void;
  noteOff: (note: string, octave: number) => void;
  setOscillator: (type: 'sine' | 'square' | 'sawtooth' | 'triangle') => void;
}

export function useMelodyPlayer(
  preset: MelodyPreset | null,
  bpm: number,
  isPlaying: boolean,
  callbacks: MelodyPlayerCallbacks
) {
  const [currentStep, setCurrentStep] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(-1);
  const activeNotesRef = useRef<Set<string>>(new Set());
  const presetRef = useRef(preset);
  presetRef.current = preset;
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const releaseAllNotes = useCallback(() => {
    for (const noteId of activeNotesRef.current) {
      const match = noteId.match(/^([A-G]#?)(\d+)$/);
      if (match) {
        callbacksRef.current.noteOff(match[1], parseInt(match[2]));
      }
    }
    activeNotesRef.current.clear();
  }, []);

  const tick = useCallback(() => {
    const p = presetRef.current;
    if (!p) return;

    stepRef.current = (stepRef.current + 1) % p.length;
    setCurrentStep(stepRef.current);

    // Release notes whose duration has ended
    for (const noteId of [...activeNotesRef.current]) {
      const match = noteId.match(/^([A-G]#?)(\d+)$/);
      if (!match) continue;
      const melodyNote = p.notes.find(
        (n) => n.note === match[1] && n.octave === parseInt(match[2])
          && stepRef.current >= n.step
          && stepRef.current < n.step + n.duration
      );
      if (!melodyNote) {
        callbacksRef.current.noteOff(match[1], parseInt(match[2]));
        activeNotesRef.current.delete(noteId);
      }
    }

    // Trigger notes that start on this step
    for (const n of p.notes) {
      if (n.step === stepRef.current) {
        const noteId = `${n.note}${n.octave}`;
        if (!activeNotesRef.current.has(noteId)) {
          callbacksRef.current.noteOn(n.note, n.octave);
          activeNotesRef.current.add(noteId);
        }
      }
    }

    // Schedule note-off for notes reaching end of duration
    for (const n of p.notes) {
      const noteId = `${n.note}${n.octave}`;
      if (activeNotesRef.current.has(noteId) && stepRef.current === (n.step + n.duration - 1) % p.length) {
        // Will be released on next tick via the release check above,
        // unless it's the last step before wrap
        if (n.step + n.duration >= p.length || stepRef.current === p.length - 1) {
          // Release at end of pattern
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isPlaying && preset) {
      callbacksRef.current.setOscillator(preset.oscillator);
      const intervalMs = (60 / bpm / 4) * 1000;
      stepRef.current = -1;
      tick();
      intervalRef.current = setInterval(tick, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      releaseAllNotes();
      stepRef.current = -1;
      setCurrentStep(-1);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      releaseAllNotes();
    };
  }, [isPlaying, bpm, preset, tick, releaseAllNotes]);

  return { currentStep };
}
