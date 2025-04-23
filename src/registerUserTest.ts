import { pool } from "./database/connection.ts";
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const email = "isi@correo.com";
const password = "123456";

const hashedPassword = await hash(password);

const client = await pool.connect();

try {
  await client.queryArray(
    "INSERT INTO usuarios (email, password) VALUES ($1, $2)",
    [email, hashedPassword],
  );
  console.log("✅ Usuario creado con contraseña cifrada:", email);
} catch (err) {
  console.error("❌ Error al insertar usuario:", err);
} finally {
  client.release();
}
