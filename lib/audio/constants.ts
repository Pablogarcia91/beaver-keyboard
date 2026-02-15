import { KeyMapping, DrumKit, DrumPreset, DrumSequence, MelodyPreset } from '@/lib/types';

// Standard tuning: A4 = 440Hz, octave 4 base frequencies
export const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getFrequency(note: string, octave: number): number {
  const baseFreq = NOTE_FREQUENCIES[note];
  if (!baseFreq) return 440;
  return baseFreq * Math.pow(2, octave - 4);
}

// Lower row (Z-M) = current octave
// Upper row (Q-U) = current octave + 1
export const KEYBOARD_MAP: KeyMapping[] = [
  // Lower octave (relative to current octave)
  { key: 'z', note: 'C', octaveOffset: 0 },
  { key: 's', note: 'C#', octaveOffset: 0 },
  { key: 'x', note: 'D', octaveOffset: 0 },
  { key: 'd', note: 'D#', octaveOffset: 0 },
  { key: 'c', note: 'E', octaveOffset: 0 },
  { key: 'v', note: 'F', octaveOffset: 0 },
  { key: 'g', note: 'F#', octaveOffset: 0 },
  { key: 'b', note: 'G', octaveOffset: 0 },
  { key: 'h', note: 'G#', octaveOffset: 0 },
  { key: 'n', note: 'A', octaveOffset: 0 },
  { key: 'j', note: 'A#', octaveOffset: 0 },
  { key: 'm', note: 'B', octaveOffset: 0 },

  // Upper octave (letters only, numbers reserved for drums)
  { key: 'q', note: 'C', octaveOffset: 1 },
  { key: 'w', note: 'D', octaveOffset: 1 },
  { key: 'e', note: 'E', octaveOffset: 1 },
  { key: 'r', note: 'F', octaveOffset: 1 },
  { key: 't', note: 'G', octaveOffset: 1 },
  { key: 'y', note: 'A', octaveOffset: 1 },
  { key: 'u', note: 'B', octaveOffset: 1 },
  { key: 'i', note: 'C', octaveOffset: 2 },
];

// Number keys 1-8 mapped to drum pad indices
export const DRUM_KEY_MAP: Record<string, number> = {
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  '5': 4,
  '6': 5,
  '7': 6,
  '8': 7,
};

export const SHORTCUTS = {
  octaveUp: 'ArrowRight',
  octaveDown: 'ArrowLeft',
  oscillatorCycle: 'Tab',
  record: 'KeyR',        // with Ctrl/Cmd
  stopRecord: 'Escape',
  playLoop: ' ',          // Space
  helpToggle: '?',
  volumeUp: 'ArrowUp',
  volumeDown: 'ArrowDown',
} as const;

export const OSCILLATOR_TYPES = ['sine', 'square', 'sawtooth', 'triangle'] as const;
export const OSCILLATOR_LABELS: Record<string, string> = {
  sine: 'SIN',
  square: 'SQR',
  sawtooth: 'SAW',
  triangle: 'TRI',
};

export const MIN_OCTAVE = 1;
export const MAX_OCTAVE = 7;
export const DEFAULT_OCTAVE = 3;

export const DEFAULT_ENVELOPE = {
  attack: 0.01,
  decay: 0.3,
  sustain: 0.7,
  release: 0.3,
};

export const DEFAULT_EFFECTS = {
  reverbMix: 0.2,
  delayTime: 0.3,
  delayFeedback: 0.3,
  delayMix: 0,
  filterFrequency: 8000,
  filterResonance: 1,
  filterType: 'lowpass' as BiquadFilterType,
};

