import { useMemo } from 'react';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { useRoleStore, rolePerm } from '../../store/role-store.js';
import { useSettingsStore } from '../../store/settings-store.js';
import { STAGES, TOOLS, LAYERS, LAYER_META, STATUS_META } from '../../data/config.js';
import { getToolStatus } from '../../hooks/useToolStatus.js';
import './LayersView.css';

const LAYER_ORDER = ['Think', 'Execute', 'Reckon'];

export default function LayersView() {
  const setSelectedToolId = usePipelineStore((s) => s.setSelectedToolId);
  const setFocusedStageKey = usePipelineStore((s) => s.setFocusedStageKey);
  const roleId = useRoleStore((s) => s.roleId);
  const attrLang = useSettingsStore((s) => s.attrLang);
  const fieldUpdateTick = usePipelineStore((s) => s.fieldUpdateTick);

  const byStage = useMemo(() => {
    const map = {};
    Object.keys(STAGES).forEach((k) => { map[k] = []; });
    TOOLS.forEach((t) => {
      if (!map[t.stage]) return;
      if (roleId === 'all' || rolePerm(t, roleId) !== '-') map[t.stage].push(t);
    });
    return map;
  }, [roleId]);

  const layerStages = useMemo(() => {
    const ls = { Think: [], Execute: [], Reckon: [] };
    Object.values(STAGES).forEach((s) => {
      const l = LAYERS[s.key];
      if (l) ls[l].push(s);
    });
    return ls;
  }, []);

  function stageStatus(key) {
    const st = TOOLS.filter((t) => t.stage === key);
    if (!st.length) return 'Not Started';
    if (st.every((t) => getToolStatus(t) === 'Complete')) return 'Complete';
    if (st.some((t) => getToolStatus(t) === 'Active')) return 'Active';
    return 'Not Started';
  }

  return (
    <div className="lv">
      <div className="lv-header">
        <div className="lv-supra">BARAKAH BUSINESS OPERATING SYSTEM</div>
        <h1>Layer Architecture</h1>
        <p className="lv-sub">
          Three layers replace the stitched stack: Think (strategy tools), Execute (pipeline tools), and Reckon (retention & optimization tools).
        </p>
      </div>

      {LAYER_ORDER.map((layer) => {
        const lm = LAYER_META[layer];
        const stages = layerStages[layer];

        return (
          <div key={layer} className="lv-layer">
            <div className="lv-layer-hdr">
              <span className="lv-layer-name" style={{ color: lm.color }}>{lm.label}</span>
              <span className="lv-layer-sub">{lm.sub}</span>
              <span className="lv-layer-line" style={{ background: lm.color + '30' }} />
            </div>

            {stages.map((stage) => {
              const items = byStage[stage.key] || [];
              if (!items.length) return null;
              const st = stageStatus(stage.key);
              const sm = STATUS_META[st];

              return (
                <div
                  key={stage.key}
                  className="lv-stage-row"
                  onClick={() => {
                    const first = items[0];
                    if (first) {
                      setSelectedToolId(first.id);
                      setFocusedStageKey(first.stage);
                    }
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = stage.c + '60'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <span className="lv-stage-badge" style={{ background: stage.bg, color: stage.c, borderColor: stage.b }}>
                    {stage.key} · {stage.name.toUpperCase()}
                  </span>
                  <span className="lv-stage-attr">
                    {attrLang === 'ar' ? stage.attr_ar : stage.attr}
                  </span>
                  <span className="lv-stage-count">{items.length} tools</span>
                  <span className="lv-stage-status" style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}>
                    {sm.dot} {st}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
