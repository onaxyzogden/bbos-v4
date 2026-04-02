// useToolStatus — derive tool status from localStorage
import { safeGet } from '../services/storage.js';

export function getToolStatus(tool) {
  if (!tool) return 'Not Started';
  const complete = safeGet('bbos_complete_' + tool.id);
  if (complete === 'true' || complete === '1') return 'Complete';

  const notes = safeGet('bbos_notes_' + tool.id);
  if (notes) return 'Active';

  // Check if any fields have content
  if (tool.fields) {
    for (const f of tool.fields) {
      const val = safeGet('bbos_field_' + tool.id + '_' + f.key);
      if (val) return 'Active';
    }
  }

  // Check for draft content
  const draft = safeGet('bbos_draft_notes_' + tool.id);
  if (draft) return 'Active';

  return 'Not Started';
}

export function hasDraft(toolId) {
  return !!safeGet('bbos_draft_notes_' + toolId);
}
