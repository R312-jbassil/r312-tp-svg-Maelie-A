// src/pages/api/generateSVG.js
import { OpenAI } from "openai";

const HF_TOKEN = import.meta.env.HF_TOKEN;
const HF_URL = import.meta.env.HF_URL || "https://router.huggingface.co/v1";

// Modèles à tenter (dans l'ordre). Tu peux régler HF_MODEL dans .env pour forcer un modèle en priorité.
const CANDIDATE_MODELS = [
  import.meta.env.HF_MODEL,
  "Qwen/Qwen2.5-7B-Instruct",
  "meta-llama/Meta-Llama-3.1-8B-Instruct",
  "google/gemma-2-9b-it",
  "mistralai/Mistral-7B-Instruct-v0.2",
  "mistralai/Mixtral-8x7B-Instruct-v0.1", // celui-ci n'est PAS chat partout → on tombera sur /completions
].filter(Boolean);

const SYS = [
  "You are an SVG code generator.",
  "Return ONLY a valid <svg>...</svg> (no backticks, no explanations).",
  "Use inline attributes only. No external URLs.",
  "Keep width/height and viewBox consistent (e.g., 512x512).",
].join(" ");

function packPrompt(user) {
  return `${SYS}\n\nUSER PROMPT:\n${user}\n\nOUTPUT:\n(Only <svg>...</svg>)`;
}

export const POST = async ({ request }) => {
  try {
    if (!HF_TOKEN) throw new Error("HF_TOKEN manquant (.env)");
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = new OpenAI({ baseURL: HF_URL, apiKey: HF_TOKEN });

    let lastErr = null;

    for (const model of CANDIDATE_MODELS) {
      // 1) On tente d'abord en chat
      try {
        const chat = await client.chat.completions.create({
          model: "meta-llama/Llama-3.1-8B-Instruct:cerebras",
          messages: [
            { role: "system", content: SYS },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1200,
        });
        const message = chat?.choices?.[0]?.message?.content || "";
        const svgMatch = message.match(/<svg[\s\S]*?<\/svg>/i);
        return new Response(
          JSON.stringify({ svg: svgMatch ? svgMatch[0] : "" }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (e) {
        const msg = String(e?.message || e);
        // 2) Si le modèle n'est pas "chat", on tente /completions
        if (
          msg.includes("not a chat model") ||
          msg.includes("is not a chat model")
        ) {
          try {
            const comp = await client.completions.create({
              model,
              prompt: packPrompt(prompt),
              temperature: 0.2,
              max_tokens: 1200,
            });
            const text = comp?.choices?.[0]?.text || "";
            const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
            return new Response(
              JSON.stringify({ svg: svgMatch ? svgMatch[0] : "" }),
              { headers: { "Content-Type": "application/json" } }
            );
          } catch (e2) {
            lastErr = e2;
            continue;
          }
        } else {
          lastErr = e;
          continue;
        }
      }
    }

    throw lastErr || new Error("Aucun modèle/provider utilisable.");
  } catch (err) {
    console.error("[generateSVG] error:", err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
