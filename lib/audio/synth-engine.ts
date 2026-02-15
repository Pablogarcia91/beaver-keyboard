import { ADSREnvelope, OscillatorType } from '@/lib/types';
import { applyEnvelopeAttack, applyEnvelopeRelease } from './envelope';

interface ActiveNote {
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

export class SynthEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private analyser: AnalyserNode;
  private activeNotes: Map<string, ActiveNote> = new Map();
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;

  // Effects nodes (initialized in Phase 2, but we route through them)
  private filter: BiquadFilterNode;
  private delayNode: DelayNode;
  private delayFeedback: GainNode;
  private delayDryGain: GainNode;
  private delayWetGain: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;

    // Master gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.5;

    // Filter
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 8000;
    this.filter.Q.value = 1;

    // Delay effect
    this.delayNode = ctx.createDelay(2);
    this.delayNode.delayTime.value = 0.3;
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.3;
    this.delayDryGain = ctx.createGain();
    this.delayDryGain.gain.value = 1;
    this.delayWetGain = ctx.createGain();
    this.delayWetGain.gain.value = 0;

    // Analyser for oscilloscope
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Audio routing:
    // masterGain -> filter -> [dry + delay wet] -> analyser -> destination
    this.masterGain.connect(this.filter);

    // Dry path
    this.filter.connect(this.delayDryGain);
    this.delayDryGain.connect(this.analyser);

    // Wet path (delay)
    this.filter.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode); // feedback loop
    this.delayNode.connect(this.delayWetGain);
    this.delayWetGain.connect(this.analyser);

    // Analyser -> destination
    this.analyser.connect(ctx.destination);
  }

  noteOn(
    noteId: string,
    frequency: number,
    type: OscillatorType,
    envelope: ADSREnvelope
  ): void {
    // Stop existing note with same ID if any
    this.noteOff(noteId, 0.01);

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0;

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(this.ctx.currentTime);
    applyEnvelopeAttack(gainNode, envelope, this.ctx.currentTime);

    this.activeNotes.set(noteId, { oscillator: osc, gainNode });
  }

  noteOff(noteId: string, releaseOverride?: number): void {
    const note = this.activeNotes.get(noteId);
    if (!note) return;

    const envelope: ADSREnvelope = {
      attack: 0,
      decay: 0,
      sustain: 0,
      release: releaseOverride ?? 0.3,
    };

    const endTime = applyEnvelopeRelease(
      note.gainNode,
      envelope,
      this.ctx.currentTime
    );

    note.oscillator.stop(endTime + 0.01);

    // Clean up after the note ends
    const noteRef = note;
    setTimeout(() => {
      try {
        noteRef.oscillator.disconnect();
        noteRef.gainNode.disconnect();
      } catch {
        // Already disconnected
      }
    }, (endTime - this.ctx.currentTime + 0.05) * 1000);

    this.activeNotes.delete(noteId);
  }

  noteOffWithEnvelope(noteId: string, envelope: ADSREnvelope): void {
    const note = this.activeNotes.get(noteId);
    if (!note) return;

    const endTime = applyEnvelopeRelease(
      note.gainNode,
      envelope,
      this.ctx.currentTime
    );

    note.oscillator.stop(endTime + 0.01);

    const noteRef = note;
    setTimeout(() => {
      try {
        noteRef.oscillator.disconnect();
        noteRef.gainNode.disconnect();
      } catch {
        // Already disconnected
      }
    }, (endTime - this.ctx.currentTime + 0.05) * 1000);

    this.activeNotes.delete(noteId);
  }

  setMasterVolume(value: number): void {
    this.masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, value)),
      this.ctx.currentTime,
      0.01
    );
  }

  setFilterFrequency(freq: number): void {
    this.filter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.01);
  }

  setFilterResonance(q: number): void {
    this.filter.Q.setTargetAtTime(q, this.ctx.currentTime, 0.01);
  }

  setFilterType(type: BiquadFilterType): void {
    this.filter.type = type;
  }

  setDelayTime(time: number): void {
    this.delayNode.delayTime.setTargetAtTime(time, this.ctx.currentTime, 0.01);
  }

  setDelayFeedback(feedback: number): void {
    this.delayFeedback.gain.setTargetAtTime(
      Math.min(feedback, 0.95),
      this.ctx.currentTime,
      0.01
    );
  }

  setDelayMix(mix: number): void {
    this.delayDryGain.gain.setTargetAtTime(1 - mix, this.ctx.currentTime, 0.01);
    this.delayWetGain.gain.setTargetAtTime(mix, this.ctx.currentTime, 0.01);
  }

  getAnalyserNode(): AnalyserNode {
    return this.analyser;
  }

  getTimeDomainData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getAudioContext(): AudioContext {
    return this.ctx;
  }

  getMasterGainNode(): GainNode {
    return this.masterGain;
  }

  getMediaStream(): MediaStream {
    if (!this.mediaStreamDest) {
      this.mediaStreamDest = this.ctx.createMediaStreamDestination();
      this.analyser.connect(this.mediaStreamDest);
    }
    return this.mediaStreamDest.stream;
  }

  dispose(): void {
    for (const [noteId] of this.activeNotes) {
      this.noteOff(noteId, 0.001);
    }
    this.activeNotes.clear();
  }
}
