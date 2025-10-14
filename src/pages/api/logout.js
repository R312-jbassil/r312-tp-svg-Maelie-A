// src/pages/api/logout.js
import pb from "../../utils/pb";

export const POST = async () => {
  try {
    pb.authStore.clear();
    const cookie = pb.authStore.exportToCookie({
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      expires: new Date(0),
    });
    return new Response(null, {
      status: 303,
      headers: { "Set-Cookie": cookie, Location: "/" },
    });
  } catch {
    return new Response(null, { status: 303, headers: { Location: "/" } });
  }
};
