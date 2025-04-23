import { Context } from "../../deps.ts";
import { pool } from "../database/connection.ts";
import { compare } from "../../deps.ts";
import { createJWT } from "../utils/jwt.ts";

export const login = async (ctx: Context) => {
  try {
    const { email, password } = await ctx.request.body({ type: "json" }).value;

    const client = await pool.connect();
    const result = await client.queryObject<{ id: number; password: string }>(
      "SELECT id, password FROM usuarios WHERE email = $1",
      [email],
    );
    client.release();

    if (result.rows.length === 0) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Usuario no encontrado" };
      return;
    }

    const usuario = result.rows[0];
    const esValido = await compare(password, usuario.password);

    if (!esValido) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Contraseña incorrecta" };
      return;
    }

    const token = await createJWT({ userId: usuario.id, email });

    ctx.response.status = 200;
    ctx.response.body = {
      message: "Login exitoso",
      token: token,
    };
  } catch (error) {
    const err = error as Error;
    ctx.response.status = 500;
    ctx.response.body = { message: "Error en login", error: err.message };
  }
};
