import { client } from "../../database/connection.ts";

export interface User {
  _id?: string;
  email: string;
  password_hash: string;
  role: string;
}

const getCollection = () => {
  return client.db().collection<User>("users");
};

export async function createUsersCollection() {
  try {
    const db = client.db();
    await db.createCollection("users");
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("✅ Colección de usuarios creada correctamente");
  } catch (error) {
    if (error.code !== 48) { // Ignorar error si la colección ya existe
      console.error("❌ Error al crear colección de usuarios:", error);
      throw error;
    }
  }
}

// ✅ Insertar usuario con email en minúsculas
export async function insertUser(user: { email: string; password_hash: string; role: string }) {
  const collection = getCollection();
  user.email = user.email.toLowerCase();
  const result = await collection.insertOne(user);
  return result.insertedId;
}

// ✅ Buscar por email en minúsculas
export async function getUserByUsername(username: string) {
  const collection = getCollection();
  return await collection.findOne({ email: username.toLowerCase() });
}
