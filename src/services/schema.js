// Schema validation and asset synthesis — ported from truthmarket_bbos.html:1809-2060
import { STAGES, TOOLS, LAYERS, ROLES } from '../data/config.js';
import { FACTORY_PROMPTS } from '../data/factory-prompts.js';
import { SACRED_FIELDS } from '../data/sacred-fields.js';
import { safeSet, safeGet } from './storage.js';
import { rolePerm } from '../store/role-store.js';

export function validateSchema(payload) {
  const errors = [];
  if (!payload) { errors.push('No payload'); return { valid: false, errors }; }
  if (payload.schema_version && payload.schema_version !== '1.0') {
    errors.push('Unsupported schema_version: ' + payload.schema_version + '. Expected 1.0.');
  }
  if (!payload.stage || !STAGES[payload.stage]) errors.push('Invalid stage: ' + payload.stage);
  if (!payload.assets || typeof payload.assets !== 'object') errors.push('Missing assets object');
  return { valid: errors.length === 0, errors };
}

export function synthesizeAssets(payload) {
  const validation = validateSchema(payload);
  if (!validation.valid) return { error: 'Invalid schema', details: validation.errors, written: [], drafted: [], skipped: [] };
  if (payload.no_ship) return { noShip: payload.no_ship, written: [], drafted: [], skipped: [] };

  const results = { written: [], drafted: [], skipped: [], warnings: [] };

  Object.entries(payload.assets).forEach(([toolId, asset]) => {
    const tool = TOOLS.find(t => t.id === toolId && t.stage === payload.stage);
    if (!tool) { results.skipped.push({ id: toolId, reason: 'Tool not found in stage' }); return; }

    // Sacred declaration enforcement — strip AI-generated content for human-only fields
    const sacredRule = SACRED_FIELDS[toolId];
    if (sacredRule === null) {
      results.skipped.push({ id: toolId, reason: 'Sacred declaration — human only' });
      results.warnings.push(toolId + ': entire tool is a sacred declaration (human only) — AI output stripped');
      return;
    }
    if (sacredRule && asset.fields) {
      for (const blockedKey of sacredRule) {
        if (asset.fields[blockedKey]) {
          delete asset.fields[blockedKey];
          results.warnings.push(toolId + '.' + blockedKey + ': sacred field stripped — human only');
        }
      }
    }

    const isDraft = true; // always route AI output to draft review

    if (asset.content) {
      const key = isDraft ? 'bbos_draft_notes_' + toolId : 'bbos_notes_' + toolId;
      safeSet(key, asset.content);
    }

    if (asset.fields && tool.fields) {
      tool.fields.forEach(f => {
        if (asset.fields[f.key]) {
          const key = isDraft ? 'bbos_draft_field_' + toolId + '_' + f.key : 'bbos_field_' + toolId + '_' + f.key;
          safeSet(key, asset.fields[f.key]);
        }
      });
    }

    if (asset.g_label) safeSet('bbos_gl_' + toolId, asset.g_label);
    if (asset.gate) safeSet('bbos_gate_' + toolId, asset.gate);

    if (isDraft) {
      safeSet('bbos_draft_meta_' + toolId, JSON.stringify({
        g_label: asset.g_label || '',
        proof_pending: asset.proof_pending || [],
        assumptions: asset.assumptions || asset.handoff?.assumptions || [],
        generated_at: payload.generated_at || new Date().toISOString(),
        status: 'draft',
      }));
      results.drafted.push(toolId);
    } else {
      results.written.push(toolId);
    }
  });

  return results;
}

export function buildSystemPrompt(stageKey, roleId, options = {}) {
  const stage = STAGES[stageKey];
  if (!stage) return '';
  const roleMeta = ROLES.find(r => r.id === roleId) || ROLES[0];
  const stageTools = TOOLS.filter(t => t.stage === stageKey && (roleId === 'all' || rolePerm(t, roleId) === 'O'));
  const targetTools = options.singleTool ? stageTools.filter(t => t.id === options.singleTool) : stageTools;

  // Gather upstream source content
  const upstreamParts = [];
  const seen = new Set();
  targetTools.forEach(t => {
    (t.sources || []).forEach(src => {
      if (seen.has(src.tool)) return;
      seen.add(src.tool);
      const notes = safeGet('bbos_notes_' + src.tool);
      const srcTool = TOOLS.find(x => x.id === src.tool);
      let fieldContent = '';
      if (srcTool?.fields) {
        srcTool.fields.forEach(f => {
          const v = safeGet('bbos_field_' + src.tool + '_' + f.key);
          if (v) fieldContent += '\n' + f.label + ': ' + v;
        });
      }
      const content = notes || fieldContent || 'NOT YET COMPLETED';
      upstreamParts.push('[' + src.label + ']\n' + content);
    });
  });

  // Gather existing content
  const existingParts = [];
  targetTools.forEach(t => {
    const notes = safeGet('bbos_notes_' + t.id);
    let fieldContent = '';
    if (t.fields) {
      t.fields.forEach(f => {
        const v = safeGet('bbos_field_' + t.id + '_' + f.key);
        if (v) fieldContent += '\n' + f.label + ': ' + v;
      });
    }
    if (notes || fieldContent) existingParts.push('[' + t.id + ' — ' + t.label + '] (EXISTING)\n' + (notes || fieldContent));
  });

  const factoryPrompt = FACTORY_PROMPTS?.[stageKey] || 'Generate high-quality content for each tool based on its description and upstream inputs.';

  return `You are a BBOS Asset Generator for Stage ${stage.code} ${stage.key} — ${stage.name}.
Governing attributes: ${stage.attr}.
Layer: ${LAYERS[stageKey]}.

ROLE: ${roleMeta.label}
Generate content ONLY for tools this role owns.

TOOLS TO POPULATE:
${targetTools.map(t => `- ${t.id}: ${t.label} (${t.asset || ''})
  Description: ${t.desc}
  ${t.fields ? `Fields: ${t.fields.map(f => f.key + ' (' + f.label + ')').join(', ')}` : 'Single content field'}`).join('\n')}

${upstreamParts.length ? `UPSTREAM SOURCES (use as inputs):
${upstreamParts.join('\n\n---\n\n')}` : 'No upstream sources for this stage.'}

${existingParts.length ? `EXISTING CONTENT (build on, do not discard):
${existingParts.join('\n\n---\n\n')}` : ''}

FACTORY INSTRUCTIONS:
${factoryPrompt}

G-LABEL RULES:
- G1: verifiable fact with named evidence
- G2: strong pattern, documented precedent
- G3: informed inference, limited data
- G4: aspiration, not yet evidenced
- Assign a G-label to each tool output

OUTPUT FORMAT: Return ONLY valid JSON matching this schema:
{
  "schema_version": "1.0",
  "stage": "${stageKey}",
  "role": "${roleId}",
  "generated_at": "ISO-8601 timestamp",
  "no_ship": null,
  "assets": {
    "[toolId]": {
      "content": "working notes text for the tool",
      "fields": { "[fieldKey]": "value for each field" },
      "g_label": "G1|G2|G3|G4",
      "proof_pending": ["list of claims needing proof"],
      "assumptions": ["list of assumptions made due to missing inputs"],
      "status": "filled"
    }
  }
}

Return ONLY the JSON. No preamble, no markdown fences, no explanation.`;
}
