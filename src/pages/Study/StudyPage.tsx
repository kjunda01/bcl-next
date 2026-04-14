import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../../config/environment';
import { getExampleLabel, STUDY_EXAMPLES } from '../../study/studyConfig';
import { useStudySession } from '../../study/useStudySession';
import { StudyInstrumentPanel } from '../../components/StudyInstrumentPanel';
import { StudyPlayerPanel } from '../../components/StudyPlayerPanel';

type SongOption = { id: string; label: string };

export default function StudyPage() {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const apiUrlRef = useRef(getApiUrl());
  apiUrlRef.current = getApiUrl();

  const [snack, setSnack] = useState<string | null>(null);
  const { session, state, scoreContainerRef, osmdContainerRef } = useStudySession(
    () => apiUrlRef.current,
    (m) => {
      setSnack(m);
      window.setTimeout(() => setSnack(null), 4000);
    },
  );

  const [idDraft, setIdDraft] = useState('');
  const [songOptions, setSongOptions] = useState<SongOption[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadTokenRef = useRef(0);
  const prevRouteIdRef = useRef<string | undefined>(undefined);

  const showInitialContent =
    !state.xmlLoaded &&
    !state.scoreLoading &&
    !selectedExampleId &&
    !routeId;

  const instrumentsOpen =
    state.xmlLoaded &&
    state.instruments.available.length >= 1 &&
    !state.instruments.cardCollapsed;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const onChange = () => {
      session.updateMobile(mq.matches);
    };
    session.updateMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [session]);

  useEffect(() => {
    document.body.classList.toggle('study-fullscreen-active', state.fullscreenScore);
    document.body.classList.toggle(
      'study-mobile-fullscreen-active',
      state.fullscreenScore && state.isMobile,
    );
    return () => {
      document.body.classList.remove('study-fullscreen-active');
      document.body.classList.remove('study-mobile-fullscreen-active');
    };
  }, [state.fullscreenScore, state.isMobile]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiUrlRef.current}/songs`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        const opts = data.map((s: { id?: unknown; title?: unknown }) => ({
          id: String(s.id ?? ''),
          label: String(s.title ?? `Partitura ${s.id}`),
        }));
        setSongOptions(opts.filter((o) => o.id));
      })
      .catch(() => {
        if (!cancelled) setSongOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onBlur = () => session.pause();
    const onVis = () => {
      if (document.hidden) session.pause();
    };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [session]);

  const fetchLocalXml = useCallback(async (assetName: string) => {
    const safe = assetName?.trim() || 'score.xml';
    const bust = `?v=${Date.now()}`;
    const res = await fetch(`/assets/${safe}${bust}`);
    if (!res.ok) throw new Error('musicxml_not_found');
    const xml = await res.text();
    if (!xml || xml.trim().length < 20) throw new Error('musicxml_empty');
    return xml;
  }, []);

  const fetchApiXml = useCallback(async (id: string) => {
    const res = await fetch(`${apiUrlRef.current}/scores/${encodeURIComponent(id)}/musicxml`);
    if (!res.ok) throw new Error('api_musicxml_failed');
    const xml = await res.text();
    if (!xml || xml.trim().length < 20) throw new Error('musicxml_empty');
    return xml;
  }, []);

  const runLoad = useCallback(
    async (mode: 'api' | 'local', payload: string, displayName: string, scoreKey: string) => {
      const token = ++loadTokenRef.current;
      setFetchError(null);
      try {
        const xml =
          mode === 'api' ? await fetchApiXml(payload) : await fetchLocalXml(payload);
        if (token !== loadTokenRef.current) return;
        await session.loadStudy(xml, scoreKey, displayName);
      } catch {
        if (token !== loadTokenRef.current) return;
        if (mode === 'api') {
          try {
            const xml = await fetchLocalXml('score.xml');
            if (token !== loadTokenRef.current) return;
            await session.loadStudy(xml, 'local:score.xml', getExampleLabel('score.xml'));
            setFetchError(null);
          } catch {
            setFetchError('Não foi possível carregar a partitura.');
          }
        } else {
          setFetchError('Não foi possível carregar a partitura.');
        }
      }
    },
    [fetchApiXml, fetchLocalXml, session],
  );

  useEffect(() => {
    const prev = prevRouteIdRef.current;
    prevRouteIdRef.current = routeId;

    if (routeId) {
      setIdDraft(routeId);
      setSelectedSongId(routeId);
      void runLoad('api', routeId, `ID ${routeId}`, routeId);
      return;
    }

    if (prev && !routeId) {
      loadTokenRef.current += 1;
      session.reset();
      setSelectedSongId(null);
      setIdDraft('');
      setSelectedExampleId(null);
      setFetchError(null);
    }
  }, [routeId, runLoad, session]);

  const backToExamples = useCallback(() => {
    loadTokenRef.current += 1;
    session.reset();
    setSelectedExampleId(null);
    setSelectedSongId(null);
    setIdDraft('');
    setFetchError(null);
    setMobileSheetOpen(false);
    navigate('/study', { replace: true });
  }, [navigate, session]);

  const selectExample = (exampleId: string) => {
    setSelectedExampleId(exampleId);
    void runLoad('local', exampleId, getExampleLabel(exampleId), `local:${exampleId}`);
  };

  const selectSong = (songId: string) => {
    setSelectedSongId(songId);
    setIdDraft(songId);
    navigate(`/study/${encodeURIComponent(songId)}`, { replace: true });
  };

  const loadByTypedId = () => {
    const id = idDraft.trim();
    if (!id) return;
    selectSong(id);
  };

  const playerSlice = useMemo(
    () => ({
      loading: state.loading,
      playerReady: state.playerReady,
      playerLoading: state.playerLoading,
      midiLoaded: state.midiLoaded,
      midiLoading: state.midiLoading,
      playerError: state.playerError,
      playerExpanded: state.playerExpanded,
      bpm: state.bpm,
      bpmMin: state.bpmMin,
      bpmMax: state.bpmMax,
      timeSignature: state.timeSignature,
      baseBpm: state.baseBpm,
      metronomeEnabled: state.metronomeEnabled,
      metronomeVolume: state.metronomeVolume,
      audioVolume: state.audioVolume,
      loopEnabled: state.loopEnabled,
      loopStartMeasure: state.loopStartMeasure,
      loopEndMeasure: state.loopEndMeasure,
    }),
    [state],
  );

  const showScoreBlock =
    state.xmlLoaded || state.scoreLoading || selectedExampleId || routeId;

  const desktopInstruments =
    state.xmlLoaded &&
    state.instruments.available.length >= 1 &&
    !(state.fullscreenScore && state.isMobile);

  const mobileInstruments =
    state.xmlLoaded &&
    state.instruments.available.length >= 1 &&
    state.fullscreenScore &&
    state.isMobile;

  return (
    <div className={`flex flex-col flex-1 min-h-0 gap-5 pb-5 ${state.fullscreenScore ? 'fixed inset-0 z-[1001] overflow-hidden pb-0 w-screen h-[100dvh] max-h-[100dvh] bg-gray-50' : ''}`}>
      {snack ? <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[1200] px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm shadow-lg" role="status">{snack}</div> : null}

      {!state.fullscreenScore && (
        <header className="flex flex-wrap items-end justify-between gap-4 px-4 py-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-3xl text-primary" aria-hidden>
                music_note
              </span>
              <h1 className="m-0 text-3xl font-medium">Estudo</h1>
            </div>
            <p className="mt-1 text-gray-600 max-w-4xl">
              Escolha uma partitura de exemplo ou uma música salva para começar a praticar.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">ID na API</span>
              <input
                type="text"
                value={idDraft}
                onChange={(e) => setIdDraft(e.target.value)}
                placeholder="ex.: 1"
                className="min-w-36 px-2.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            {idDraft.trim() ? (
              <button type="button" className="px-4 py-2.5 font-medium rounded-lg bg-primary text-white hover:opacity-90" onClick={loadByTypedId}>
                Carregar
              </button>
            ) : null}
            {state.xmlLoaded ? (
              <button type="button" className="flex items-center gap-1.5 px-4 py-2.5 font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50" onClick={backToExamples}>
                <span className="material-icons text-lg" aria-hidden>
                  arrow_back
                </span>
                Voltar aos exemplos
              </button>
            ) : null}
          </div>
        </header>
      )}

      {showInitialContent ? (
        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-5">
          <div className="flex items-start gap-3 mb-5">
            <span className="material-icons text-3xl text-primary" aria-hidden>
              library_music
            </span>
            <p className="m-0 text-gray-700">Selecione uma partitura de exemplo ou uma música salva para começar.</p>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2.5">Exemplos</span>
            <div className="flex flex-wrap gap-2">
              {STUDY_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  className={`px-2.5 py-2 font-medium rounded-lg border text-sm ${selectedExampleId === ex.id ? 'border-primary bg-blue-50 text-primary' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                  onClick={() => selectExample(ex.id)}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
          {songOptions.length > 0 ? (
            <div className="mt-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">Partituras salvas</span>
                <select
                  value={selectedSongId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) selectSong(v);
                  }}
                  className="max-w-sm px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione uma música</option>
                  {songOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={`flex flex-col gap-5 flex-1 min-h-0 relative ${state.fullscreenScore && state.isMobile ? 'study-mobile-fullscreen' : ''}`}>
        {mobileInstruments && instrumentsOpen ? (
          <aside className="fixed left-0 top-0 bottom-0 w-[90vw] max-w-80 z-[1100] bg-white border-r border-gray-300 shadow-2xl flex flex-col transform -translate-x-full visibility-hidden transition-all" role="dialog" aria-label="Menu de instrumentos">
            <StudyInstrumentPanel
              available={state.instruments.available}
              selectedIds={state.instruments.selectedIds}
              filtered={state.instruments.filtered}
              selectionMatchesApplied={state.instruments.selectionMatchesApplied}
              filter={state.instruments.filter}
              loading={state.loading}
              xmlLoaded={state.xmlLoaded}
              allSelected={state.instruments.allSelected}
              onFilterChange={(v) => session.setInstrumentFilter(v)}
              onToggle={(id, c) => session.toggleInstrument(id, c)}
              onSelectOnly={(id) => session.selectOnlyInstrument(id)}
              onSelectAllChange={(checked) =>
                checked ? session.selectAllInstruments() : session.restoreAppliedInstruments()
              }
              onApply={() => session.applySelectedInstruments()}
              onCancel={() => session.cancelInstrumentSelection()}
              onRestore={() => session.restoreAppliedInstruments()}
              onClose={() => session.setInstrumentCardCollapsed(true)}
            />
          </aside>
        ) : null}
        {mobileInstruments && state.instruments.cardCollapsed ? (
          <button
            type="button"
            className="fixed left-0 top-2/5 z-[1101] inline-flex items-center justify-center gap-2 min-w-[3rem] h-12 px-2 border-0 rounded-r-lg bg-white text-gray-900 cursor-pointer shadow-md opacity-90 hover:opacity-100 hover:pl-3 hover:pr-3.5"
            onClick={() => session.toggleInstrumentsMenu()}
            aria-label="Expandir instrumentos"
          >
            <span className="material-icons">chevron_right</span>
            <span className="whitespace-nowrap text-sm font-medium max-w-0 overflow-hidden opacity-0 transition-all">Instrumentos</span>
          </button>
        ) : null}

        {state.fullscreenScore && state.isMobile ? (
          <header className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-300 flex-shrink-0">
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-gray-200 cursor-pointer text-gray-700"
              onClick={backToExamples}
              aria-label="Voltar aos exemplos"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <span className="flex-1 text-center font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">{state.currentScoreName}</span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-gray-200 cursor-pointer text-gray-700"
              onClick={() => setMobileSheetOpen((o) => !o)}
              aria-label="Controles"
            >
              <span className="material-icons">tune</span>
            </button>
          </header>
        ) : null}

        {desktopInstruments ? (
          <>
            <aside
              className="fixed left-0 top-14 bottom-0 w-80 max-w-[90vw] z-[1100] bg-white border-r border-gray-300 shadow-lg flex flex-col"
              role="dialog"
              aria-label="Menu de instrumentos"
            >
              <StudyInstrumentPanel
                available={state.instruments.available}
                selectedIds={state.instruments.selectedIds}
                filtered={state.instruments.filtered}
                selectionMatchesApplied={state.instruments.selectionMatchesApplied}
                filter={state.instruments.filter}
                loading={state.loading}
                xmlLoaded={state.xmlLoaded}
                allSelected={state.instruments.allSelected}
                onFilterChange={(v) => session.setInstrumentFilter(v)}
                onToggle={(id, c) => session.toggleInstrument(id, c)}
                onSelectOnly={(id) => session.selectOnlyInstrument(id)}
                onSelectAllChange={(checked) =>
                  checked ? session.selectAllInstruments() : session.restoreAppliedInstruments()
                }
                onApply={() => session.applySelectedInstruments()}
                onCancel={() => session.cancelInstrumentSelection()}
                onRestore={() => session.restoreAppliedInstruments()}
                onClose={() => session.setInstrumentCardCollapsed(true)}
              />
            </aside>
            {state.instruments.cardCollapsed ? (
              <button
                type="button"
                className="fixed left-0 top-2/5 z-[1101] inline-flex items-center justify-center gap-2 min-w-[3rem] h-12 px-2 border-0 rounded-r-lg bg-white text-gray-900 cursor-pointer shadow-md opacity-90 hover:opacity-100"
                onClick={() => session.toggleInstrumentsMenu()}
                aria-label="Expandir instrumentos"
              >
                <span className="material-icons">chevron_right</span>
                <span className="whitespace-nowrap text-sm font-medium max-w-0 overflow-hidden opacity-0">Instrumentos</span>
              </button>
            ) : null}
          </>
        ) : null}

        {!(state.fullscreenScore && state.isMobile) && showScoreBlock ? (
          <div className="w-full min-h-0">
            <div className="flex flex-col gap-5 min-w-0">
              {state.xmlLoaded ? (
                <StudyPlayerPanel
                  state={playerSlice}
                  onPlay={() => void session.play()}
                  onPause={() => session.pause()}
                  onStop={() => session.stop()}
                  onToggleExpanded={() => session.togglePlayerExpanded()}
                  onTempo={(v) => session.setTempo(v)}
                  onAudioVolume={(v) => session.setAudioVolume(v)}
                  onToggleMetronome={() => session.toggleMetronome()}
                  onMetronomeVolume={(v) => session.setMetronomeVolume(v)}
                  onToggleLoop={() => session.toggleLoop()}
                  onLoopStart={(v) => session.setLoopStartMeasure(v)}
                  onLoopEnd={(v) => session.setLoopEndMeasure(v)}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {showScoreBlock ? (
          <section className={`flex flex-col flex-1 min-h-0 bg-white border border-gray-300 rounded-2xl overflow-hidden ${state.fullscreenScore ? 'flex-1 rounded-none border-0 min-h-0' : ''}`}>
            {state.fullscreenScore ? (
              <button
                type="button"
                className="absolute top-3 right-3 z-20 inline-flex items-center gap-2 px-3 py-2 bg-white/95 border border-gray-300 rounded-lg cursor-pointer text-xs font-medium shadow-md hover:bg-white"
                onClick={() => session.toggleFullscreenScore()}
                aria-label="Sair da tela cheia"
              >
                <span className="material-icons text-lg" aria-hidden>
                  fullscreen_exit
                </span>
                <span>Sair da tela cheia</span>
              </button>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 border-b border-gray-300 flex-shrink-0">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2.5">
                <span className="material-icons text-2xl text-primary" aria-hidden>
                  menu_book
                </span>
                <span className="font-medium text-gray-900">Partitura</span>
                <span className="font-medium text-gray-900">{state.currentScoreName}</span>
                {state.playbackPosition ? (
                  <span className="text-xs font-medium text-primary bg-blue-100 px-2 py-1 rounded whitespace-nowrap" aria-live="polite">
                    Compasso {state.playbackPosition.measure + 1}, tempo {state.playbackPosition.beat}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {state.xmlLoaded ? (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 cursor-pointer text-xs font-medium hover:bg-gray-50"
                      onClick={() => session.openInstrumentSelection()}
                    >
                      <span className="material-icons text-base">tune</span>
                      <span className="hidden md:inline">Instrumentos</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 cursor-pointer text-xs font-medium hover:bg-gray-50"
                      onClick={() => session.toggleFullscreenScore()}
                    >
                      <span className="material-icons text-base">
                        {state.fullscreenScore ? 'fullscreen_exit' : 'fullscreen'}
                      </span>
                      <span className="hidden md:inline">
                        {state.fullscreenScore ? 'Sair da tela cheia' : 'Tela cheia'}
                      </span>
                    </button>
                  </div>
                ) : null}
                <div className="text-sm">
                  {state.scoreLoading ? <span className="text-gray-600">Carregando…</span> : null}
                  {!state.scoreLoading && (fetchError || state.scoreError) ? (
                    <span className="text-red-700">{fetchError ?? state.scoreError}</span>
                  ) : null}
                  {!state.scoreLoading && !fetchError && !state.scoreError ? (
                    <span className="text-green-700">{state.xmlLoaded ? 'Pronto' : 'Pendente'}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <div className="relative flex-1 min-h-52 max-h-[70vh] px-4 py-4 bg-gray-100 overflow-auto" ref={scoreContainerRef}>
                {state.scoreLoading ? (
                  <div className="absolute inset-0 z-5 flex flex-col items-center justify-center gap-4 bg-white/88 pointer-events-none">
                    <div className="flex flex-col gap-2.5 opacity-35" aria-hidden>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-0.5 bg-gray-600 rounded-sm w-min(100%, 480px)" />
                      ))}
                    </div>
                    <p className="m-0 font-medium text-gray-700">Carregando partitura…</p>
                  </div>
                ) : null}
                {state.xmlLoaded && state.playbackCursorX != null ? (
                  <div className="absolute inset-0 pointer-events-none z-10" aria-hidden>
                    <div
                      className="absolute top-0 bottom-0 w-1.25 bg-red-600 rounded-sm shadow-lg"
                      style={{ left: state.playbackCursorX }}
                    />
                  </div>
                ) : null}
                <div ref={osmdContainerRef} className="min-h-52" />
              </div>
            </div>
          </section>
        ) : null}

        {state.fullscreenScore && state.isMobile && state.xmlLoaded ? (
          <>
            <div className="flex-shrink-0 h-20 pointer-events-none" aria-hidden />
            <div className="fixed bottom-0 left-0 right-0 z-[1005] flex items-center justify-center gap-3 px-4 py-3 bg-white/96 border-t border-gray-300 shadow-lg" style={{ paddingBottom: `calc(12px + env(safe-area-inset-bottom, 0))` }}>
              <button
                type="button"
                className="w-14 h-14 rounded-full border-0 bg-primary text-white cursor-pointer inline-flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => void session.play()}
                disabled={state.loading}
                aria-label="Play"
              >
                <span className="material-icons text-4xl">play_arrow</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border-0 bg-transparent hover:bg-gray-200 cursor-pointer text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => session.pause()}
                disabled={state.loading}
                aria-label="Pausar"
              >
                <span className="material-icons">pause</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border-0 bg-transparent hover:bg-gray-200 cursor-pointer text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => session.stop()}
                disabled={state.loading}
                aria-label="Parar"
              >
                <span className="material-icons">stop</span>
              </button>
            </div>
            <div className={`fixed inset-0 z-1006 pointer-events-none visibility-hidden ${mobileSheetOpen ? 'pointer-events-auto visibility-visible' : ''}`} role="dialog" aria-label="Controles do player">
              <div
                className={`absolute inset-0 bg-black/35 opacity-0 transition-opacity ${mobileSheetOpen ? 'opacity-100' : ''}`}
                onClick={() => setMobileSheetOpen(false)}
                aria-hidden
              />
              <div className={`absolute left-0 right-0 bottom-0 max-h-[70vh] bg-white border-t-4 border-rounded-t-2xl shadow-2xl transform translate-y-full transition-transform flex flex-col min-h-0 ${mobileSheetOpen ? 'translate-y-0' : ''}`}>
                <div className="flex items-center justify-between px-2 py-2 md:px-4 font-semibold border-b border-gray-300 flex-shrink-0">
                  <span>Controles</span>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-gray-200 cursor-pointer text-gray-700"
                    onClick={() => setMobileSheetOpen(false)}
                    aria-label="Fechar"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
                <div className="overflow-auto px-4 py-2 md:px-4 md:py-3 flex-1 min-h-0">
                  {state.playerReady ? (
                    <StudyPlayerPanel
                      state={playerSlice}
                      mobileControlsOnly
                      onPlay={() => void session.play()}
                      onPause={() => session.pause()}
                      onStop={() => session.stop()}
                      onToggleExpanded={() => session.togglePlayerExpanded()}
                      onTempo={(v) => session.setTempo(v)}
                      onAudioVolume={(v) => session.setAudioVolume(v)}
                      onToggleMetronome={() => session.toggleMetronome()}
                      onMetronomeVolume={(v) => session.setMetronomeVolume(v)}
                      onToggleLoop={() => session.toggleLoop()}
                      onLoopStart={(v) => session.setLoopStartMeasure(v)}
                      onLoopEnd={(v) => session.setLoopEndMeasure(v)}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
