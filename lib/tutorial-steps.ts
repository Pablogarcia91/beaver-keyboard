import { DifficultyLevel } from './types';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  completionEvent: string;
  level: DifficultyLevel;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // Basic
  {
    id: 'play-note',
    title: 'Play your first note',
    description: 'Press the Z key on your keyboard to play a C note.',
    completionEvent: 'note-played',
    level: 'basic',
  },
  {
    id: 'play-more-notes',
    title: 'Play a melody',
    description: 'Try pressing X, C, V, B, N, M to play more notes. Each key is a different note!',
    completionEvent: 'notes-multiple',
    level: 'basic',
  },
  {
    id: 'drum-hit',
    title: 'Hit a drum pad',
    description: 'Click one of the colorful drum pads, or press keys 1-8.',
    completionEvent: 'drum-hit',
    level: 'basic',
  },
  {
    id: 'help-toggle',
    title: 'Open the help menu',
    description: 'Press the ? key or click the ? button to see all shortcuts.',
    completionEvent: 'help-toggle',
    level: 'basic',
  },

  // Intermediate
  {
    id: 'octave-shift',
    title: 'Change the octave',
    description: 'Use the left/right arrow keys to shift the octave up or down.',
    completionEvent: 'octave-shift',
    level: 'intermediate',
  },
  {
    id: 'filter-change',
    title: 'Tweak the filter',
    description: 'Drag the orange FILTER knob upward to change the cutoff frequency.',
    completionEvent: 'filter-change',
    level: 'intermediate',
  },
  {
    id: 'drum-sequencer',
    title: 'Use the step sequencer',
    description: 'Click on a step in the sequencer grid, then press PLAY to hear your pattern.',
    completionEvent: 'drum-step-play',
    level: 'intermediate',
  },
  {
    id: 'recording-start',
    title: 'Record a loop',
    description: 'Click the red circle button in the LOOPS section to start recording.',
    completionEvent: 'recording-start',
    level: 'intermediate',
  },

  // Expert
  {
    id: 'melody-play',
    title: 'Play a melody preset',
    description: 'Select a melody preset and press PLAY to hear a predefined sequence.',
    completionEvent: 'melody-play',
    level: 'expert',
  },
  {
    id: 'oscillator-cycle',
    title: 'Change the oscillator',
    description: 'Press Tab to cycle through oscillator types: SIN, SQR, SAW, TRI.',
    completionEvent: 'oscillator-cycle',
    level: 'expert',
  },
];

export function getStepsForLevel(level: DifficultyLevel): TutorialStep[] {
  const levelOrder: DifficultyLevel[] = ['basic', 'intermediate', 'expert'];
  const maxIndex = levelOrder.indexOf(level);
  return TUTORIAL_STEPS.filter(
    (step) => levelOrder.indexOf(step.level) <= maxIndex
  );
}
