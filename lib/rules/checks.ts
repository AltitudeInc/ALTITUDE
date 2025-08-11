/**
 * Deterministic functions for performing skill checks. A skill check
 * consists of rolling a d20, adding a stat modifier, and comparing
 * against a difficulty class (DC). By default the global Math.random
 * is used, but you can inject your own RNG for testing.
 */
export function d20(rng: () => number = Math.random): number {
  return 1 + Math.floor(rng() * 20);
}

export interface SkillCheckResult {
  roll: number;
  total: number;
  success: boolean;
}

export function skillCheck(stat: number, dc: number, rng: () => number = Math.random): SkillCheckResult {
  const roll = d20(rng);
  const total = roll + stat;
  return { roll, total, success: total >= dc };
}