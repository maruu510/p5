import { SignJWT } from "npm:jose@5.9.6";

const secret = new TextEncoder().encode("clave_secreta_isi");

export async function createJWT(payload: Record<string, unknown>): Promise<string> {
    const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return jwt;
}
