import { safeGet, safeSet } from '../../services/storage.js';
import { usePipelineStore } from '../../store/pipeline-store.js';
import './GLabel.css';

const G_LABELS = [
  { id: 'G1', label: 'G1 — Deliverable', desc: 'Verifiable fact with named evidence', color: 'var(--out)' },
  { id: 'G2', label: 'G2 — Standard', desc: 'Strong pattern, documented precedent', color: 'var(--str)' },
  { id: 'G3', label: 'G3 — Conditional', desc: 'Informed inference, limited data', color: 'var(--sal)' },
  { id: 'G4', label: 'G4 — Aspirational', desc: 'Aspiration, not yet evidenced', color: 'var(--ofr)' },
];

export default function GLabel({ toolId, readOnly = false }) {
  const current = safeGet('bbos_gl_' + toolId, '');
  const bumpFieldUpdate = usePipelineStore((s) => s.bumpFieldUpdate);

  const activeLabel = G_LABELS.find(g => g.id === current);

  function setLabel(id) {
    if (readOnly) return;
    safeSet('bbos_gl_' + toolId, id);
    bumpFieldUpdate();
  }

  return (
    <div className="gl-wrap">
      <div className="gl-header">G-LABEL</div>
      <div className="gl-pills">
        {G_LABELS.map(g => (
          <button
            key={g.id}
            className={`gl-pill ${current === g.id ? 'active' : ''}`}
            style={current === g.id ? { color: g.color, borderColor: g.color, background: g.color + '15' } : {}}
            onClick={() => setLabel(g.id)}
            disabled={readOnly}
            data-tooltip={g.desc}
          >
            {g.id}
          </button>
        ))}
      </div>
      {activeLabel && (
        <div className="gl-desc" style={{ color: activeLabel.color }}>
          {activeLabel.desc}
        </div>
      )}
    </div>
  );
}

export function GBadge({ toolId }) {
  const label = safeGet('bbos_gl_' + toolId, '');
  if (!label) return null;
  const g = G_LABELS.find(x => x.id === label);
  if (!g) return null;
  return (
    <span className="gl-badge" style={{ color: g.color, borderColor: g.color + '40' }}>
      {g.id}
    </span>
  );
}
