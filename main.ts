import { Application, Router, oakCors } from "./src/utils/deps.ts";
import { createPackagesTable } from "./src/packages/models/package.ts";
import packageRouter from "./src/packages/routes/packages.ts";
import authRouter from "./src/auth/routes/auth.ts";
import { join } from "./src/utils/deps.ts";
import "https://deno.land/std@0.204.0/dotenv/load.ts";

const app = new Application();
const port = 8000;

// Configuración inicial
app.use(oakCors());  // Habilita CORS para todas las rutas

// Middleware global de errores
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    ctx.response.status = 500;
    ctx.response.body = { 
      error: error.message,
      stack: Deno.env.get("DENO_ENV") === "development" ? error.stack : undefined
    };
  }
});

// Middleware para archivos estáticos
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;

  // Verifica si la ruta es /login o cualquier otra página estática
  if (path === "/login" || path === "/" || path.startsWith("/auth/") || path.startsWith("/js/")) {
    // Sirve los archivos estáticos
    await ctx.send({
      root: join(Deno.cwd(), "src", "views"),
      index: "auth/login.html", // Servir el archivo login.html por defecto en /login
    });
  } else {
    await next();  // Si no es una ruta válida, pasa al siguiente middleware
  }
});

// Registro de rutas
app.use(authRouter.routes());          // Rutas de autenticación (/api/auth)
app.use(authRouter.allowedMethods());

app.use(packageRouter.routes());       // Rutas de paquetes (/api/packages)
app.use(packageRouter.allowedMethods());

// Ruta de prueba
const defaultRouter = new Router();
defaultRouter.get("/", (ctx) => {
  ctx.response.body = "API de Gestión de Paquetes P5 - Deno";
  ctx.response.type = "text/plain";
});
app.use(defaultRouter.routes());

// Inicialización
await createPackagesTable();  // Crea tablas si no existen

console.log(`Servidor web corriendo en http://localhost:${port}`);
await app.listen({ port });
