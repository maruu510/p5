import { Application, Router } from "./deps.ts";
import { createPackagesTable } from "./src/database/models/package.ts";  // Cambiado
import packageRouter from "./src/routes/packages.ts";  // Cambiado
import { oakCors } from "./deps.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const app = new Application();
const port = 8000;

// Configura CORS
app.use(oakCors());

// Middleware para parsear JSON
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { error: err.message };
  }
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: join(Deno.cwd(), "src", "views"),
      index: "index.html",
    });
  } catch {
    await next();
  }
});

// Rutas API
app.use(packageRouter.routes());  // Cambiado
app.use(packageRouter.allowedMethods());  // Cambiado

// Ruta básica para prueba
const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "API de Gestión de Paquetes P5 - Deno";
});

app.use(router.routes());

// Inicializar base de datos
await createPackagesTable();  // Cambiado

console.log(`Servidor web corriendo en http://localhost:${port}`);
await app.listen({ port });