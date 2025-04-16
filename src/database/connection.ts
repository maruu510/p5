import "https://deno.land/std@0.204.0/dotenv/load.ts";
import { Pool } from "../../deps.ts";

const pool = new Pool({
  user: Deno.env.get("DB_USER"),
  password: Deno.env.get("DB_PASSWORD"),
  database: Deno.env.get("DB_NAME"),
  hostname: Deno.env.get("DB_HOST"),
  port: Number(Deno.env.get("DB_PORT")),
}, 10);

export { pool };
