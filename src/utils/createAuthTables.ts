import { pool } from "./connection.ts";
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const client = await pool.connect();

try {
  await client.queryObject(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  const email = "test@example.com";
  const password = "123456";
  const passwordHash = await hash(password);

  await client.queryObject(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
    [email, passwordHash]
  );

  console.log("✅ Tabla 'users' creada y usuario insertado.");
} catch (error) {
  console.error("❌ Error:", error);
} finally {
  client.release();
  Deno.exit();
}
