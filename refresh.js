import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic();

const TODAY = new Date().toLocaleDateString("en-GB", {
  day: "2-digit", month: "short", year: "numeric"
});

const PROMPT = `Search the web for current data as of ${TODAY} for these FX pairs:
USD/EGP, USD/KZT, USD/UAH, USD/MAD, USD/EUR.

For each pair provide: spot rate, 7-day % change and trend direction, 30-day % change and trend,
6-month outlook, latest inflation rate with short note, central bank interest rate with short note,
real rate (interest minus inflation, show sign), 3 key macro drivers (max 12 words each), one-sentence outlook note.

trend / outlook values must be EXACTLY one of: "appreciation" | "depreciation" | "stable"
appreciation = USD getting stronger (more local currency per USD) = RED
depreciation = USD getting weaker = GREEN

Return ONLY a raw JSON object — no markdown, no backticks, no preamble:
{
  "lastUpdated": "${TODAY}",
  "pairs": [
    {
      "pair": "USD/EGP",
      "flag": "🇪🇬",
      "name": "Egyptian Pound",
      "spotRate": 49.08,
      "change7d": "-1.2%",
      "trend7d": "depreciation",
      "change30d": "-6.1%",
      "trend30d": "depreciation",
      "outlook6m": "stable",
      "inflationRate": "14.6%",
      "inflationNote": "May 2026 YoY — short context here",
      "interestRate": "19.0%",
      "interestNote": "CBE decision context here",
      "realRate": "+4.4%",
      "drivers": ["driver one max 12 words", "driver two", "driver three"],
      "outlookNote": "One sentence 6-month outlook."
    }
  ]
}`;

async function refresh() {
  console.log(`Fetching FX data for ${TODAY}...`);

  let response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{ role: "user", content: PROMPT }],
  });

  let messages = [
    { role: "user", content: PROMPT },
    { role: "assistant", content: response.content },
  ];

  // Agentic loop — keep going until valid JSON with 5 pairs is extracted
  for (let i = 0; i < 6; i++) {
    const text = response.content
      .filter(b => b.type === "text").map(b => b.text).join("");
    const match = text.match(/\{[\s\S]*\}/);

    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed.pairs?.length === 5) {
          // Inject the new data into index.html
          const html = fs.readFileSync("index.html", "utf8");
          const newData = `    const FX_DATA = ${JSON.stringify(parsed, null, 6).replace(/^/gm, "    ").trimStart()};`;
          const updated = html.replace(
            /\/\/ ── DATA[\s\S]*?\/\/ ── Components/,
            `// ── DATA (updated by refresh.js on every run) ──────────────────\n${newData}\n\n    // ── Components`
          );
          fs.writeFileSync("index.html", updated);
          console.log(`✅ index.html updated with data for ${TODAY}`);
          return;
        }
      } catch (e) {
        console.log("JSON parse failed, retrying...");
      }
    }

    if (response.stop_reason !== "tool_use") {
      // No tool use and no valid JSON — ask again explicitly
      messages.push({
        role: "user",
        content: "Please now return only the JSON object with no markdown or extra text.",
      });
    } else {
      // Feed tool results back
      const toolUses = response.content.filter(b => b.type === "tool_use");
      messages.push({
        role: "user",
        content: toolUses.map(tu => ({
          type: "tool_result",
          tool_use_id: tu.id,
          content: "Search complete. Now return the JSON as instructed.",
        })),
      });
    }

    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages,
    });

    messages.push({ role: "assistant", content: response.content });
  }

  throw new Error("Could not extract valid FX JSON after multiple attempts.");
}

refresh().catch(e => { console.error("❌ Refresh failed:", e.message); process.exit(1); });
