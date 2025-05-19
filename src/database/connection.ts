import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Cargar variables de entorno
await load({ export: true });

const pool = new Pool({
  user: Deno.env.get("DB_USER"),
  password: Deno.env.get("DB_PASSWORD"),
  database: Deno.env.get("DB_NAME"),
  hostname: Deno.env.get("DB_HOST"),
  port: Number(Deno.env.get("DB_PORT")),
}, 10);

export { pool }; 