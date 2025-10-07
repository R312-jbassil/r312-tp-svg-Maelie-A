import PocketBase from "pocketbase";

const PB_URL = import.meta.env.PB_URL || "http://127.0.0.1:8090/";

export async function onRequest(
  { request, locals },
  next
) {
  const pb = new PocketBase(PB_URL);
  pb.authStore.loadFromCookie(request.headers.get("cookie") || "");

  try {
    // rafraîchit le token si possible
    if (pb.authStore.isValid) await pb.collection("users").authRefresh();
  } catch {
    pb.authStore.clear();
  }

  // expose l’utilisateur à tes routes/pages
  locals.user = pb.authStore.model || null;

  return next();
}
