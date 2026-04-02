import { useMemo } from 'react';
import { usePipelineStore } from './store/pipeline-store.js';
import { useSettingsStore } from './store/settings-store.js';
import { useRoleStore } from './store/role-store.js';
import { useThresholdStore } from './store/threshold-store.js';
import { useMobile } from './hooks/useMobile.js';
import TopBar from './components/layout/TopBar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import ColumnResizer from './components/layout/ColumnResizer.jsx';
import MainContent from './components/layout/MainContent.jsx';
import IslamicLayer from './components/layout/IslamicLayer.jsx';
import MobileTabBar from './components/layout/MobileTabBar.jsx';
import ThresholdModal from './components/islamic/ThresholdModal.jsx';
import WelcomeModal from './components/shared/WelcomeModal.jsx';
import { STAGES, TOOLS } from './data/config.js';
import './App.css';

export default function App() {
  const isMobile = useMobile();
  const sidebarWidth = usePipelineStore((s) => s.sidebarWidth);
  const ilWidth = usePipelineStore((s) => s.ilWidth);
  const valuesLayer = useSettingsStore((s) => s.valuesLayer);
  const ilOpen = useSettingsStore((s) => s.ilOpen);
  const tipsOn = useSettingsStore((s) => s.tipsOn);
  const openingStageKey = useThresholdStore((s) => s.openingStageKey);
  const closingStageKey = useThresholdStore((s) => s.closingStageKey);

  // Group tools by stage
  const toolsByStage = useMemo(() => {
    const map = {};
    for (const t of TOOLS) {
      if (!map[t.stage]) map[t.stage] = [];
      map[t.stage].push(t);
    }
    return map;
  }, []);

  const sidebarOpen = usePipelineStore((s) => s.sidebarOpen);
  const showILEdge = !isMobile && valuesLayer === 'islamic';
  const showILContent = showILEdge && ilOpen;
  const sbW = sidebarOpen ? sidebarWidth : 0;

  const gridCols = isMobile
    ? '1fr'
    : showILContent
      ? `${sbW}px 28px 1fr 28px ${ilWidth}px`
      : showILEdge
        ? `${sbW}px 28px 1fr 28px`
        : `${sbW}px 28px 1fr`;

  return (
    <div className={`app${tipsOn ? '' : ' tips-off'}`} style={{ gridTemplateColumns: gridCols }}>
      <TopBar />

      {!isMobile && (
        <>
          {sidebarOpen && <Sidebar toolsByStage={toolsByStage} />}
          {!sidebarOpen && <div style={{ gridRow: 2 }} />}
          <ColumnResizer side="sidebar" />
        </>
      )}

      <MainContent toolsByStage={toolsByStage} />

      {showILEdge && <ColumnResizer side="islamic" />}
      {showILContent && <IslamicLayer />}

      {isMobile && <MobileTabBar />}

      {/* Modals */}
      {openingStageKey && <ThresholdModal type="opening" />}
      {closingStageKey && <ThresholdModal type="closing" />}
      <WelcomeModal />
    </div>
  );
}
