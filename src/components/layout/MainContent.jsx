import { useMemo } from 'react';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { useRoleStore, rolePerm } from '../../store/role-store.js';
import { STAGES, TOOLS, STATUS_META } from '../../data/config.js';
import { getToolStatus } from '../../hooks/useToolStatus.js';
import { useSettingsStore } from '../../store/settings-store.js';
import AssetView from '../pipeline/AssetView.jsx';
import LayersView from '../pipeline/LayersView.jsx';
import GenerateButton from '../generation/GenerateButton.jsx';
import StageUpload from '../generation/StageUpload.jsx';
import { NO_AI_TOOLS } from '../../data/sacred-fields.js';
import GLabel from '../integrity/GLabel.jsx';
import ProofPendingBanner from '../integrity/ProofPendingBanner.jsx';
import DraftReview from '../tools/DraftReview.jsx';
import { safeGet, safeSet } from '../../services/storage.js';
import { CheckCircle, Circle } from 'lucide-react';
import './MainContent.css';

export default function MainContent({ toolsByStage }) {
  const selectedToolId = usePipelineStore((s) => s.selectedToolId);
  const setSelectedToolId = usePipelineStore((s) => s.setSelectedToolId);
  const setFocusedStageKey = usePipelineStore((s) => s.setFocusedStageKey);
  const view = usePipelineStore((s) => s.view);
  const fieldUpdateTick = usePipelineStore((s) => s.fieldUpdateTick);
  const attrLang = useSettingsStore((s) => s.attrLang);
  const valuesLayer = useSettingsStore((s) => s.valuesLayer);

  const selectedTool = selectedToolId ? TOOLS.find((t) => t.id === selectedToolId) : null;

  // If a tool is selected, show ToolDetail regardless of view
  if (selectedTool) {
    return <ToolDetailView tool={selectedTool} onBack={() => setSelectedToolId(null)} />;
  }

  // Route based on view mode
  if (view === 'asset') {
    return <main className="main"><AssetView /></main>;
  }

  if (view === 'layers') {
    return <main className="main"><LayersView /></main>;
  }

  // Pipeline Overview (default)
  return (
    <main className="main">
      <div className="main-header">
        <h1>Pipeline Overview</h1>
        <p className="main-sub">9-stage ethical business pipeline</p>
      </div>

      <div className="pipeline-grid">
        {Object.values(STAGES).map((stage) => {
          const tools = toolsByStage[stage.key] || [];
          const completed = tools.filter((t) => getToolStatus(t) === 'Complete').length;
          const active = tools.filter((t) => getToolStatus(t) === 'Active').length;
          const total = tools.length;

          return (
            <div
              key={stage.key}
              className="stage-card"
              style={{ borderTopColor: stage.c }}
            >
              <div className="stage-card-header">
                <span className="stage-card-code" style={{ color: stage.c }}>
                  {stage.code}
                </span>
                <span className="stage-card-name">{stage.name}</span>
              </div>

              <div className="stage-card-attr" style={{ color: stage.c }}>
                {attrLang === 'ar' ? stage.attr_ar : stage.attr}
              </div>

              <div className="stage-card-stats">
                <span className="stage-stat">
                  <span className="stage-stat-dot" style={{ color: 'var(--success)' }}>●</span>
                  {completed}
                </span>
                <span className="stage-stat">
                  <span className="stage-stat-dot" style={{ color: 'var(--warning)' }}>◉</span>
                  {active}
                </span>
                <span className="stage-stat">
                  <span className="stage-stat-dot" style={{ color: 'var(--text3)' }}>○</span>
                  {total - completed - active}
                </span>
              </div>

              <div className="stage-card-tools">
                {tools.slice(0, 4).map((tool) => {
                  const status = getToolStatus(tool);
                  const meta = STATUS_META[status] || STATUS_META['Not Started'];
                  return (
                    <button
                      key={tool.id}
                      className="stage-tool-btn"
                      onClick={() => {
                        setSelectedToolId(tool.id);
                        setFocusedStageKey(tool.stage);
                      }}
                    >
                      <span style={{ color: meta.color }}>{meta.dot}</span>
                      <span className="stage-tool-label">{tool.label}</span>
                    </button>
                  );
                })}
                {tools.length > 4 && (
                  <span className="stage-tool-more">
                    +{tools.length - 4} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function ToolDetailView({ tool, onBack }) {
  const stage = STAGES[tool.stage];
  const valuesLayer = useSettingsStore((s) => s.valuesLayer);
  const roleId = useRoleStore((s) => s.roleId);
  const perm = rolePerm(tool, roleId);
  const isReadOnly = perm === 'V';

  return (
    <main className="main">
      <button className="main-back" onClick={onBack}>
        ← Back to Overview
      </button>

      {/* Permission banner */}
      {roleId !== 'all' && perm !== 'O' && (
        <div className={`tool-perm-banner ${isReadOnly ? 'readonly' : ''}`} style={{ borderColor: stage?.c + '40' }}>
          {isReadOnly ? 'View only — this tool is read-only for your role' : `Edit access (${perm})`}
        </div>
      )}

      <div className="tool-detail-header" style={{ borderLeftColor: stage?.c }}>
        <span className="tool-detail-code" style={{ color: stage?.c }}>
          {stage?.code} {stage?.name}
        </span>
        <h2>{tool.label}</h2>
        <p className="tool-detail-asset">{tool.asset}</p>
      </div>
      <div className="tool-detail-desc">
        <p>{tool.desc}</p>
      </div>
      <div className="tool-detail-rat">
        <p style={{ color: stage?.c, fontSize: '14px', fontStyle: 'italic' }}>
          {valuesLayer === 'universal' && tool.rat_u ? tool.rat_u : tool.rat}
        </p>
      </div>

      {/* AI Generate — hidden for sacred declaration tools */}
      {!isReadOnly && !NO_AI_TOOLS.includes(tool.id) && (
        <GenerateButton toolId={tool.id} stageKey={tool.stage} />
      )}

      {/* Stage file upload — available for all tools including sacred ones */}
      {!isReadOnly && <StageUpload stageKey={tool.stage} />}

      {/* G-Label */}
      <GLabel toolId={tool.id} readOnly={isReadOnly} />

      {/* Proof Pending */}
      <ProofPendingBanner toolId={tool.id} />

      {/* Source dependencies */}
      {tool.sources && tool.sources.length > 0 && (
        <div className="tool-sources">
          <div className="tool-sources-label">Upstream Sources</div>
          <div className="tool-sources-list">
            {tool.sources.map((src, i) => (
              <span key={i} className="tool-source-pill" style={{ color: STAGES[src.stage]?.c, borderColor: STAGES[src.stage]?.c + '40' }}>
                {src.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {tool.fields && (
        <div className="tool-fields">
          {tool.fields.map((f) => (
            <div key={f.key} className="tool-field">
              <label className="tool-field-label">{f.label}</label>
              <textarea
                className="tool-field-input"
                rows={f.rows || 3}
                placeholder={f.placeholder}
                readOnly={isReadOnly}
                defaultValue={localStorage.getItem('bbos_field_' + tool.id + '_' + f.key) || ''}
                onBlur={(e) => {
                  if (isReadOnly) return;
                  const val = e.target.value;
                  if (val) {
                    localStorage.setItem('bbos_field_' + tool.id + '_' + f.key, val);
                  } else {
                    localStorage.removeItem('bbos_field_' + tool.id + '_' + f.key);
                  }
                  usePipelineStore.getState().bumpFieldUpdate();
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Draft Review */}
      <DraftReview toolId={tool.id} />

      {/* Complete toggle */}
      {!isReadOnly && (
        <ToolCompleteToggle toolId={tool.id} stageColor={stage?.c} />
      )}
    </main>
  );
}

function ToolCompleteToggle({ toolId, stageColor }) {
  const isComplete = safeGet('bbos_complete_' + toolId) === '1';
  const bumpFieldUpdate = usePipelineStore((s) => s.bumpFieldUpdate);

  function toggle() {
    if (isComplete) {
      safeSet('bbos_complete_' + toolId, '0');
    } else {
      safeSet('bbos_complete_' + toolId, '1');
    }
    bumpFieldUpdate();
  }

  return (
    <button
      className={`tool-complete-btn ${isComplete ? 'done' : ''}`}
      onClick={toggle}
    >
      {isComplete ? <CheckCircle size={16} /> : <Circle size={16} />}
      {isComplete ? 'Marked Complete' : 'Mark as Complete'}
    </button>
  );
}
