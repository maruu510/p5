// user.ts
import { pool } from "../../database/connection.ts";

export interface User {
  id: number;
  email: string;
  password_hash: string; 
}

async function createUsersTable() {
  const client = await pool.connect();
  try {
    await client.queryObject(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}

async function insertUser(user: { email: string, password_hash: string }): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<{ id: number }>(
      `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING id`,
      [user.email, user.password_hash]
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
      "SELECT * FROM users WHERE email = $1",  // Cambiado de username a email
      [username]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export { createUsersTable, insertUser, getUserByUsername };
