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
  TransportState,
  TransportAction,
  LoopRecording,
  DrumSequence,
} from '@/lib/types';
import { DRUM_KITS, createEmptyDrumSequence } from '@/lib/audio/constants';
import { DrumSampler } from '@/lib/audio/drum-sampler';
import { emitTutorialEvent } from '@/lib/tutorial-events';

const defaultKit = DRUM_KITS[0];

const initialState: TransportState = {
  isRecording: false,
  isPlaying: false,
  bpm: 120,
  loops: [],
  activeLoopIndex: null,
  drumKit: defaultKit.id,
  drumSequence: createEmptyDrumSequence(defaultKit),
  drumSequencerPlaying: false,
  melodyPresetId: null,
  melodyPlaying: false,
};

function transportReducer(state: TransportState, action: TransportAction): TransportState {
  switch (action.type) {
    case 'START_RECORDING':
      return { ...state, isRecording: true };
    case 'STOP_RECORDING':
      return { ...state, isRecording: false };
    case 'ADD_LOOP':
      return { ...state, loops: [...state.loops, action.payload] };
    case 'DELETE_LOOP': {
      const newLoops = state.loops.filter((_, i) => i !== action.payload);
      // Revoke the object URL
      const deletedLoop = state.loops[action.payload];
      if (deletedLoop) URL.revokeObjectURL(deletedLoop.url);
      return {
        ...state,
        loops: newLoops,
        activeLoopIndex:
          state.activeLoopIndex === action.payload ? null : state.activeLoopIndex,
      };
    }
    case 'SET_ACTIVE_LOOP':
      return { ...state, activeLoopIndex: action.payload };
    case 'PLAY_LOOP':
      return { ...state, isPlaying: true };
    case 'STOP_LOOP':
      return { ...state, isPlaying: false };
    case 'SET_BPM':
      return { ...state, bpm: Math.max(40, Math.min(300, action.payload)) };
    case 'SET_DRUM_KIT': {
      const kit = DRUM_KITS.find((k) => k.id === action.payload);
      if (!kit) return state;
      return {
        ...state,
        drumKit: action.payload,
        drumSequence: createEmptyDrumSequence(kit),
      };
    }
    case 'TOGGLE_DRUM_STEP': {
      const { instrument, step } = action.payload;
      const currentSteps = state.drumSequence[instrument] || new Array(16).fill(false);
      const newSteps = [...currentSteps];
      newSteps[step] = !newSteps[step];
      return {
        ...state,
        drumSequence: { ...state.drumSequence, [instrument]: newSteps },
      };
    }
    case 'CLEAR_DRUM_SEQUENCE': {
      const kit = DRUM_KITS.find((k) => k.id === state.drumKit);
      if (!kit) return state;
      return { ...state, drumSequence: createEmptyDrumSequence(kit) };
    }
    case 'TOGGLE_DRUM_SEQUENCER':
      return { ...state, drumSequencerPlaying: !state.drumSequencerPlaying };
    case 'LOAD_DRUM_PRESET':
      return {
        ...state,
        drumKit: action.payload.kitId,
        bpm: action.payload.bpm,
        drumSequence: action.payload.pattern,
      };
    case 'SET_MELODY_PRESET':
      return { ...state, melodyPresetId: action.payload, melodyPlaying: false };
    case 'TOGGLE_MELODY':
      return { ...state, melodyPlaying: !state.melodyPlaying };
    default:
      return state;
  }
}

interface TransportContextValue {
  state: TransportState;
  dispatch: React.Dispatch<TransportAction>;
  sampler: DrumSampler | null;
  setSampler: (sampler: DrumSampler) => void;
  playDrumHit: (instrumentId: string) => void;
}

const TransportContext = createContext<TransportContextValue | null>(null);

export function TransportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(transportReducer, initialState);
  const samplerRef = useRef<DrumSampler | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setSampler = useCallback((sampler: DrumSampler) => {
    samplerRef.current = sampler;
  }, []);

  const playDrumHit = useCallback((instrumentId: string) => {
    samplerRef.current?.play(instrumentId, stateRef.current.drumKit);
    emitTutorialEvent('drum-hit');
  }, []);

  // Wrap dispatch to emit tutorial events for relevant actions
  const wrappedDispatch = useCallback((action: TransportAction) => {
    dispatch(action);
    switch (action.type) {
      case 'TOGGLE_DRUM_STEP':
        emitTutorialEvent('drum-step-toggled');
        break;
      case 'TOGGLE_DRUM_SEQUENCER':
        // Check if it's turning ON (current state is off)
        if (!stateRef.current.drumSequencerPlaying) {
          emitTutorialEvent('drum-sequencer-play');
        }
        break;
      case 'START_RECORDING':
        emitTutorialEvent('recording-start');
        break;
      case 'TOGGLE_MELODY':
        if (!stateRef.current.melodyPlaying && stateRef.current.melodyPresetId) {
          emitTutorialEvent('melody-play');
        }
        break;
    }
  }, []);

  return (
    <TransportContext.Provider
      value={{
        state,
        dispatch: wrappedDispatch,
        sampler: samplerRef.current,
        setSampler,
        playDrumHit,
      }}
    >
      {children}
    </TransportContext.Provider>
  );
}

export function useTransportContext(): TransportContextValue {
  const ctx = useContext(TransportContext);
  if (!ctx) {
    throw new Error('useTransportContext must be used within a TransportProvider');
  }
  return ctx;
}