// Drum kit definitions
export const DRUM_KITS: DrumKit[] = [
  {
    id: '808',
    name: '808',
    instruments: [
      { id: 'kick', name: 'Kick', color: '#FF6B35' },
      { id: 'snare', name: 'Snare', color: '#4ECB71' },
      { id: 'hihat-closed', name: 'HH Closed', color: '#4DABF7' },
      { id: 'hihat-open', name: 'HH Open', color: '#888' },
      { id: 'clap', name: 'Clap', color: '#FF6B35' },
      { id: 'tom-low', name: 'Tom Low', color: '#4ECB71' },
      { id: 'tom-mid', name: 'Tom Mid', color: '#4DABF7' },
      { id: 'tom-high', name: 'Tom High', color: '#888' },
    ],
  },
  {
    id: 'acoustic',
    name: 'Acoustic',
    instruments: [
      { id: 'kick', name: 'Kick', color: '#FF6B35' },
      { id: 'snare', name: 'Snare', color: '#4ECB71' },
      { id: 'hihat-closed', name: 'HH Closed', color: '#4DABF7' },
      { id: 'hihat-open', name: 'HH Open', color: '#888' },
      { id: 'clap', name: 'Clap', color: '#FF6B35' },
      { id: 'ride', name: 'Ride', color: '#4ECB71' },
      { id: 'crash', name: 'Crash', color: '#4DABF7' },
      { id: 'rim', name: 'Rim', color: '#888' },
    ],
  },
  {
    id: 'electronic',
    name: 'Electronic',
    instruments: [
      { id: 'kick', name: 'Kick', color: '#FF6B35' },
      { id: 'snare', name: 'Snare', color: '#4ECB71' },
      { id: 'hihat-closed', name: 'HH Closed', color: '#4DABF7' },
      { id: 'hihat-open', name: 'HH Open', color: '#888' },
      { id: 'clap', name: 'Clap', color: '#FF6B35' },
      { id: 'perc-1', name: 'Perc 1', color: '#4ECB71' },
      { id: 'perc-2', name: 'Perc 2', color: '#4DABF7' },
      { id: 'fx', name: 'FX', color: '#888' },
    ],
  },
];

export function createEmptyDrumSequence(kit: DrumKit): Record<string, boolean[]> {
  const sequence: Record<string, boolean[]> = {};
  for (const inst of kit.instruments) {
    sequence[inst.id] = new Array(16).fill(false);
  }
  return sequence;
}

// Helper: convert step indices to 16-step boolean array
function steps(...active: number[]): boolean[] {
  const arr = new Array(16).fill(false);
  for (const s of active) arr[s] = true;
  return arr;
}

// Helper: build a full DrumSequence for a kit, filling missing instruments with empty
function buildPattern(kitId: string, partial: Record<string, boolean[]>): DrumSequence {
  const kit = DRUM_KITS.find((k) => k.id === kitId)!;
  const seq: DrumSequence = {};
  for (const inst of kit.instruments) {
    seq[inst.id] = partial[inst.id] ?? new Array(16).fill(false);
  }
  return seq;
}

