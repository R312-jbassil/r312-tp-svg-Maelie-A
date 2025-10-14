// src/pages/api/login.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    // Nettoie tout état précédent (évite les surprises si le serveur gardait un token)
    pb.authStore.clear();

    // Auth PocketBase (identifier = email ou username)
    const auth = await pb
      .collection(Collections.Users)
      .authWithPassword(email, password);

    // Cookie httpOnly avec le token PB
    cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      // en dev (http://localhost) ne pas forcer secure
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    return new Response(JSON.stringify({ user: auth.record }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // message plus verbeux si PocketBase en renvoie un
    const msg = err?.response?.message || "Identifiants invalides";
    console.error("login error:", err?.response || err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
};
