import { Application, Router } from "./deps.ts";
import { createPackagesTable } from "./src/database/models/package.ts";
import packageRouter from "./src/routes/packages.ts";
import { oakCors } from "./deps.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import "https://deno.land/std@0.204.0/dotenv/load.ts";
import { createUsersTable } from "./src/auth/models/user.ts";
import authRouter from "./src/routes/routes.ts"; // Importación del router de autenticación

const app = new Application();
const port = 8000;

// Configuración CORS más completa
app.use(oakCors({
  origin: /http:\/\/localhost(:\d+)?/, // Acepta cualquier puerto local
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Middleware para parsear JSON
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error no capturado:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor" };
  }
});

// Servir HTML y archivos estáticos
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

// API REST para autenticación
app.use(authRouter.routes()); // Usa las rutas de autenticación
app.use(authRouter.allowedMethods());

// API REST para paquetes
app.use(packageRouter.routes());
app.use(packageRouter.allowedMethods());

// Ruta raíz (opcional)
const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "API de Gestión de Paquetes P5 - Deno";
});
app.use(router.routes());
app.use(router.allowedMethods());

// Crear tablas si no existen
await createUsersTable();   // Crea la tabla de usuarios
await createPackagesTable(); // Crea la tabla de paquetes

console.log(`Servidor web corriendo en http://localhost:${port}`);
await app.listen({ port });
