'use client';

import { useKeyboardInput } from '@/hooks/use-keyboard-input';

interface SynthKeyboardHandlerProps {
  onHelpToggle: () => void;
}

export function SynthKeyboardHandler({ onHelpToggle }: SynthKeyboardHandlerProps) {
  useKeyboardInput({ onHelpToggle });
  return null;
}
