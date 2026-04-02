import { useRef, useCallback } from 'react';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { useSettingsStore } from '../../store/settings-store.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ColumnResizer.css';

export default function ColumnResizer({ side }) {
  const sidebarWidth = usePipelineStore((s) => s.sidebarWidth);
  const setSidebarWidth = usePipelineStore((s) => s.setSidebarWidth);
  const sidebarOpen = usePipelineStore((s) => s.sidebarOpen);
  const toggleSidebar = usePipelineStore((s) => s.toggleSidebar);
  const ilWidth = usePipelineStore((s) => s.ilWidth);
  const setIlWidth = usePipelineStore((s) => s.setIlWidth);
  const ilOpen = useSettingsStore((s) => s.ilOpen);
  const setIlOpen = useSettingsStore((s) => s.setIlOpen);

  const isSidebar = side === 'sidebar';
  const isOpen = isSidebar ? sidebarOpen : ilOpen;
  const draggedRef = useRef(false);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = isSidebar ? sidebarWidth : ilWidth;
    const min = 160;
    const max = isSidebar ? 480 : 360;
    draggedRef.current = false;

    const onMove = (e2) => {
      const dx = e2.clientX - startX;
      if (Math.abs(dx) > 4) draggedRef.current = true;
      if (draggedRef.current) {
        const next = Math.min(max, Math.max(min, isSidebar ? startW + dx : startW - dx));
        if (isSidebar) setSidebarWidth(next);
        else setIlWidth(next);
      }
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // If no drag happened, it was a click — toggle collapse
      if (!draggedRef.current) {
        if (isSidebar) toggleSidebar();
        else setIlOpen(!ilOpen);
      }
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isSidebar, sidebarWidth, ilWidth, setSidebarWidth, setIlWidth, toggleSidebar, ilOpen, setIlOpen]);

  return (
    <div
      className={`col-edge ${isSidebar ? 'sb-edge' : 'il-edge'}`}
      onMouseDown={onMouseDown}
      style={{ gridRow: 2 }}
      role="separator"
      aria-label={isSidebar ? 'Toggle sidebar' : 'Toggle Islamic layer'}
    >
      <div className="col-edge-line" />
      <div className="col-edge-toggle">
        {isSidebar ? (
          isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />
        ) : (
          isOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />
        )}
      </div>
    </div>
  );
}
