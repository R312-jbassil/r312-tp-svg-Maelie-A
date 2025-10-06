// src/pages/api/saveSVG.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Normalisation des champs (adapte "title" si ton champ s'appelle autrement)
    const payload = {
      title: data.title ?? data.nom ?? "Sans titre",
      code_svg: data.code_svg ?? "",
      // chat_history peut arriver en string => on parse
      chat_history:
        typeof data.chat_history === "string"
          ? JSON.parse(data.chat_history || "[]")
          : data.chat_history ?? [],
    };

    const rec = await pb.collection(Collections.Svg).create(payload);

    return new Response(JSON.stringify({ success: true, id: rec.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving SVG:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "save error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
