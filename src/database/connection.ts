<<<<<<< HEAD
//connection.ts
import "https://deno.land/std@0.204.0/dotenv/load.ts";
import { Pool } from "../../deps.ts";
=======
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Cargar variables de entorno
await load({ export: true });
>>>>>>> scrum-191

const pool = new Pool({
  user: Deno.env.get("DB_USER"),
  password: Deno.env.get("DB_PASSWORD"),
  database: Deno.env.get("DB_NAME"),
  hostname: Deno.env.get("DB_HOST"),
  port: Number(Deno.env.get("DB_PORT")),
}, 10);

<<<<<<< HEAD
export { pool };
=======
export { pool };
>>>>>>> scrum-191
