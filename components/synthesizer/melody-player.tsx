'use client';

import { useMemo } from 'react';
import { useTransportContext } from '@/contexts/transport-context';
import { useSynthContext } from '@/contexts/synth-context';
import { useMelodyPlayer } from '@/hooks/use-melody-player';
import { MELODY_PRESETS } from '@/lib/audio/constants';
import { cn } from '@/lib/utils';

export function MelodyPlayer() {
  const { state: transportState, dispatch } = useTransportContext();
  const { noteOn, noteOff, setOscillator, initAudio } = useSynthContext();

  const activePreset = MELODY_PRESETS.find(
    (p) => p.id === transportState.melodyPresetId
  ) ?? null;

  const callbacks = useMemo(
    () => ({ noteOn, noteOff, setOscillator }),
    [noteOn, noteOff, setOscillator]
  );

  const { currentStep } = useMelodyPlayer(
    activePreset,
    activePreset?.bpm ?? transportState.bpm,
    transportState.melodyPlaying,
    callbacks
  );

  const handleSelectPreset = (presetId: string) => {
    initAudio();
    if (transportState.melodyPresetId === presetId) {
      // Toggle off
      dispatch({ type: 'SET_MELODY_PRESET', payload: null });
    } else {
      dispatch({ type: 'SET_MELODY_PRESET', payload: presetId });
    }
  };

  const handleTogglePlay = () => {
    if (!activePreset) return;
    initAudio();
    dispatch({ type: 'TOGGLE_MELODY' });
  };

  // Build the visual note grid for the active preset
  const noteRows = useMemo(() => {
    if (!activePreset) return [];
    // Get unique notes sorted by pitch (high to low)
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const uniqueNotes = [...new Set(activePreset.notes.map((n) => `${n.note}${n.octave}`))];
    uniqueNotes.sort((a, b) => {
      const matchA = a.match(/^([A-G]#?)(\d+)$/);
      const matchB = b.match(/^([A-G]#?)(\d+)$/);
      if (!matchA || !matchB) return 0;
      const octA = parseInt(matchA[2]);
      const octB = parseInt(matchB[2]);
      if (octA !== octB) return octB - octA;
      return noteOrder.indexOf(matchB[1]) - noteOrder.indexOf(matchA[1]);
    });
    return uniqueNotes;
  }, [activePreset]);

  const rowColors = ['#FF6B35', '#4ECB71', '#4DABF7', '#888', '#FF4444', '#4ECB71', '#4DABF7', '#FF6B35', '#888', '#4ECB71', '#FF4444', '#4DABF7'];

  return (
    <div className="px-4 py-3 border-t border-device-divider">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-op1-green font-mono text-[10px] font-bold tracking-wider">
          MELODIES
        </span>

        {activePreset && (
          <div className="flex items-center gap-2">
            <span className="text-device-text-dim font-mono text-[9px]">
              {activePreset.bpm} BPM
            </span>
            <span className="text-device-text-dim font-mono text-[9px] uppercase">
              {activePreset.oscillator}
            </span>
            <button
              onClick={handleTogglePlay}
              className={cn(
                'px-2 py-0.5 rounded text-[9px] font-mono font-bold',
                transportState.melodyPlaying
                  ? 'bg-op1-red text-white'
                  : 'bg-op1-green text-black'
              )}
            >
              {transportState.melodyPlaying ? 'STOP' : 'PLAY'}
            </button>
          </div>
        )}
      </div>

      {/* Preset buttons */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <span className="text-device-text-dim font-mono text-[9px] mr-1">PRESETS</span>
        {MELODY_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.id)}
            className={cn(
              'px-1.5 py-0.5 rounded text-[8px] font-mono transition-colors',
              transportState.melodyPresetId === preset.id
                ? 'bg-op1-green text-black font-bold'
                : 'text-device-text-muted hover:text-op1-green hover:bg-op1-chassis'
            )}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Note grid visualization */}
      {activePreset && (
        <div className="overflow-x-auto">
          <div className="min-w-[320px]">
            {noteRows.map((noteId, rowIndex) => (
              <div key={noteId} className="flex items-center gap-0.5 mb-0.5">
                <span
                  className="w-10 text-[7px] font-mono truncate shrink-0"
                  style={{ color: rowColors[rowIndex % rowColors.length] }}
                >
                  {noteId}
                </span>
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length: activePreset.length }).map((_, step) => {
                    const melodyNote = activePreset.notes.find(
                      (n) =>
                        `${n.note}${n.octave}` === noteId &&
                        step >= n.step &&
                        step < n.step + n.duration
                    );
                    const isNoteStart = activePreset.notes.some(
                      (n) => `${n.note}${n.octave}` === noteId && n.step === step
                    );
                    const isActive = !!melodyNote;
                    const isCurrent = step === currentStep;
                    const isDownbeat = step % 4 === 0;
                    const color = rowColors[rowIndex % rowColors.length];

                    return (
                      <div
                        key={step}
                        className={cn(
                          'flex-1 h-3 rounded-sm border',
                          isActive
                            ? 'border-transparent'
                            : isDownbeat
                            ? 'border-device-border bg-device-step-beat'
                            : 'border-device-divider bg-device-step-bg'
                        )}
                        style={
                          isActive
                            ? {
                                backgroundColor: color,
                                opacity: isNoteStart ? 1 : 0.5,
                                boxShadow: isCurrent ? `0 0 6px ${color}` : 'none',
                              }
                            : isCurrent
                            ? { borderColor: 'var(--device-text-dim)' }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
