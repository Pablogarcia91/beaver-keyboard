// Synthetic drum sampler - generates drum sounds programmatically via Web Audio API

export class DrumSampler {
  private ctx: AudioContext;
  private output: GainNode;

  constructor(ctx: AudioContext, output: GainNode) {
    this.ctx = ctx;
    this.output = output;
  }

  play(instrumentId: string, kitId: string, velocity: number = 0.8): void {
    switch (kitId) {
      case '808':
        this.play808(instrumentId, velocity);
        break;
      case 'acoustic':
        this.playAcoustic(instrumentId, velocity);
        break;
      case 'electronic':
        this.playElectronic(instrumentId, velocity);
        break;
      default:
        this.play808(instrumentId, velocity);
    }
  }

  private play808(instrumentId: string, velocity: number): void {
    switch (instrumentId) {
      case 'kick':
        this.synthKick808(velocity);
        break;
      case 'snare':
        this.synthSnare808(velocity);
        break;
      case 'hihat-closed':
        this.synthHihat(velocity, 0.05);
        break;
      case 'hihat-open':
        this.synthHihat(velocity, 0.3);
        break;
      case 'clap':
        this.synthClap(velocity);
        break;
      case 'tom-low':
        this.synthTom(velocity, 80);
        break;
      case 'tom-mid':
        this.synthTom(velocity, 120);
        break;
      case 'tom-high':
        this.synthTom(velocity, 180);
        break;
      default:
        this.synthKick808(velocity);
    }
  }

  private playAcoustic(instrumentId: string, velocity: number): void {
    switch (instrumentId) {
      case 'kick':
        this.synthKickAcoustic(velocity);
        break;
      case 'snare':
        this.synthSnareAcoustic(velocity);
        break;
      case 'hihat-closed':
        this.synthHihat(velocity, 0.04);
        break;
      case 'hihat-open':
        this.synthHihat(velocity, 0.25);
        break;
      case 'clap':
        this.synthClap(velocity);
        break;
      case 'ride':
        this.synthRide(velocity);
        break;
      case 'crash':
        this.synthCrash(velocity);
        break;
      case 'rim':
        this.synthRim(velocity);
        break;
      default:
        this.synthKickAcoustic(velocity);
    }
  }

  private playElectronic(instrumentId: string, velocity: number): void {
    switch (instrumentId) {
      case 'kick':
        this.synthKick808(velocity);
        break;
      case 'snare':
        this.synthSnare808(velocity);
        break;
      case 'hihat-closed':
        this.synthHihat(velocity, 0.03);
        break;
      case 'hihat-open':
        this.synthHihat(velocity, 0.2);
        break;
      case 'clap':
        this.synthClap(velocity);
        break;
      case 'perc-1':
        this.synthPerc(velocity, 800);
        break;
      case 'perc-2':
        this.synthPerc(velocity, 1200);
        break;
      case 'fx':
        this.synthFx(velocity);
        break;
      default:
        this.synthKick808(velocity);
    }
  }

  // 808 Kick: sine wave with frequency sweep from ~150Hz to ~40Hz
  private synthKick808(velocity: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    gain.gain.setValueAtTime(velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Acoustic Kick: shorter, punchier
  private synthKickAcoustic(velocity: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

    gain.gain.setValueAtTime(velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 808 Snare: noise burst + sine tone
  private synthSnare808(velocity: number): void {
    const now = this.ctx.currentTime;

    // Noise component
    const noiseBuffer = this.createNoiseBuffer(0.2);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.output);
    noiseSource.start(now);

    // Tone component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
    oscGain.gain.setValueAtTime(velocity * 0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Acoustic Snare
  private synthSnareAcoustic(velocity: number): void {
    const now = this.ctx.currentTime;

    const noiseBuffer = this.createNoiseBuffer(0.15);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3000;
    noiseFilter.Q.value = 1;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.output);
    noiseSource.start(now);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
    oscGain.gain.setValueAtTime(velocity * 0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Hi-Hat: filtered noise
  private synthHihat(velocity: number, decay: number): void {
    const now = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(decay + 0.05);
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);
    source.start(now);
  }

  // Clap: multiple short noise bursts
  private synthClap(velocity: number): void {
    const now = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const offset = i * 0.01;
      const noiseBuffer = this.createNoiseBuffer(0.03);
      const source = this.ctx.createBufferSource();
      source.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value = 2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(velocity * 0.5, now + offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.03);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.output);
      source.start(now + offset);
    }

    // Tail
    const tailBuffer = this.createNoiseBuffer(0.15);
    const tailSource = this.ctx.createBufferSource();
    tailSource.buffer = tailBuffer;
    const tailFilter = this.ctx.createBiquadFilter();
    tailFilter.type = 'bandpass';
    tailFilter.frequency.value = 2500;
    tailFilter.Q.value = 1;
    const tailGain = this.ctx.createGain();
    tailGain.gain.setValueAtTime(velocity * 0.4, now + 0.03);
    tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    tailSource.connect(tailFilter);
    tailFilter.connect(tailGain);
    tailGain.connect(this.output);
    tailSource.start(now + 0.03);
  }

  // Tom: sine sweep
  private synthTom(velocity: number, freq: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.05);

    gain.gain.setValueAtTime(velocity * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Ride cymbal
  private synthRide(velocity: number): void {
    const now = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(0.6);
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8000;
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);
    source.start(now);
  }

  // Crash cymbal
  private synthCrash(velocity: number): void {
    const now = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(1.2);
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);
    source.start(now);
  }

  // Rim shot
  private synthRim(velocity: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(velocity * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Percussion hit
  private synthPerc(velocity: number, freq: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.05);

    gain.gain.setValueAtTime(velocity * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // FX sound
  private synthFx(velocity: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

    gain.gain.setValueAtTime(velocity * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.output);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}
