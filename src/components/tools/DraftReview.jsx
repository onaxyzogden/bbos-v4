import { safeGet, safeSet, safeRemove } from '../../services/storage.js';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { TOOLS } from '../../data/config.js';
import { Check, X, Sparkles, AlertTriangle } from 'lucide-react';
import './DraftReview.css';

export default function DraftReview({ toolId }) {
  const draftNotes = safeGet('bbos_draft_notes_' + toolId);
  const liveNotes = safeGet('bbos_notes_' + toolId);
  const bumpFieldUpdate = usePipelineStore((s) => s.bumpFieldUpdate);
  const tool = TOOLS.find(t => t.id === toolId);

  // Check for draft field content
  const draftFields = {};
  let hasDraftFields = false;
  if (tool?.fields) {
    tool.fields.forEach(f => {
      const v = safeGet('bbos_draft_field_' + toolId + '_' + f.key);
      if (v) {
        draftFields[f.key] = v;
        hasDraftFields = true;
      }
    });
  }

  if (!draftNotes && !hasDraftFields) return null;

  // Parse draft metadata
  let meta = {};
  try { meta = JSON.parse(safeGet('bbos_draft_meta_' + toolId) || '{}'); } catch {}

  function accept() {
    // Move draft content to live
    if (draftNotes) {
      safeSet('bbos_notes_' + toolId, draftNotes);
      safeRemove('bbos_draft_notes_' + toolId);
    }
    if (tool?.fields) {
      tool.fields.forEach(f => {
        const draftVal = safeGet('bbos_draft_field_' + toolId + '_' + f.key);
        if (draftVal) {
          safeSet('bbos_field_' + toolId + '_' + f.key, draftVal);
          safeRemove('bbos_draft_field_' + toolId + '_' + f.key);
        }
      });
    }
    safeRemove('bbos_draft_meta_' + toolId);
    bumpFieldUpdate();
  }

  function reject() {
    safeRemove('bbos_draft_notes_' + toolId);
    if (tool?.fields) {
      tool.fields.forEach(f => {
        safeRemove('bbos_draft_field_' + toolId + '_' + f.key);
      });
    }
    safeRemove('bbos_draft_meta_' + toolId);
    bumpFieldUpdate();
  }

  return (
    <div className="dr-wrap">
      <div className="dr-header">
        <Sparkles size={14} />
        <span>AI Draft — Review Required</span>
        {meta.generated_at && (
          <span className="dr-time">{new Date(meta.generated_at).toLocaleString()}</span>
        )}
      </div>

      {meta.g_label && (
        <div className="dr-meta">
          Suggested G-Label: <strong>{meta.g_label}</strong>
        </div>
      )}

      {/* Assumptions warning */}
      {meta.assumptions?.length > 0 && (
        <div className="dr-assumptions">
          <div className="dr-assumptions-header">
            <AlertTriangle size={14} />
            <span>AI Assumptions — verify before accepting</span>
          </div>
          <ul className="dr-assumptions-list">
            {meta.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Notes split view */}
      {draftNotes && (
        <div className={`dr-content ${liveNotes ? 'dr-content-split' : ''}`}>
          {liveNotes && (
            <div className="dr-content-current">
              <div className="dr-content-label">Current Notes</div>
              <div className="dr-content-text">{liveNotes}</div>
            </div>
          )}
          <div className="dr-content-draft">
            <div className="dr-content-label">Draft Notes</div>
            <div className="dr-content-text">{draftNotes}</div>
          </div>
        </div>
      )}

      {/* Fields split view */}
      {hasDraftFields && (
        <div className="dr-fields">
          {Object.entries(draftFields).map(([key, value]) => {
            const field = tool.fields.find(f => f.key === key);
            const liveValue = safeGet('bbos_field_' + toolId + '_' + key);
            return (
              <div key={key} className={`dr-field ${liveValue ? 'dr-field-split' : ''}`}>
                {liveValue && (
                  <div className="dr-field-current">
                    <div className="dr-field-label">Current: {field?.label || key}</div>
                    <div className="dr-field-value">{liveValue}</div>
                  </div>
                )}
                <div className="dr-field-draft">
                  <div className="dr-field-label">Draft: {field?.label || key}</div>
                  <div className="dr-field-value">{value}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="dr-actions">
        <button className="dr-btn dr-accept" onClick={accept}>
          <Check size={14} /> Accept Draft
        </button>
        <button className="dr-btn dr-reject" onClick={reject}>
          <X size={14} /> Reject
        </button>
      </div>
    </div>
  );
}
