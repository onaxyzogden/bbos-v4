// Sacred fields that AI must NEVER populate — human-only declarations.
// If the AI returns values for these, synthesizeAssets() strips them.
// This enforces the theological requirement of muhasaba (human reckoning).

export const SACRED_FIELDS = {
  // FSH actual numbers — owner declaration only (Al-Awwal · Ash-Shahid)
  fsh: ['runway', 'burn', 'end_date'],

  // Amanah Gate Go/No-Go — owner decision only (Al-Haqq · Al-Khabir)
  cleared_handoff: ['amanah_decision'],

  // Covenant Integrity Audit — entire tool is human-only (Al-Hasib)
  covenant_audit: null,

  // G-Label Accuracy Report — entire tool is human-only (Al-Hasib)
  glabel_accuracy: null,

  // Stewardship Score — all scoring fields are human-only (Al-Hasib · As-Subbuh)
  stewardship_score: ['covenant_adherence', 'constraint_respect', 'reckoning_quality'],
};

// Tools where GenerateButton should not appear at all
export const NO_AI_TOOLS = [
  'fsh',
  'covenant_audit',
  'glabel_accuracy',
  'stewardship_score',
];
