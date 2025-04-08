import { pool } from "../connection.ts";  


interface Paquete {
  id?: number;
  numero_departamento: string;
  remitente: string;
  fecha_entrega: Date;
  estado: string;
  codigo_qr: string;
  fecha_retiro?: Date;
  notas?: string;
  metodo_entrega?: string;
}

// Función para crear la tabla "paquetes" si no existe
async function crearTablaPaquetes() {
  const client = await pool.connect();
  try {
    await client.queryObject(`
      CREATE TABLE IF NOT EXISTS paquetes (
        id SERIAL PRIMARY KEY,
        numero_departamento TEXT NOT NULL,
        remitente TEXT NOT NULL,
        fecha_entrega TIMESTAMP NOT NULL,
        estado TEXT NOT NULL,
        codigo_qr TEXT NOT NULL,
        fecha_retiro TIMESTAMP,
        notas TEXT,
        metodo_entrega TEXT
      )
    `);
  } finally {
    client.release();
  }
}

// Función para insertar un nuevo paquete
async function insertarPaquete(paquete: Paquete) {
  const client = await pool.connect();
  try {
    await client.queryObject(
      `INSERT INTO paquetes (
        numero_departamento,
        remitente,
        fecha_entrega,
        estado,
        codigo_qr,
        fecha_retiro,
        notas,
        metodo_entrega
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        paquete.numero_departamento,
        paquete.remitente,
        paquete.fecha_entrega,
        paquete.estado,
        paquete.codigo_qr,
        paquete.fecha_retiro ?? null,
        paquete.notas ?? null,
        paquete.metodo_entrega ?? null,
      ]
    );
  } finally {
    client.release();
  }
}

// Función para obtener todos los paquetes
async function obtenerTodosPaquetes(): Promise<Paquete[]> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<Paquete>(
      "SELECT * FROM paquetes ORDER BY fecha_entrega DESC"
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Función para obtener un paquete por ID
async function obtenerPaquetePorId(id: number): Promise<Paquete | null> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<Paquete>(
      "SELECT * FROM paquetes WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export {
  crearTablaPaquetes,
  insertarPaquete,
  obtenerTodosPaquetes,
  obtenerPaquetePorId,
  Paquete,
};
