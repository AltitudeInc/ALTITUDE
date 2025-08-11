import { z } from "zod";

/**
 * Define the basic statistic structure for a player. You can expand these
 * properties later as the game grows. All stats are integers and must be
 * non‑negative.
 */
export const Stats = z.object({
  Pilot: z.number().int().min(0),
  Tactics: z.number().int().min(0),
  Mechanics: z.number().int().min(0),
  Charisma: z.number().int().min(0),
});

/**
 * Define an inventory item. Each item has an ID (which refers to an entry
 * in your content packs) and a quantity. Quantities must be at least 1.
 */
export const InventoryItem = z.object({
  id: z.string(),
  qty: z.number().int().min(1),
});

/**
 * Define quest progression. A record keyed by quest ID, with a stage
 * counter and a vars map for storing local variables. Vars can hold
 * arbitrary data related to the quest.
 */
export const Quests = z.record(
  z.string(),
  z.object({
    stage: z.number().int(),
    vars: z.record(z.string(), z.any()).default({}),
  })
);

/**
 * The full persistent game state. This should contain everything you need
 * to resume a game session, including player stats, flags, inventory,
 * quests and world variables. See the documentation for guidance on
 * extending these fields in the future.
 */
export const GameState = z.object({
  meta: z.object({ save_version: z.string(), time: z.string() }),
  player: z.object({
    name: z.string(),
    faction: z.string(),
    stats: Stats,
    hp: z.number().int(),
    max_hp: z.number().int(),
    credits: z.number().int(),
    tags: z.array(z.string()),
  }),
  location: z.string(),
  flags: z.record(z.string(), z.any()),
  inventory: z.array(InventoryItem),
  quests: Quests,
  world: z.object({
    weather: z.string(),
    notoriety: z.number().int(),
  }),
});

export type TGameState = z.infer<typeof GameState>;

/**
 * Define what the model must return each turn. The narrative director
 * produces a short narration, a list of choices, an optional state
 * patch describing how the game state should change, and an optional log
 * for internal debugging. Choices are capped at six to keep UI tidy.
 */
export const TurnOutput = z.object({
  narration: z.string().min(1),
  choices: z
    .array(
      z.object({ id: z.string(), label: z.string() })
    )
    .max(6),
  state_patch: z.record(z.string(), z.any()).default({}),
  log: z.any().optional(),
});

export type TTurnOutput = z.infer<typeof TurnOutput>;