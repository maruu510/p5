import { Router } from "../../deps.ts";
import { signup, login } from "../auth/controllers/authController.ts";
import { generateQRCode } from "../services/packageService.ts";
import { verifyJwt } from "../auth/controllers/authService.ts";

const router = new Router();

// Rutas públicas
router
  .post("/api/signup", signup)
  .post("/api/login", login);

// Middleware de autenticación para rutas protegidas
router.use(async (ctx, next) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token no proporcionado" };
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token || !(await verifyJwt(token))) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token inválido o expirado" };
    return;
  }

  await next();
});

// Ruta protegida para generación de QR
router.post("/api/generate-qr", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    if (!body.apartment_number || !body.sender) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Faltan campos requeridos" };
      return;
    }

    const qrContent = JSON.stringify({
      apartment: body.apartment_number,
      sender: body.sender,
      timestamp: new Date().toISOString()
    });

    const qrCode = await generateQRCode(qrContent);
    ctx.response.body = { qr_code: qrCode };
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al generar QR",
      details: error.message 
    };
  }
});

export { router };