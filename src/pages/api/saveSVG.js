// src/pages/api/saveSVG.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

/**
 * Enregistre un SVG dans la collection Svg.
 * Body JSON attendu: { title?: string, code_svg?: string, chat_history?: [] | string }
 * - Ne bloque PAS si l'utilisateur n'est pas connecté
 * - Ajoute le champ "user" SEULEMENT si locals.user existe ET que le champ existe dans la collection
 */
export async function POST({ request, locals }) {
  try {
    // 1) Lecture + normalisation des données
    const data = await request.json().catch(() => ({}));

    const title = (data.title ?? data.nom ?? "N/A").toString();
    const code_svg = (data.code_svg ?? "<svg></svg>").toString();

    let chat_history = [];
    if (Array.isArray(data.chat_history)) chat_history = data.chat_history;
    else if (typeof data.chat_history === "string") {
      try {
        chat_history = JSON.parse(data.chat_history || "[]");
      } catch {
        chat_history = [];
      }
    }

    // 2) Prépare le payload
    const payload = { title, code_svg, chat_history };

    // Si ton schéma possède un champ relation "user", on le remplit uniquement si on est connecté
    const userId = locals?.user?.id || null;
    if (userId) {
      // Ajoute le champ uniquement si ta collection a bien "user"
      // (si tu n'as pas ce champ, garde juste le payload sans user)
      payload.user = userId;
    }

    // 3) Création en base
    const record = await pb.collection(Collections.Svg).create(payload);

    return new Response(
      JSON.stringify({ success: true, id: record.id, record }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error saving SVG:", err?.response || err);
    const message = err?.response?.message || err?.message || "Server error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
