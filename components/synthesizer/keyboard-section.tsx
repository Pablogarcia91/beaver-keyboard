'use client';

import { useSynthContext } from '@/contexts/synth-context';
import { KEYBOARD_MAP, NOTE_NAMES } from '@/lib/audio/constants';
import { PianoKey } from './piano-key';

function getKeyboardLayout(baseOctave: number) {
  const keys: {
    note: string;
    octave: number;
    isBlack: boolean;
    keyBinding?: string;
  }[] = [];

  for (let octOffset = 0; octOffset < 2; octOffset++) {
    const octave = baseOctave + octOffset;
    for (const noteName of NOTE_NAMES) {
      const isBlack = noteName.includes('#');
      const mapping = KEYBOARD_MAP.find(
        (m) => m.note === noteName && m.octaveOffset === octOffset
      );
      keys.push({
        note: noteName,
        octave,
        isBlack,
        keyBinding: mapping?.key,
      });
    }
  }
  // Top C
  const topCMapping = KEYBOARD_MAP.find(
    (m) => m.note === 'C' && m.octaveOffset === 2
  );
  keys.push({
    note: 'C',
    octave: baseOctave + 2,
    isBlack: false,
    keyBinding: topCMapping?.key,
  });

  return keys;
}

export function KeyboardSection() {
  const { state, noteOn, noteOff, initAudio } = useSynthContext();

  const handleNoteOn = (note: string, octave: number) => {
    initAudio();
    noteOn(note, octave);
  };

  const handleNoteOff = (note: string, octave: number) => {
    noteOff(note, octave);
  };

  const layout = getKeyboardLayout(state.octave);
  const whiteKeys = layout.filter((k) => !k.isBlack);
  const blackKeys = layout.filter((k) => k.isBlack);
  const totalWhiteKeys = whiteKeys.length;

  function getBlackKeyStyle(note: string, octave: number) {
    const naturalNote = note.replace('#', '');
    const whiteIndex = whiteKeys.findIndex(
      (k) => k.note === naturalNote && k.octave === octave
    );
    const keyWidthPercent = 100 / totalWhiteKeys;
    const leftPercent = (whiteIndex + 1) * keyWidthPercent - keyWidthPercent * 0.3;
    return {
      left: `${leftPercent}%`,
      width: `${keyWidthPercent * 0.6}%`,
    };
  }

  return (
    <div className="py-3 px-1 h-full flex flex-col">
      <div className="relative flex w-full flex-1" style={{ minHeight: '112px' }}>
        {/* White keys - flex-1 fills the width evenly */}
        {whiteKeys.map((key) => (
          <PianoKey
            key={`${key.note}${key.octave}`}
            note={key.note}
            octave={key.octave}
            isBlack={false}
            isActive={state.activeNotes.has(`${key.note}${key.octave}`)}
            keyBinding={key.keyBinding}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
          />
        ))}
        {/* Black keys - positioned as percentages */}
        {blackKeys.map((key) => {
          const style = getBlackKeyStyle(key.note, key.octave);
          return (
            <div
              key={`${key.note}${key.octave}`}
              className="absolute top-0 z-10"
              style={{ left: style.left, width: style.width, height: '72%' }}
            >
              <PianoKey
                note={key.note}
                octave={key.octave}
                isBlack={true}
                isActive={state.activeNotes.has(`${key.note}${key.octave}`)}
                keyBinding={key.keyBinding}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
