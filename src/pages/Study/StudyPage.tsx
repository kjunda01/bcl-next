import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiUrl } from '../../config/environment';
import { useStudySession } from '../../study/useStudySession';
import { StudyInstrumentPanel } from '../../components/StudyInstrumentPanel';
import { StudyPlayerPanel } from '../../components/StudyPlayerPanel';
import {
  StudySongCatalog,
  type StudyStartOptions,
} from '../../components/study/StudySongCatalog';

export default function StudyPage() {
  const apiUrl = getApiUrl();

  const [snack, setSnack] = useState<string | null>(null);
  const { session, state, scoreContainerRef, osmdContainerRef } = useStudySession(
    () => apiUrl,
    (m) => {
      setSnack(m);
      window.setTimeout(() => setSnack(null), 4000);
    },
  );

  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const showInitialContent =
    !state.xmlLoaded &&
    !state.scoreLoading &&
    !selectedSongId;

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

  const backToExamples = useCallback(() => {
    session.reset();
    setSelectedSongId(null);
    setMobileSheetOpen(false);
  }, [session]);

  const startStudy = ({
    song,
    xml,
    scoreInstrumentIds,
    midiInstrumentIds,
  }: StudyStartOptions) => {
    const songId = String(song.id);
    setSelectedSongId(songId);
    void session.loadStudy(xml, songId, song.title, {
      scoreInstrumentIds,
      midiInstrumentIds,
    });
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
    state.xmlLoaded || state.scoreLoading || selectedSongId;

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
              Escolha uma música, configure a partitura e o MIDI e comece a praticar.
            </p>
          </div>
          {state.xmlLoaded ? (
            <button type="button" className="flex items-center gap-1.5 px-4 py-2.5 font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50" onClick={backToExamples}>
              <span className="material-icons text-lg" aria-hidden>
                arrow_back
              </span>
              Escolher outra música
            </button>
          ) : null}
        </header>
      )}

      {showInitialContent ? (
        <StudySongCatalog onStart={startStudy} />
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
              aria-label="Voltar às músicas"
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
                  {!state.scoreLoading && state.scoreError ? (
                    <span className="text-red-700">{state.scoreError}</span>
                  ) : null}
                  {!state.scoreLoading && !state.scoreError ? (
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
