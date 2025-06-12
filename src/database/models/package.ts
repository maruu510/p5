import { client } from "../connection.ts";

interface Package {
  _id?: string;
  apartment_number: string;
  sender: string;
  delivery_date: Date;
  status: string;
  qr_code: string;
  pickup_date?: Date;
  notes?: string;
  delivery_method?: string;
}

const getCollection = () => {
  return client.db().collection<Package>("packages");
};

export async function createPackagesTable() {
  try {
    const collection = getCollection();

    console.log("✅ Colección 'packages' lista para usar");
  } catch (error) {
    console.error("❌ Error al preparar la colección 'packages':", error);
    throw error;
  }
}

export async function insertPackage(pkg: Omit<Package, '_id'>) {
  try {
    const collection = getCollection();
    const result = await collection.insertOne(pkg);
    return result;
  } catch (error) {
    console.error("Error al insertar paquete:", error);
    throw error;
  }
}

export async function getAllPackages() {
  try {
    const collection = getCollection();
    const packages = await collection.find({}).toArray();
    return packages;
  } catch (error) {
    console.error("Error al obtener todos los paquetes:", error);
    throw error;
  }
}

export async function getPackageById(id: string) {
  try {
    const collection = getCollection();
    const pkg = await collection.findOne({ _id: id });
    return pkg;
  } catch (error) {
    console.error("Error al obtener el paquete por ID:", error);
    throw error;
  }
}

export async function updateStatusById(id: string, status: string, pickup_date: Date | null) {
  try {
    const collection = getCollection();
    const result = await collection.updateOne(
      { _id: id },
      { $set: { status, pickup_date } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error al actualizar el estado del paquete:", error);
    throw error;
  }
}

export async function getPackagesByApartment(apartment: string) {
  try {
    const collection = getCollection();
    const packages = await collection.find({ apartment_number: apartment }).toArray();
    return packages;
  } catch (error) {
    console.error("Error al obtener paquetes por apartamento:", error);
    throw error;
  }
}