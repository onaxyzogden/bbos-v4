// Migration service — v3.2 → v4.0 localStorage compatibility
import { safeSet, safeGet } from './storage.js';

export function runMigrations() {
  // Migration 1: Legacy single API key → provider-specific key (from v3.2)
  const oldKey = safeGet('bbos_api_key');
  if (oldKey && !safeGet('bbos_api_key_anthropic')) {
    safeSet('bbos_api_key_anthropic', oldKey);
    safeSet('bbos_provider', 'anthropic');
  }

  // Ensure default provider
  if (!safeGet('bbos_provider')) {
    safeSet('bbos_provider', 'anthropic');
  }

  // Stamp schema version
  safeSet('bbos_schema_version', '4.0');
}
