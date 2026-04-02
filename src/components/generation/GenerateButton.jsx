import { useCallback, useState } from 'react';
import { useGenerationStore } from '../../store/generation-store.js';
import { useRoleStore } from '../../store/role-store.js';
import { useThresholdStore } from '../../store/threshold-store.js';
import { usePipelineStore } from '../../store/pipeline-store.js';
import { callLLM } from '../../services/llm.js';
import { buildSystemPrompt, synthesizeAssets } from '../../services/schema.js';
import { checkUpstreamReady } from '../../services/upstream.js';
import { safeGet } from '../../services/storage.js';
import { Sparkles, Loader2, AlertCircle, Check, Shield, AlertTriangle } from 'lucide-react';
import './GenerateButton.css';

export default function GenerateButton({ toolId, stageKey }) {
  const roleId = useRoleStore((s) => s.roleId);
  const genState = useGenerationStore((s) => s.genStates[toolId] || 'idle');
  const genError = useGenerationStore((s) => s.genErrors[toolId]);
  const setGenerating = useGenerationStore((s) => s.setGenerating);
  const setGenResult = useGenerationStore((s) => s.setGenResult);
  const setGenError = useGenerationStore((s) => s.setGenError);
  const bumpFieldUpdate = usePipelineStore((s) => s.bumpFieldUpdate);

  const completedOpening = useThresholdStore((s) => s.completedOpening);
  const setOpeningStageKey = useThresholdStore((s) => s.setOpeningStageKey);

  const [bypassUpstream, setBypassUpstream] = useState(false);

  const hasApiKey = !!safeGet('bbos_api_key_' + safeGet('bbos_provider', 'anthropic'));

  const generate = useCallback(async () => {
    if (genState === 'loading') return;

    setGenerating(toolId);
    try {
      const systemPrompt = buildSystemPrompt(stageKey, roleId, { singleTool: toolId });
      const userMessage = `Generate content for tool "${toolId}" in stage ${stageKey}. Follow factory instructions precisely.`;
      const result = await callLLM(systemPrompt, userMessage);
      const synthesis = synthesizeAssets(result);

      if (synthesis.noShip) {
        setGenError(toolId, 'NO-SHIP: ' + synthesis.noShip);
      } else if (synthesis.error) {
        setGenError(toolId, synthesis.error);
      } else {
        setGenResult(toolId, synthesis);
        bumpFieldUpdate();
      }
    } catch (err) {
      setGenError(toolId, err.message);
    }
  }, [toolId, stageKey, roleId, genState]);

  // Gate: No API key
  if (!hasApiKey) {
    return (
      <div className="gen-no-key">
        Configure an API key in settings to enable AI generation.
      </div>
    );
  }

  // Gate A: Opening threshold ceremony must be completed
  if (!completedOpening[stageKey]) {
    return (
      <div className="gen-wrap">
        <button
          className="gen-btn gen-threshold-gate"
          onClick={() => setOpeningStageKey(stageKey)}
        >
          <Shield size={14} /> Complete Opening Threshold First
        </button>
        <div className="gen-gate-hint">
          The Opening Dua and Readiness Check must be completed before generation.
        </div>
      </div>
    );
  }

  // Gate B: Upstream readiness check (soft block)
  const upstream = checkUpstreamReady(toolId);
  if (!upstream.ready && !bypassUpstream) {
    return (
      <div className="gen-wrap">
        <div className="gen-upstream-warn">
          <div className="gen-upstream-header">
            <AlertTriangle size={14} /> Upstream sources incomplete
          </div>
          <ul className="gen-upstream-list">
            {upstream.missing.map((m, i) => (
              <li key={i}>{m.label}</li>
            ))}
          </ul>
          <div className="gen-upstream-hint">
            AI output quality depends on these inputs.
          </div>
          <button
            className="gen-btn gen-bypass"
            onClick={() => setBypassUpstream(true)}
          >
            Generate Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gen-wrap">
      <button
        className={`gen-btn ${genState}`}
        onClick={generate}
        disabled={genState === 'loading'}
      >
        {genState === 'loading' ? (
          <><Loader2 size={14} className="gen-spinner" /> Generating...</>
        ) : genState === 'done' ? (
          <><Check size={14} /> Generated — Review Draft</>
        ) : genState === 'error' ? (
          <><AlertCircle size={14} /> Retry Generation</>
        ) : (
          <><Sparkles size={14} /> Generate with AI</>
        )}
      </button>

      {genState === 'error' && genError && (
        <div className="gen-error">{genError}</div>
      )}
    </div>
  );
}