export const DRUM_PRESETS: DrumPreset[] = [
  {
    id: 'basic-rock',
    name: 'Rock',
    kitId: 'acoustic',
    bpm: 120,
    pattern: buildPattern('acoustic', {
      'kick':         steps(0, 8),
      'snare':        steps(4, 12),
      'hihat-closed': steps(0, 2, 4, 6, 8, 10, 12, 14),
    }),
  },
  {
    id: 'hip-hop',
    name: 'Hip Hop',
    kitId: '808',
    bpm: 90,
    pattern: buildPattern('808', {
      'kick':         steps(0, 3, 7, 10),
      'snare':        steps(4, 12),
      'hihat-closed': steps(0, 2, 4, 6, 8, 10, 12, 14),
      'hihat-open':   steps(5, 13),
    }),
  },
  {
    id: 'house',
    name: 'House',
    kitId: 'electronic',
    bpm: 128,
    pattern: buildPattern('electronic', {
      'kick':         steps(0, 4, 8, 12),
      'clap':         steps(4, 12),
      'hihat-closed': steps(2, 6, 10, 14),
      'hihat-open':   steps(3, 11),
      'perc-1':       steps(0, 7, 14),
    }),
  },
  {
    id: 'reggaeton',
    name: 'Reggaeton',
    kitId: '808',
    bpm: 95,
    pattern: buildPattern('808', {
      'kick':         steps(0, 3, 4, 7, 8, 11, 12, 15),
      'snare':        steps(3, 7, 11, 15),
      'hihat-closed': steps(0, 2, 4, 6, 8, 10, 12, 14),
      'clap':         steps(4, 12),
    }),
  },
  {
    id: 'bossa-nova',
    name: 'Bossa Nova',
    kitId: 'acoustic',
    bpm: 140,
    pattern: buildPattern('acoustic', {
      'kick':         steps(0, 3, 6, 10),
      'rim':          steps(2, 5, 8, 11, 14),
      'hihat-closed': steps(0, 2, 4, 6, 8, 10, 12, 14),
      'snare':        steps(12),
    }),
  },
  {
    id: 'trap',
    name: 'Trap',
    kitId: '808',
    bpm: 140,
    pattern: buildPattern('808', {
      'kick':         steps(0, 7, 8),
      'snare':        steps(4, 12),
      'hihat-closed': steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      'hihat-open':   steps(6, 14),
      'clap':         steps(4, 12),
    }),
  },
  {
    id: 'funk',
    name: 'Funk',
    kitId: 'acoustic',
    bpm: 100,
    pattern: buildPattern('acoustic', {
      'kick':         steps(0, 3, 6, 10, 14),
      'snare':        steps(4, 12),
      'hihat-closed': steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      'hihat-open':   steps(7, 15),
      'ride':         steps(0, 4, 8, 12),
    }),
  },
  {
    id: 'disco',
    name: 'Disco',
    kitId: 'electronic',
    bpm: 120,
    pattern: buildPattern('electronic', {
      'kick':         steps(0, 4, 8, 12),
      'snare':        steps(4, 12),
      'hihat-closed': steps(0, 2, 4, 6, 8, 10, 12, 14),
      'hihat-open':   steps(1, 3, 5, 7, 9, 11, 13, 15),
      'clap':         steps(4, 12),
    }),
  },
];

