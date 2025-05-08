// emailjsConfig.ts
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

// Cargar variables de entorno
await load({ export: true });

const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");
const EMAILJS_USER_ID = Deno.env.get("EMAILJS_USER_ID");

if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
  throw new Error("Faltan variables de entorno de EmailJS");
}

export {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_USER_ID,
};
