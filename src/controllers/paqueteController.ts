import { RouterContext } from "../../deps.ts";

import { insertarPaquete, obtenerTodosPaquetes, obtenerPaquetePorId } from "../database/models/paquete.ts";

// Registrar nuevo paquete
export async function registrarPaquete(ctx: RouterContext) {
  try {
    const body = await ctx.request.body().value;
    const id = await insertarPaquete(body);
    ctx.response.body = { id, ...body };
    ctx.response.status = 201;
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
}

// Obtener todos los paquetes
export async function obtenerPaquetes(ctx: RouterContext) {
  try {
    const paquetes = await obtenerTodosPaquetes();
    ctx.response.body = paquetes;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener paquetes" };
  }
}

// Obtener paquete por ID
export async function obtenerPaquete(ctx: RouterContext) {
  try {
    const id = ctx.params.id;
    const paquete = await obtenerPaquetePorId(Number(id));
    if (!paquete) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Paquete no encontrado" };
      return;
    }
    ctx.response.body = paquete;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener el paquete" };
  }
}