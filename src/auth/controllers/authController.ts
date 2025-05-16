// authController.ts
import { RouterContext } from "./../../../deps.ts"; 
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
      ctx.response.status = 409; 
      ctx.response.body = { error: "El correo electrónico ya está registrado" };
      return;
    }

    const hashedPassword = await bcrypt.hash(password);
    const newUser = {
      email: username,
      password_hash: hashedPassword,
      role: 'residente' // Ya implementado
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

    const token = await generateJwt(user.id!.toString(), user.email, user.role);

    ctx.response.status = 200;
    ctx.response.body = { 
      message: "Login exitoso", 
      token, 
      userId: user.id,
      role: user.role 
    };
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

export async function getResidentProfile(ctx: RouterContext) {
  try {
    // Obtener el token del header de autorización
    const token = ctx.request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = { error: "No autorizado" };
      return;
    }

    // Verificar y decodificar el token
    const isValid = await verifyJwt(token);
    if (!isValid) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Token inválido" };
      return;
    }

    // Obtener el usuario del token
    const payload = await decodeJwt(token);
    const user = await getUserByUsername(payload.username);

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }

    // Devolver el perfil del usuario
    ctx.response.status = 200;
    ctx.response.body = {
      email: user.email,
      role: user.role,
      apartment_number: user.apartment_number
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener el perfil" };
  }
}

export async function updateResidentProfile(ctx: RouterContext) {
  try {
    // Obtener el token del header de autorización
    const token = ctx.request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = { error: "No autorizado" };
      return;
    }

    // Verificar y decodificar el token
    const isValid = await verifyJwt(token);
    if (!isValid) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Token inválido" };
      return;
    }

    // Obtener los datos actualizados del cuerpo de la petición
    const body = await ctx.request.body().value;
    const { apartment_number } = body;

    // Obtener el usuario del token
    const payload = await decodeJwt(token);
    const user = await getUserByUsername(payload.username);

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }

    // Actualizar el número de apartamento
    const client = await pool.connect();
    try {
      await client.queryObject(
        "UPDATE users SET apartment_number = $1 WHERE email = $2",
        [apartment_number, user.email]
      );

      ctx.response.status = 200;
      ctx.response.body = { message: "Perfil actualizado con éxito" };
    } finally {
      client.release();
    }
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al actualizar el perfil" };
  }
}

