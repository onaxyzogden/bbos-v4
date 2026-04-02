// useStorage — React hook for bbos_ localStorage values
import { useState, useCallback } from 'react';
import { safeGet, safeGetJSON, safeSet } from '../services/storage.js';

export function useStorageValue(key, fallback = '') {
  const [value, setValue] = useState(() => safeGet(key, fallback));

  const update = useCallback((newVal) => {
    safeSet(key, newVal);
    setValue(newVal);
  }, [key]);

  return [value, update];
}

export function useStorageJSON(key, fallback = null) {
  const [value, setValue] = useState(() => safeGetJSON(key, fallback));

  const update = useCallback((newVal) => {
    safeSet(key, JSON.stringify(newVal));
    setValue(newVal);
  }, [key]);

  return [value, update];
}
