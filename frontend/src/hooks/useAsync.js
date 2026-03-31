import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Generic async operation hook with loading/error/data states.
 */
export function useAsync(asyncFn, immediate = false, deps = []) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: immediate,
  });
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await asyncFn(...args);
        if (mountedRef.current) {
          setState({ data: result, error: null, loading: false });
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setState({ data: null, error: err, loading: false });
        }
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFn, ...deps]
  );

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) execute();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return { ...state, execute, reset: () => setState({ data: null, error: null, loading: false }) };
}

/**
 * Debounced value hook.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
