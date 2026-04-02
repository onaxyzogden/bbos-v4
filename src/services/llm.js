// LLM Service — provider-agnostic API caller
// Ported from truthmarket_bbos.html:1978-2009

import { LLM_PROVIDERS } from '../data/providers.js';
import { safeGet } from './storage.js';

export async function callLLM(systemPrompt, userMessage, options = {}) {
  const providerId = options.provider || safeGet('bbos_provider', 'anthropic');
  const provider = LLM_PROVIDERS[providerId];
  if (!provider) throw new Error('Unknown provider: ' + providerId);

  const apiKey = safeGet('bbos_api_key_' + providerId);
  if (!apiKey) throw new Error('No API key set for ' + provider.name + '. Click the Key button in the topbar to configure it.');

  const model = options.model || safeGet('bbos_model') || provider.defaultModel;
  const maxTokens = options.maxTokens || 8192;
  const endpoint = provider.getEndpoint ? provider.getEndpoint(apiKey, model) : provider.endpoint;
  const headers = provider.buildHeaders(apiKey);
  const body = provider.buildBody(systemPrompt, userMessage, model, maxTokens);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 120000);

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify(body),
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      if (resp.status === 401) throw new Error('Invalid API key for ' + provider.name + '. Please check your key.');
      if (resp.status === 429) throw new Error('Rate limited by ' + provider.name + '. Please wait and try again.');
      throw new Error(provider.name + ' error ' + resp.status + ': ' + errBody.slice(0, 200));
    }

    const data = await resp.json();
    const text = provider.parseResponse(data);
    let jsonStr = text.trim();

    // Strip markdown fences if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      return JSON.parse(jsonStr);
    } catch (parseErr) {
      throw new Error('LLM returned invalid JSON: ' + jsonStr.slice(0, 120));
    }
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') throw new Error('Request timed out after ' + (options.timeout || 120000) / 1000 + 's');
    throw e;
  }
}
