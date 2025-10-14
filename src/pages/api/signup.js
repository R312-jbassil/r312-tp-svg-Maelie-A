import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name ?? "");
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email et mot de passe requis." }),
        { status: 400 }
      );
    }

    pb.authStore.clear();

    // 1) créer l’utilisateur (users = collection auth)
    await pb.collection(Collections.Users).create({
      email,
      password,
      passwordConfirm: password,
      name,
    });

    // 2) connecter de suite
    const auth = await pb
      .collection(Collections.Users)
      .authWithPassword(email, password);

    // 3) cookie d’auth
    cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    return new Response(JSON.stringify({ user: auth.record }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // PocketBase renvoie souvent: err.response.message et err.response.data.{field}.message
    const pbMsg = err?.response?.message;
    const fieldErrors = err?.response?.data || {};
    const firstFieldMsg =
      fieldErrors?.email?.message ||
      fieldErrors?.password?.message ||
      fieldErrors?.passwordConfirm?.message ||
      fieldErrors?.username?.message ||
      null;

    const msg = firstFieldMsg || pbMsg || "Failed to create record.";
    console.error("Signup error:", err?.response || err);

    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
