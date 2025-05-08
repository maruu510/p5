import { Pool } from "../../../deps.ts";

export async function getAllDepartments() {
  const client = await Pool.connect();
  try {
    const result = await client.queryObject<{
      id: number;
      number: string;
      name?: string;
      role?: string;
      // agrega más campos si los tienes
    }>("SELECT id, number, name, role FROM departments ORDER BY number ASC;");
    return result.rows;
  } finally {
    client.release();
  }
}
