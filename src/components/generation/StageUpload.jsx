import { useRef, useState, useCallback } from 'react';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { handleStageUpload } from '../../services/stage-upload.js';
import { STAGES, TOOLS } from '../../data/config.js';
import NoShipBanner from '../integrity/NoShipBanner.jsx';
import { Upload, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './StageUpload.css';

function buildTemplate(stageKey) {
  const stage = STAGES[stageKey];
  const tools = TOOLS.filter(t => t.stage === stageKey);
  const assets = {};
  for (const tool of tools) {
    const fields = {};
    if (tool.fields) {
      for (const f of tool.fields) {
        fields[f.key] = '';
      }
    }
    assets[tool.id] = {
      content: '',
      fields,
      g_label: 'G3',
      proof_pending: [],
      assumptions: [],
      status: 'filled',
    };
  }
  return {
    schema_version: '1.0',
    stage: stageKey,
    role: 'all',
    generated_at: '',
    no_ship: null,
    handoff: { assumptions: [] },
    assets,
    _comment: 'BBOS Stage ' + stage.code + ' ' + stage.name + ' — fill in tool fields and set g_labels before uploading.',
  };
}

function downloadTemplate(stageKey) {
  const template = buildTemplate(stageKey);
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bbos-' + stageKey.toLowerCase() + '-template.bbos.json';
  a.click();
  URL.revokeObjectURL(url);
}

export default function StageUpload({ stageKey }) {
  const fileRef = useRef(null);
  const bumpFieldUpdate = usePipelineStore((s) => s.bumpFieldUpdate);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = handleStageUpload(ev.target.result, stageKey);
      setResult(res);
      if (!res.error && !res.noShip) {
        bumpFieldUpdate();
      }
    };
    reader.readAsText(file);
  }, [stageKey]);

  function onFileChange(e) {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }
  function onDragLeave() {
    setDragging(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.bbos.json'))) {
      processFile(file);
    } else {
      setResult({ error: 'Only .json and .bbos.json files are accepted.' });
    }
  }

  return (
    <div className="su-wrap">
      <div className="su-row">
        <div
          className={`su-dropzone ${dragging ? 'su-dragging' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={16} />
          <span>Upload stage JSON or drop file here</span>
        </div>
        <button
          className="su-template-btn tip-left"
          onClick={(e) => { e.stopPropagation(); downloadTemplate(stageKey); }}
          data-tooltip="Download a blank JSON template for this stage"
        >
          <Download size={14} />
          <span>Template</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.bbos.json"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      {/* Results */}
      {result && (
        <div className="su-result">
          {result.noShip && (
            <NoShipBanner message={result.noShip} />
          )}

          {result.error && (
            <div className="su-error">{result.error}</div>
          )}

          {result.assumptions?.length > 0 && (
            <div className="su-assumptions">
              <div className="su-assumptions-header">
                <AlertTriangle size={14} />
                <span>Assumptions in uploaded file — verify before accepting drafts</span>
              </div>
              <ul>
                {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          {result.drafted?.length > 0 && (
            <div className="su-success">
              <CheckCircle2 size={14} />
              <span>{result.drafted.length} tool(s) loaded as drafts — review and accept below.</span>
            </div>
          )}

          {result.warnings?.length > 0 && (
            <div className="su-warnings">
              {result.warnings.map((w, i) => <div key={i} className="su-warning-item">{w}</div>)}
            </div>
          )}

          {result.skipped?.length > 0 && (
            <div className="su-skipped">
              Skipped: {result.skipped.map(s => s.id + ' (' + s.reason + ')').join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
