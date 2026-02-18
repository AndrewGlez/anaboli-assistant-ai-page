import { useEffect, useRef, useCallback } from 'react';

interface UseSSETimeoutOptions {
  timeout?: number;
  onTimeout: () => void;
  enabled?: boolean;
}

export function useSSETimeout({
  timeout = 10000,
  onTimeout,
  enabled = true,
}: UseSSETimeoutOptions) {
  const timeoutIdRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const set = useCallback(() => {
    if (!enabled) return;
    clear();
    timeoutIdRef.current = window.setTimeout(onTimeout, timeout);
  }, [enabled, timeout, onTimeout, clear]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return { set, clear };
}
