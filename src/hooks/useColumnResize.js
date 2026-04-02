// useColumnResize — drag-to-resize column widths
import { useCallback, useRef } from 'react';

export function useColumnResize(currentWidth, setWidth, min = 160, max = 480) {
  const dragRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = currentWidth;

    const onMove = (e2) => {
      const delta = e2.clientX - startX;
      const next = Math.min(max, Math.max(min, startW + delta));
      setWidth(next);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [currentWidth, setWidth, min, max]);

  return { onMouseDown, dragRef };
}
