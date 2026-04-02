// Stage-specific file upload handler — validates and routes through synthesizeAssets
import { STAGES } from '../data/config.js';
import { validateSchema, synthesizeAssets } from './schema.js';

export function handleStageUpload(fileContent, targetStageKey) {
  let payload;
  try {
    payload = JSON.parse(fileContent);
  } catch (e) {
    return { error: 'Invalid JSON: ' + e.message };
  }

  // Validate schema_version
  if (payload.schema_version && payload.schema_version !== '1.0') {
    return { error: 'Unsupported schema version: ' + payload.schema_version + '. Expected 1.0.' };
  }

  // Validate stage match
  if (payload.stage && payload.stage !== targetStageKey) {
    return {
      error: 'Stage mismatch: file targets ' + (STAGES[payload.stage]?.name || payload.stage) +
             ' but current context is ' + (STAGES[targetStageKey]?.name || targetStageKey),
    };
  }

  // Default stage if absent
  if (!payload.stage) payload.stage = targetStageKey;

  // Schema validation
  const validation = validateSchema(payload);
  if (!validation.valid) {
    return { error: 'Schema validation failed: ' + validation.errors.join('; ') };
  }

  // Extract assumptions from payload and per-asset
  const assumptions = [];
  if (payload.handoff?.assumptions) {
    assumptions.push(...payload.handoff.assumptions);
  }
  if (payload.assets) {
    Object.values(payload.assets).forEach(asset => {
      if (asset.assumptions) assumptions.push(...asset.assumptions);
      if (asset.handoff?.assumptions) assumptions.push(...asset.handoff.assumptions);
    });
  }

  // Route through synthesizeAssets (writes to draft keys)
  const result = synthesizeAssets(payload);
  result.assumptions = assumptions;
  return result;
}
