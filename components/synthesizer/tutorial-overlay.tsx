'use client';

import { useTutorial } from '@/contexts/tutorial-context';
import { cn } from '@/lib/utils';

export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    completedCount,
    isCompleted,
    startTutorial,
    skipTutorial,
    hasSeenTutorial,
  } = useTutorial();

  // Show completion celebration
  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-op1-chassis border border-device-border rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
          <div className="text-3xl mb-3">&#127881;</div>
          <h2 className="text-op1-green font-mono text-lg font-bold mb-2">
            TUTORIAL COMPLETE!
          </h2>
          <p className="text-device-text-muted font-mono text-xs mb-4">
            You&apos;ve mastered all {completedCount} challenges. Now go make some music!
          </p>
          <button
            onClick={skipTutorial}
            className="px-4 py-2 rounded-full bg-op1-green text-black font-mono text-xs font-bold"
          >
            START PLAYING
          </button>
        </div>
      </div>
    );
  }

  // Show start prompt for first visit
  if (!hasSeenTutorial && !isActive) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-none">
        <div className="pointer-events-auto bg-op1-chassis border border-device-border rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
          <h2 className="text-op1-orange font-mono text-lg font-bold mb-2">
            BEAVER KEYBOARD
          </h2>
          <p className="text-device-text-muted font-mono text-xs mb-4">
            Welcome! Want to take a quick interactive tutorial to learn how to use the synthesizer?
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={startTutorial}
              className="px-4 py-2 rounded-full bg-op1-green text-black font-mono text-xs font-bold"
            >
              START TUTORIAL
            </button>
            <button
              onClick={skipTutorial}
              className="px-4 py-2 rounded-full border border-device-border text-device-text-muted font-mono text-xs font-bold hover:text-foreground"
            >
              SKIP
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active tutorial step
  if (!isActive || !currentStep) return null;

  const progress = totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;

  const levelColor =
    currentStep.level === 'basic'
      ? 'text-op1-green'
      : currentStep.level === 'intermediate'
      ? 'text-op1-blue'
      : 'text-op1-orange';

  const levelBg =
    currentStep.level === 'basic'
      ? 'bg-op1-green'
      : currentStep.level === 'intermediate'
      ? 'bg-op1-blue'
      : 'bg-op1-orange';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-op1-chassis border border-device-border rounded-2xl p-4 shadow-2xl">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-device-divider rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', levelBg)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-device-text-dim font-mono text-[9px] shrink-0">
            {currentStepIndex + 1}/{totalSteps}
          </span>
        </div>

        {/* Step content */}
        <div className="flex items-start gap-3">
          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold', levelBg, 'text-black')}>
            {currentStepIndex + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-mono text-sm font-bold mb-1', levelColor)}>
              {currentStep.title}
            </h3>
            <p className="text-device-text-muted font-mono text-[11px] leading-relaxed">
              {currentStep.description}
            </p>
          </div>
          <button
            onClick={skipTutorial}
            className="text-device-text-dim hover:text-foreground text-xs font-mono shrink-0 ml-2"
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
}
