import type { RouterContext } from "../../../deps.ts";
import { insertUser, getUserByUsername } from "../models/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { generateJwt } from "./authService.ts";
import { setCookie } from "../../../deps.ts";

export async function signup(ctx: RouterContext<string>) {
  try {
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No se recibieron datos" };
      return;
    }

    const { username, password } = await ctx.request.body().value;

    if (!username?.trim() || !password?.trim()) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Username y password son obligatorios" };
      return;
    }

    const normalizedUsername = username.toLowerCase();
    const existingUser = await getUserByUsername(normalizedUsername);
    if (existingUser) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El correo electrónico ya está registrado" };
      return;
    }

    const hashedPassword = await bcrypt.hash(password);
    const newUser = {
      email: normalizedUsername,
      password_hash: hashedPassword,
      role: "admin",
    };

    const userId = await insertUser(newUser);

    ctx.response.status = 201;
    ctx.response.body = {
      message: "Usuario creado con éxito",
      userId,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en registro:", error.message);
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Error al crear el usuario",
        details: error.message,
      };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error desconocido" };
    }
  }
}

export async function login(ctx: RouterContext<string>) {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { username, password } = body;

    if (!username || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Username y password son obligatorios" };
      return;
    }

    const normalizedUsername = username.toLowerCase();
    const user = await getUserByUsername(normalizedUsername);
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Contraseña incorrecta" };
      return;
    }

    const token = await generateJwt(user._id!.toString(), normalizedUsername);

    setCookie(ctx.response.headers, {
      name: "jwt",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    ctx.response.status = 200;
    ctx.response.body = {
      message: "Login exitoso",
      userId: user._id,
      user,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en login:", error.message);
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Error al iniciar sesión",
        details: error.message,
      };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error desconocido" };
    }
  }
}
