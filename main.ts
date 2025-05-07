import { Application, Router, send } from "./deps.ts";
import { createPackagesTable } from "./src/database/models/package.ts";
import { createUsersTable } from "./src/auth/models/user.ts";
import { router as packageRouter } from "./src/routes/packages.ts";
import { router as authRouter } from "./src/routes/routes.ts";  
import { oakCors } from "./deps.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import "https://deno.land/std@0.204.0/dotenv/load.ts";

// Verificación de variables de entorno
console.log("Variables de entorno:", {
  user: Deno.env.get("DB_USER"),
  database: Deno.env.get("DB_NAME"),
  host: Deno.env.get("DB_HOST"),
  port: Deno.env.get("DB_PORT")
});

const app = new Application();
const port = 8003;

// Configuración de CORS
app.use(oakCors({
  origin: /http:\/\/localhost(:\d+)?/,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Middleware para manejo de errores
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error no capturado:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor" };
  }
});

// Middleware para archivos estáticos (corregido)
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  const staticDir = join(Deno.cwd(), "src", "views");
  
  try {
    if (path.startsWith("/images/")) {
      await send(ctx, path, {
        root: staticDir,  // Busca en src/views/images/
        index: "ENCOMIENDA.png"
      });
    } else if (path.startsWith("/styles/")) {
      await send(ctx, path, {
        root: staticDir   // Busca en src/views/styles/
      });
    } else if (path.endsWith(".html")) {
      await send(ctx, path, {
        root: staticDir
      });
    } else {
      await next();
    }
  } catch (err) {
    if (err.status === 404) {
      console.warn(`Archivo no encontrado: ${path}`);
      await next();
    } else {
      throw err;
    }
  }
});

// Router principal
const mainRouter = new Router();
mainRouter.get("/", (ctx) => {
  ctx.response.redirect("/login.html");
});

// Uso de routers
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(packageRouter.routes());
app.use(packageRouter.allowedMethods());
app.use(mainRouter.routes());
app.use(mainRouter.allowedMethods());

// Inicialización de la base de datos
async function initializeDatabase() {
  try {
    await createUsersTable();
    await createPackagesTable();
    console.log("Tablas creadas exitosamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}

await initializeDatabase();

console.log(`Servidor web corriendo en http://localhost:${port}`);
await app.listen({ port });