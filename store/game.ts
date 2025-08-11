import { create } from "zustand";
import type { TGameState } from "../lib/schema";

type Choice = { id: string; label: string };
type TurnState = { narration: string; choices: Choice[] };

interface GameStore {
  state: TGameState;
  lastTurn?: TurnState;
  loading: boolean;
  error?: string;
  act: (choiceId: string) => Promise<void>;
}

export const useGame = create<GameStore>((set, get) => ({
  state: {
    meta: { save_version: "0.1.0", time: "Y402-D17 03:42" },
    player: {
      name: "Commander Pax",
      faction: "SilverContrails",
      stats: { Pilot: 6, Tactics: 5, Mechanics: 3, Charisma: 4 },
      hp: 24, max_hp: 24, credits: 1200, tags: ["Ace"]
    },
    location: "Skyhaven.Docks",
    flags: { alert_level: 1 },
    inventory: [
      { id: "tool.nanospanner", qty: 1 },
      { id: "weapon.flak_pistol", qty: 1 }
    ],
    quests: {},
    world: { weather: "ion_storm", notoriety: 2 }
  },
  loading: false,
  error: undefined,

  async act(choiceId: string) {
    set({ loading: true, error: undefined });
    try {
      // Optional: mock mode for testing UI without API
      if (process.env.NEXT_PUBLIC_USE_MOCK === "1") {
        const mock: TurnState = {
          narration: `You chose: ${choiceId}. (MOCK RESPONSE)`,
          choices: [
            { id: "dock_control", label: "Report to Dock Control" },
            { id: "inspect_hull", label: "Inspect the hull damage" }
          ]
        };
        set({ lastTurn: mock, loading: false });
        return;
      }

      const res = await fetch("/api/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_state: get().state,
          player_action: { choice_id: choiceId },
          allowed_ids: {}
        })
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = text;
        try { msg = JSON.parse(text).error || text; } catch {}
        set({
          loading: false,
          error: typeof msg === "string" ? msg : JSON.stringify(msg),
          lastTurn: {
            narration: `⚠️ Turn failed: ${typeof msg === "string" ? msg : "See console"}`,
            choices: [{ id: "retry", label: "Try again" }]
          }
        });
        console.error("TURN ERROR", msg);
        return;
      }

      const out = JSON.parse(text);
      set(s => ({
        loading: false,
        lastTurn: { narration: out.narration, choices: out.choices },
        // If you later return a merged next-state from the API, set it here.
        state: { ...s.state }
      }));
    } catch (err: any) {
      const msg = err?.message || String(err);
      set({
        loading: false,
        error: msg,
        lastTurn: {
          narration: `⚠️ Network/JS error: ${msg}`,
          choices: [{ id: "retry", label: "Try again" }]
        }
      });
      console.error("TURN FATAL", err);
    }
  }
}));
