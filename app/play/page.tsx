"use client";

import { useGame } from "../../store/game";

export default function Play() {
  const { state, lastTurn, act, loading } = useGame();
  const defaultChoices = [
    { id: "dock_control", label: "Report to Dock Control" },
    { id: "inspect_hull", label: "Inspect the hull damage" },
    { id: "hail_escort", label: "Hail the escort" },
  ];
  return (
    <main className="grid grid-cols-3 gap-4 p-6 text-slate-100 bg-slate-900 min-h-screen">
      <section className="col-span-2 rounded border border-slate-700 p-4">
        <div className="whitespace-pre-wrap text-lg leading-relaxed">
          {lastTurn?.narration ??
            "Skyhaven hums as stormlight flickers off the hull…"}
        </div>
        <div className="mt-6 grid gap-2">
          {(lastTurn?.choices ?? defaultChoices).map((c) => (
            <button
              key={c.id}
              onClick={() => act(c.id)}
              disabled={loading}
              className="text-left rounded border border-slate-600 px-3 py-2 hover:bg-slate-800"
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>
      <aside className="rounded border border-slate-700 p-4">
        <h2 className="font-semibold">
          Commander {state.player.name}
        </h2>
        <div className="text-sm mt-2">
          Hull {state.player.hp}/{state.player.max_hp}
        </div>
        <div className="text-sm">Credits {state.player.credits}</div>
        <div className="mt-4 text-xs uppercase tracking-wide text-slate-400">
          Stats
        </div>
        <ul className="text-sm">
          {Object.entries(state.player.stats).map(([k, v]) => (
            <li key={k}>
              {k} {v as number}
            </li>
          ))}
        </ul>
        <div className="mt-4 text-xs uppercase tracking-wide text-slate-400">
          Inventory
        </div>
        <ul className="text-sm">
          {state.inventory.map((i) => (
            <li key={i.id}>
              {i.id} ×{i.qty}
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}