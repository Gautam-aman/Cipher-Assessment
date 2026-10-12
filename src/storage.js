const KEY = 'blueprint.practice.v1';

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { attempts: [], drafts: {} };
    const parsed = JSON.parse(raw);
    return { attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [], drafts: parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts : {} };
  } catch {
    return { attempts: [], drafts: {} };
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
