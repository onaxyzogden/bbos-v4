// Threshold Store — opening/closing ceremony completion state
import { create } from 'zustand';
import { safeGetJSON, safeSet } from '../services/storage.js';

export const useThresholdStore = create((set) => ({
  completedOpening: safeGetJSON('bbos_thr_open', {}),
  completedClosing: safeGetJSON('bbos_thr_close', {}),

  completeOpening: (stageKey) => set((state) => {
    const next = { ...state.completedOpening, [stageKey]: true };
    safeSet('bbos_thr_open', JSON.stringify(next));
    return { completedOpening: next };
  }),

  completeClosing: (stageKey) => set((state) => {
    const next = { ...state.completedClosing, [stageKey]: true };
    safeSet('bbos_thr_close', JSON.stringify(next));
    return { completedClosing: next };
  }),

  // Active threshold modals
  openingStageKey: null,
  closingStageKey: null,
  setOpeningStageKey: (key) => set({ openingStageKey: key }),
  setClosingStageKey: (key) => set({ closingStageKey: key }),
}));
