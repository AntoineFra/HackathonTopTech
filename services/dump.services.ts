import { apiFetch } from './api';

/**
 * dump.services.ts
 * Client wrapper for Dump backend endpoints.
 * - listDumps(): GET /dump
 * - getDump(dumpType): GET /dump/:dumpType
 */

export async function listDumps() {
  return apiFetch('/dump', { method: 'GET' });
}

export async function getDump(dumpType: string) {
  if (!dumpType) throw new TypeError('dumpType is required');
  return apiFetch(`/dump/${dumpType}`, { method: 'GET' });
}
