// Role Store — current role selection and permission resolution
import { create } from 'zustand';
import { safeGet, safeSet } from '../services/storage.js';

export const useRoleStore = create((set) => ({
  roleId: safeGet('bbos_role', 'all'),
  setRoleId: (id) => { safeSet('bbos_role', id); set({ roleId: id }); },
}));

// Permission resolution — matches truthmarket_bbos.html rolePerm() logic
const ROLE_INDEX = { owner: 0, strat: 1, copy: 2, media: 3, setter: 4, closer: 5, fulfil: 6 };

export function rolePerm(tool, roleId) {
  if (!tool?.perms || roleId === 'all') return 'O';
  const idx = ROLE_INDEX[roleId];
  if (idx === undefined) return '-';
  return tool.perms[idx] || '-';
}
