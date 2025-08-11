import type { TGameState } from "../schema";

/**
 * Apply a state patch returned by the model to the existing game state.
 * Only a whitelisted set of top‑level keys can be modified. Fields not
 * present in the patch are left untouched. For simplicity this performs
 * a shallow replace on allowed keys. In future you may want to merge
 * nested objects instead of replacing them outright.
 */
export function applyStatePatch(state: TGameState, patch: Record<string, any>): TGameState {
  const allowed = new Set([
    "meta",
    "player",
    "location",
    "flags",
    "inventory",
    "quests",
    "world",
  ]);
  // Create a deep copy to avoid mutations.
  const nextState: TGameState = JSON.parse(JSON.stringify(state));
  for (const [key, value] of Object.entries(patch)) {
    if (allowed.has(key)) {
      // @ts-ignore - dynamic assignment
      nextState[key] = value;
    }
  }
  return nextState;
}