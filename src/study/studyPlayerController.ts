export class StudyPlayerController {
  player: unknown = null;
  metronomeEnabled = false;
  metronomeVolume = 0.5;

  private metronomeTimer: number | null = null;
  private metronomeSyncTimer: number | null = null;
  private audioContext: AudioContext | null = null;
  private metronomeBeat = 0;
  private metronomeLastBeatIndex: number | null = null;
  private metronomeLastMeasureIndex: number | null = null;

  stopMetronome() {
    if (this.metronomeTimer) {
      window.clearInterval(this.metronomeTimer);
      this.metronomeTimer = null;
    }
    if (this.metronomeSyncTimer) {
      window.clearInterval(this.metronomeSyncTimer);
      this.metronomeSyncTimer = null;
    }
    this.metronomeBeat = 0;
    this.metronomeLastBeatIndex = null;
    this.metronomeLastMeasureIndex = null;
  }

  restartMetronome(isPlaying: boolean, bpm: number, beatsPerMeasure: number) {
    if (!this.metronomeEnabled) return;
    this.stopMetronome();
    if (isPlaying) this.startMetronomeSync(bpm, beatsPerMeasure);
    else this.startMetronome(bpm, beatsPerMeasure);
  }

  startMetronome(bpm: number, beatsPerMeasure: number) {
    if (this.metronomeTimer) return;
    this.ensureAudioContext();
    const interval = this.getMetronomeIntervalMs(bpm);
    this.metronomeBeat = 0;
    this.clickMetronome(true, beatsPerMeasure);
    this.metronomeTimer = window.setInterval(() => this.clickMetronome(false, beatsPerMeasure), interval);
  }

  startMetronomeSync(_bpm: number, beatsPerMeasure: number) {
    if (this.metronomeSyncTimer) return;
    this.ensureAudioContext();
    this.metronomeLastBeatIndex = null;
    this.metronomeLastMeasureIndex = null;
    this.metronomeSyncTimer = window.setInterval(() => {
      if (!this.player) return;
      const posMs = this.getPlayerPositionMs();
      if (posMs == null) return;
      const beatInfo = this.getBeatIndexFromTimemap(posMs, beatsPerMeasure);
      if (!beatInfo) return;
      if (this.metronomeLastBeatIndex === beatInfo.globalBeat) return;
      const accent = beatInfo.beatInMeasure === 0;
      this.clickMetronome(accent, beatsPerMeasure);
      this.metronomeLastBeatIndex = beatInfo.globalBeat;
      this.metronomeLastMeasureIndex = beatInfo.measureIndex;
    }, 30);
  }

  private getMetronomeIntervalMs(bpm: number): number {
    const safeBpm = Math.max(30, bpm);
    return Math.round(60000 / safeBpm);
  }

  private ensureAudioContext() {
    if (this.audioContext) return;
    const AudioCtx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.audioContext = new AudioCtx();
  }

  private clickMetronome(forceAccent: boolean, beatsPerMeasure: number) {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const isAccent = forceAccent || this.metronomeBeat === 0;
    osc.frequency.value = isAccent ? 1400 : 1000;
    const baseVol = Math.max(0, Math.min(1, this.metronomeVolume));
    const vol = isAccent ? Math.min(1, baseVol * 1.4) : baseVol;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
    this.metronomeBeat = (this.metronomeBeat + 1) % Math.max(1, beatsPerMeasure);
  }

  private getPlayerPositionMs(): number | null {
    const pos = (this.player as { position?: number })?.position;
    if (pos == null || Number.isNaN(pos)) return null;
    const timemap = (this.player as { _options?: { converter?: { timemap?: unknown } } })?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0) {
      return pos > 1000 ? pos : pos * 1000;
    }
    const last = (timemap as { timestamp?: number }[])[timemap.length - 1];
    const lastTs = last?.timestamp ?? 0;
    const isMs = lastTs > 1000 || pos > 1000;
    return isMs ? pos : pos * 1000;
  }

  private timemapToMs(timemap: Array<{ timestamp?: number; duration?: number }>): Array<{ startMs: number; durationMs: number }> {
    if (!timemap?.length) return [];
    const lastTs = timemap[timemap.length - 1]?.timestamp ?? 0;
    const inSeconds = lastTs > 0 && lastTs < 1000;
    const toMs = (t: number) => (inSeconds ? t * 1000 : t);
    return timemap.map((entry, i) => {
      const startMs = toMs(entry.timestamp ?? 0);
      let durationMs = entry.duration != null ? toMs(entry.duration) : 0;
      if (durationMs <= 0 && timemap[i + 1]) {
        durationMs = toMs(timemap[i + 1].timestamp ?? 0) - startMs;
      }
      return { startMs, durationMs };
    });
  }

  private getBeatIndexFromTimemap(posMs: number, beatsPerMeasure: number): {
    globalBeat: number;
    beatInMeasure: number;
    measureIndex: number;
  } | null {
    const rawTimemap = (this.player as { _options?: { converter?: { timemap?: unknown } } })?._options?.converter?.timemap;
    if (!Array.isArray(rawTimemap) || rawTimemap.length === 0) return null;
    const timemapMs = this.timemapToMs(rawTimemap as { timestamp?: number; duration?: number }[]);
    const beats = Math.max(1, beatsPerMeasure);

    let index = this.metronomeLastMeasureIndex ?? 0;
    if (index >= timemapMs.length) index = 0;

    const pos = posMs;
    const forward =
      index < timemapMs.length - 1 &&
      pos >= timemapMs[index + 1].startMs;
    const backward = index < timemapMs.length && pos < timemapMs[index].startMs;

    if (forward || backward) {
      index = 0;
      for (let i = 0; i < timemapMs.length - 1; i++) {
        const start = timemapMs[i].startMs;
        const nextStart = timemapMs[i + 1].startMs;
        if (pos >= start && pos < nextStart) {
          index = i;
          break;
        }
        if (pos < start) {
          index = Math.max(0, i - 1);
          break;
        }
      }
      if (index >= timemapMs.length) index = timemapMs.length - 1;
    }

    const current = timemapMs[index];
    if (!current || current.durationMs <= 0) return null;

    const measureStart = current.startMs;
    const beatDuration = current.durationMs / beats;
    const beatInMeasure = Math.min(
      beats - 1,
      Math.max(0, Math.floor((pos - measureStart) / beatDuration))
    );
    const globalBeat = index * beats + beatInMeasure;
    return { globalBeat, beatInMeasure, measureIndex: index };
  }
}
