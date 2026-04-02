import { useState } from 'react';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { useRoleStore, rolePerm } from '../../store/role-store.js';
import { useSettingsStore } from '../../store/settings-store.js';
import { getToolStatus } from '../../hooks/useToolStatus.js';
import { STAGES, STATUS_META } from '../../data/config.js';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ toolsByStage }) {
  const selectedToolId = usePipelineStore((s) => s.selectedToolId);
  const setSelectedToolId = usePipelineStore((s) => s.setSelectedToolId);
  const sidebarSearch = usePipelineStore((s) => s.sidebarSearch);
  const setSidebarSearch = usePipelineStore((s) => s.setSidebarSearch);
  const setFocusedStageKey = usePipelineStore((s) => s.setFocusedStageKey);
  const setView = usePipelineStore((s) => s.setView);
  const roleId = useRoleStore((s) => s.roleId);
  const fieldUpdateTick = usePipelineStore((s) => s.fieldUpdateTick);
  const attrLang = useSettingsStore((s) => s.attrLang);

  // Accordion: only one stage open at a time
  const [activeStage, setActiveStage] = useState(null);

  const searchLower = sidebarSearch.toLowerCase();

  return (
    <aside className="sb">
      {/* Top: Overview + Search */}
      <div className="sb-top">
        <button
          className="sb-overview-btn"
          onClick={() => { setSelectedToolId(null); setView('pipeline'); }}
        >
          Pipeline Overview
        </button>
        <div className="sb-search-wrap">
          <Search size={14} className="sb-search-icon" />
          <input
            className="sb-search"
            type="text"
            placeholder="Search tools..."
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stage sections */}
      <div className="sb-stages">
        {Object.values(STAGES).map((stage) => {
          const tools = toolsByStage[stage.key] || [];
          const isOpen = activeStage === stage.key;

          // Filter tools by search and role
          const visibleTools = tools.filter((t) => {
            if (searchLower && !t.label.toLowerCase().includes(searchLower)) return false;
            if (roleId !== 'all' && rolePerm(t, roleId) === '-') return false;
            return true;
          });

          // Count completed
          const completedCount = tools.filter((t) => getToolStatus(t) === 'Complete').length;

          if (searchLower && visibleTools.length === 0) return null;

          return (
            <div key={stage.key} className="sb-stage">
              <button
                className="sb-stage-header"
                onClick={() => setActiveStage(isOpen ? null : stage.key)}
                style={{ borderLeftColor: stage.c }}
              >
                <span className="sb-stage-code" style={{ color: stage.c }}>
                  {stage.code}
                </span>
                <span className="sb-stage-name">{stage.name}</span>
                <span className="sb-stage-attr" style={{ color: stage.c }}>
                  {attrLang === 'ar' ? stage.attr_ar : stage.attr}
                </span>
                <span className="sb-stage-count">
                  {completedCount}/{tools.length}
                </span>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isOpen && (
                <div className="sb-tools">
                  {visibleTools.map((tool) => {
                    const status = getToolStatus(tool);
                    const meta = STATUS_META[status] || STATUS_META['Not Started'];
                    const perm = rolePerm(tool, roleId);
                    const isSelected = tool.id === selectedToolId;

                    return (
                      <button
                        key={tool.id}
                        className={`sb-tool ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedToolId(tool.id);
                          setFocusedStageKey(tool.stage);
                          setView('pipeline');
                        }}
                      >
                        <span className="sb-tool-dot" style={{ color: meta.color }}>
                          {meta.dot}
                        </span>
                        <span className="sb-tool-label">{tool.label}</span>
                        {perm !== 'O' && perm !== '-' && (
                          <span className="sb-tool-perm" style={{ color: stage.c }}>
                            {perm}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
