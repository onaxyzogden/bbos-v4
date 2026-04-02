// Upstream readiness check — verifies source dependencies before generation
import { TOOLS } from '../data/config.js';
import { safeGet } from './storage.js';

export function checkUpstreamReady(toolId) {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool?.sources?.length) return { ready: true, missing: [] };

  const missing = [];
  for (const src of tool.sources) {
    const srcTool = TOOLS.find(t => t.id === src.tool);
    let hasContent = false;

    if (safeGet('bbos_notes_' + src.tool)) {
      hasContent = true;
    }

    if (!hasContent && srcTool?.fields) {
      for (const f of srcTool.fields) {
        if (safeGet('bbos_field_' + src.tool + '_' + f.key)) {
          hasContent = true;
          break;
        }
      }
    }

    if (!hasContent) {
      missing.push({ tool: src.tool, label: src.label, stage: src.stage });
    }
  }

  return { ready: missing.length === 0, missing };
}
