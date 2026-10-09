import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Player, VerovioConverter, type ISheetRenderer } from '@music-i18n/musicxml-player';
import { StudyPlayerController } from './studyPlayerController';
import {
  extractTempoInfoFromXml,
  extractInstrumentsFromXml,
  filterXmlByPartIds,
  type InstrumentInfo,
} from './studyUtils';

/**
 * O WASM do Verovio embarcado no musicxml-player traz 652 dos 1043 glifos que
 * ele espera, e reclama disso ao construir o toolkit. Não afeta o MIDI — única
 * coisa que usamos do Verovio — nem a partitura, que é desenhada pelo OSMD.
 */
const VEROVIO_FONT_NOISE = ['default SMuFL glyphs', 'font could not be loaded'];

/**
 * O Player exige um ISheetRenderer, mas quem desenha a partitura aqui é o OSMD.
 * Usar o VerovioRenderer faria uma segunda engravação completa num container
 * invisível a cada troca de instrumentos — custo alto no celular e sem uso.
 */
class HeadlessSheetRenderer implements ISheetRenderer {
  player?: Player;

  destroy() {}

  async initialize() {}

  moveTo() {}

  onResize() {}

  onEvent() {}

  get version() {
    return 'headless';
  }
}

export type StudyViewSnapshot = {
  scoreLoading: boolean;
  xmlLoaded: boolean;
  scoreError: string | null;
  currentScoreName: string;
  fullscreenScore: boolean;
  isMobile: boolean;
  playbackPosition: { measure: number; beat: number; timeSignature: string } | null;
  playbackCursorX: number | null;
  loading: boolean;
  playerReady: boolean;
  playerLoading: boolean;
  midiLoaded: boolean;
  midiLoading: boolean;
  playerError: string | null;
  playerExpanded: boolean;
  bpm: number;
  bpmMin: number;
  bpmMax: number;
  timeSignature: string;
  baseBpm: number;
  metronomeEnabled: boolean;
  metronomeVolume: number;
  audioVolume: number;
  loopEnabled: boolean;
  loopStartMeasure: number | null;
  loopEndMeasure: number | null;
  instruments: {
    available: InstrumentInfo[];
    selectedIds: string[];
    midiSelectedIds: string[];
    filtered: InstrumentInfo[];
    selectionMatchesApplied: boolean;
    showSelection: boolean;
    cardCollapsed: boolean;
    allSelected: boolean;
    midiAllSelected: boolean;
    summary: string;
    filter: string;
  };
};

export type StudySessionOptions = {
  getApiUrl: () => string;
  /** Container rolável + área do cursor (classe .score-container no Angular). */
  getScoreContainer: () => HTMLElement | null;
  /** Elemento exclusivo onde o OSMD desenha (será esvaziado ao re-renderizar). */
  getOsmdContainer: () => HTMLElement | null;
  onSnack?: (message: string) => void;
};

export type StudyInstrumentSelection = {
  scoreInstrumentIds?: string[];
  midiInstrumentIds?: string[];
};

function sameIdSet(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const ids = new Set(left);
  return right.every((id) => ids.has(id));
}

function isMobileView() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 600px)').matches;
}

export class StudySession {
  private listeners = new Set<() => void>();
  private snapshot: StudyViewSnapshot;

  private options: StudySessionOptions;
  private loadToken = 0;
  private sourceXml: string | null = null;
  private currentScoreId = 'local';
  private lastRenderedSelectionKey: string | null = null;
  private midiCache = new Map<string, ArrayBuffer>();

  private player: unknown = null;
  private hiddenPlayerContainer: HTMLElement | null = null;
  private midiOnlyMode = false;
  private osmd: OpenSheetMusicDisplay | null = null;
  private workletPatched = false;
  private scrollPatched = false;

  private playerController = new StudyPlayerController();
  private loopTimer: number | null = null;
  private loopStartTs: number | null = null;
  private loopEndTs: number | null = null;
  private cursorSyncTimer: number | null = null;
  private lastCursorMeasure = -1;
  private lastCursorBeat = -1;
  private measureBoundsCache: Array<{ xStart: number; xEnd: number; yTop: number; yBottom: number }> = [];
  private lastCursorX = 0;
  private lastCursorY = 0;
  private lastScrollIntoViewTime = 0;
  private readonly scrollIntoViewThrottleMs = 150;

  private isPlaying = false;
  private tempo = 1.0;
  private beatsPerMeasure = 4;

  private availableInstruments: InstrumentInfo[] = [];
  private selectedInstrumentIds: string[] = [];
  private selectedMidiInstrumentIds: string[] = [];
  private lastAppliedMidiInstrumentIds: string[] = [];
  private lastAppliedInstrumentIds: string[] = [];
  private instrumentFilter = '';
  private showInstrumentSelection = false;
  private instrumentCardCollapsed = true;

  private midiPrefetchScheduled = false;
  private midiWarmupScheduled = false;

  /** UI fields mirrored in snapshot */
  private scoreLoading = false;
  private xmlLoaded = false;
  private scoreError: string | null = null;
  private currentScoreName = 'Nenhuma selecionada';
  private fullscreenScore = false;
  private isMobile = isMobileView();
  private playbackPosition: StudyViewSnapshot['playbackPosition'] = null;
  private playbackCursorX: number | null = null;
  private loading = false;
  private playerReady = false;
  private playerLoading = false;
  private midiLoaded = false;
  private midiLoading = false;
  private playerError: string | null = null;
  private playerExpanded = false;
  private bpm = 100;
  private bpmMin = 40;
  private bpmMax = 200;
  private timeSignature = '4/4';
  private baseBpm = 100;
  private metronomeEnabled = false;
  private metronomeVolume = 0.5;
  private audioVolume = 1;
  private loopEnabled = false;
  private loopStartMeasure: number | null = null;
  private loopEndMeasure: number | null = null;

