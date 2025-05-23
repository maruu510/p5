import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Cargar variables de entorno
await load({ export: true });

// Debug: Verificar que las variables se cargaron correctamente
console.log("=== CONFIGURACIÓN DE BASE DE DATOS ===");
console.log("DB_USER:", Deno.env.get("DB_USER"));
console.log("DB_PASSWORD:", Deno.env.get("DB_PASSWORD") ? "***" : "NO DEFINIDA");
console.log("DB_NAME:", Deno.env.get("DB_NAME"));
console.log("DB_HOST:", Deno.env.get("DB_HOST"));
console.log("DB_PORT:", Deno.env.get("DB_PORT"));
console.log("=====================================");

// Verificar que todas las variables necesarias estén definidas
if (!Deno.env.get("DB_USER") || !Deno.env.get("DB_PASSWORD") || !Deno.env.get("DB_NAME") || 
    !Deno.env.get("DB_HOST") || !Deno.env.get("DB_PORT")) {
  console.error("❌ ERROR: Faltan variables de entorno para la conexión a la base de datos");
  console.error("Por favor, verifica que el archivo .env esté correctamente configurado");
}

const dbConfig = {
  user: Deno.env.get("DB_USER"),
  password: Deno.env.get("DB_PASSWORD"),
  database: Deno.env.get("DB_NAME"),
  hostname: Deno.env.get("DB_HOST"),
  port: Number(Deno.env.get("DB_PORT")),
};

console.log("Configuración final:", {
  ...dbConfig,
  password: dbConfig.password ? "***" : "NO DEFINIDA"
});

const pool = new Pool(dbConfig, 10);

// Función para probar la conexión
export async function testConnection() {
  try {
    console.log("Intentando conectar a la base de datos...");
    const client = await pool.connect();
    console.log("✅ Conexión exitosa a la base de datos");
    
    // Probar una query simple
    const result = await client.queryObject("SELECT NOW() as current_time");
    console.log("✅ Query de prueba exitosa:", result.rows[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Error de conexión a la base de datos:");
    console.error("Tipo de error:", error instanceof Error ? error.name : "Unknown error type");
    console.error("Mensaje:", error instanceof Error ? error.message : "Unknown error");
    console.error("Stack:", error instanceof Error ? error.stack : "Stack not available");
    
    // Información adicional para depuración
    console.error("Detalles de configuración (sin contraseña):");
    console.error({
      user: dbConfig.user,
      database: dbConfig.database,
      hostname: dbConfig.hostname,
      port: dbConfig.port
    });
    
    return false;
  }
}

export { pool };