// authController.ts
import { RouterContext } from "./../../../deps.ts";  // Importa el RouterContext
import { insertUser, getUserByUsername } from "../models/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { generateJwt } from "../controllers/authService.ts";

// Definir los tipos de RouterContext
export async function signup(ctx: RouterContext<"/signup", Record<string, string>, Record<string, any>>) {
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

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      ctx.response.status = 409; // 409 Conflict
      ctx.response.body = { error: "El correo electrónico ya está registrado" };
      return;
    }

    const hashedPassword = await bcrypt.hash(password);
    const newUser = {
      email: username,
      password_hash: hashedPassword
    };

    const userId = await insertUser(newUser);

    ctx.response.status = 201;
    ctx.response.body = {
      message: "Usuario creado con éxito",
      userId
    };

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en registro:", error.message);
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Error al crear el usuario",
        details: error.message
      };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error desconocido" };
    }
  }
}

export async function login(ctx: RouterContext<"/login", Record<string, string>, Record<string, any>>) {
  try {
    const body = await ctx.request.body({ type: 'json' }).value;
    const { username, password } = body;

    if (!username || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Username y password son obligatorios" };
      return;
    }

    const user = await getUserByUsername(username);
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

    const token = await generateJwt(user.id!.toString(), user.email);

    ctx.response.status = 200;
    ctx.response.body = { message: "Login exitoso", token, userId: user.id };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en login:", error.message);
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al iniciar sesión", details: error.message };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error desconocido" };
    }
  }
}

