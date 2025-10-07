// src/pages/api/generateSVG.js
import { OpenAI } from "openai";

const OR_TOKEN = import.meta.env.OR_TOKEN; // ex: "sk-or-..."
const OR_URL = import.meta.env.OR_URL || "https://openrouter.ai/api/v1";
const OR_MODEL = import.meta.env.OR_MODEL || "openai/gpt-oss-20b:free";

// Petite aide pour renvoyer du JSON proprement
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

// GET -> simple hint
export const GET = () => json({ ok: true, hint: "Use POST {prompt:'...'}" });

// POST -> génère un SVG à partir du prompt
export const POST = async ({ request }) => {
  try {
    if (!OR_TOKEN) return json({ error: "OR_TOKEN manquant" }, 500);

    const body = await request.json().catch(() => ({}));

    // Compat : [{role,content}] | {messages:[...]} | {prompt:"..."}
    const messages = Array.isArray(body)
      ? body
      : Array.isArray(body?.messages)
      ? body.messages
      : body?.prompt
      ? [{ role: "user", content: body.prompt }]
      : [];

    const systemMessage = {
      role: "system",
      content:
        "You are an SVG code generator. Respond with ONLY raw, valid SVG markup for the user's request. " +
        "Do not include backticks or explanations. Include ids for key elements.",
    };

    const client = new OpenAI({
      baseURL: OR_URL,
      apiKey: OR_TOKEN,
    });

    const resp = await client.chat.completions.create({
      model: OR_MODEL,
      messages: [systemMessage, ...messages],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = resp?.choices?.[0]?.message?.content ?? "";

    // On tente d’extraire le bloc <svg>…</svg>
    const match = content.match(/<svg[\s\S]*?<\/svg>/i);
    const svg = (match ? match[0] : content).trim();

    if (!svg || !svg.includes("<svg")) {
      return json(
        { error: "Aucun SVG détecté dans la réponse du modèle." },
        502
      );
    }

    // ✅ Important : on renvoie une STRING et pas un objet
    return json({ svg });
  } catch (e) {
    console.error("generateSVG error:", e);
    return json({ error: "Erreur serveur generateSVG" }, 500);
  }
};
