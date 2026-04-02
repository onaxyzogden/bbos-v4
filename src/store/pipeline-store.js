// Pipeline Store — manages navigation, selection, and view state
import { create } from 'zustand';
import { safeGet, safeGetJSON, safeSet } from '../services/storage.js';

export const usePipelineStore = create((set) => ({
  // Selected tool
  selectedToolId: null,
  setSelectedToolId: (id) => set({ selectedToolId: id }),

  // Active stage (for Islamic layer context)
  focusedStageKey: null,
  setFocusedStageKey: (key) => set({ focusedStageKey: key }),

  // View mode
  view: safeGet('bbos_view', 'pipeline'), // 'pipeline' | 'asset' | 'layers'
  setView: (v) => { safeSet('bbos_view', v); set({ view: v }); },

  // Map view
  mapView: safeGet('bbos_map_view', 'pipeline'), // 'pipeline' | 'layers'
  setMapView: (v) => { safeSet('bbos_map_view', v); set({ mapView: v }); },

  // Stage collapse states
  collapsed: safeGetJSON('bbos_collapsed', {}),
  toggleCollapsed: (key) => set((state) => {
    const next = { ...state.collapsed, [key]: !state.collapsed[key] };
    safeSet('bbos_collapsed', JSON.stringify(next));
    return { collapsed: next };
  }),

  // Sidebar state
  sidebarOpen: safeGet('bbos_sb_open', '1') === '1',
  toggleSidebar: () => set((state) => {
    const next = !state.sidebarOpen;
    safeSet('bbos_sb_open', next ? '1' : '0');
    return { sidebarOpen: next };
  }),

  // Sidebar search
  sidebarSearch: '',
  setSidebarSearch: (s) => set({ sidebarSearch: s }),

  // Column widths
  sidebarWidth: parseInt(safeGet('bbos_sb_width', '248'), 10),
  setSidebarWidth: (w) => { safeSet('bbos_sb_width', String(w)); set({ sidebarWidth: w }); },
  ilWidth: parseInt(safeGet('bbos_il_width', '280'), 10),
  setIlWidth: (w) => { safeSet('bbos_il_width', String(w)); set({ ilWidth: w }); },

  // Field update counter (replaces window.dispatchEvent('bbos-field-updated'))
  fieldUpdateTick: 0,
  bumpFieldUpdate: () => set((state) => ({ fieldUpdateTick: state.fieldUpdateTick + 1 })),

  // Ref stage (depth-of-field mode)
  refStageKey: null,
  setRefStageKey: (key) => set({ refStageKey: key }),
}));
