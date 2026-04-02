import { usePipelineStore } from '../../store/pipeline-store.js';
import { LayoutGrid, BookOpen } from 'lucide-react';
import './MobileTabBar.css';

export default function MobileTabBar() {
  const view = usePipelineStore((s) => s.view);
  const setView = usePipelineStore((s) => s.setView);

  return (
    <nav className="mob-tab-bar">
      <button
        className={`mob-tab ${view === 'pipeline' ? 'active' : ''}`}
        onClick={() => setView('pipeline')}
      >
        <LayoutGrid size={18} />
        <span>Pipeline</span>
      </button>
      <button
        className={`mob-tab ${view === 'islamic' ? 'active' : ''}`}
        onClick={() => setView('islamic')}
      >
        <BookOpen size={18} />
        <span>Islamic</span>
      </button>
    </nav>
  );
}
