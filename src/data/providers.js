// LLM Provider Registry — ported from truthmarket_bbos.html:1918-1965

export const LLM_PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    keyPlaceholder: 'sk-ant-...',
    keyPrefix: 'sk-ant-',
    privacyDomain: 'api.anthropic.com',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-haiku-35-20241022', label: 'Claude 3.5 Haiku' },
    ],
    defaultModel: 'claude-sonnet-4-20250514',
    buildHeaders(k) {
      return {
        'x-api-key': k,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      };
    },
    buildBody(sys, usr, model, max) {
      return { model, max_tokens: max, system: sys, messages: [{ role: 'user', content: usr }] };
    },
    parseResponse(d) { return d.content?.[0]?.text || ''; },
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyPlaceholder: 'sk-...',
    keyPrefix: 'sk-',
    privacyDomain: 'api.openai.com',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'o3-mini', label: 'o3 Mini' },
    ],
    defaultModel: 'gpt-4o',
    buildHeaders(k) {
      return { Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' };
    },
    buildBody(sys, usr, model, max) {
      return { model, max_tokens: max, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }] };
    },
    parseResponse(d) { return d.choices?.[0]?.message?.content || ''; },
  },
  gemini: {
    name: 'Google Gemini',
    endpoint: null,
    getEndpoint(k, m) {
      return 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + k;
    },
    keyPlaceholder: 'AIza...',
    keyPrefix: 'AIza',
    privacyDomain: 'generativelanguage.googleapis.com',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro' },
    ],
    defaultModel: 'gemini-2.0-flash',
    buildHeaders() { return { 'Content-Type': 'application/json' }; },
    buildBody(sys, usr, _m, max) {
      return {
        systemInstruction: { parts: [{ text: sys }] },
        contents: [{ parts: [{ text: usr }] }],
        generationConfig: { maxOutputTokens: max },
      };
    },
    parseResponse(d) { return d.candidates?.[0]?.content?.parts?.[0]?.text || ''; },
  },
  groq: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    keyPlaceholder: 'gsk_...',
    keyPrefix: 'gsk_',
    privacyDomain: 'api.groq.com',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    ],
    defaultModel: 'llama-3.3-70b-versatile',
    buildHeaders(k) {
      return { Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' };
    },
    buildBody(sys, usr, model, max) {
      return { model, max_tokens: max, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }] };
    },
    parseResponse(d) { return d.choices?.[0]?.message?.content || ''; },
  },
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    keyPlaceholder: 'sk-or-...',
    keyPrefix: 'sk-or-',
    privacyDomain: 'openrouter.ai',
    models: [
      { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4 (via OR)' },
      { id: 'openai/gpt-4o', label: 'GPT-4o (via OR)' },
      { id: 'google/gemini-2.0-flash', label: 'Gemini Flash (via OR)' },
      { id: 'meta-llama/llama-3.3-70b', label: 'Llama 3.3 70B (via OR)' },
      { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron Super 120B (Free)' },
      { id: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'Nemotron Nano 30B (Free)' },
    ],
    defaultModel: 'anthropic/claude-sonnet-4',
    buildHeaders(k) {
      return {
        Authorization: 'Bearer ' + k,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'BBOS',
      };
    },
    buildBody(sys, usr, model, max) {
      return { model, max_tokens: max, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }] };
    },
    parseResponse(d) { return d.choices?.[0]?.message?.content || ''; },
  },
};
