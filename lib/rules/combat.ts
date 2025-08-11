/**
 * A minimal combat system for ship‑to‑ship engagements. Each ship
 * has hull points, armor rating, and gunnery skill. Attacks specify
 * their base damage. Damage dealt is (base + gunnery) minus the
 * defender's armor, with a minimum of 1 point of damage. The function
 * returns both the damage dealt and the defender's remaining hull.
 */
export interface Ship {
  hull: number;
  armor: number;
  gunnery: number;
}

export interface Attack {
  base: number;
}

export interface AttackResult {
  dmg: number;
  defenderHull: number;
}

export function resolveAttack(attacker: Ship, defender: Ship, atk: Attack): AttackResult {
  const raw = atk.base + attacker.gunnery;
  const dmg = Math.max(1, raw - defender.armor);
  const defenderHull = Math.max(0, defender.hull - dmg);
  return { dmg, defenderHull };
}