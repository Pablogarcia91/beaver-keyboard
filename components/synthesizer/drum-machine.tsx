'use client';

import { useEffect, useMemo } from 'react';
import { useTransportContext } from '@/contexts/transport-context';
import { useSynthContext } from '@/contexts/synth-context';
import { useDrumSequencer } from '@/hooks/use-drum-sequencer';
import { DrumPad } from './drum-pad';
import { DRUM_KITS, DRUM_PRESETS, OP1_COLORS } from '@/lib/audio/constants';
import { DrumSampler } from '@/lib/audio/drum-sampler';
import { DifficultyLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DrumMachineProps {
  level?: DifficultyLevel;
}

export function DrumMachine({ level = 'expert' }: DrumMachineProps) {
  const { state: transportState, dispatch, playDrumHit, setSampler } = useTransportContext();
  const { engine, initAudio } = useSynthContext();

  const currentKit = DRUM_KITS.find((k) => k.id === transportState.drumKit) ?? DRUM_KITS[0];

  const showSequencer = level !== 'basic';
  const showPresets = level === 'expert';
  const showBpm = level !== 'basic';

  // Memoize drum sampler to avoid recreating on every render
  const sampler = useMemo(() => {
    if (!engine) return null;
    return new DrumSampler(engine.getAudioContext(), engine.getMasterGainNode());
  }, [engine]);

  // Register sampler in transport context
  useEffect(() => {
    if (sampler) {
      setSampler(sampler);
    }
  }, [sampler, setSampler]);

  const { currentStep } = useDrumSequencer(
    sampler,
    transportState.drumSequence,
    transportState.bpm,
    transportState.drumSequencerPlaying,
    transportState.drumKit
  );

  const handlePadHit = (instrumentId: string) => {
    initAudio();
    playDrumHit(instrumentId);
  };

  return (
    <div className="px-4 py-3 border-t border-device-divider">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-op1-orange font-mono text-[10px] font-bold tracking-wider">
          DRUMS
        </span>

        <div className="flex items-center gap-2">
          {/* Kit selector */}
          <div className="flex gap-1">
            {DRUM_KITS.map((kit) => (
              <button
                key={kit.id}
                onClick={() => dispatch({ type: 'SET_DRUM_KIT', payload: kit.id })}
                className={cn(
                  'px-2 py-0.5 rounded text-[9px] font-mono transition-colors',
                  transportState.drumKit === kit.id
                    ? 'bg-op1-orange text-black font-bold'
                    : 'text-device-text-dim hover:text-device-text-muted'
                )}
              >
                {kit.name}
              </button>
            ))}
          </div>

          {/* BPM - hidden in basic */}
          {showBpm && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => dispatch({ type: 'SET_BPM', payload: transportState.bpm - 5 })}
                className="text-device-text-dim hover:text-op1-blue text-xs font-mono"
              >
                -
              </button>
              <span className="text-op1-blue font-mono text-[10px] w-14 text-center">
                {transportState.bpm} BPM
              </span>
              <button
                onClick={() => dispatch({ type: 'SET_BPM', payload: transportState.bpm + 5 })}
                className="text-device-text-dim hover:text-op1-blue text-xs font-mono"
              >
                +
              </button>
            </div>
          )}

          {/* Play/Stop - hidden in basic */}
          {showSequencer && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DRUM_SEQUENCER' })}
              className={cn(
                'px-2 py-0.5 rounded text-[9px] font-mono font-bold',
                transportState.drumSequencerPlaying
                  ? 'bg-op1-red text-white'
                  : 'bg-op1-green text-black'
              )}
            >
              {transportState.drumSequencerPlaying ? 'STOP' : 'PLAY'}
            </button>
          )}

          {/* Clear - hidden in basic */}
          {showSequencer && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_DRUM_SEQUENCE' })}
              className="text-device-text-dim hover:text-op1-red text-[9px] font-mono"
            >
              CLR
            </button>
          )}
        </div>
      </div>

      {/* Preset selector - expert only */}
      {showPresets && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          <span className="text-device-text-dim font-mono text-[9px] mr-1">PRESETS</span>
          {DRUM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                dispatch({
                  type: 'LOAD_DRUM_PRESET',
                  payload: { kitId: preset.kitId, bpm: preset.bpm, pattern: preset.pattern },
                })
              }
              className="px-1.5 py-0.5 rounded text-[8px] font-mono text-device-text-muted hover:text-op1-green hover:bg-op1-chassis transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      {/* Drum pads - single row */}
      <div className="grid grid-cols-8 gap-1.5 mb-2" style={{ height: '56px' }}>
        {currentKit.instruments.map((inst, index) => (
          <DrumPad
            key={inst.id}
            instrumentId={inst.id}
            name={inst.name}
            color={inst.color}
            keyNumber={index + 1}
            onHit={handlePadHit}
          />
        ))}
      </div>

      {/* Step sequencer grid - hidden in basic */}
      {showSequencer && (
        <div className="overflow-x-auto">
          <div className="min-w-[320px]">
            {currentKit.instruments.map((inst) => (
              <div key={inst.id} className="flex items-center gap-0.5 mb-0.5">
                <span
                  className="w-8 text-[7px] font-mono truncate shrink-0"
                  style={{ color: inst.color }}
                >
                  {inst.name}
                </span>
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length: 16 }).map((_, step) => {
                    const isActive = transportState.drumSequence[inst.id]?.[step] ?? false;
                    const isCurrent = step === currentStep;
                    const isDownbeat = step % 4 === 0;

                    return (
                      <button
                        key={step}
                        onClick={() =>
                          dispatch({
                            type: 'TOGGLE_DRUM_STEP',
                            payload: { instrument: inst.id, step },
                          })
                        }
                        className={cn(
                          'seq-step flex-1 h-3 rounded-sm cursor-pointer border',
                          isCurrent && 'active',
                          isActive
                            ? 'border-transparent'
                            : isDownbeat
                            ? 'border-device-border bg-device-step-beat'
                            : 'border-device-divider bg-device-step-bg'
                        )}
                        style={
                          isActive
                            ? {
                                backgroundColor: inst.color,
                                boxShadow: isCurrent ? `0 0 6px ${inst.color}` : 'none',
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
