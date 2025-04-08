import { Pool } from "../../deps.ts";

const pool = new Pool({
  user: "sophia",         // Usuario de la base de datos
  password: "Hola8989",   // Contraseña del usuario
  database: "trabajo",    // Nombre de la base de datos (actualizado a "trabajo")
  hostname: "localhost",  // Host local
  port: 5432,             // Puerto de PostgreSQL
}, 10);

export { pool };
