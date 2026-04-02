// Storage service — safe localStorage wrapper with bbos_ prefix pattern

export function safeSet(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage.setItem failed:', e);
  }
}

export function safeGet(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch (e) {
    console.warn('localStorage.getItem failed:', e);
    return fallback;
  }
}

export function safeGetJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('localStorage.removeItem failed:', e);
  }
}

// Export all BBOS data as JSON
export function exportProject() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('bbos_')) {
      data[key] = localStorage.getItem(key);
    }
  }
  return {
    bbos_version: '4.0',
    exported_at: new Date().toISOString(),
    data,
  };
}

// Import BBOS data from JSON
export function importProject(json) {
  if (!json?.data || typeof json.data !== 'object') {
    throw new Error('Invalid BBOS project file');
  }
  for (const [key, value] of Object.entries(json.data)) {
    if (key.startsWith('bbos_')) {
      safeSet(key, value);
    }
  }
}
