type Listener = (event: string) => void;
const listeners = new Set<Listener>();

export function emitTutorialEvent(event: string) {
  listeners.forEach((l) => l(event));
}

export function subscribeTutorialEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
