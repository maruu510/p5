import { Context } from "../../deps.ts";
import { jwtVerify } from "npm:jose@5.9.6";

const secret = new TextEncoder().encode("clave_secreta_isi");

export const authMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    const authHeader = ctx.request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Token no proporcionado" };
      return;
    }

    const token = authHeader.split(" ")[1];

    await jwtVerify(token, secret);

    await next();
  } catch (_err) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Token inválido o expirado" };
  }
};
