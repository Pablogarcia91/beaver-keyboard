'use client';

import { useSynthContext } from '@/contexts/synth-context';
import {
  OSCILLATOR_TYPES,
  OSCILLATOR_LABELS,
  MIN_OCTAVE,
  MAX_OCTAVE,
} from '@/lib/audio/constants';
import { OscillatorType, DifficultyLevel } from '@/lib/types';
import { emitTutorialEvent } from '@/lib/tutorial-events';

interface TransportBarProps {
  onHelpToggle: () => void;
  level?: DifficultyLevel;
}

export function TransportBar({ onHelpToggle, level = 'expert' }: TransportBarProps) {
  const { state, dispatch, setOscillator } = useSynthContext();

  const showOscillator = level !== 'basic';
  const showOctave = level !== 'basic';

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-device-border">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span className="text-op1-orange font-mono text-sm font-bold tracking-wider">
          BEAVER
        </span>
        <span className="text-device-text-dim font-mono text-[10px]">SYNTH</span>
      </div>

      {/* Center: Oscillator type selector */}
      {showOscillator && (
        <div className="flex items-center gap-1">
          {OSCILLATOR_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setOscillator(type as OscillatorType)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                state.oscillatorType === type
                  ? 'bg-op1-green text-black font-bold'
                  : 'text-device-text-muted hover:text-foreground/60'
              }`}
            >
              {OSCILLATOR_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {/* Right: Octave + help */}
      <div className="flex items-center gap-3">
        {showOctave && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: 'SHIFT_OCTAVE', payload: -1 })}
              disabled={state.octave <= MIN_OCTAVE}
              className="text-device-text-muted hover:text-op1-blue disabled:text-device-border text-sm font-mono px-1"
            >
              -
            </button>
            <span className="font-mono text-xs text-op1-blue w-12 text-center">
              OCT {state.octave}
            </span>
            <button
              onClick={() => dispatch({ type: 'SHIFT_OCTAVE', payload: 1 })}
              disabled={state.octave >= MAX_OCTAVE}
              className="text-device-text-muted hover:text-op1-blue disabled:text-device-border text-sm font-mono px-1"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={() => { onHelpToggle(); emitTutorialEvent('help-toggle'); }}
          className="w-6 h-6 rounded-full border border-device-border text-device-text-muted hover:text-op1-white hover:border-device-text-muted text-xs font-mono flex items-center justify-center transition-colors"
        >
          ?
        </button>
      </div>
    </div>
  );
}
