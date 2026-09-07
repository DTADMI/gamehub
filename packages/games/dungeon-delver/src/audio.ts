/**
 * DungeonDelverAudio — Web Audio API procedural sound synthesis
 *
 * Zero-dependency, no mp3 files required. Generates:
 * - Combat: hit, crit, death, block
 * - Movement: step, stairs  
 * - UI: click, equip, pickup, levelUp, error
 * - Ambient: dungeon drone per floor depth
 * - Boss: dramatic sting on boss floor
 */

type SfxType = "hit" | "crit" | "death" | "block" | "step" | "stairs" | "click" | "equip" | "pickup" | "levelUp" | "error" | "bossAppear";

class DungeonDelverAudio {
  private static instance: DungeonDelverAudio;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientNode: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private enabled = true;
  private volume = 0.25;

  private constructor() {}

  static getInstance(): DungeonDelverAudio {
    if (!DungeonDelverAudio.instance) {
      DungeonDelverAudio.instance = new DungeonDelverAudio();
    }
    return DungeonDelverAudio.instance;
  }

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") {return null;}
    if (this.ctx && this.ctx.state !== "closed") {return this.ctx;}
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    } catch { return null; }
    return this.ctx;
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.getCtx()!.currentTime, 0.05);
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) {this.stopAmbient();}
  }

  /** One-shot sound effect */
  play(type: SfxType) {
    const ctx = this.getCtx();
    if (!ctx || !this.enabled || !this.masterGain) {return;}
    if (ctx.state === "suspended") {ctx.resume();}
    switch (type) {
      case "hit": this._hit(ctx); break;
      case "crit": this._crit(ctx); break;
      case "death": this._death(ctx); break;
      case "block": this._block(ctx); break;
      case "step": this._step(ctx); break;
      case "stairs": this._stairs(ctx); break;
      case "click": this._click(ctx); break;
      case "equip": this._equip(ctx); break;
      case "pickup": this._pickup(ctx); break;
      case "levelUp": this._levelUp(ctx); break;
      case "error": this._error(ctx); break;
      case "bossAppear": this._bossAppear(ctx); break;
    }
  }

  /** Ambient drone - gets darker/deeper as floor increases */
  startAmbient(floor: number) {
    const ctx = this.getCtx();
    if (!ctx || !this.enabled || !this.masterGain) {return;}
    this.stopAmbient();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // Base frequency drops as floors get deeper
    const baseFreq = 80 - Math.min(floor * 2, 40);
    osc.type = "sawtooth";
    osc.frequency.value = baseFreq;

    // Add harmonic
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = baseFreq * 1.5;

    const gain2 = ctx.createGain();
    gain2.gain.value = 0.03;

    gain.gain.value = 0.04;
    // Slow LFO for creepiness
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.01;
    lfo.connect(lfoGain).connect(gain.gain);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc.start();
    osc2.start();
    lfo.start();

    this.ambientNode = osc;
    this.ambientGain = gain;
    // Store references for cleanup
    (this as any)._ambient2 = osc2;
    (this as any)._ambientGain2 = gain2;
    (this as any)._ambientLfo = lfo;
  }

  stopAmbient() {
    try {
      this.ambientNode?.stop();
      (this as any)._ambient2?.stop();
      (this as any)._ambientLfo?.stop();
    } catch { /* already stopped */ }
    this.ambientNode = null;
    this.ambientGain = null;
  }

  // ── Sound generators ──────────────────────────────────────

  private _hit(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  private _crit(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  private _death(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  }

  private _block(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  private _step(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  private _stairs(ctx: AudioContext) {
    // Descending arpeggio
    [400, 350, 300, 250].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  private _click(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  private _equip(ctx: AudioContext) {
    [600, 900].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  private _pickup(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  private _levelUp(ctx: AudioContext) {
    // Triumphant ascending arpeggio
    [400, 500, 600, 800, 1000].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  private _error(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(this.masterGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  private _bossAppear(ctx: AudioContext) {
    // Dramatic low drone + chord
    [80, 100, 120, 160].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? "sawtooth" : "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.2);
      gain.gain.setValueAtTime(0.1, t + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }
}

export const ddAudio = DungeonDelverAudio.getInstance();