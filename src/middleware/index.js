// src/middleware/index.js
import pb from "../utils/pb.js";

export const onRequest = async (context, next) => {
  // 0) Routes API non-protégées
  const path = context.url.pathname;
  const isApi = path.startsWith("/api/");
  const isPublicApi = ["/api/login", "/api/signup", "/api/logout"].includes(
    path
  );

  // 1) Charger l'auth PB depuis le cookie s'il existe
  const cookie = context.cookies.get("pb_auth")?.value || "";
  if (cookie) {
    try {
      pb.authStore.loadFromCookie(cookie);
      if (pb.authStore.isValid) {
        // rafraîchit si possible (facultatif mais mieux)
        try {
          await pb.collection("users").authRefresh();
        } catch {}
        context.locals.user = pb.authStore.record;
      }
    } catch {
      pb.authStore.clear();
    }
  }

  // 2) i18n — gestion du POST du sélecteur
  if (!isApi && context.request.method === "POST") {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get("language");
    if (lang === "fr" || lang === "en") {
      context.cookies.set("locale", lang, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "Lax",
      });
      return Response.redirect(
        new URL(context.url.pathname + context.url.search, context.url),
        303
      );
    }
  }

  // 3) i18n — déterminer la langue pour cette requête
  const fromCookie = context.cookies.get("locale")?.value;
  const al = context.request.headers.get("accept-language") || "";
  const headerLang = /^fr\b/i.test(al) ? "fr" : /^en\b/i.test(al) ? "en" : null;
  context.locals.lang =
    fromCookie === "fr" || fromCookie === "en"
      ? fromCookie
      : headerLang ?? "en";

  // 4) Garde & protection
  const isPublicPage = ["/", "/login", "/signup"].includes(path);
  if (isApi) {
    if (!context.locals.user && !isPublicApi) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    return next();
  } else {
    if (!context.locals.user && !isPublicPage) {
      return Response.redirect(new URL("/login", context.url), 303);
    }
    return next();
  }
};