  constructor(options: StudySessionOptions) {
    this.options = options;
    this.snapshot = this.buildSnapshot();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot = () => this.snapshot;

  private emit() {
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach((l) => l());
  }

  private buildSnapshot(): StudyViewSnapshot {
    const q = this.instrumentFilter.trim().toLowerCase();
    const filtered = !q
      ? this.availableInstruments
      : this.availableInstruments.filter((i) => i.name.toLowerCase().includes(q));

    const selectedSet = new Set(this.selectedInstrumentIds);
    const names = this.availableInstruments.filter((i) => selectedSet.has(i.id)).map((i) => i.name);
    let summary = 'Nenhum';
    if (names.length <= 2) summary = names.join(', ');
    else if (names.length > 2) summary = `${names.slice(0, 2).join(', ')} +${names.length - 2}`;

    const allSelected =
      this.availableInstruments.length > 0 &&
      this.selectedInstrumentIds.length === this.availableInstruments.length;
    const midiAllSelected =
      this.availableInstruments.length > 0 &&
      this.selectedMidiInstrumentIds.length === this.availableInstruments.length;

    const selectionMatchesApplied =
      sameIdSet(this.selectedInstrumentIds, this.lastAppliedInstrumentIds) &&
      sameIdSet(this.selectedMidiInstrumentIds, this.lastAppliedMidiInstrumentIds);

    return {
      scoreLoading: this.scoreLoading,
      xmlLoaded: this.xmlLoaded,
      scoreError: this.scoreError,
      currentScoreName: this.currentScoreName,
      fullscreenScore: this.fullscreenScore,
      isMobile: this.isMobile,
      playbackPosition: this.playbackPosition,
      playbackCursorX: this.playbackCursorX,
      loading: this.loading,
      playerReady: this.playerReady,
      playerLoading: this.playerLoading,
      midiLoaded: this.midiLoaded,
      midiLoading: this.midiLoading,
      playerError: this.playerError,
      playerExpanded: this.playerExpanded,
      bpm: this.bpm,
      bpmMin: this.bpmMin,
      bpmMax: this.bpmMax,
      timeSignature: this.timeSignature,
      baseBpm: this.baseBpm,
      metronomeEnabled: this.metronomeEnabled,
      metronomeVolume: this.metronomeVolume,
      audioVolume: this.audioVolume,
      loopEnabled: this.loopEnabled,
      loopStartMeasure: this.loopStartMeasure,
      loopEndMeasure: this.loopEndMeasure,
      instruments: {
        available: this.availableInstruments,
        selectedIds: [...this.selectedInstrumentIds],
        midiSelectedIds: [...this.selectedMidiInstrumentIds],
        filtered,
        selectionMatchesApplied,
        showSelection: this.showInstrumentSelection,
        cardCollapsed: this.instrumentCardCollapsed,
        allSelected,
        midiAllSelected,
        summary,
        filter: this.instrumentFilter,
      },
    };
  }

  updateMobile(isMobile: boolean) {
    this.isMobile = isMobile;
    this.emit();
  }

  setFullscreenScore(v: boolean) {
    this.fullscreenScore = v;
    this.measureBoundsCache = [];
    requestAnimationFrame(() => {
      const p = this.osmd?.render?.();
      if (p && typeof (p as Promise<void>).then === 'function') {
        void (p as Promise<void>)
          .catch(() => {})
          .finally(() => {
            if (this.isPlaying) this.syncPlaybackCursor();
          });
      } else if (this.isPlaying) this.syncPlaybackCursor();
    });
    this.emit();
  }

  toggleFullscreenScore() {
    this.setFullscreenScore(!this.fullscreenScore);
  }

  togglePlayerExpanded() {
    this.playerExpanded = !this.playerExpanded;
    this.emit();
  }

  async loadStudy(
    xml: string,
    scoreId: string,
    displayName: string,
    selection: StudyInstrumentSelection = {},
  ) {
    const token = ++this.loadToken;
    this.scoreError = null;
    this.currentScoreId = scoreId;
    this.currentScoreName = displayName;
    this.sourceXml = xml;
    this.lastRenderedSelectionKey = null;
    this.destroyPlayer();
    this.clearOsmdContainer();

    const tempoInfo = extractTempoInfoFromXml(xml);
    this.baseBpm = tempoInfo?.bpm ?? 100;
    this.timeSignature = tempoInfo?.timeSignature ?? '4/4';
    this.beatsPerMeasure = tempoInfo?.beatsPerMeasure ?? 4;
    this.bpm = this.baseBpm;
    this.tempo = this.bpm / this.baseBpm;
    this.updateBpmRange();
    if (this.metronomeEnabled) this.restartMetronome();

    this.initializeInstrumentsFromXml(scoreId, xml, selection);
    this.instrumentCardCollapsed = true;
    this.emit();

    await this.applyInstrumentSelection(scoreId, token);
  }

  reset() {
    this.loadToken++;
    this.pause();
    this.destroyPlayer();
    this.clearOsmdContainer();
    this.osmd = null;
    this.sourceXml = null;
    this.lastRenderedSelectionKey = null;
    this.xmlLoaded = false;
    this.scoreLoading = false;
    this.scoreError = null;
    this.fullscreenScore = false;
    this.playbackPosition = null;
    this.playbackCursorX = null;
    this.midiLoaded = false;
    this.midiLoading = false;
    this.resetInstruments();
    this.currentScoreName = 'Nenhuma selecionada';
    this.currentScoreId = 'local';
    this.emit();
  }

  destroy() {
    this.loadToken++;
    this.pause();
    this.destroyPlayer();
    this.clearOsmdContainer();
    this.osmd = null;
    this.listeners.clear();
  }

  private resetInstruments() {
    this.availableInstruments = [];
    this.selectedInstrumentIds = [];
    this.selectedMidiInstrumentIds = [];
    this.lastAppliedInstrumentIds = [];
    this.lastAppliedMidiInstrumentIds = [];
    this.showInstrumentSelection = false;
    this.instrumentCardCollapsed = true;
    this.instrumentFilter = '';
  }

  private storageKey(id: string) {
    return `study_instruments_${id}`;
  }

  private readStoredSelection(id: string): { score: string[]; midi: string[] } {
    try {
      const raw = localStorage.getItem(this.storageKey(id));
      if (!raw) return { score: [], midi: [] };
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const score = parsed.filter((item): item is string => typeof item === 'string');
        return { score, midi: score };
      }
      if (parsed && typeof parsed === 'object') {
        const record = parsed as { score?: unknown; midi?: unknown };
        return {
          score: Array.isArray(record.score)
            ? record.score.filter((item): item is string => typeof item === 'string')
            : [],
          midi: Array.isArray(record.midi)
            ? record.midi.filter((item): item is string => typeof item === 'string')
            : [],
        };
      }
      return { score: [], midi: [] };
    } catch {
      return { score: [], midi: [] };
    }
  }

