'use client';

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import {
  SynthState,
  SynthAction,
  OscillatorType,
  ADSREnvelope,
  EffectsConfig,
} from '@/lib/types';
import {
  DEFAULT_ENVELOPE,
  DEFAULT_EFFECTS,
  DEFAULT_OCTAVE,
  MIN_OCTAVE,
  MAX_OCTAVE,
  OSCILLATOR_TYPES,
} from '@/lib/audio/constants';
import { SynthEngine } from '@/lib/audio/synth-engine';
import { getFrequency } from '@/lib/audio/constants';
import { emitTutorialEvent } from '@/lib/tutorial-events';

const initialState: SynthState = {
  oscillatorType: 'sawtooth',
  octave: DEFAULT_OCTAVE,
  envelope: DEFAULT_ENVELOPE,
  effects: DEFAULT_EFFECTS,
  masterVolume: 0.5,
  activeNotes: new Set<string>(),
};

function synthReducer(state: SynthState, action: SynthAction): SynthState {
  switch (action.type) {
    case 'SET_OSCILLATOR':
      return { ...state, oscillatorType: action.payload };
    case 'SET_OCTAVE':
      return {
        ...state,
        octave: Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, action.payload)),
      };
    case 'SHIFT_OCTAVE':
      return {
        ...state,
        octave: Math.max(
          MIN_OCTAVE,
          Math.min(MAX_OCTAVE, state.octave + action.payload)
        ),
      };
    case 'SET_ENVELOPE':
      return { ...state, envelope: { ...state.envelope, ...action.payload } };
    case 'SET_EFFECTS':
      return { ...state, effects: { ...state.effects, ...action.payload } };
    case 'SET_VOLUME':
      return {
        ...state,
        masterVolume: Math.max(0, Math.min(1, action.payload)),
      };
    case 'NOTE_ON': {
      const newNotes = new Set(state.activeNotes);
      newNotes.add(action.payload);
      return { ...state, activeNotes: newNotes };
    }
    case 'NOTE_OFF': {
      const newNotes = new Set(state.activeNotes);
      newNotes.delete(action.payload);
      return { ...state, activeNotes: newNotes };
    }
    default:
      return state;
  }
}

interface SynthContextValue {
  state: SynthState;
  dispatch: React.Dispatch<SynthAction>;
  engine: SynthEngine | null;
  initAudio: () => Promise<void>;
  noteOn: (note: string, octave: number) => void;
  noteOff: (note: string, octave: number) => void;
  cycleOscillator: () => void;
  setOscillator: (type: OscillatorType) => void;
  setEnvelope: (envelope: Partial<ADSREnvelope>) => void;
  setEffects: (effects: Partial<EffectsConfig>) => void;
  setVolume: (volume: number) => void;
}

const SynthContext = createContext<SynthContextValue | null>(null);

export function SynthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(synthReducer, initialState);
  const engineRef = useRef<SynthEngine | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Use refs to always access latest state in callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      return;
    }
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    engineRef.current = new SynthEngine(ctx);
    engineRef.current.setMasterVolume(stateRef.current.masterVolume);
  }, []);

  const noteOn = useCallback(
    (note: string, octave: number) => {
      const noteId = `${note}${octave}`;
      if (stateRef.current.activeNotes.has(noteId)) return;

      const frequency = getFrequency(note, octave);
      engineRef.current?.noteOn(
        noteId,
        frequency,
        stateRef.current.oscillatorType,
        stateRef.current.envelope
      );
      dispatch({ type: 'NOTE_ON', payload: noteId });
      emitTutorialEvent('note-played');
    },
    []
  );

  const noteOff = useCallback(
    (note: string, octave: number) => {
      const noteId = `${note}${octave}`;
      engineRef.current?.noteOffWithEnvelope(noteId, stateRef.current.envelope);
      dispatch({ type: 'NOTE_OFF', payload: noteId });
    },
    []
  );

  const cycleOscillator = useCallback(() => {
    const currentIndex = OSCILLATOR_TYPES.indexOf(
      stateRef.current.oscillatorType as typeof OSCILLATOR_TYPES[number]
    );
    const nextIndex = (currentIndex + 1) % OSCILLATOR_TYPES.length;
    dispatch({ type: 'SET_OSCILLATOR', payload: OSCILLATOR_TYPES[nextIndex] });
    emitTutorialEvent('oscillator-cycle');
  }, []);

  const setOscillator = useCallback((type: OscillatorType) => {
    dispatch({ type: 'SET_OSCILLATOR', payload: type });
  }, []);

  const setEnvelope = useCallback((envelope: Partial<ADSREnvelope>) => {
    dispatch({ type: 'SET_ENVELOPE', payload: envelope });
  }, []);

  const setEffects = useCallback((effects: Partial<EffectsConfig>) => {
    dispatch({ type: 'SET_EFFECTS', payload: effects });
    const engine = engineRef.current;
    if (!engine) return;
    if (effects.filterFrequency !== undefined) {
      engine.setFilterFrequency(effects.filterFrequency);
      emitTutorialEvent('filter-change');
    }
    if (effects.filterResonance !== undefined) engine.setFilterResonance(effects.filterResonance);
    if (effects.filterType !== undefined) engine.setFilterType(effects.filterType);
    if (effects.delayTime !== undefined) engine.setDelayTime(effects.delayTime);
    if (effects.delayFeedback !== undefined) engine.setDelayFeedback(effects.delayFeedback);
    if (effects.delayMix !== undefined) engine.setDelayMix(effects.delayMix);
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
    engineRef.current?.setMasterVolume(volume);
  }, []);

  return (
    <SynthContext.Provider
      value={{
        state,
        dispatch,
        engine: engineRef.current,
        initAudio,
        noteOn,
        noteOff,
        cycleOscillator,
        setOscillator,
        setEnvelope,
        setEffects,
        setVolume,
      }}
    >
      {children}
    </SynthContext.Provider>
  );
}

export function useSynthContext(): SynthContextValue {
  const ctx = useContext(SynthContext);
  if (!ctx) {
    throw new Error('useSynthContext must be used within a SynthProvider');
  }
  return ctx;
}
