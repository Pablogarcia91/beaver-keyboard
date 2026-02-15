import { ADSREnvelope } from '@/lib/types';

const MIN_RAMP_TIME = 0.005; // 5ms minimum to avoid clicks

export function applyEnvelopeAttack(
  gainNode: GainNode,
  envelope: ADSREnvelope,
  startTime: number
): void {
  const { attack, decay, sustain } = envelope;
  const attackTime = Math.max(attack, MIN_RAMP_TIME);
  const decayTime = Math.max(decay, MIN_RAMP_TIME);

  gainNode.gain.cancelScheduledValues(startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  // Attack: ramp from 0 to 1
  gainNode.gain.linearRampToValueAtTime(1, startTime + attackTime);
  // Decay: ramp from 1 to sustain level
  gainNode.gain.linearRampToValueAtTime(sustain, startTime + attackTime + decayTime);
}

export function applyEnvelopeRelease(
  gainNode: GainNode,
  envelope: ADSREnvelope,
  releaseStartTime: number
): number {
  const releaseTime = Math.max(envelope.release, MIN_RAMP_TIME);

  gainNode.gain.cancelScheduledValues(releaseStartTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, releaseStartTime);
  // Release: ramp from current value to 0
  gainNode.gain.linearRampToValueAtTime(0, releaseStartTime + releaseTime);

  // Return the time when the note fully ends
  return releaseStartTime + releaseTime;
}
