import "https://deno.land/std@0.204.0/dotenv/load.ts";
import { Application, Router, send } from "./deps.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { oakCors } from "./deps.ts";


import { createPackagesTable } from "./src/database/models/package.ts";
import { createUsersTable } from "./src/auth/models/user.ts";
import { testConnection } from "./src/database/connection.ts";

import packageRouter from "./src/routes/packages.ts";
import authRouter from "./src/routes/routes.ts";
import notificationRouter from "./src/services/notifications/notifications.routes.ts";

// Verificar variables de entorno
console.log("=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===");
console.log("DB_USER:", Deno.env.get("DB_USER"));
console.log("DB_DATABASE:", Deno.env.get("DB_NAME"));
console.log("DB_HOST:", Deno.env.get("DB_HOST"));
console.log("DB_PORT:", Deno.env.get("DB_PORT"));
console.log("PASSWORD definida:", !!Deno.env.get("DB_PASSWORD"));
console.log("===========================================");

const app = new Application();
const port = 8003;

// CORS
app.use(oakCors({
  origin: /http:\/\/localhost(:\d+)?/,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Middleware de errores
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error no capturado:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor" };
  }
});

// Middleware para servir archivos estáticos
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  if (
    path.startsWith("/styles") ||
    path.startsWith("/images") ||
    path.endsWith(".html") ||
    path.startsWith("/resident/")
  ) {
    await send(ctx, path, {
      root: join(Deno.cwd(), "src", "views"),
    });
  } else {
    await next();
  }
});

// Ruta base redirige a login
const router = new Router();
router.get("/", (ctx) => {
  ctx.response.redirect("/login.html");
});
app.use(router.routes());
app.use(router.allowedMethods());

// Rutas de APIs
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(packageRouter.routes());
app.use(packageRouter.allowedMethods());

app.use(notificationRouter.routes()); 
app.use(notificationRouter.allowedMethods());

// Conexión a DB
console.log("\n=== PRUEBA DE CONEXIÓN A BASE DE DATOS ===");
const connectionSuccess = await testConnection();
if (!connectionSuccess) {
  console.error("❌ No se pudo establecer conexión con la base de datos");
  Deno.exit(1);
}

console.log("✅ Conexión establecida, creando tablas...");
try {
  await createUsersTable();
  await createPackagesTable();
  console.log("✅ Tablas creadas correctamente");
} catch (error) {
  console.error("❌ Error al crear tablas:", error);
  Deno.exit(1);
}

console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
await app.listen({ port });