  private persistSelection(id: string, score: string[], midi: string[]) {
    try {
      localStorage.setItem(this.storageKey(id), JSON.stringify({ score, midi }));
    } catch {
      /* ignore */
    }
  }

  private initializeInstrumentsFromXml(
    scoreId: string,
    xml: string,
    selection: StudyInstrumentSelection,
  ) {
    const instruments = extractInstrumentsFromXml(xml);
    this.availableInstruments = instruments;
    const availableIds = new Set(this.availableInstruments.map((i) => i.id));
    const stored = this.readStoredSelection(scoreId);
    const storedScore = stored.score.filter((id) => availableIds.has(id));
    const storedMidi = stored.midi.filter((id) => availableIds.has(id));
    const requestedScoreIds = (selection.scoreInstrumentIds ?? []).filter((id) =>
      availableIds.has(id),
    );
    const requestedMidiIds = (selection.midiInstrumentIds ?? []).filter((id) =>
      availableIds.has(id),
    );
    const allIds = this.availableInstruments.map((i) => i.id);
    this.selectedInstrumentIds =
      requestedScoreIds.length > 0
        ? requestedScoreIds
        : storedScore.length > 0
          ? storedScore
          : allIds;
    this.selectedMidiInstrumentIds =
      requestedMidiIds.length > 0
        ? requestedMidiIds
        : storedMidi.length > 0
          ? storedMidi
          : allIds;
    this.lastAppliedInstrumentIds = [...this.selectedInstrumentIds];
    this.lastAppliedMidiInstrumentIds = [...this.selectedMidiInstrumentIds];
    this.showInstrumentSelection = false;
  }

  setInstrumentFilter(value: string) {
    this.instrumentFilter = value;
    this.emit();
  }

  toggleInstrument(id: string, checked: boolean) {
    const selected = new Set(this.selectedInstrumentIds);
    if (checked) selected.add(id);
    else selected.delete(id);
    this.selectedInstrumentIds = Array.from(selected);
    this.emit();
  }

  selectAllInstruments() {
    if (this.availableInstruments.length === 0) return;
    this.selectedInstrumentIds = this.availableInstruments.map((i) => i.id);
    this.emit();
  }

  clearSelectedInstruments() {
    this.selectedInstrumentIds = [];
    this.emit();
  }

  toggleMidiInstrument(id: string, checked: boolean) {
    const selected = new Set(this.selectedMidiInstrumentIds);
    if (checked) selected.add(id);
    else selected.delete(id);
    this.selectedMidiInstrumentIds = Array.from(selected);
    this.emit();
  }

  selectAllMidiInstruments() {
    if (this.availableInstruments.length === 0) return;
    this.selectedMidiInstrumentIds = this.availableInstruments.map((i) => i.id);
    this.emit();
  }

  clearSelectedMidiInstruments() {
    this.selectedMidiInstrumentIds = [];
    this.emit();
  }

  restoreAppliedInstruments() {
    this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
    this.selectedMidiInstrumentIds = [...this.lastAppliedMidiInstrumentIds];
    this.instrumentFilter = '';
    this.emit();
  }

  applySelectedInstruments() {
    if (!this.sourceXml || this.availableInstruments.length === 0) return;
    if (this.selectedInstrumentIds.length === 0 || this.selectedMidiInstrumentIds.length === 0) {
      this.options.onSnack?.('Selecione ao menos um instrumento na partitura e no MIDI.');
      return;
    }
    this.instrumentFilter = '';
    this.showInstrumentSelection = false;
    void this.applyInstrumentSelection(this.currentScoreId, this.loadToken);
  }

  openInstrumentSelection() {
    this.pause();
    this.instrumentFilter = '';
    this.showInstrumentSelection = true;
    this.instrumentCardCollapsed = false;
    this.emit();
  }

  cancelInstrumentSelection() {
    this.pause();
    this.selectedInstrumentIds = [...this.lastAppliedInstrumentIds];
    this.selectedMidiInstrumentIds = [...this.lastAppliedMidiInstrumentIds];
    this.instrumentFilter = '';
    this.showInstrumentSelection = false;
    this.emit();
  }

  setInstrumentCardCollapsed(collapsed: boolean) {
    this.instrumentCardCollapsed = collapsed;
    this.emit();
  }

  toggleInstrumentsMenu() {
    this.instrumentCardCollapsed = !this.instrumentCardCollapsed;
    this.emit();
  }

  private async applyInstrumentSelection(id: string, token: number) {
    if (!this.sourceXml || token !== this.loadToken) return;
    this.loading = true;
    this.scoreLoading = true;
    this.destroyPlayer();
    this.emit();

    try {
      const available = this.availableInstruments;
      const selectedIds = this.selectedInstrumentIds;
      const midiSelectedIds = this.selectedMidiInstrumentIds;
      const selectionKey = `${[...selectedIds].sort().join('|')}::midi:${[
        ...midiSelectedIds,
      ]
        .sort()
        .join('|')}`;
      if (selectionKey === this.lastRenderedSelectionKey && this.xmlLoaded) {
        this.loading = false;
        this.scoreLoading = false;
        this.emit();
        return;
      }
      const shouldFilter =
        available.length > 0 && selectedIds.length > 0 && selectedIds.length < available.length;
      const shouldFilterMidi =
        available.length > 0 &&
        midiSelectedIds.length > 0 &&
        midiSelectedIds.length < available.length;
      const scoreXml = shouldFilter
        ? filterXmlByPartIds(this.sourceXml, selectedIds)
        : this.sourceXml;
      const midiXml = shouldFilterMidi
        ? filterXmlByPartIds(this.sourceXml, midiSelectedIds)
        : this.sourceXml;
      await this.renderScoreWithOsmd(scoreXml, token);
      if (token !== this.loadToken) return;
      await this.initVerovioPlayerInHiddenContainer(midiXml, id, token);
      if (token !== this.loadToken) return;
      this.lastRenderedSelectionKey = selectionKey;
      this.lastAppliedInstrumentIds = [...selectedIds];
      this.lastAppliedMidiInstrumentIds = [...midiSelectedIds];
      this.persistSelection(id, selectedIds, midiSelectedIds);
      this.scheduleMidiPrefetch();
      this.scheduleMidiWarmup();
    } finally {
      if (token === this.loadToken) {
        this.loading = false;
        this.scoreLoading = false;
        this.emit();
      }
    }
  }

