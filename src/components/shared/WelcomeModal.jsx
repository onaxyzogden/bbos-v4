import { useSettingsStore } from '../../store/settings-store.js';
import './WelcomeModal.css';

export default function WelcomeModal() {
  const segment = useSettingsStore((s) => s.segment);
  const setSegment = useSettingsStore((s) => s.setSegment);
  const setValuesLayer = useSettingsStore((s) => s.setValuesLayer);

  if (segment) return null;

  function choose(seg) {
    setSegment(seg);
    setValuesLayer(seg === 'A' ? 'islamic' : 'universal');
  }

  return (
    <div className="wlc-overlay">
      <div className="wlc-modal">
        <div className="wlc-header">
          <div className="wlc-supra">BARAKAH BUSINESS OPERATING SYSTEM</div>
          <h2>Welcome</h2>
          <p className="wlc-sub">Choose how you'd like to experience the pipeline.</p>
        </div>

        <div className="wlc-options">
          <button className="wlc-option" onClick={() => choose('A')}>
            <div className="wlc-option-badge" style={{ color: 'var(--accent)' }}>Path A</div>
            <h3>Islamic Framing</h3>
            <p>
              Full theological layer with governing divine attributes, duas,
              readiness checks, and spiritual threshold ceremonies at each stage.
            </p>
          </button>

          <button className="wlc-option" onClick={() => choose('B')}>
            <div className="wlc-option-badge" style={{ color: 'var(--str)' }}>Path B</div>
            <h3>Universal Framing</h3>
            <p>
              Same pipeline integrity and governance mechanisms,
              expressed in universal ethical language without theological references.
            </p>
          </button>
        </div>

        <div className="wlc-footer">
          You can switch between framings at any time using the layers toggle in the top bar.
        </div>
      </div>
    </div>
  );
}
