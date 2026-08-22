/**
 * ProceduralAudio — Web Audio API sound synthesis for point-and-click games.
 *
 * Generates sounds on-the-fly (no mp3 files needed):
 * - click: short UI feedback tick
 * - solve: rising success jingle
 * - ambient: low drone/pad per scene type
 * - reveal: magical discovery chime
 * - error: low buzzer
 *
 * Usage:
 *   const audio = ProceduralAudio.getInstance();
 *   audio.play("click");
 *   audio.startAmbient("workshop");
 *   audio.stopAmbient();
 */

type SoundType = "click" | "solve" | "reveal" | "error" | "collect";

type AmbientType = "workshop" | "office" | "apartment" | "space" | "ocean" | "body" | "home" | "thinking";

export class ProceduralAudio {
  private static instance: ProceduralAudio;
  private ctx: AudioContext | null = null;
  private ambientNode: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbient: AmbientType | null = null;
  private enabled = true;
  private volume = 0.3;

  private constructor() {}

  static getInstance(): ProceduralAudio {
    if (!ProceduralAudio.instance) {
      ProceduralAudio.instance = new ProceduralAudio();
    }
    return ProceduralAudio.instance;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx && this.ctx.state !== "closed") return this.ctx;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      return null;
    }
    return this.ctx;
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.getContext()!.currentTime, 0.05);
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stopAmbient();
  }

  /** Play a one-shot sound effect */
  play(type: SoundType) {
    const ctx = this.getContext();
    if (!ctx || !this.enabled || !this.masterGain) return;
    if (ctx.state === "suspended") ctx.resume();

    switch (type) {
      case "click": this._click(ctx); break;
      case "solve": this._solve(ctx); break;
      case "reveal": this._reveal(ctx); break;
      case "error": this._error(ctx); break;
      case "collect": this._collect(ctx); break;
    }
  }

  /** Start an ambient background drone */
  startAmbient(type: AmbientType) {
    const ctx = this.getContext();
    if (!ctx || !this.enabled || !this.masterGain) return;
    if (ctx.state === "suspended") ctx.resume();
    if (this.currentAmbient === type && this.ambientNode) return;

    this.stopAmbient();

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = 0;
    this.ambientGain.connect(this.masterGain);

    switch (type) {
      case "workshop": this._ambientWorkshop(ctx); break;
      case "office": this._ambientOffice(ctx); break;
      case "apartment": this._ambientApartment(ctx); break;
      case "space": this._ambientSpace(ctx); break;
      case "ocean": this._ambientOcean(ctx); break;
      case "body": this._ambientBody(ctx); break;
      case "home": this._ambientHome(ctx); break;
      case "thinking": this._ambientThinking(ctx); break;
    }

    this.currentAmbient = type;
  }

  stopAmbient() {
    if (this.ambientNode) {
      try { this.ambientNode.stop(); } catch {}
      this.ambientNode.disconnect();
      this.ambientNode = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.currentAmbient = null;
  }

  // ─── one-shot sound generators ───

  private _click(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  private _solve(ctx: AudioContext) {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  private _reveal(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);

    // Add a shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1200, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.4);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.5);
  }

  private _error(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }

  private _collect(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  // ─── ambient generators ───

  private _ambientWorkshop(ctx: AudioContext) {
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "triangle";
    this.ambientNode.frequency.value = 110; // A2 — warm workshop hum
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientNode.frequency);
    lfo.start();
    this.ambientNode.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);
  }

  private _ambientOffice(ctx: AudioContext) {
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "sine";
    this.ambientNode.frequency.value = 146.83; // D3 — quiet office
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientNode.frequency);
    lfo.start();
    this.ambientNode.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
  }

  private _ambientApartment(ctx: AudioContext) {
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "sine";
    this.ambientNode.frequency.value = 196; // G3 — neutral space
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.2;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientNode.frequency);
    lfo.start();
    this.ambientNode.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
  }

  private _ambientSpace(ctx: AudioContext) {
    // Deep space drone with filter sweep
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "sawtooth";
    this.ambientNode.frequency.value = 55; // A1 — deep space

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300;
    filter.Q.value = 1;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    this.ambientNode.connect(filter);
    filter.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
  }

  private _ambientOcean(ctx: AudioContext) {
    // Ocean — low rumble with noise-like modulation
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "triangle";
    this.ambientNode.frequency.value = 82.41; // E2

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.5; // wave-like pulsing
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientNode.frequency);
    lfo.start();

    this.ambientNode.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 2);
  }

  private _ambientBody(ctx: AudioContext) {
    // Heartbeat-like low pulse
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "sine";
    this.ambientNode.frequency.value = 65.41; // C2

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 1.2; // ~72 BPM
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientGain!.gain);
    lfo.start();

    this.ambientNode.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.value = 0.04;
  }

  private _ambientHome(ctx: AudioContext) {
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "sine";
    this.ambientNode.frequency.value = 261.63; // C4 — warm home

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.2;
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientNode.frequency);
    lfo.start();

    this.ambientNode.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
  }

  private _ambientThinking(ctx: AudioContext) {
    this.ambientNode = ctx.createOscillator();
    this.ambientNode.type = "triangle";
    this.ambientNode.frequency.value = 220; // A3

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.25;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientNode.frequency);
    lfo.start();

    this.ambientNode.connect(this.ambientGain!);
    this.ambientNode.start();
    this.ambientGain!.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
  }
}

export const proceduralAudio = ProceduralAudio.getInstance();