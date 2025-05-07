//package.ts
import { pool } from "../connection.ts";
import { generateQRCode } from "../../services/packageService.ts";

interface Package {
  id?: number;
  apartment_number: string;
  sender: string;
  delivery_date: Date;
  status: string;
  qr_code: string;
  pickup_date?: Date;
  notes?: string;
  delivery_method?: string;
}

async function createPackagesTable() {
  const client = await pool.connect();
  try {
    await client.queryObject(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        apartment_number TEXT NOT NULL,
        sender TEXT NOT NULL,
        delivery_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL,
        qr_code TEXT NOT NULL,
        pickup_date TIMESTAMP,
        notes TEXT
      )
    `);
  } finally {
    client.release();
  }
}

async function insertPackage(pkg: Package): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<{ id: number }>(
      `INSERT INTO packages (
        apartment_number,
        sender,
        delivery_date,
        status,
        qr_code,
        pickup_date,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        pkg.apartment_number,
        pkg.sender,
        pkg.delivery_date.toISOString(), 
        pkg.status,
        pkg.qr_code,
        pkg.pickup_date?.toISOString() ?? null,
        pkg.notes
      ]
    );
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

async function getAllPackages(): Promise<Package[]> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<Package[]>(
      "SELECT * FROM packages ORDER BY delivery_date DESC"
    );
    return result.rows;
  } finally {
    client.release();
  }
}

async function getPackageById(id: number): Promise<Package | null> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<Package[]>(
      "SELECT * FROM packages WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function updateStatusById(
  id: number,
  status: string,
  pickup_date: Date | null
): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject(
      `UPDATE packages 
       SET status = $1, pickup_date = $2
       WHERE id = $3 AND status = 'pendiente'`,
      [status, pickup_date?.toISOString() ?? null, id]
    );
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

export {
  createPackagesTable,
  insertPackage,
  getAllPackages,
  getPackageById,
};

export type { Package };