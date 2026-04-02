import { OctagonX } from 'lucide-react';
import './NoShipBanner.css';

export default function NoShipBanner({ message }) {
  if (!message) return null;

  return (
    <div className="ns-banner">
      <div className="ns-header">
        <OctagonX size={16} />
        <span>NO-SHIP CONDITION</span>
      </div>
      <div className="ns-body">{message}</div>
      <div className="ns-hint">
        This blocking condition must be resolved before the stage can advance. All downstream work is paused.
      </div>
    </div>
  );
}
