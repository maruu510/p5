// user.ts
import { pool } from "../../database/connection.ts";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'residente';
  apartment_number?: string;
}

async function createUsersTable() {
  const client = await pool.connect();
  try {
    await client.queryObject(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'residente',
        apartment_number TEXT
      );
    `);
  } finally {
    client.release();
  }
}

async function insertUser(user: { email: string, password_hash: string, role?: string, apartment_number?: string }): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<{ id: number }>(
      `INSERT INTO users (email, password_hash, role, apartment_number) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [user.email, user.password_hash, user.role || 'residente', user.apartment_number]
    );
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

async function getUserByUsername(username: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<User>(
      "SELECT * FROM users WHERE email = $1",
      [username]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export { createUsersTable, insertUser, getUserByUsername };
