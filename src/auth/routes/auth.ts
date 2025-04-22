import { Router } from "../../utils/deps.ts";
import { validateUser, generateToken } from "../services/authService.ts";

const router = new Router();

router.post("/api/auth/login", async (ctx) => {
  try {
    // 1. Obtener y validar datos básicos
    const { email, password } = await ctx.request.body().value;
    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Email y contraseña son requeridos" };
      return;
    }

    // 2. Autenticar usuario
    const user = await validateUser(email, password);
    
    // 3. Generar token
    const token = generateToken(user);
    
    // 4. Responder
    ctx.response.body = { 
      token,
      user: {
        id: user.id,
        email: user.email
      }
    };

  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { 
      error: "Error de autenticación",
      details: error.message
    };
  }
});

export default router;