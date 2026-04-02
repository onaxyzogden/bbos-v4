// Generation Store — AI generation state per tool and stage
import { create } from 'zustand';

export const useGenerationStore = create((set) => ({
  // Per-tool generation state: { [toolId]: 'idle' | 'loading' | 'done' | 'error' }
  genStates: {},
  // Per-tool generation results/errors
  genResults: {},
  genErrors: {},

  setGenerating: (toolId) => set((state) => ({
    genStates: { ...state.genStates, [toolId]: 'loading' },
    genErrors: { ...state.genErrors, [toolId]: null },
  })),

  setGenResult: (toolId, result) => set((state) => ({
    genStates: { ...state.genStates, [toolId]: 'done' },
    genResults: { ...state.genResults, [toolId]: result },
  })),

  setGenError: (toolId, error) => set((state) => ({
    genStates: { ...state.genStates, [toolId]: 'error' },
    genErrors: { ...state.genErrors, [toolId]: error },
  })),

  clearGen: (toolId) => set((state) => ({
    genStates: { ...state.genStates, [toolId]: 'idle' },
    genResults: { ...state.genResults, [toolId]: null },
    genErrors: { ...state.genErrors, [toolId]: null },
  })),

  // Stage-level generation
  stageGenStates: {},
  setStageGenerating: (stageKey) => set((state) => ({
    stageGenStates: { ...state.stageGenStates, [stageKey]: 'loading' },
  })),
  setStageGenDone: (stageKey) => set((state) => ({
    stageGenStates: { ...state.stageGenStates, [stageKey]: 'done' },
  })),
}));
