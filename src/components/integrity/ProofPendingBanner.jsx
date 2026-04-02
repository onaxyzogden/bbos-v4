import { safeGet } from '../../services/storage.js';
import { AlertTriangle } from 'lucide-react';
import './ProofPendingBanner.css';

export default function ProofPendingBanner({ toolId }) {
  const meta = safeGet('bbos_draft_meta_' + toolId);
  let ppItems = [];
  if (meta) {
    try {
      const parsed = JSON.parse(meta);
      ppItems = parsed.proof_pending || [];
    } catch {}
  }

  if (!ppItems.length) return null;

  return (
    <div className="pp-banner">
      <div className="pp-header">
        <AlertTriangle size={14} />
        <span>PROOF PENDING — {ppItems.length} claim{ppItems.length > 1 ? 's' : ''} require verification</span>
      </div>
      <div className="pp-hint">
        Claims flagged as Proof Pending are restricted to G3 maximum in all downstream usage until resolved.
      </div>
      <ul className="pp-list">
        {ppItems.map((item, i) => (
          <li key={i} className="pp-item">{item}</li>
        ))}
      </ul>
    </div>
  );
}
