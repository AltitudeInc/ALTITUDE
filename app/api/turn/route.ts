import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GameState } from "../../../lib/schema";
import { DIRECTOR_SYSTEM } from "../../../prompts/director";

export const runtime = "edge";

// Strict JSON Schema for the model's output
const TurnOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["narration", "choices", "state_patch", "log"], // log added to required
  properties: {
    narration: { type: "string" },
    choices: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "label"],
        properties: {
          id: { type: "string" },
          label: { type: "string" }
        }
      }
    },
    state_patch: {
      type: "object",
      additionalProperties: false,
      required: ["meta", "player", "location", "flags", "inventory", "quests", "world"],
      properties: {
        meta:      { type: "object", additionalProperties: false, properties: {} },
        player:    { type: "object", additionalProperties: false, properties: {} },
        location:  { type: "string" },
        flags:     { type: "object", additionalProperties: false, properties: {} },
        inventory: { type: "array", items: { type: "object", additionalProperties: false, properties: {} } },
        quests:    { type: "object", additionalProperties: false, properties: {} },
        world:     { type: "object", additionalProperties: false, properties: {} }
      }
    },
    log: { type: "object", additionalProperties: false, properties: {} } // ensure {} is valid
  }
} as const;

export async function POST(req: NextRequest) {
  const { game_state, player_action, allowed_ids } = await req.json();

  // Validate incoming game_state with Zod
  const parsed = GameState.safeParse(game_state);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad state" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "medium" },

    // Use input_text blocks
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: DIRECTOR_SYSTEM }]
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: "GAME_STATE:" },
          { type: "input_text", text: JSON.stringify(game_state) },
          { type: "input_text", text: "PLAYER_ACTION:" },
          { type: "input_text", text: JSON.stringify(player_action) },
          { type: "input_text", text: "ALLOWED_CONTENT_IDS:" },
          { type: "input_text", text: JSON.stringify(allowed_ids ?? {}) }
        ]
      }
    ],

    // Structured outputs live under text.format now
    text: {
      format: {
        type: "json_schema",
        name: "TurnOutput",
        schema: TurnOutputSchema,
        strict: true
      }
    },

    stream: false
  });

  // Prefer convenience field, fall back to raw
  const raw =
    (response as any).output_text ??
    response.output?.[0]?.content?.[0]?.text ??
    "";

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON", raw },
      { status: 500 }
    );
  }

  // Ensure all required keys exist
  const sp = parsedJson.state_patch ?? {};
  parsedJson.state_patch = {
    meta:      typeof sp.meta === "object" && sp.meta ? sp.meta : {},
    player:    typeof sp.player === "object" && sp.player ? sp.player : {},
    location:  typeof sp.location === "string" ? sp.location : "",
    flags:     typeof sp.flags === "object" && sp.flags ? sp.flags : {},
    inventory: Array.isArray(sp.inventory) ? sp.inventory : [],
    quests:    typeof sp.quests === "object" && sp.quests ? sp.quests : {},
    world:     typeof sp.world === "object" && sp.world ? sp.world : {}
  };

  // Ensure log exists
  if (typeof parsedJson.log !== "object" || parsedJson.log === null) {
    parsedJson.log = {};
  }

  return NextResponse.json(parsedJson);
}