  private async renderScoreWithOsmd(xml: string, token: number) {
    if (token !== this.loadToken) return;
    this.scoreLoading = true;
    this.emit();
    try {
      try {
        this.osmd?.clear();
      } catch {
        /* ignore */
      }
      this.osmd = null;
      // Na primeira música o container ainda não existe: ele só monta quando a
      // página troca o catálogo pelo bloco da partitura. Por isso esperamos o
      // ref aparecer antes de ler, em vez de desistir na hora.
      const ready = await this.waitForOsmdContainer(token);
      if (token !== this.loadToken) return;
      const mount = this.options.getOsmdContainer();
      if (!ready || !mount) {
        this.scoreLoading = false;
        this.scoreError = 'Não foi possível montar a área da partitura.';
        this.emit();
        return;
      }
      this.clearOsmdInner(mount);
      this.osmd = new OpenSheetMusicDisplay(mount, {
        drawingParameters: 'default',
        autoResize: true,
        followCursor: true,
      });
      await this.osmd.load(xml);
      await this.osmd.render();
      this.measureBoundsCache = [];
      this.osmd.enableOrDisableCursors?.(false);
      if (token === this.loadToken) {
        this.xmlLoaded = true;
        this.scoreLoading = false;
        if (isMobileView()) this.fullscreenScore = true;
      }
    } catch (err) {
      console.error('Falha ao renderizar a partitura com o OSMD:', err);
      if (token === this.loadToken) {
        this.scoreLoading = false;
        this.scoreError = 'Falha ao renderizar a partitura.';
      }
    }
    this.emit();
  }

  private clearOsmdContainer() {
    this.stopCursorSync();
    this.lastCursorMeasure = -1;
    this.lastCursorBeat = -1;
    this.measureBoundsCache = [];
    try {
      this.osmd?.clear();
    } catch {
      /* ignore */
    }
    this.osmd = null;
    const el = this.options.getOsmdContainer();
    if (el) el.innerHTML = '';
  }

  private clearOsmdInner(el: HTMLElement) {
    el.innerHTML = '';
  }

  private async waitNextFrame() {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }

  private async waitForOsmdContainer(token: number, maxTries = 30): Promise<boolean> {
    for (let i = 0; i < maxTries; i++) {
      if (token !== this.loadToken) return false;
      const el = this.options.getOsmdContainer();
      if (el?.isConnected) return true;
      await this.waitNextFrame();
    }
    return false;
  }

  private async initVerovioPlayerInHiddenContainer(xml: string, _scoreId: string, token: number) {
    if (token !== this.loadToken) return;
    this.playerReady = false;
    this.midiLoaded = false;
    this.playerError = null;
    this.midiOnlyMode = false;
    this.playerLoading = true;
    this.emit();
    this.destroyVerovioAndHiddenContainer();

    const tryCreate = async (): Promise<boolean> => {
      const el = document.createElement('div');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText =
        'position:fixed;left:-10000px;top:0;width:800px;height:600px;overflow:hidden;pointer-events:none;visibility:hidden';
      document.body.appendChild(el);
      if (token !== this.loadToken) return false;
      this.hiddenPlayerContainer = el;
      const converter = new VerovioConverter();
      const renderer = new HeadlessSheetRenderer();
      try {
        this.player = await Player.create({
          container: el,
          musicXml: xml,
          converter,
          renderer,
          followCursor: false,
          velocity: this.tempo,
          repeat: this.loopEnabled ? -1 : 1,
        });
        return true;
      } catch (e) {
        this.destroyVerovioAndHiddenContainer();
        throw e;
      }
    };

    try {
      this.patchAudioWorklet();
      this.patchScrollIntoView();
      let ok = false;
      try {
        ok = await this.withoutVerovioFontNoise(tryCreate);
      } catch (firstErr) {
        console.warn('Study player init (1ª tentativa) falhou:', firstErr);
        if (token !== this.loadToken) return;
        await new Promise((r) => setTimeout(r, 800));
        if (token !== this.loadToken) return;
        ok = await this.withoutVerovioFontNoise(tryCreate);
      }
      if (!ok || token !== this.loadToken) {
        if (token === this.loadToken) this.destroyVerovioAndHiddenContainer();
        return;
      }
      this.playerController.player = this.player;
      this.playerReady = true;
      // Player.create converte o MusicXML filtrado e já prepara seu MIDI interno.
      this.midiLoaded = true;
      this.applyTempo();
      this.applyLoop();
      this.applyAudioVolume();
    } catch (err) {
      console.warn('Study player init failed:', err);
      this.destroyVerovioAndHiddenContainer();
      const xmlLen = xml.length;
      const isVeryLarge = xmlLen > 2_000_000;
      this.midiOnlyMode = isVeryLarge;
      this.playerReady = true;
      this.playerError = isVeryLarge
        ? null
        : 'Não foi possível preparar o áudio. Tente recarregar a partitura.';
    } finally {
      if (token === this.loadToken) {
        this.playerLoading = false;
        this.emit();
      }
    }
  }

  private destroyVerovioAndHiddenContainer() {
    try {
      const p = this.player as { pause?: () => void; stop?: () => void; destroy?: () => void; dispose?: () => void } | null;
      p?.pause?.();
      p?.stop?.();
      p?.destroy?.();
      p?.dispose?.();
      const ctx =
        (this.player as { audioContext?: AudioContext; _context?: AudioContext } | null)?.audioContext ||
        (this.player as { _context?: AudioContext } | null)?._context;
      if (ctx?.close && ctx.state !== 'closed') void ctx.close();
    } catch {
      /* ignore */
    }
    this.player = null;
    this.playerController.player = null;
    if (this.hiddenPlayerContainer?.parentNode) {
      this.hiddenPlayerContainer.parentNode.removeChild(this.hiddenPlayerContainer);
    }
    this.hiddenPlayerContainer = null;
  }

