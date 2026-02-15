'use client';

import { useState, useCallback, useEffect } from 'react';
import { SynthProvider } from '@/contexts/synth-context';
import { TransportProvider } from '@/contexts/transport-context';
import { DeviceFrame } from './device-frame';
import { TransportBar } from './transport-bar';
import { DisplayScreen } from './display-screen';
import { KeyboardSection } from './keyboard-section';
import { ControlPanel } from './control-panel';
import { DrumMachine } from './drum-machine';
import { MelodyPlayer } from './melody-player';
import { LoopRecorder } from './loop-recorder';
import { SynthKeyboardHandler } from './synth-keyboard-handler';
import { TutorialOverlay } from './tutorial-overlay';
import { useTheme } from '@/contexts/theme-context';
import { TutorialProvider, useTutorial } from '@/contexts/tutorial-context';
import { DifficultyLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

const LEVEL_KEY = 'beaver-keyboard-level';

const LEVELS: { id: DifficultyLevel; label: string; activeColor: string; activeBorder: string }[] = [
  { id: 'basic', label: 'Basic', activeColor: 'text-op1-green', activeBorder: 'border-op1-green' },
  { id: 'intermediate', label: 'Intermediate', activeColor: 'text-op1-blue', activeBorder: 'border-op1-blue' },
  { id: 'expert', label: 'Expert', activeColor: 'text-op1-orange', activeBorder: 'border-op1-orange' },
];

export function Synthesizer() {
  const [level, setLevel] = useState<DifficultyLevel>('basic');

  // Load saved level
  useEffect(() => {
    const saved = localStorage.getItem(LEVEL_KEY) as DifficultyLevel | null;
    if (saved && ['basic', 'intermediate', 'expert'].includes(saved)) {
      setLevel(saved);
    }
  }, []);

  const handleSetLevel = useCallback((newLevel: DifficultyLevel) => {
    setLevel(newLevel);
    localStorage.setItem(LEVEL_KEY, newLevel);
  }, []);

  return (
    <SynthProvider>
      <TransportProvider>
        <TutorialProvider level={level}>
          <SynthesizerInner level={level} onSetLevel={handleSetLevel} />
        </TutorialProvider>
      </TransportProvider>
    </SynthProvider>
  );
}

interface SynthesizerInnerProps {
  level: DifficultyLevel;
  onSetLevel: (level: DifficultyLevel) => void;
}

function SynthesizerInner({ level, onSetLevel }: SynthesizerInnerProps) {
  const { theme, toggleTheme } = useTheme();
  const { startTutorial, hasSeenTutorial, isActive: tutorialActive } = useTutorial();
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = useCallback(() => {
    setShowHelp((prev) => !prev);
  }, []);

  const showIntermediate = level === 'intermediate' || level === 'expert';
  const showExpert = level === 'expert';

  return (
    <>
      <SynthKeyboardHandler onHelpToggle={toggleHelp} />

      {/* Top bar: level selector + tutorial + theme */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-device-text-muted font-mono text-[10px] tracking-wider">
            Musician level:
          </span>
          <div className="flex border border-device-border rounded-md overflow-hidden">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => onSetLevel(l.id)}
                className={cn(
                  'px-3 py-1 text-[10px] font-mono font-bold tracking-wider transition-colors border-b-2',
                  level === l.id
                    ? `${l.activeColor} ${l.activeBorder} bg-background`
                    : 'text-device-text-muted border-transparent hover:text-foreground/70'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tutorial button */}
          {hasSeenTutorial && !tutorialActive && (
            <button
              onClick={startTutorial}
              className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-colors text-op1-green/60 hover:text-op1-green"
            >
              TUTORIAL
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-colors text-device-text-muted hover:text-op1-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
        </div>
      </div>

      <DeviceFrame>
        <TransportBar onHelpToggle={toggleHelp} level={level} />
        <DisplayScreen />

        {showIntermediate && <ControlPanel />}

        <div className="border-t border-device-divider">
          <KeyboardSection />
        </div>

        <DrumMachine level={level} />

        {showExpert && <MelodyPlayer />}

        {showIntermediate && <LoopRecorder />}
      </DeviceFrame>

      {/* Tutorial overlay */}
      <TutorialOverlay />

      {/* Help overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={toggleHelp}
        >
          <div
            className="bg-op1-chassis border border-device-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-op1-orange font-mono text-lg font-bold">
                BEAVER KEYBOARD
              </h2>
              <button
                onClick={toggleHelp}
                className="text-device-text-muted hover:text-foreground text-lg font-mono"
              >
                x
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <section>
                <h3 className="text-op1-green mb-2 text-sm">KEYBOARD - NOTES</h3>
                <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                  <span>Z X C V B N M</span>
                  <span className="text-op1-white">C D E F G A B (lower oct)</span>
                  <span>S D G H J</span>
                  <span className="text-op1-white">C# D# F# G# A# (lower oct)</span>
                  <span>Q W E R T Y U I</span>
                  <span className="text-op1-white">C D E F G A B C (upper oct)</span>
                </div>
              </section>

              {showIntermediate && (
                <section>
                  <h3 className="text-op1-blue mb-2 text-sm">NAVIGATION</h3>
                  <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                    <span>Arrow Left / Right</span>
                    <span className="text-op1-white">Change octave</span>
                    <span>Arrow Up / Down</span>
                    <span className="text-op1-white">Volume +/-</span>
                    <span>Tab</span>
                    <span className="text-op1-white">Cycle oscillator type</span>
                    <span>?</span>
                    <span className="text-op1-white">Toggle this help</span>
                  </div>
                </section>
              )}

              {showIntermediate && (
                <section>
                  <h3 className="text-op1-orange mb-2 text-sm">SYNTH</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p className="text-op1-white">4 oscillator types: SIN, SQR, SAW, TRI</p>
                    <p>Drag <span className="text-op1-orange">knobs</span> vertically to adjust</p>
                    <p><span className="text-op1-orange">FILTER</span> cutoff | <span className="text-op1-green">RES</span> resonance | <span className="text-op1-blue">DELAY</span> mix | <span className="text-op1-white">VOL</span> master</p>
                    <p>ADSR sliders shape the note envelope</p>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-op1-red mb-2 text-sm">DRUMS</h3>
                <div className="text-muted-foreground space-y-1">
                  <p>Keys <span className="text-op1-white">1-8</span> trigger drum pads</p>
                  {showIntermediate && <p>Click pads or grid steps to program a 16-step sequence</p>}
                  <p>3 kits: <span className="text-op1-white">808, Acoustic, Electronic</span></p>
                  {showIntermediate && <p>Adjust BPM with +/- buttons</p>}
                </div>
              </section>

              {showIntermediate && (
                <section>
                  <h3 className="text-op1-red mb-2 text-sm">LOOPS</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Click the red circle to start/stop recording</p>
                    <p>Records everything: synth + drums</p>
                    <p>Play loops on repeat, download as .webm</p>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-device-text-dim mb-2 text-sm">TIPS</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Click oscilloscope to toggle waveform/spectrum</li>
                  <li>Click or touch piano keys to play with mouse</li>
                  <li>Two keyboard rows = two octaves at once</li>
                  {showIntermediate && <li>All sounds route through the filter + delay</li>}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
