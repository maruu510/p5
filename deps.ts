// deps.ts
export { Application, Router, send } from "https://deno.land/x/oak@v11.1.0/mod.ts";
export type { RouterContext, Context } from "https://deno.land/x/oak@v11.1.0/mod.ts"; 
export { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
export { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
export { oakCors } from "https://deno.land/x/cors@v1.2.1/mod.ts";
export * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
export { join } from "https://deno.land/std@0.177.0/path/mod.ts";
export { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";
