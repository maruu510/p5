import { pool } from "../../utils/connection.ts"; 
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create } from "https://deno.land/x/djwt@v2.7/mod.ts";  

interface User {
  id: number;
  email: string;
  password_hash: string;
}

export async function validateUser(email: string, password: string): Promise<User> {
  const client = await pool.connect(); 
  try {
    const result = await client.queryObject<User>(
      "SELECT id, email, password_hash FROM users WHERE email = $1", 
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const user = result.rows[0];
    const passwordValid = await compare(password, user.password_hash);
    if (!passwordValid) {
      throw new Error("Contraseña incorrecta");
    }

    return user;
  } finally {
    client.release(); 
  }
}

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  const secretKey = Deno.env.get("JWT_SECRET") || "default-secret";  
  const jwtOptions = { expiresIn: "24h" };  

  const token = create(payload, secretKey, jwtOptions);  
  return token;
}
