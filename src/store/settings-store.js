// Settings Store — theme, values layer, language, tips, segment
import { create } from 'zustand';
import { safeGet, safeSet } from '../services/storage.js';

export const useSettingsStore = create((set) => ({
  // Theme
  theme: safeGet('bbos_theme', 'dark'),
  setTheme: (t) => {
    safeSet('bbos_theme', t);
    document.documentElement.setAttribute('data-theme', t);
    set({ theme: t });
  },

  // Values layer
  valuesLayer: safeGet('bbos_values_layer', 'islamic'), // 'islamic' | 'universal'
  setValuesLayer: (v) => { safeSet('bbos_values_layer', v); set({ valuesLayer: v }); },

  // Attribute language
  attrLang: safeGet('bbos_attr_lang', 'en'), // 'en' | 'ar'
  setAttrLang: (l) => { safeSet('bbos_attr_lang', l); set({ attrLang: l }); },

  // Tooltips
  tipsOn: safeGet('bbos_tips', 'on') === 'on',
  toggleTips: () => set((state) => {
    const next = !state.tipsOn;
    safeSet('bbos_tips', next ? 'on' : 'off');
    return { tipsOn: next };
  }),

  // Segment
  segment: safeGet('bbos_segment', ''),
  setSegment: (s) => { safeSet('bbos_segment', s); set({ segment: s }); },

  // Islamic Layer visibility
  ilOpen: safeGet('bbos_il_open', '1') === '1',
  setIlOpen: (v) => { safeSet('bbos_il_open', v ? '1' : '0'); set({ ilOpen: v }); },
  ilLocked: safeGet('bbos_il_locked', '0') === '1',
  setIlLocked: (v) => { safeSet('bbos_il_locked', v ? '1' : '0'); set({ ilLocked: v }); },
}));
