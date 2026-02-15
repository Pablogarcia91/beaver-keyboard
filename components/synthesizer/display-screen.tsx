'use client';

import { useSynthContext } from '@/contexts/synth-context';
import { Oscilloscope } from './oscilloscope';
import { OSCILLATOR_LABELS } from '@/lib/audio/constants';

export function DisplayScreen() {
  const { state, engine } = useSynthContext();
  const analyser = engine?.getAnalyserNode() ?? null;

  const activeNotesArray = Array.from(state.activeNotes);
  const currentNote = activeNotesArray.length > 0 ? activeNotesArray[activeNotesArray.length - 1] : '---';

  return (
    <div className="oled-screen border-b border-device-border overflow-hidden h-52">
      <div className="relative h-full">
        <Oscilloscope analyser={analyser} />

        {/* Overlay info */}
        <div className="absolute top-2 left-3 flex items-center gap-3">
          <span className="oled-text text-sm font-bold">
            {currentNote}
          </span>
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-4">
          <span className="oled-text-dim text-[10px]">
            OCT {state.octave}
          </span>
          <span className="oled-text-dim text-[10px]">
            {OSCILLATOR_LABELS[state.oscillatorType]}
          </span>
          <span className="oled-text-dim text-[10px]">
            VOL {Math.round(state.masterVolume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
