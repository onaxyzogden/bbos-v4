import { VERBATIM_ITEMS, STAGES } from '../../data/config.js';
import { safeGet } from '../../services/storage.js';
import { X, FileText } from 'lucide-react';
import './PILModal.css';

export default function PILModal({ onClose }) {
  return (
    <div className="pil-overlay" onClick={onClose}>
      <div className="pil-modal" onClick={e => e.stopPropagation()}>
        <div className="pil-header">
          <FileText size={18} />
          <h3>Pipeline Integrity Ledger</h3>
          <button className="pil-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="pil-body">
          <p className="pil-desc">
            Cross-stage verbatim carry fields. These values originate at their source stage
            and must be carried forward unchanged through all downstream stages.
          </p>

          <div className="pil-items">
            {VERBATIM_ITEMS.map((item) => {
              const value = safeGet(item.key, '');
              const originStage = STAGES[item.origin];
              const firstStage = STAGES[item.first];

              return (
                <div key={item.key} className="pil-item">
                  <div className="pil-item-header">
                    <span className="pil-item-label">{item.label}</span>
                    <div className="pil-item-meta">
                      <span className="pil-item-badge" style={{ color: originStage?.c, borderColor: originStage?.c + '40' }}>
                        Origin: {item.origin}
                      </span>
                      <span className="pil-item-badge" style={{ color: firstStage?.c, borderColor: firstStage?.c + '40' }}>
                        First use: {item.first}
                      </span>
                    </div>
                  </div>
                  <div className={`pil-item-value ${item.mono ? 'mono' : ''} ${!value ? 'empty' : ''}`}>
                    {value || 'Not yet declared'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