// Melody presets - each note: { step, note, octave, duration (in steps) }
export const MELODY_PRESETS: MelodyPreset[] = [
  {
    id: 'twinkle',
    name: 'Twinkle',
    bpm: 120,
    oscillator: 'sine',
    length: 32,
    notes: [
      { step: 0, note: 'C', octave: 4, duration: 2 },
      { step: 2, note: 'C', octave: 4, duration: 2 },
      { step: 4, note: 'G', octave: 4, duration: 2 },
      { step: 6, note: 'G', octave: 4, duration: 2 },
      { step: 8, note: 'A', octave: 4, duration: 2 },
      { step: 10, note: 'A', octave: 4, duration: 2 },
      { step: 12, note: 'G', octave: 4, duration: 4 },
      { step: 16, note: 'F', octave: 4, duration: 2 },
      { step: 18, note: 'F', octave: 4, duration: 2 },
      { step: 20, note: 'E', octave: 4, duration: 2 },
      { step: 22, note: 'E', octave: 4, duration: 2 },
      { step: 24, note: 'D', octave: 4, duration: 2 },
      { step: 26, note: 'D', octave: 4, duration: 2 },
      { step: 28, note: 'C', octave: 4, duration: 4 },
    ],
  },
  {
    id: 'synth-arp',
    name: 'Synth Arp',
    bpm: 130,
    oscillator: 'sawtooth',
    length: 16,
    notes: [
      { step: 0, note: 'C', octave: 4, duration: 1 },
      { step: 1, note: 'E', octave: 4, duration: 1 },
      { step: 2, note: 'G', octave: 4, duration: 1 },
      { step: 3, note: 'C', octave: 5, duration: 1 },
      { step: 4, note: 'G', octave: 4, duration: 1 },
      { step: 5, note: 'E', octave: 4, duration: 1 },
      { step: 6, note: 'C', octave: 4, duration: 1 },
      { step: 7, note: 'G', octave: 3, duration: 1 },
      { step: 8, note: 'A', octave: 3, duration: 1 },
      { step: 9, note: 'C', octave: 4, duration: 1 },
      { step: 10, note: 'E', octave: 4, duration: 1 },
      { step: 11, note: 'A', octave: 4, duration: 1 },
      { step: 12, note: 'E', octave: 4, duration: 1 },
      { step: 13, note: 'C', octave: 4, duration: 1 },
      { step: 14, note: 'A', octave: 3, duration: 1 },
      { step: 15, note: 'E', octave: 3, duration: 1 },
    ],
  },
  {
    id: 'bass-line',
    name: 'Bass Line',
    bpm: 110,
    oscillator: 'square',
    length: 16,
    notes: [
      { step: 0, note: 'C', octave: 3, duration: 2 },
      { step: 2, note: 'C', octave: 3, duration: 1 },
      { step: 4, note: 'E', octave: 3, duration: 2 },
      { step: 6, note: 'G', octave: 3, duration: 1 },
      { step: 8, note: 'A', octave: 3, duration: 2 },
      { step: 10, note: 'A', octave: 3, duration: 1 },
      { step: 12, note: 'G', octave: 3, duration: 2 },
      { step: 14, note: 'F', octave: 3, duration: 2 },
    ],
  },
  {
    id: 'minor-melody',
    name: 'Minor',
    bpm: 100,
    oscillator: 'triangle',
    length: 32,
    notes: [
      { step: 0, note: 'A', octave: 4, duration: 2 },
      { step: 2, note: 'B', octave: 4, duration: 2 },
      { step: 4, note: 'C', octave: 5, duration: 4 },
      { step: 8, note: 'B', octave: 4, duration: 2 },
      { step: 10, note: 'A', octave: 4, duration: 2 },
      { step: 12, note: 'G', octave: 4, duration: 4 },
      { step: 16, note: 'F', octave: 4, duration: 2 },
      { step: 18, note: 'E', octave: 4, duration: 2 },
      { step: 20, note: 'D', octave: 4, duration: 4 },
      { step: 24, note: 'E', octave: 4, duration: 2 },
      { step: 26, note: 'F', octave: 4, duration: 2 },
      { step: 28, note: 'E', octave: 4, duration: 4 },
    ],
  },
  {
    id: 'techno-seq',
    name: 'Techno',
    bpm: 135,
    oscillator: 'sawtooth',
    length: 16,
    notes: [
      { step: 0, note: 'C', octave: 3, duration: 1 },
      { step: 2, note: 'C', octave: 3, duration: 1 },
      { step: 3, note: 'D#', octave: 3, duration: 1 },
      { step: 4, note: 'C', octave: 3, duration: 1 },
      { step: 6, note: 'C', octave: 3, duration: 1 },
      { step: 7, note: 'A#', octave: 2, duration: 1 },
      { step: 8, note: 'C', octave: 3, duration: 1 },
      { step: 10, note: 'C', octave: 3, duration: 1 },
      { step: 11, note: 'D#', octave: 3, duration: 1 },
      { step: 12, note: 'F', octave: 3, duration: 1 },
      { step: 13, note: 'D#', octave: 3, duration: 1 },
      { step: 14, note: 'C', octave: 3, duration: 1 },
      { step: 15, note: 'A#', octave: 2, duration: 1 },
    ],
  },
  {
    id: 'happy-scale',
    name: 'Major Scale',
    bpm: 120,
    oscillator: 'sine',
    length: 16,
    notes: [
      { step: 0, note: 'C', octave: 4, duration: 2 },
      { step: 2, note: 'D', octave: 4, duration: 2 },
      { step: 4, note: 'E', octave: 4, duration: 2 },
      { step: 6, note: 'F', octave: 4, duration: 2 },
      { step: 8, note: 'G', octave: 4, duration: 2 },
      { step: 10, note: 'A', octave: 4, duration: 2 },
      { step: 12, note: 'B', octave: 4, duration: 2 },
      { step: 14, note: 'C', octave: 5, duration: 2 },
    ],
  },
];

// OP-1 accent colors
export const OP1_COLORS = {
  orange: '#FF6B35',
  green: '#4ECB71',
  blue: '#4DABF7',
  white: '#888',
  red: '#FF4444',
  chassis: '#1a1a1a',
  screen: '#0a0a0a',
} as const;
