import { useMemo } from 'react';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { useRoleStore, rolePerm } from '../../store/role-store.js';
import { useSettingsStore } from '../../store/settings-store.js';
import { STAGES, TOOLS, STATUS_META } from '../../data/config.js';
import { getToolStatus } from '../../hooks/useToolStatus.js';
import './AssetView.css';

export default function AssetView() {
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

  return (
    <div className="av">
      <div className="av-header">
        <h1>Asset Registry</h1>
        <p className="av-sub">All pipeline assets grouped by stage</p>
      </div>

      {Object.values(STAGES).map((stage) => {
        const items = byStage[stage.key] || [];
        if (!items.length) return null;

        const stageTools = TOOLS.filter((t) => t.stage === stage.key);
        const completed = stageTools.filter((t) => getToolStatus(t) === 'Complete').length;
        const total = stageTools.length;
        const stageStatusLabel = completed === total && total > 0 ? 'Complete' : stageTools.some((t) => getToolStatus(t) === 'Active') ? 'Active' : 'Not Started';
        const sm = STATUS_META[stageStatusLabel];

        return (
          <div key={stage.key} className="av-stage">
            <div className="av-stage-hdr">
              <span className="av-stage-badge" style={{ background: stage.bg, color: stage.c, borderColor: stage.b }}>
                {stage.key}
              </span>
              <span className="av-stage-name">{stage.name}</span>
              <span className="av-stage-attr" style={{ color: stage.c }}>
                {attrLang === 'ar' ? stage.attr_ar : stage.attr}
              </span>
              <span className="av-stage-status" style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}>
                <span>{sm.dot}</span> {stageStatusLabel}
              </span>
            </div>

            <div className="av-list">
              {items.map((tool) => {
                const perm = roleId === 'all' ? 'O' : rolePerm(tool, roleId);
                const status = getToolStatus(tool);
                const toolSm = STATUS_META[status];

                return (
                  <div
                    key={tool.id}
                    className="av-row"
                    onClick={() => { setSelectedToolId(tool.id); setFocusedStageKey(tool.stage); }}
                  >
                    <div className="av-bar" style={{ background: stage.c + '55' }} />
                    <div className="av-body">
                      <div className="av-name">{tool.label}</div>
                      <div className="av-ref">{tool.asset}</div>
                    </div>
                    <div className="av-right">
                      <span className="av-tool-status" style={{ color: toolSm.color }}>{toolSm.dot}</span>
                      {roleId !== 'all' && perm !== 'O' && (
                        <span className="av-perm" style={{ color: stage.c }}>{perm}</span>
                      )}
                      <span className="av-sec">{tool.sec}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
