import { STAGES } from '../../data/config.js';
import { X } from 'lucide-react';
import './DuaPopup.css';

export default function DuaPopup({ dua, kind, stageKey, onClose }) {
  const stage = STAGES[stageKey];
  const kindLabel = kind === 'ongoing' ? 'DURING WORK · TAWAKKUL' : kind === 'closing' ? 'CLOSING DUA' : 'OPENING DUA';

  return (
    <div className="dp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dp-modal">
        <div className="dp-header">
          <div>
            <div className="dp-eyebrow" style={{ color: stage?.c }}>{kindLabel}</div>
            <div className="dp-stage">Stage {stage?.code} · {stage?.key} — {stage?.name}</div>
          </div>
          <button className="dp-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="dp-indicator">
          <div className="dp-dot" style={{ background: stage?.c }} />
        </div>
        <div className="dp-instruction">
          Take a moment to make this dua privately.<br />
          When you are ready, we will begin.
        </div>

        <div className="dp-card">
          <div className="dp-card-attr">{stage?.attr}</div>
          <div className="dp-arabic arabic">{dua.arabic}</div>
          <div className="dp-trans">{dua.trans}</div>
          <div className="dp-meaning">{dua.meaning}</div>
          <div className="dp-source">{dua.source}</div>
        </div>

        <div className="dp-footer">
          <button className="dp-done-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
