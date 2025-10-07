// src/pages/api/saveSVG.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export async function POST({ request, locals }) {
  try {
    // 1) Sécurité : il faut être connecté
    const userId = locals?.user?.id;
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2) Lecture + normalisation des données
    const data = await request.json().catch(() => ({}));

    const payload = {
      // accepte encore "nom" par rétro-compatibilité
      title: (data.title ?? data.nom ?? "N/A").toString(),
      code_svg: (data.code_svg ?? "<svg></svg>").toString(),
      chat_history: Array.isArray(data.chat_history)
        ? data.chat_history
        : typeof data.chat_history === "string"
        ? JSON.parse(data.chat_history || "[]")
        : [],
      // on force le lien côté serveur (ne JAMAIS faire confiance au client)
      user: userId,
    };

    // 3) Création en base
    const record = await pb.collection(Collections.Svg).create(payload);

    return new Response(
      JSON.stringify({ success: true, id: record.id, record }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error saving SVG:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
