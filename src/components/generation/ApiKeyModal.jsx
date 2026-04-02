import { useState } from 'react';
import { LLM_PROVIDERS } from '../../data/providers.js';
import { safeGet, safeSet } from '../../services/storage.js';
import { X, Key, Check } from 'lucide-react';
import './ApiKeyModal.css';

export default function ApiKeyModal({ onClose }) {
  const [providerId, setProviderId] = useState(() => safeGet('bbos_provider', 'anthropic'));
  const [keys, setKeys] = useState(() => {
    const k = {};
    Object.keys(LLM_PROVIDERS).forEach(id => { k[id] = safeGet('bbos_api_key_' + id, ''); });
    return k;
  });
  const [model, setModel] = useState(() => safeGet('bbos_model', ''));
  const [saved, setSaved] = useState(false);

  const provider = LLM_PROVIDERS[providerId];
  const currentKey = keys[providerId] || '';
  const currentModel = model || provider?.defaultModel || '';

  function save() {
    safeSet('bbos_provider', providerId);
    Object.entries(keys).forEach(([id, key]) => {
      if (key) safeSet('bbos_api_key_' + id, key);
    });
    safeSet('bbos_model', currentModel);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  }

  return (
    <div className="api-overlay" onClick={onClose}>
      <div className="api-modal" onClick={e => e.stopPropagation()}>
        <div className="api-header">
          <Key size={18} />
          <h3>API Configuration</h3>
          <button className="api-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="api-body">
          {/* Provider selector */}
          <div className="api-field">
            <label className="api-label">Provider</label>
            <div className="api-providers">
              {Object.entries(LLM_PROVIDERS).map(([id, p]) => (
                <button
                  key={id}
                  className={`api-prov-btn ${id === providerId ? 'active' : ''}`}
                  onClick={() => setProviderId(id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="api-field">
            <label className="api-label">API Key — {provider?.name}</label>
            <input
              className="api-input"
              type="password"
              placeholder={provider?.keyPlaceholder}
              value={currentKey}
              onChange={e => setKeys({ ...keys, [providerId]: e.target.value })}
            />
            <div className="api-hint">
              Keys are stored in your browser's localStorage only. Never sent to any server except {provider?.privacyDomain}.
            </div>
          </div>

          {/* Model selector */}
          <div className="api-field">
            <label className="api-label">Model</label>
            <select
              className="api-select"
              value={currentModel}
              onChange={e => setModel(e.target.value)}
            >
              {provider?.models.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="api-footer">
          <button className="api-btn api-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="api-btn api-btn-save" onClick={save}>
            {saved ? <><Check size={14} /> Saved</> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
