'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { DifficultyLevel } from '@/lib/types';
import { TutorialStep, getStepsForLevel } from '@/lib/tutorial-steps';
import { subscribeTutorialEvents } from '@/lib/tutorial-events';

const STORAGE_KEY = 'beaver-keyboard-tutorial';

interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  completedStepIds: string[];
  hasSeenTutorial: boolean;
}

interface TutorialContextValue {
  isActive: boolean;
  currentStep: TutorialStep | null;
  steps: TutorialStep[];
  currentStepIndex: number;
  totalSteps: number;
  completedCount: number;
  isCompleted: boolean;
  startTutorial: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
  hasSeenTutorial: boolean;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

const defaultState: TutorialState = {
  isActive: false,
  currentStepIndex: 0,
  completedStepIds: [],
  hasSeenTutorial: false,
};

function saveState(state: TutorialState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

interface TutorialProviderProps {
  children: ReactNode;
  level: DifficultyLevel;
}

export function TutorialProvider({ children, level }: TutorialProviderProps) {
  const [state, setState] = useState<TutorialState>(defaultState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const steps = getStepsForLevel(level);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // Notes counter for the "play multiple notes" challenge
  const noteCountRef = useRef(0);

  // Track drum step added (for compound sequencer challenge)
  const drumStepAddedRef = useRef(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TutorialState;
        setState(parsed);
      }
    } catch {}
  }, []);

  // Persist state changes (skip initial mount to avoid overwriting with defaults)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    saveState(state);
  }, [state]);

  // Subscribe to tutorial events
  useEffect(() => {
    const unsubscribe = subscribeTutorialEvents((event: string) => {
      const s = stateRef.current;
      if (!s.isActive) return;

      const currentSteps = stepsRef.current;
      if (s.currentStepIndex >= currentSteps.length) return;

      const step = currentSteps[s.currentStepIndex];
      if (!step) return;

      // Handle multi-note challenge
      if (step.completionEvent === 'notes-multiple' && event === 'note-played') {
        noteCountRef.current++;
        if (noteCountRef.current >= 4) {
          noteCountRef.current = 0;
          advanceStep(step.id);
        }
        return;
      }

      // Handle compound drum sequencer challenge (step + play)
      if (step.completionEvent === 'drum-step-play') {
        if (event === 'drum-step-toggled') {
          drumStepAddedRef.current = true;
          return;
        }
        if (event === 'drum-sequencer-play' && drumStepAddedRef.current) {
          drumStepAddedRef.current = false;
          advanceStep(step.id);
          return;
        }
        return;
      }

      // Simple event matching
      if (event === step.completionEvent) {
        advanceStep(step.id);
      }
    });
    return unsubscribe;
  }, []);

  const advanceStep = useCallback((completedId: string) => {
    setState((prev) => {
      const newCompleted = [...prev.completedStepIds, completedId];
      const nextIndex = prev.currentStepIndex + 1;
      const allDone = nextIndex >= stepsRef.current.length;
      return {
        ...prev,
        completedStepIds: newCompleted,
        currentStepIndex: nextIndex,
        isActive: !allDone,
        hasSeenTutorial: true,
      };
    });
  }, []);

  const startTutorial = useCallback(() => {
    noteCountRef.current = 0;
    drumStepAddedRef.current = false;
    setState({
      isActive: true,
      currentStepIndex: 0,
      completedStepIds: [],
      hasSeenTutorial: true,
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      hasSeenTutorial: true,
    }));
  }, []);

  const resetTutorial = useCallback(() => {
    noteCountRef.current = 0;
    drumStepAddedRef.current = false;
    setState({
      isActive: false,
      currentStepIndex: 0,
      completedStepIds: [],
      hasSeenTutorial: false,
    });
  }, []);

  const currentStep = state.isActive && state.currentStepIndex < steps.length
    ? steps[state.currentStepIndex]
    : null;

  const isCompleted = !state.isActive && state.completedStepIds.length >= steps.length && state.hasSeenTutorial;

  return (
    <TutorialContext.Provider
      value={{
        isActive: state.isActive,
        currentStep,
        steps,
        currentStepIndex: state.currentStepIndex,
        totalSteps: steps.length,
        completedCount: state.completedStepIds.length,
        isCompleted,
        startTutorial,
        skipTutorial,
        resetTutorial,
        hasSeenTutorial: state.hasSeenTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return ctx;
}
