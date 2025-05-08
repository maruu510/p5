import { Application, Router, send } from "./deps.ts";
import { createPackagesTable } from "./src/database/models/package.ts";
import { createUsersTable } from "./src/auth/models/user.ts";
import packageRouter from "./src/routes/packages.ts";
import authRouter from "./src/routes/routes.ts";
import { oakCors } from "./deps.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import "https://deno.land/std@0.204.0/dotenv/load.ts";
import departmentRoutes from "./src/routes/departmentRoutes.ts";
// ...otros imports y setup...






// Verificar variables de entorno
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

// Middleware para servir archivos estáticos
app.use(async (ctx, next) => {  // This is the async function causing the warning
  const path = ctx.request.url.pathname;
  if (path.startsWith("/styles") || path.startsWith("/images") || path.endsWith(".html")) {
    await send(ctx, path, {      // This function uses await
      root: join(Deno.cwd(), "src", "views"),
    });
  } else {
    await next();               // This function uses await
  }
});

// Router para redirigir la raíz "/" hacia "login.html"
const router = new Router();
// ... existing code ...

router.get("/", (ctx) => {  // Removed async keyword
  ctx.response.redirect("/login.html");
});



app.use(router.routes());
app.use(router.allowedMethods());

// API REST para autenticación
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

// API REST para paquetes
app.use(packageRouter.routes());
app.use(packageRouter.allowedMethods());

// Crear tablas si no existen
await createUsersTable();
await createPackagesTable();

app.use(departmentRoutes.routes());
app.use(departmentRoutes.allowedMethods());

console.log(`Servidor web corriendo en http://localhost:${port}`);
await app.listen({ port });