  private destroyPlayer() {
    this.destroyVerovioAndHiddenContainer();
    this.midiOnlyMode = false;
    this.isPlaying = false;
    this.playerReady = false;
    this.stopCursorSync();
    this.playerController.stopMetronome();
    this.stopLoopMonitor();
    this.midiLoaded = false;
    this.midiLoading = false;
  }

  /** Esconde só as queixas de fonte do Verovio, e só enquanto o toolkit é criado. */
  private async withoutVerovioFontNoise<T>(fn: () => Promise<T>): Promise<T> {
    const original = console.error;
    console.error = (...args: unknown[]) => {
      const text = typeof args[0] === 'string' ? args[0] : '';
      if (VEROVIO_FONT_NOISE.some((noise) => text.includes(noise))) return;
      original.apply(console, args);
    };
    try {
      return await fn();
    } finally {
      console.error = original;
    }
  }

  private patchAudioWorklet() {
    if (this.workletPatched || typeof window === 'undefined') return;
    const awProto = (window as unknown as { AudioWorklet?: { prototype: { addModule: typeof AudioWorklet.prototype.addModule } } }).AudioWorklet?.prototype;
    if (!awProto?.addModule) return;
    const original = awProto.addModule;
    awProto.addModule = function (this: AudioWorklet, moduleURL: string | URL, options?: unknown) {
      try {
        const url = typeof moduleURL === 'string' ? moduleURL : moduleURL?.toString?.();
        if (url && url.includes('spessasynth_processor.js')) {
          return original.call(this, '/spessasynth_processor.js', options as never);
        }
      } catch {
        /* fallback */
      }
      return original.call(this, moduleURL, options as never);
    };
    this.workletPatched = true;
  }

  private patchScrollIntoView() {
    if (this.scrollPatched || typeof window === 'undefined') return;
    const proto = (window as unknown as { Element?: { prototype: { scrollIntoView: Element['scrollIntoView'] } } }).Element?.prototype;
    if (!proto?.scrollIntoView) return;
    const original = proto.scrollIntoView;
    proto.scrollIntoView = function (this: Element, arg?: boolean | ScrollIntoViewOptions) {
      try {
        const el = this as HTMLElement;
        const container = el?.closest?.('.score-container') as HTMLElement | null;
        const containerHeight = container?.clientHeight;
        if (!container || !containerHeight || !container.getBoundingClientRect || !el.getBoundingClientRect) {
          return original.call(this, arg as boolean | ScrollIntoViewOptions);
        }
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetTop = elRect.top - containerRect.top + container.scrollTop;
        const target = offsetTop - containerHeight / 2 + elRect.height / 2;
        const behavior =
          typeof arg === 'object' && arg?.behavior ? arg.behavior : 'smooth';
        container.scrollTo({
          top: Math.max(0, target),
          behavior,
        });
        return;
      } catch {
        return original.call(this, arg as boolean | ScrollIntoViewOptions);
      }
    };
    this.scrollPatched = true;
  }

  private updateBpmRange() {
    const base = Math.max(30, this.baseBpm);
    const min = Math.max(30, Math.round(base * 0.5));
    const max = Math.max(min + 10, Math.round(base * 2));
    this.bpmMin = min;
    this.bpmMax = max;
  }

  private applyTempo() {
    if (!this.player) return;
    const p = this.player as { velocity?: number };
    if ('velocity' in p) p.velocity = this.tempo;
    if (this.metronomeEnabled && this.isPlaying) this.restartMetronome();
  }

  private applyAudioVolume() {
    const synth = (this.player as { _synthesizer?: { setMasterParameter?: (k: string, v: number) => void } })?._synthesizer;
    if (synth?.setMasterParameter) {
      try {
        synth.setMasterParameter('masterGain', this.audioVolume);
      } catch {
        /* ignore */
      }
    }
  }

  private applyLoop() {
    if (!this.player) return;
    const p = this.player as { repeat?: number };
    if ('repeat' in p) p.repeat = this.loopEnabled ? -1 : 1;
    if (!this.loopEnabled) {
      this.loopStartTs = null;
      this.loopEndTs = null;
      return;
    }
    this.computeLoopTimestamps();
    if (this.isPlaying) {
      this.stopLoopMonitor();
      this.startLoopMonitor();
      if (this.metronomeEnabled) this.restartMetronome();
    }
  }

