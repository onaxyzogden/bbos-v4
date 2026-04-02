import { useState } from 'react';
import { useThresholdStore } from '../../store/threshold-store.js';
import { STAGES } from '../../data/config.js';
import { DUAS, THRESHOLD_META } from '../../data/duas.js';
import DuaDisplay from './DuaDisplay.jsx';
import AttributeCard from './AttributeCard.jsx';
import ReadinessCheck from './ReadinessCheck.jsx';
import { X, Check } from 'lucide-react';
import './ThresholdModal.css';

export default function ThresholdModal({ type }) {
  const openingStageKey = useThresholdStore((s) => s.openingStageKey);
  const closingStageKey = useThresholdStore((s) => s.closingStageKey);
  const setOpeningStageKey = useThresholdStore((s) => s.setOpeningStageKey);
  const setClosingStageKey = useThresholdStore((s) => s.setClosingStageKey);
  const completeOpening = useThresholdStore((s) => s.completeOpening);
  const completeClosing = useThresholdStore((s) => s.completeClosing);

  const isOpening = type === 'opening';
  const stageKey = isOpening ? openingStageKey : closingStageKey;
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep] = useState(0);

  if (!stageKey) return null;

  const stage = STAGES[stageKey];
  const dua = DUAS[stageKey];
  const meta = THRESHOLD_META[stageKey];
  if (!stage || !dua) return null;

  const color = stage.c?.replace('var(--', '').replace(')', '') || 'accent';
  const hexColor = getComputedStyle(document.documentElement).getPropertyValue('--' + color).trim() || '#c9a05a';

  const closingDua = isOpening ? null : (dua.closing || meta?.closingDua);
  const activeDua = isOpening ? dua : closingDua;
  const readiness = isOpening ? dua.readiness : null;
  const reflection = isOpening ? null : dua.reflection;
  const attrs = meta?.attributesFull || [];

  const steps = [
    { label: 'Dua', key: 'dua' },
    { label: 'Attributes', key: 'attrs' },
    { label: isOpening ? 'Readiness' : 'Reflection', key: 'check' },
    { label: 'Confirm', key: 'confirm' },
  ];

  const close = () => {
    if (isOpening) setOpeningStageKey(null);
    else setClosingStageKey(null);
    setStep(0);
    setConfirmed(false);
  };

  const complete = () => {
    if (isOpening) completeOpening(stageKey);
    else completeClosing(stageKey);
    close();
  };

  return (
    <div className="thr-overlay" onClick={close}>
      <div className="thr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="thr-header">
          <div>
            <span className="thr-stage-badge" style={{ color: hexColor, borderColor: hexColor + '40' }}>
              Stage {stage.code} — {stage.name}
            </span>
            <h2 className="thr-title">
              {isOpening ? 'Opening Threshold' : 'Closing Threshold'}
            </h2>
          </div>
          <button className="thr-close" onClick={close}>
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="thr-steps">
          {steps.map((s, i) => (
            <button
              key={s.key}
              className={`thr-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              style={i === step ? { color: hexColor, borderColor: hexColor } : {}}
              onClick={() => setStep(i)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="thr-body">
          {step === 0 && activeDua && (
            <DuaDisplay dua={activeDua} color={hexColor} />
          )}

          {step === 1 && (
            <div>
              {attrs.map((attr, i) => (
                <AttributeCard key={i} attr={attr} color={hexColor} />
              ))}
              {attrs.length === 0 && (
                <div className="thr-empty">No attribute annotations for this stage.</div>
              )}
            </div>
          )}

          {step === 2 && (
            <ReadinessCheck
              readiness={readiness}
              reflection={reflection}
              color={hexColor}
            />
          )}

          {step === 3 && (
            <div className="thr-confirm">
              <label className="thr-check-label">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="thr-checkbox"
                />
                <span>
                  I have read the {isOpening ? 'opening' : 'closing'} dua, reviewed the governing attributes,
                  and completed the {isOpening ? 'readiness' : 'reflection'} check for Stage {stage.code} — {stage.name}.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="thr-footer">
          {step > 0 && (
            <button className="thr-btn thr-btn-ghost" onClick={() => setStep(step - 1)}>
              Previous
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < steps.length - 1 ? (
            <button className="thr-btn thr-btn-primary" style={{ background: hexColor }} onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button
              className="thr-btn thr-btn-primary"
              style={{ background: hexColor, opacity: confirmed ? 1 : 0.4 }}
              disabled={!confirmed}
              onClick={complete}
            >
              <Check size={14} />
              {isOpening ? 'Begin Stage' : 'Complete Stage'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
