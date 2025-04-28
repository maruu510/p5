import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "tu_super_secreto";
const JWT_EXPIRATION = 60 * 60 * 24; // 1 día en segundos

// Convertir el secreto a un CryptoKey usando la API Web Crypto de Deno
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw", // Tipo de clave
    new TextEncoder().encode(secret), // Codificamos la cadena en un buffer
    { name: "HMAC", hash: "SHA-256" }, // Usamos HMAC y SHA-256
    true, // La clave es exportable
    ["sign", "verify"] // Operaciones permitidas
  );
}

// Función para generar el JWT
export async function generateJwt(userId: string, username: string): Promise<string> {
  const secretKey = await getCryptoKey(JWT_SECRET); // Convertir el secreto a CryptoKey
  return await create(
    { alg: "HS256", typ: "JWT" },
    { 
      userId,
      username,
      exp: getNumericDate(JWT_EXPIRATION) 
    },
    secretKey
  );
}

// Función para verificar el JWT
export async function verifyJwt(token: string): Promise<boolean> {
  try {
    const secretKey = await getCryptoKey(JWT_SECRET); // Convertir el secreto a CryptoKey
    await verify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}
