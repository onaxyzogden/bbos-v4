import { useState } from 'react';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { useThresholdStore } from '../../store/threshold-store.js';
import { STAGES } from '../../data/config.js';
import { DUAS, THRESHOLD_META, ONGOING_DUA } from '../../data/duas.js';
import DuaDisplay from '../islamic/DuaDisplay.jsx';
import ReadinessCheck from '../islamic/ReadinessCheck.jsx';
import AttributeCard from '../islamic/AttributeCard.jsx';
import DuaPopup from '../islamic/DuaPopup.jsx';
import { BookOpen, Play, CheckCircle, ChevronDown } from 'lucide-react';
import './IslamicLayer.css';

function ILSection({ label, glyph = '⧁', color, children, hasPopup, onPopup }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="il-block">
      <div className="il-block-toggle" role="button" tabIndex={0} onClick={() => setOpen(!open)}>
        <span className="il-block-glyph" style={{ color }}>{ glyph }</span>
        <span className="il-block-label" style={{ color }}>{label}</span>
        {hasPopup && (
          <button className="il-block-popup" onClick={(e) => { e.stopPropagation(); onPopup?.(); }} data-tooltip="Open in focus view">▸</button>
        )}
        <span className={`il-block-chev ${open ? 'open' : ''}`}>
          <ChevronDown size={12} />
        </span>
      </div>
      {open && <div className="il-block-body">{children}</div>}
    </div>
  );
}

export default function IslamicLayer() {
  const focusedStageKey = usePipelineStore((s) => s.focusedStageKey);
  const stage = focusedStageKey ? STAGES[focusedStageKey] : null;
  const completedOpening = useThresholdStore((s) => s.completedOpening);
  const completedClosing = useThresholdStore((s) => s.completedClosing);
  const setOpeningStageKey = useThresholdStore((s) => s.setOpeningStageKey);
  const setClosingStageKey = useThresholdStore((s) => s.setClosingStageKey);

  const [popup, setPopup] = useState(null); // { dua, kind }

  const dua = focusedStageKey ? DUAS[focusedStageKey] : null;
  const meta = focusedStageKey ? THRESHOLD_META[focusedStageKey] : null;

  const getHexColor = () => {
    if (!stage?.c) return '#c9a05a';
    const varName = stage.c.replace('var(--', '').replace(')', '');
    return getComputedStyle(document.documentElement).getPropertyValue('--' + varName).trim() || '#c9a05a';
  };

  return (
    <aside className="il">
      <div className="il-header">
        <BookOpen size={16} />
        <span>Islamic Layer</span>
      </div>

      {stage && dua ? (
        <div className="il-content">
          <div className="il-stage-badge" style={{ color: getHexColor(), borderColor: getHexColor() + '40' }}>
            Stage {stage.code} — {stage.name}
          </div>
          <div className="il-attr" style={{ color: getHexColor() }}>
            {stage.attr}
          </div>
          <div className="il-attr-ar arabic">
            {stage.attr_ar}
          </div>

          {/* Threshold buttons */}
          <div className="il-threshold-btns">
            {!completedOpening[focusedStageKey] ? (
              <button className="il-thr-btn" style={{ color: getHexColor(), borderColor: getHexColor() + '40' }} onClick={() => setOpeningStageKey(focusedStageKey)}>
                <Play size={12} /> Begin Stage
              </button>
            ) : (
              <span className="il-thr-done"><CheckCircle size={12} /> Stage opened</span>
            )}
            {completedOpening[focusedStageKey] && !completedClosing[focusedStageKey] && (
              <button className="il-thr-btn" style={{ color: getHexColor(), borderColor: getHexColor() + '40' }} onClick={() => setClosingStageKey(focusedStageKey)}>
                <CheckCircle size={12} /> Close Stage
              </button>
            )}
            {completedClosing[focusedStageKey] && (
              <span className="il-thr-done"><CheckCircle size={12} /> Stage closed</span>
            )}
          </div>

          {/* 1. Opening Dua */}
          <ILSection label="Opening Dua" color={getHexColor()} hasPopup onPopup={() => setPopup({ dua, kind: 'opening' })}>
            <DuaDisplay dua={dua} color={getHexColor()} />
          </ILSection>

          {/* 2. Governing Attributes */}
          {meta?.attributesFull?.length > 0 && (
            <ILSection label="Governing Attributes" color={getHexColor()}>
              {meta.attributesFull.map((attr, i) => (
                <AttributeCard key={i} attr={attr} color={getHexColor()} />
              ))}
            </ILSection>
          )}

          {/* 3. Readiness Check */}
          {dua.readiness && (
            <ILSection label="Readiness Check" glyph="▣" color={getHexColor()}>
              <ReadinessCheck readiness={dua.readiness} color={getHexColor()} />
            </ILSection>
          )}

          <div className="il-section-divider" />

          {/* 4. During Work · Tawakkul */}
          <ILSection label="During Work · Tawakkul" color={getHexColor()} hasPopup onPopup={() => setPopup({ dua: ONGOING_DUA, kind: 'ongoing' })}>
            <DuaDisplay dua={ONGOING_DUA} color={getHexColor()} />
          </ILSection>

          <div className="il-section-divider" />

          {/* 5. Closing Reflection */}
          {dua.reflection && (
            <ILSection label="Closing Reflection" glyph="▣" color={getHexColor()}>
              <ReadinessCheck reflection={dua.reflection} color={getHexColor()} />
            </ILSection>
          )}

          {/* 6. Closing Dua */}
          {(dua.closing || meta?.closingDua) && (
            <ILSection label="Closing Dua" color={getHexColor()} hasPopup onPopup={() => setPopup({ dua: dua.closing || meta?.closingDua, kind: 'closing' })}>
              <DuaDisplay dua={dua.closing || meta?.closingDua} color={getHexColor()} />
            </ILSection>
          )}
        </div>
      ) : (
        <div className="il-empty">
          Select a tool to view stage-specific Islamic guidance.
        </div>
      )}

      {/* Popup modal */}
      {popup && (
        <DuaPopup dua={popup.dua} kind={popup.kind} stageKey={focusedStageKey} onClose={() => setPopup(null)} />
      )}
    </aside>
  );
}