  private computeLoopTimestamps() {
    if (!this.player) return;
    const timemap = (this.player as { _options?: { converter?: { timemap?: Array<{ measure?: number; timestamp?: number; duration?: number }> } } })?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0 || !this.loopStartMeasure || !this.loopEndMeasure) {
      this.loopStartTs = null;
      this.loopEndTs = null;
      return;
    }
    const lastTs = timemap[timemap.length - 1]?.timestamp ?? 0;
    const toMs = (t: number) => (lastTs > 0 && lastTs < 1000 ? t * 1000 : t);
    const startMeasure = this.loopStartMeasure - 1;
    const endMeasure = this.loopEndMeasure - 1;
    if (startMeasure < 0 || endMeasure < 0) {
      this.loopStartTs = null;
      this.loopEndTs = null;
      return;
    }
    const startEntry = timemap.find((t) => t.measure === startMeasure);
    const endEntry = timemap.find((t) => t.measure === endMeasure);
    this.loopStartTs = startEntry?.timestamp != null ? toMs(startEntry.timestamp) : null;
    const endStart = endEntry?.timestamp != null ? toMs(endEntry.timestamp) : null;
    const endDur = endEntry?.duration != null ? toMs(endEntry.duration) : 0;
    this.loopEndTs = endStart != null ? endStart + endDur : null;
  }

  private startLoopMonitor() {
    if (this.loopTimer || !this.loopEnabled || this.loopStartTs == null || this.loopEndTs == null) return;
    this.loopTimer = window.setInterval(() => {
      if (!this.player) return;
      const posMs = this.getPlayerPositionMs();
      if (posMs != null && this.loopEndTs != null && posMs >= this.loopEndTs) {
        const measureIndex = Math.max(0, (this.loopStartMeasure ?? 1) - 1);
        const startMs = this.loopStartTs ?? 0;
        const p = this.player as { moveTo?: (a: number, b: number, c: number) => void };
        p.moveTo?.(measureIndex, startMs, 0);
        if (this.metronomeEnabled) this.restartMetronome();
      }
    }, 120);
  }

  private stopLoopMonitor() {
    if (this.loopTimer) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private getPlayerPositionMs(): number | null {
    const player = this.player as { position?: number; _options?: { converter?: { timemap?: { timestamp?: number }[] } } } | null;
    if (!player || player.position == null) return null;
    const pos = Number(player.position);
    if (Number.isNaN(pos)) return null;
    const timemap = player?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0) return pos > 1000 ? pos : pos * 1000;
    const lastTs = timemap[timemap.length - 1]?.timestamp ?? 0;
    const inSeconds = lastTs > 0 && lastTs < 1000;
    return inSeconds ? pos * 1000 : pos;
  }

  private getMoveToFromMeasureBeat(measure: number, beatInMeasure: number): {
    measureIndex: number;
    measureStartMs: number;
    measureOffsetMs: number;
  } | null {
    const player = this.player as { _options?: { converter?: { timemap?: Array<{ timestamp?: number; duration?: number; measure?: number }> } } } | null;
    const timemap = player?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0) return null;
    const measureIndex = Math.max(0, measure - 1);
    if (measureIndex >= timemap.length) return null;
    const lastTs = timemap[timemap.length - 1]?.timestamp ?? 0;
    const timemapInSeconds = lastTs > 0 && lastTs < 1000;
    const toMs = (t: number) => (timemapInSeconds ? t * 1000 : t);
    const entry = timemap[measureIndex];
    if (!entry) return null;
    const measureStartMs = toMs(entry.timestamp ?? 0);
    let duration = entry.duration != null ? toMs(entry.duration) : 0;
    if (duration <= 0 && timemap[measureIndex + 1]) {
      duration = toMs(timemap[measureIndex + 1].timestamp ?? 0) - measureStartMs;
    }
    const beats = Math.max(1, this.beatsPerMeasure);
    const beatDuration = duration > 0 ? duration / beats : 0;
    const measureOffsetMs = Math.min(duration, Math.max(0, beatInMeasure * beatDuration));
    return { measureIndex, measureStartMs, measureOffsetMs };
  }

  private getCurrentMeasureAndBeat(): {
    measure: number;
    beatInMeasure: number;
    fractionInMeasure: number;
  } | null {
    const posMs = this.getPlayerPositionMs();
    if (posMs == null) return null;
    const player = this.player as { _options?: { converter?: { timemap?: Array<{ timestamp?: number; duration?: number; measure?: number }> } } } | null;
    const timemap = player?._options?.converter?.timemap;
    if (!Array.isArray(timemap) || timemap.length === 0) return null;
    const lastTs = timemap[timemap.length - 1]?.timestamp ?? 0;
    const timemapInSeconds = lastTs > 0 && lastTs < 1000;
    const toMs = (t: number) => (timemapInSeconds ? t * 1000 : t);
    const beats = Math.max(1, this.beatsPerMeasure);
    let index = 0;
    for (let i = 0; i < timemap.length - 1; i++) {
      const start = toMs(timemap[i]?.timestamp ?? 0);
      const nextStart = toMs(timemap[i + 1]?.timestamp ?? Infinity);
      if (posMs >= start && posMs < nextStart) {
        index = i;
        break;
      }
      if (posMs < start) {
        index = Math.max(0, i - 1);
        break;
      }
      index = i;
    }
    const entry = timemap[index];
    if (!entry) return null;
    const measureStart = toMs(entry.timestamp ?? 0);
    let duration = entry.duration != null ? toMs(entry.duration) : 0;
    if (duration <= 0 && timemap[index + 1]) {
      duration = toMs(timemap[index + 1].timestamp ?? 0) - measureStart;
    }
    const measureNum = typeof entry.measure === 'number' ? entry.measure + 1 : index + 1;
    if (duration <= 0) {
      return { measure: measureNum, beatInMeasure: 0, fractionInMeasure: 0 };
    }
    const beatDuration = duration / beats;
    const beatInMeasure = Math.min(
      beats - 1,
      Math.max(0, Math.floor((posMs - measureStart) / beatDuration))
    );
    const fractionInMeasure = Math.max(0, Math.min(1, (posMs - measureStart) / duration));
    return { measure: measureNum, beatInMeasure, fractionInMeasure };
  }

  private getMeasureBoundsFromOsmd(measureIndex: number): {
    xStart: number;
    xEnd: number;
    yTop: number;
    yBottom: number;
  } | null {
    if (measureIndex < 0 || !this.osmd) return null;
    const cached = this.measureBoundsCache[measureIndex];
    if (cached) return cached;
    const osmdAny = this.osmd as unknown as Record<string, unknown>;
    const graphic = (osmdAny['GraphicSheet'] ?? osmdAny['graphic']) as
      | { findGraphicalMeasure?: (mi: number, si: number) => unknown }
      | undefined;
    if (!graphic?.findGraphicalMeasure) return null;
    try {
      const graphicAny = graphic as { systems?: { length: number } };
      const systemsCount =
        typeof graphicAny?.systems?.length === 'number' ? graphicAny.systems.length : 6;
      const maxSystems = Math.max(1, Math.min(20, systemsCount));
      let gMeasure: Record<string, unknown> | null | undefined;
      for (let si = 0; si < maxSystems; si++) {
        gMeasure = graphic.findGraphicalMeasure(measureIndex, si) as Record<string, unknown> | null | undefined;
        if (gMeasure) break;
      }
      if (!gMeasure) return null;
      const pos = (gMeasure['PositionAndShape'] ??
        gMeasure['positionAndShape'] ??
        gMeasure['boundingBox']) as {
        AbsolutePosition?: { x: number; y: number };
        absolutePosition?: { x: number; y: number };
        Size?: { width: number; height: number };
        size?: { width: number; height: number };
      } | undefined;
      if (!pos) return null;
      const ap = pos.AbsolutePosition ?? pos.absolutePosition;
      const sz = pos.Size ?? pos.size;
      const ax = ap?.x ?? 0;
      const ay = ap?.y ?? 0;
      const w = sz?.width ?? 0;
      const h = sz?.height ?? 0;
      const bounds = { xStart: ax, xEnd: ax + w, yTop: ay, yBottom: ay + h };
      this.measureBoundsCache[measureIndex] = bounds;
      return bounds;
    } catch {
      return null;
    }
  }

  private getCursorPointFromPosition(): { x: number; y: number } | null {
    const pos = this.getCurrentMeasureAndBeat();
    if (!pos) return null;
    const container = this.options.getScoreContainer();
    if (!container) return null;
    const player = this.player as { _options?: { converter?: { timemap?: unknown[] } } } | null;
    const timemap = player?._options?.converter?.timemap;
    const numMeasures = Math.max(1, Array.isArray(timemap) ? timemap.length : 1);
    const measureIndex = pos.measure - 1;
    const fraction = Math.max(0, Math.min(1, pos.fractionInMeasure));
    const bounds = this.getMeasureBoundsFromOsmd(measureIndex);
    if (bounds && bounds.xEnd - bounds.xStart > 0) {
      const xOsmd = bounds.xStart + fraction * (bounds.xEnd - bounds.xStart);
      const yOsmd = (bounds.yTop + bounds.yBottom) / 2;
      const svg = container.querySelector('svg');
      const viewBoxRaw = svg?.getAttribute('viewBox') ?? '';
      const parts = viewBoxRaw.split(/\s+/).map((n) => Number(n));
      if (svg && parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        const [minX, minY, vbW, vbH] = parts;
        const scaleX = vbW > 0 ? svg.clientWidth / vbW : 1;
        const scaleY = vbH > 0 ? svg.clientHeight / vbH : scaleX;
        const svgRect = svg.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const xPx = (xOsmd - minX) * scaleX + (svgRect.left - containerRect.left) + container.scrollLeft;
        const yPx = (yOsmd - minY) * scaleY + (svgRect.top - containerRect.top) + container.scrollTop;
        return { x: xPx, y: yPx };
      }
    }
    const progress = (measureIndex + fraction) / numMeasures;
    return {
      x: progress * container.scrollWidth,
      y: container.scrollTop + container.clientHeight / 2,
    };
  }

  private syncPlaybackCursor() {
    const pos = this.getCurrentMeasureAndBeat();
    if (pos) {
      this.lastCursorMeasure = pos.measure;
      this.lastCursorBeat = pos.beatInMeasure;
      this.playbackPosition = {
        measure: pos.measure,
        beat: pos.beatInMeasure + 1,
        timeSignature: this.timeSignature,
      };
    }
    const container = this.options.getScoreContainer();
    const point = this.getCursorPointFromPosition();
    if (point && Number.isFinite(point.x)) {
      const scrollWidth = container?.scrollWidth ?? 0;
      const maxX = Math.max(0, scrollWidth - 4);
      this.lastCursorX = Math.max(0, Math.min(maxX, point.x));
      if (Number.isFinite(point.y)) this.lastCursorY = point.y;
    }
    this.playbackCursorX = this.lastCursorX;
    this.scrollCursorIntoView(this.lastCursorX, this.lastCursorY);
    this.emit();
  }

  private scrollCursorIntoView(cursorX: number, cursorY: number) {
    const container = this.options.getScoreContainer();
    if (!container) return;
    const now = Date.now();
    if (now - this.lastScrollIntoViewTime < this.scrollIntoViewThrottleMs) return;
    this.lastScrollIntoViewTime = now;
    try {
      const cw = container.clientWidth;
      const sw = container.scrollWidth;
      if (sw > cw && Number.isFinite(cursorX)) {
        const targetScrollLeft = Math.max(0, cursorX - cw / 2);
        const maxScrollLeft = sw - cw;
        const clampedLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
        if (Math.abs(container.scrollLeft - clampedLeft) > 2) {
          container.scrollTo({ left: clampedLeft, behavior: 'smooth' });
        }
      }
      const targetScrollTop = cursorY - container.clientHeight / 2;
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
      const clampedTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
      if (Math.abs(container.scrollTop - clampedTop) > 2) {
        container.scrollTo({ top: clampedTop, behavior: 'smooth' });
      }
    } catch {
      /* ignore */
    }
  }

  private startCursorSync() {
    if (this.cursorSyncTimer) return;
    this.cursorSyncTimer = window.setInterval(() => this.syncPlaybackCursor(), 30);
  }

  private stopCursorSync() {
    if (this.cursorSyncTimer) {
      window.clearInterval(this.cursorSyncTimer);
      this.cursorSyncTimer = null;
    }
    this.playbackPosition = null;
    this.playbackCursorX = null;
    this.lastCursorX = 0;
    this.lastCursorY = 0;
    this.emit();
  }

  pause() {
    const p = this.player as { pause?: () => void } | null;
    p?.pause?.();
    this.isPlaying = false;
    this.stopLoopMonitor();
    this.stopCursorSync();
    this.playerController.stopMetronome();
    this.emit();
  }

  stop() {
    const p = this.player as { pause?: () => void; rewind?: () => void; moveTo?: (a: number, b: number, c: number) => void } | null;
    if (p) {
      p.pause?.();
      if (p.rewind) p.rewind();
      else p.moveTo?.(0, 0, 0);
    }
    this.isPlaying = false;
    this.stopLoopMonitor();
    this.stopCursorSync();
    this.lastCursorMeasure = -1;
    this.lastCursorBeat = -1;
    this.playerController.stopMetronome();
    this.emit();
  }

  async play() {
    if (this.isPlaying) return;
    const token = this.loadToken;
    await this.prepareMidiForPlayer(token);
    if (token !== this.loadToken || !this.midiLoaded) return;

    if (this.player) {
      const measure = this.lastCursorMeasure >= 1 ? this.lastCursorMeasure : 1;
      const beat = this.lastCursorBeat >= 0 ? this.lastCursorBeat : 0;
      const moveTo = this.getMoveToFromMeasureBeat(measure, beat);
      const pl = this.player as { moveTo?: (a: number, b: number, c: number) => void; play?: () => void };
      if (moveTo && pl.moveTo) {
        pl.moveTo(moveTo.measureIndex, moveTo.measureStartMs, moveTo.measureOffsetMs);
      }
      pl.play?.();
      this.isPlaying = true;
      this.startLoopMonitor();
      this.startCursorSync();
      this.syncPlaybackCursor();
      if (this.metronomeEnabled) this.playerController.startMetronomeSync(this.bpm, this.beatsPerMeasure);
      this.emit();
      return;
    }

    if (this.midiOnlyMode) {
      this.options.onSnack?.(
        'Partituras grandes: use o download MIDI quando disponível.',
      );
      const midi = await this.getMidiBufferForCurrentScore();
      if (midi) this.triggerMidiDownload(midi);
    }
  }

  private triggerMidiDownload(midi: ArrayBuffer) {
    const blob = new Blob([midi], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partitura-${this.currentScoreId.replace(/^local:/, '')}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async prepareMidiForPlayer(token: number) {
    if (token !== this.loadToken) return;
    if (!this.playerReady) return;
    if (this.midiLoaded) return;
    this.midiLoading = true;
    this.playerError = null;
    this.emit();
    try {
      await this.loadMidiForCurrentScore(token);
      if (token !== this.loadToken) return;
      if (!this.midiLoaded) {
        this.playerError = this.midiOnlyMode ? 'MIDI não disponível para esta partitura.' : 'Player indisponível.';
        if (!this.midiOnlyMode) this.playerReady = false;
      }
    } catch {
      if (token === this.loadToken) {
        this.playerError = 'Player indisponível.';
        if (!this.midiOnlyMode) this.playerReady = false;
      }
    } finally {
      if (token === this.loadToken) {
        this.midiLoading = false;
        this.emit();
      }
    }
  }

  private async loadMidiForCurrentScore(token: number) {
    this.midiLoaded = false;
    const midi = await this.getMidiBufferForCurrentScore();
    if (!midi || token !== this.loadToken) return;
    const p = this.player as { loadMIDI?: (b: ArrayBuffer) => void; loadMidi?: (b: ArrayBuffer) => void; setMidi?: (b: ArrayBuffer) => void } | null;
    if (p) {
      if (p.loadMIDI) p.loadMIDI(midi);
      else if (p.loadMidi) p.loadMidi(midi);
      else if (p.setMidi) p.setMidi(midi);
    }
    this.midiLoaded = true;
  }

  private async getMidiBufferForCurrentScore(): Promise<ArrayBuffer | null> {
    if (this.currentScoreId.startsWith('local:')) {
      const cached = this.midiCache.get(this.currentScoreId);
      if (cached) return cached;
      const assetName = this.currentScoreId.replace('local:', '');
      const midiName = assetName.replace(/\.musicxml$/i, '.mid').replace(/\.xml$/i, '.mid');
      try {
        const res = await fetch(`/assets/${midiName}?v=${Date.now()}`);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        this.midiCache.set(this.currentScoreId, buf);
        return buf;
      } catch {
        return null;
      }
    }
    const cached = this.midiCache.get(this.currentScoreId);
    if (cached) return cached;
    const midi = await this.tryGetMidi(this.currentScoreId);
    if (midi) this.midiCache.set(this.currentScoreId, midi);
    return midi;
  }

  private async tryGetMidi(id: string): Promise<ArrayBuffer | null> {
    const base = this.options.getApiUrl();
    try {
      const r = await fetch(`${base}/scores/${encodeURIComponent(id)}/midi`);
      if (r.ok) return await r.arrayBuffer();
    } catch {
      /* continue */
    }
    try {
      const r = await fetch(`${base}/scores/${encodeURIComponent(id)}/midi?generate=true`);
      if (r.ok) return await r.arrayBuffer();
    } catch {
      /* ignore */
    }
    return null;
  }

  private scheduleMidiPrefetch() {
    if (this.midiPrefetchScheduled || this.midiLoading || this.midiLoaded || this.isPlaying) return;
    this.midiPrefetchScheduled = true;
    const run = () => {
      this.midiPrefetchScheduled = false;
      void this.prefetchMidiForCurrentScore();
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (typeof idle === 'function') idle(run, { timeout: 1500 });
    else window.setTimeout(run, 0);
  }

  private scheduleMidiWarmup() {
    if (
      this.midiWarmupScheduled ||
      !this.playerReady ||
      this.midiLoaded ||
      this.midiLoading ||
      this.isPlaying
    )
      return;
    this.midiWarmupScheduled = true;
    const token = this.loadToken;
    const run = () => {
      this.midiWarmupScheduled = false;
      void this.prepareMidiForPlayer(token);
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (typeof idle === 'function') idle(run, { timeout: 3000 });
    else window.setTimeout(run, 500);
  }

  private async prefetchMidiForCurrentScore() {
    if (this.midiLoading || this.midiLoaded || this.isPlaying) return;
    await this.getMidiBufferForCurrentScore();
  }

  setTempo(value: number) {
    if (value == null || Number.isNaN(value)) return;
    this.bpm = value;
    this.tempo = this.bpm / this.baseBpm;
    this.applyTempo();
    this.emit();
  }

  setAudioVolume(value: number) {
    if (value == null || Number.isNaN(value)) return;
    this.audioVolume = Math.max(0, Math.min(1, value));
    this.applyAudioVolume();
    this.emit();
  }

  toggleMetronome() {
    this.metronomeEnabled = !this.metronomeEnabled;
    this.playerController.metronomeEnabled = this.metronomeEnabled;
    if (this.metronomeEnabled) {
      if (this.isPlaying) this.playerController.startMetronomeSync(this.bpm, this.beatsPerMeasure);
    } else {
      this.playerController.stopMetronome();
    }
    this.emit();
  }

  setMetronomeVolume(value: number) {
    if (value == null || Number.isNaN(value)) return;
    this.metronomeVolume = value;
    this.playerController.metronomeVolume = value;
    this.emit();
  }

  toggleLoop() {
    this.loopEnabled = !this.loopEnabled;
    this.applyLoop();
    if (this.loopEnabled && this.isPlaying) this.startLoopMonitor();
    else this.stopLoopMonitor();
    this.emit();
  }

  setLoopStartMeasure(v: number | null) {
    this.loopStartMeasure = v != null && Number.isFinite(v) ? v : null;
    this.applyLoop();
    this.emit();
  }

  setLoopEndMeasure(v: number | null) {
    this.loopEndMeasure = v != null && Number.isFinite(v) ? v : null;
    this.applyLoop();
    this.emit();
  }

  private restartMetronome() {
    if (!this.metronomeEnabled) return;
    this.playerController.stopMetronome();
    if (this.isPlaying) this.playerController.startMetronomeSync(this.bpm, this.beatsPerMeasure);
  }
}
