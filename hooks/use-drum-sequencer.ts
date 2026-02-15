'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { DrumSampler } from '@/lib/audio/drum-sampler';
import { DrumSequence } from '@/lib/types';

export function useDrumSequencer(
  sampler: DrumSampler | null,
  sequence: DrumSequence,
  bpm: number,
  isPlaying: boolean,
  kitId: string
) {
  const [currentStep, setCurrentStep] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(-1);
  const sequenceRef = useRef(sequence);
  sequenceRef.current = sequence;
  const kitRef = useRef(kitId);
  kitRef.current = kitId;
  const samplerRef = useRef(sampler);
  samplerRef.current = sampler;

  const tick = useCallback(() => {
    if (!samplerRef.current) return;
    stepRef.current = (stepRef.current + 1) % 16;
    setCurrentStep(stepRef.current);

    const seq = sequenceRef.current;
    for (const instrumentId of Object.keys(seq)) {
      if (seq[instrumentId]?.[stepRef.current]) {
        samplerRef.current.play(instrumentId, kitRef.current);
      }
    }
  }, []);

  useEffect(() => {
    if (isPlaying && samplerRef.current) {
      // 16th note interval at given BPM
      const intervalMs = (60 / bpm / 4) * 1000;
      stepRef.current = -1;
      tick(); // play first step immediately
      intervalRef.current = setInterval(tick, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stepRef.current = -1;
      setCurrentStep(-1);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, tick]);

  return { currentStep };
}
