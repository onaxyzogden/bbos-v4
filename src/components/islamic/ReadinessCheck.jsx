import './ReadinessCheck.css';

export default function ReadinessCheck({ readiness, reflection, color }) {
  return (
    <div className="rc-wrap">
      {readiness && (
        <div className="rc-section">
          <div className="rc-frame">{readiness.frame}</div>
          <div className="rc-grid">
            <div>
              <div className="rc-col-title rc-at-peace">AT PEACE WHEN</div>
              {readiness.governing.map((g, i) => (
                <div key={i} className="rc-item rc-item-at-peace">{g}</div>
              ))}
            </div>
            <div>
              <div className="rc-col-title rc-not-rested">NOT YET RESTED IN</div>
              {readiness.notYet.map((n, i) => (
                <div key={i} className="rc-item rc-item-not-rested">{n}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reflection && (
        <div className="rc-section">
          <div className="rc-frame">{reflection.frame}</div>
          <div className="rc-grid">
            <div>
              <div className="rc-col-title rc-at-peace">AT PEACE WHEN</div>
              {reflection.governing.map((g, i) => (
                <div key={i} className="rc-item rc-item-at-peace">{g}</div>
              ))}
            </div>
            <div>
              <div className="rc-col-title rc-not-rested">NOT YET RESTED IN</div>
              {reflection.notYet.map((n, i) => (
                <div key={i} className="rc-item rc-item-not-rested">{n}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
