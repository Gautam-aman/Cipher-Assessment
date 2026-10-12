const KEY = 'blueprint.practice.v1';

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { attempts: [], drafts: {}, revisions: { focuses: {}, notes: {} } };
    const parsed = JSON.parse(raw);
    const revisions = parsed.revisions && typeof parsed.revisions === 'object' ? parsed.revisions : {};
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      drafts: parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts : {},
      revisions: {
        focuses: revisions.focuses && typeof revisions.focuses === 'object' && !Array.isArray(revisions.focuses) ? revisions.focuses : {},
        notes: revisions.notes && typeof revisions.notes === 'object' && !Array.isArray(revisions.notes) ? revisions.notes : {}
      }
    };
  } catch {
    return { attempts: [], drafts: {}, revisions: { focuses: {}, notes: {} } };
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
