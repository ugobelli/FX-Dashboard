import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic();

const TODAY = new Date().toLocaleDateString("en-GB", {
  day: "2-digit", month: "short", year: "numeric"
});

const PROMPT = `Search the web for current data as of ${TODAY} for these FX pairs:
USD/EGP, USD/KZT, USD/UAH, USD/MAD, USD/EUR.

For each pair return: spot rate, 7-day % change and trend, 30-day % change and trend,
6-month outlook, latest inflation rate with note, central bank interest rate with note,
real rate (interest minus inflation), 3 key macro drivers (max 12 words each), outlook note.

trend values must be exactly: "appreciation" | "depreciation" | "stable"
appreciation = USD getting stronger vs local currency
depreciation = USD getting weaker vs local currency

Return ONLY a raw JSON object — no markdown, no backticks, no explanation:
{
  "lastUpdated": "${TODAY}",
  "pairs": [
    {
      "pair": "USD/EGP", "flag": "🇪🇬", "name": "Egyptian Pound",
      "spotRate": 49.08,
      "change7d": "-1.2%", "trend7d": "depreciation",
      "change30d": "-6.1%", "trend30d": "depreciation",
      "outlook6m": "stable",
      "inflationRate": "14.6%", "inflationNote": "May 2026 YoY ...",
      "interestRate": "19.0%", "interestNote": "CBE on hold ...",
      "realRate": "+4.4%",
      "drivers": ["driver 1", "driver 2", "driver 3"],
      "outlookNote": "One sentence outlook."
    }
  ]
}`;

async function refresh() {
  console.log(`Fetching FX data for ${TODAY}...`);

  // First call — may trigger web search
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

  // Agentic loop — keep going until we get the JSON
  for (let i = 0; i < 5; i++) {
    const text = response.content
      .filter(b => b.type === "text").map(b => b.text).join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.pairs?.length === 5) {
        fs.writeFileSync("data.json", JSON.stringify(parsed, null, 2));
        console.log("data.json updated successfully.");
        return;
      }
    }

    if (response.stop_reason !== "tool_use") break;

    const toolUses = response.content.filter(b => b.type === "tool_use");
    messages.push({
      role: "user",
      content: toolUses.map(tu => ({
        type: "tool_result",
        tool_use_id: tu.id,
        content: "Search complete. Now return the JSON as instructed.",
      })),
    });

    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages,
    });

    messages.push({ role: "assistant", content: response.content });
  }

  throw new Error("Could not extract valid JSON after multiple attempts.");
}

refresh().catch(e => { console.error(e); process.exit(1); });
