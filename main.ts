import { Application, Router, send } from "./deps.ts";
import { createPackagesTable } from "./src/database/models/package.ts";
import { createUsersCollection } from "./src/auth/models/user.ts";
import { connectDB } from "./src/database/connection.ts";
import packageRouter from "./src/routes/packages.ts";
import authRouter from "./src/routes/routes.ts";
import { oakCors } from "./deps.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import "https://deno.land/std@0.204.0/dotenv/load.ts";

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
app.use(
  oakCors({
    origin: /http:\/\/localhost(:\d+)?/,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// Manejo global de errores
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error no capturado:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor" };
  }
});

// Middleware para autenticación JWT
app.use(async (ctx, next) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const { verifyJwt } = await import("./src/auth/controllers/authService.ts");
      const { getUserByUsername } = await import("./src/auth/models/user.ts");
      const payload = await verifyJwt(token);
      if (payload && payload.username) {
        const user = await getUserByUsername(payload.username.toLowerCase());
        if (user) ctx.state.user = user;
      }
    } catch (error) {
      console.error("Error al verificar token:", error);
      // continuar sin bloquear
    }
  }
  await next();
});

// Servir archivos estáticos (estilos, imágenes, vistas)
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  if (
    path.startsWith("/styles") ||
    path.startsWith("/images") ||
    path.endsWith(".html") ||
    path.startsWith("/resident/") ||
    path.startsWith("/admin/")
  ) {
    await send(ctx, path, {
      root: join(Deno.cwd(), "src", "views"),
    });
  } else {
    await next();
  }
});

// Router para raíz que redirige a login
const router = new Router();
router.get("/", (ctx) => {
  ctx.response.redirect("/login.html");
});
app.use(router.routes());
app.use(router.allowedMethods());

// Rutas del proyecto
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(packageRouter.routes());
app.use(packageRouter.allowedMethods());

// Conexión a BD y creación de tablas
console.log("\n=== PRUEBA DE CONEXIÓN A BASE DE DATOS ===");
try {
  const _db = await connectDB(); // '_' para no avisar variable sin usar
  console.log("✅ Conexión establecida, creando tablas...");
  await createUsersCollection();
  await createPackagesTable();
  console.log("✅ Tablas creadas correctamente");
  console.log(`🚀 Servidor web corriendo en http://localhost:${port}`);
  await app.listen({ port });
} catch (error) {
  console.error("❌ Error al inicializar la aplicación:", error);
  Deno.exit(1);
}
