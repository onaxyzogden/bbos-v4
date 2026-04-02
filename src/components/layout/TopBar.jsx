import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/settings-store.js';
import { useRoleStore } from '../../store/role-store.js';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { ROLES } from '../../data/config.js';
import { Sun, Moon, Layers, Eye, EyeOff, Key, Languages, FileText } from 'lucide-react';
import ApiKeyModal from '../generation/ApiKeyModal.jsx';
import PILModal from '../integrity/PILModal.jsx';
import './TopBar.css';

export default function TopBar() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const valuesLayer = useSettingsStore((s) => s.valuesLayer);
  const setValuesLayer = useSettingsStore((s) => s.setValuesLayer);
  const attrLang = useSettingsStore((s) => s.attrLang);
  const setAttrLang = useSettingsStore((s) => s.setAttrLang);
  const tipsOn = useSettingsStore((s) => s.tipsOn);
  const toggleTips = useSettingsStore((s) => s.toggleTips);
  const roleId = useRoleStore((s) => s.roleId);
  const setRoleId = useRoleStore((s) => s.setRoleId);
  const view = usePipelineStore((s) => s.view);
  const setView = usePipelineStore((s) => s.setView);
  const setSelectedToolId = usePipelineStore((s) => s.setSelectedToolId);

  const [roleOpen, setRoleOpen] = useState(false);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [pilOpen, setPilOpen] = useState(false);
  const roleRef = useRef(null);

  // Close dropdown when clicking anywhere outside the role wrapper
  useEffect(() => {
    if (!roleOpen) return;
    // Use a timeout to skip the current event that opened the dropdown
    const tid = setTimeout(() => {
      const handler = () => setRoleOpen(false);
      window.addEventListener('click', handler);
      // Store cleanup ref
      roleRef.current._cleanup = () => window.removeEventListener('click', handler);
    }, 10);
    return () => {
      clearTimeout(tid);
      roleRef.current?._cleanup?.();
    };
  }, [roleOpen]);

  const currentRole = ROLES.find((r) => r.id === roleId) || ROLES[0];

  return (
    <header className="tb">
      {/* Logo */}
      <div className="tb-logo" onClick={() => { setSelectedToolId(null); setView('pipeline'); }}>
        <span className="tb-logo-mark">B</span>
        <span className="tb-logo-text">BBOS</span>
      </div>

      <div className="tb-divider" />

      {/* Role selector */}
      <div className="tb-role-wrap" ref={roleRef}>
        <button
          className="tb-role-btn"
          style={{ color: currentRole.color, borderColor: currentRole.color + '40' }}
          onClick={() => setRoleOpen(!roleOpen)}
        >
          {currentRole.initials && <span className="tb-role-initials">{currentRole.initials}</span>}
          {currentRole.label}
        </button>
        {roleOpen && (
          <div className="tb-role-dropdown" onClick={(e) => e.stopPropagation()} style={(() => {
            const rect = roleRef.current?.getBoundingClientRect();
            return rect ? { top: rect.bottom + 4, left: rect.left } : {};
          })()}>
            {ROLES.map((r) => (
              <button
                key={r.id}
                className={`tb-role-option ${r.id === roleId ? 'active' : ''}`}
                style={{ color: r.color }}
                onClick={() => { setRoleId(r.id); setRoleOpen(false); }}
              >
                {r.initials && <span className="tb-role-initials">{r.initials}</span>}
                <span>{r.label}</span>
                <span className="tb-role-sub">{r.sub}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tb-divider" />

      {/* View toggles */}
      <div className="tb-view-group">
        {['pipeline', 'asset', 'layers'].map((v) => (
          <button
            key={v}
            className={`tb-view-btn ${view === v ? 'active' : ''}`}
            onClick={() => { setView(v); setSelectedToolId(null); }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="tb-spacer" />

      {/* Pipeline Integrity Ledger */}
      <button className="tb-icon-btn" data-tooltip="Pipeline Integrity Ledger" onClick={() => setPilOpen(true)}>
        <FileText size={16} />
      </button>

      {/* Values layer toggle */}
      <button
        className="tb-icon-btn"
        data-tooltip={valuesLayer === 'islamic' ? 'Islamic framing' : 'Universal framing'}
        onClick={() => setValuesLayer(valuesLayer === 'islamic' ? 'universal' : 'islamic')}
      >
        <Layers size={16} />
      </button>

      {/* Attribute language */}
      <button
        className="tb-icon-btn"
        data-tooltip={attrLang === 'en' ? 'English attributes' : 'Arabic attributes'}
        onClick={() => setAttrLang(attrLang === 'en' ? 'ar' : 'en')}
      >
        <Languages size={16} />
      </button>

      {/* Tips toggle */}
      <button className="tb-icon-btn" data-tooltip="Toggle tips" onClick={toggleTips}>
        {tipsOn ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>

      {/* Theme toggle */}
      <button
        className="tb-icon-btn"
        data-tooltip={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* API Key */}
      <button className="tb-icon-btn" data-tooltip="API Key settings" onClick={() => setApiKeyOpen(true)}>
        <Key size={16} />
      </button>

      {apiKeyOpen && <ApiKeyModal onClose={() => setApiKeyOpen(false)} />}
      {pilOpen && <PILModal onClose={() => setPilOpen(false)} />}
    </header>
  );
}
