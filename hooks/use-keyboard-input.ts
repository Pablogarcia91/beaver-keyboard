'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSynthContext } from '@/contexts/synth-context';
import { useTransportContext } from '@/contexts/transport-context';
import { KEYBOARD_MAP, DRUM_KEY_MAP, DRUM_KITS } from '@/lib/audio/constants';
import { emitTutorialEvent } from '@/lib/tutorial-events';

interface UseKeyboardInputOptions {
  onHelpToggle?: () => void;
  enabled?: boolean;
}

export function useKeyboardInput({ onHelpToggle, enabled = true }: UseKeyboardInputOptions = {}) {
  const { state, noteOn, noteOff, cycleOscillator, dispatch, initAudio, setVolume } =
    useSynthContext();
  const { state: transportState, playDrumHit } = useTransportContext();
  const pressedKeys = useRef<Set<string>>(new Set());
  const stateRef = useRef(state);
  stateRef.current = state;
  const transportRef = useRef(transportState);
  transportRef.current = transportState;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Prevent key repeat
      if (pressedKeys.current.has(key)) return;

      // Init audio on first interaction
      initAudio();

      // Check for shortcuts first
      if (e.key === '?') {
        e.preventDefault();
        onHelpToggle?.();
        emitTutorialEvent('help-toggle');
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        cycleOscillator();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        dispatch({ type: 'SHIFT_OCTAVE', payload: -1 });
        emitTutorialEvent('octave-shift');
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        dispatch({ type: 'SHIFT_OCTAVE', payload: 1 });
        emitTutorialEvent('octave-shift');
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(1, stateRef.current.masterVolume + 0.05));
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(0, stateRef.current.masterVolume - 0.05));
        return;
      }

      // Check for drum pad keys (1-8)
      const drumIndex = DRUM_KEY_MAP[e.key];
      if (drumIndex !== undefined) {
        e.preventDefault();
        pressedKeys.current.add(key);
        const kit = DRUM_KITS.find((k) => k.id === transportRef.current.drumKit);
        if (kit && kit.instruments[drumIndex]) {
          playDrumHit(kit.instruments[drumIndex].id);
        }
        return;
      }

      // Find note mapping
      const mapping = KEYBOARD_MAP.find((m) => m.key === key);
      if (mapping) {
        e.preventDefault();
        pressedKeys.current.add(key);
        const octave = stateRef.current.octave + mapping.octaveOffset;
        noteOn(mapping.note, octave);
      }
    },
    [initAudio, onHelpToggle, cycleOscillator, dispatch, noteOn, setVolume, playDrumHit]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeys.current.delete(key);

      const mapping = KEYBOARD_MAP.find((m) => m.key === key);
      if (mapping) {
        const octave = stateRef.current.octave + mapping.octaveOffset;
        noteOff(mapping.note, octave);
      }
    },
    [noteOff]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, enabled]);

  return { pressedKeys: pressedKeys.current };
}
