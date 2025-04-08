import { Pool } from "../../deps.ts";

const pool = new Pool({
  user: "sophia",  
  password: "Hola8989",
  database: "encomiendas",  
  hostname: "localhost",
  port: 5432,
}, 10);
export { pool };