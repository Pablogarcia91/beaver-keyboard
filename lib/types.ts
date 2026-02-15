// Difficulty levels
export type DifficultyLevel = 'basic' | 'intermediate' | 'expert';

// Oscillator types matching Web Audio API
export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

// ADSR envelope parameters (all in seconds except sustain which is 0-1)
export interface ADSREnvelope {
  attack: number;   // 0.001 - 2.0
  decay: number;    // 0.001 - 2.0
  sustain: number;  // 0.0 - 1.0
  release: number;  // 0.001 - 5.0
}

// Effects configuration
export interface EffectsConfig {
  reverbMix: number;
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
  filterFrequency: number;
  filterResonance: number;
  filterType: BiquadFilterType;
}

// Synth state managed by reducer
export interface SynthState {
  oscillatorType: OscillatorType;
  octave: number;
  envelope: ADSREnvelope;
  effects: EffectsConfig;
  masterVolume: number;
  activeNotes: Set<string>;
}

// Actions for synth reducer
export type SynthAction =
  | { type: 'SET_OSCILLATOR'; payload: OscillatorType }
  | { type: 'SET_OCTAVE'; payload: number }
  | { type: 'SHIFT_OCTAVE'; payload: 1 | -1 }
  | { type: 'SET_ENVELOPE'; payload: Partial<ADSREnvelope> }
  | { type: 'SET_EFFECTS'; payload: Partial<EffectsConfig> }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'NOTE_ON'; payload: string }
  | { type: 'NOTE_OFF'; payload: string };

// Transport / recording state
export interface TransportState {
  isRecording: boolean;
  isPlaying: boolean;
  bpm: number;
  loops: LoopRecording[];
  activeLoopIndex: number | null;
  drumKit: string;
  drumSequence: DrumSequence;
  drumSequencerPlaying: boolean;
  melodyPresetId: string | null;
  melodyPlaying: boolean;
}

export type TransportAction =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ADD_LOOP'; payload: LoopRecording }
  | { type: 'DELETE_LOOP'; payload: number }
  | { type: 'SET_ACTIVE_LOOP'; payload: number | null }
  | { type: 'PLAY_LOOP' }
  | { type: 'STOP_LOOP' }
  | { type: 'SET_BPM'; payload: number }
  | { type: 'SET_DRUM_KIT'; payload: string }
  | { type: 'TOGGLE_DRUM_STEP'; payload: { instrument: string; step: number } }
  | { type: 'CLEAR_DRUM_SEQUENCE' }
  | { type: 'TOGGLE_DRUM_SEQUENCER' }
  | { type: 'LOAD_DRUM_PRESET'; payload: { kitId: string; bpm: number; pattern: DrumSequence } }
  | { type: 'SET_MELODY_PRESET'; payload: string | null }
  | { type: 'TOGGLE_MELODY' };

export interface LoopRecording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  createdAt: number;
}

// Drum sequencer: 16-step grid
export interface DrumSequence {
  [instrumentId: string]: boolean[];
}

// Drum kit definition
export interface DrumKit {
  id: string;
  name: string;
  instruments: DrumInstrument[];
}

export interface DrumInstrument {
  id: string;
  name: string;
  color: string;
}

// Drum preset pattern
export interface DrumPreset {
  id: string;
  name: string;
  kitId: string;
  bpm: number;
  pattern: DrumSequence;
}

// Melody note in a sequence (step = 16th note position, duration in steps)
export interface MelodyNote {
  step: number;
  note: string;
  octave: number;
  duration: number; // in steps (1 = 16th note, 4 = quarter note)
}

// Melody preset
export interface MelodyPreset {
  id: string;
  name: string;
  bpm: number;
  oscillator: OscillatorType;
  notes: MelodyNote[];
  length: number; // total steps in the loop (usually 16 or 32)
}

// Key mapping for piano keyboard
export interface KeyMapping {
  key: string;
  note: string;
  octaveOffset: number;
}

// Note with computed frequency
export interface NoteConfig {
  note: string;
  octave: number;
  frequency: number;
  keyBinding?: string;
}
