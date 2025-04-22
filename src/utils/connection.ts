import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import "https://deno.land/std@0.223.0/dotenv/load.ts"; // Cargar las variables de entorno

// Configuración del pool de conexiones
const pool = new Pool({
  user: Deno.env.get("DB_USER"),
  password: Deno.env.get("DB_PASSWORD"),
  database: Deno.env.get("DB_NAME"),
  hostname: Deno.env.get("DB_HOST"),
  port: parseInt(Deno.env.get("DB_PORT") || "5432"),
}, 3, true); // El '3' es el número máximo de conexiones simultáneas


export { pool };
