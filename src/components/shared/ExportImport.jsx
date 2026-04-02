import { useRef } from 'react';
import { exportProject, importProject } from '../../services/storage.js';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { Download, Upload } from 'lucide-react';
import './ExportImport.css';

export default function ExportImport() {
  const fileRef = useRef(null);
  const bumpFieldUpdate = usePipelineStore((s) => s.bumpFieldUpdate);

  function handleExport() {
    const data = exportProject();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bbos-project-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        importProject(json);
        bumpFieldUpdate();
        alert('Project imported successfully. Reload to see all changes.');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="ei-wrap">
      <button className="ei-btn" onClick={handleExport}>
        <Download size={14} /> Export Project
      </button>
      <button className="ei-btn" onClick={() => fileRef.current?.click()}>
        <Upload size={14} /> Import Project
      </button>
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
    </div>
  );
}
