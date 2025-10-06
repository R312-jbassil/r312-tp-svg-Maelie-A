// src/pages/api/updateSVG.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export async function POST({ request }) {
  try {
    const updated = await request.json(); // {id, code_svg, chat_history}
    const { id, ...rest } = updated;
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "id manquant" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const payload = {
      ...rest,
      chat_history:
        typeof rest.chat_history === "string"
          ? JSON.parse(rest.chat_history || "[]")
          : rest.chat_history ?? [],
    };

    await pb.collection(Collections.Svg).update(id, payload);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("updateSVG error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "PB error" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}
