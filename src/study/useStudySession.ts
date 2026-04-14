import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { StudySession, type StudySessionOptions } from './studySession';

export function useStudySession(
  getApiUrl: () => string,
  onSnack: (message: string) => void,
) {
  const scoreContainerRef = useRef<HTMLDivElement | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement | null>(null);
  const getApiUrlRef = useRef(getApiUrl);
  getApiUrlRef.current = getApiUrl;
  const onSnackRef = useRef(onSnack);
  onSnackRef.current = onSnack;

  const session = useMemo(() => {
    const opts: StudySessionOptions = {
      getApiUrl: () => getApiUrlRef.current(),
      getScoreContainer: () => scoreContainerRef.current,
      getOsmdContainer: () => osmdContainerRef.current,
      onSnack: (m) => onSnackRef.current(m),
    };
    return new StudySession(opts);
  }, []);

  const subscribe = useCallback(
    (onStoreChange: () => void) => session.subscribe(onStoreChange),
    [session],
  );
  const getSnapshot = useCallback(() => session.getSnapshot(), [session]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    return () => session.destroy();
  }, [session]);

  return {
    session,
    state,
    scoreContainerRef,
    osmdContainerRef,
  };
}
