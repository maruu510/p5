import { MongoClient } from "../../deps.ts";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

// Cargar variables de entorno
await load({ export: true });

const uri = Deno.env.get("MONGODB_URI") || "";
const dbName = Deno.env.get("MONGODB_DB") || "trabajo";

if (!uri) {
  throw new Error("❌ La variable MONGODB_URI no está definida.");
}

const isProduction = Deno.env.get("ENV") === "production";

const client = new MongoClient(uri, {
  retryWrites: true,
  w: "majority",
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 10000,  // Aumentado el tiempo de espera
  connectTimeoutMS: 20000,  // Aumentado el tiempo de espera
  ssl: true,
  authMechanism: "SCRAM-SHA-1"  // Agregado mecanismo de autenticación explícito
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conexión exitosa a MongoDB");
    return client.db(dbName);
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error);
    throw error;
  }
}

export async function closeConnection() {
  await client.close();
  console.log("Conexión a MongoDB cerrada");
}

export { client };
